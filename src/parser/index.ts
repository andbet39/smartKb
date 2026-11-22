import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { basename, join } from "node:path";
import { persist } from "./persistence.ts";
import { createAnalysis, type AnalysisProgressEvent, type AnalyzedSection } from "./analysis.ts";
import { convertDocument } from "./convert.ts";
import {
  DocumentParseError,
  type DocumentInput,
  type DocumentPage,
  type DocumentParsePhase,
  type DocumentParseProgress,
  type DocumentParser,
  type DocumentSection,
  type DocumentTableOfContents,
  type ImportFileOptions,
  type ImportDocumentInput,
  type ParsedDocument,
  type ParserOptions,
} from "./types.ts";
import { ParserUtils } from "./utils.ts";

export * from "./types.ts";
export { convertDocument, type ConvertedDocument, type ConversionInput, type LocalConversionProgress } from "./convert.ts";
export { persist, load } from "./persistence.ts";

const PHASE_RANGES: Record<DocumentParsePhase, readonly [start: number, end: number]> = {
  reading: [0, 0],
  saving: [100, 100],
  conversion: [0, 25],
  segmentation: [25, 75],
  sections: [75, 90],
  overview: [90, 99],
  completed: [100, 100],
};

interface BatchPosition {
  current: number;
  total: number;
}

class DefaultDocumentParser implements DocumentParser {
  private readonly analyze: ReturnType<typeof createAnalysis>;

  constructor(private readonly options: ParserOptions) {
    ParserUtils.validatePositiveInteger(options.windowTokens, "windowTokens");
    this.analyze = createAnalysis(options);
  }

  parseDocument(input: DocumentInput): Promise<ParsedDocument> {
    return this.parseSingleDocument(input);
  }

  async importFile(path: string, options: ImportFileOptions): Promise<ParsedDocument> {
    const fileName = basename(path);
    this.reportImportStep(options.documentId, fileName, "reading");
    const bytes = await readFile(path);
    return this.importDocument({ ...options, fileName, bytes });
  }

  async importDocument({ kbFolder, ...input }: ImportDocumentInput): Promise<ParsedDocument> {
    const { documentId } = input;
    if (!Number.isSafeInteger(documentId)) throw new RangeError("documentId must be a safe integer");
    await mkdir(kbFolder, { recursive: true });
    const destination = join(kbFolder, `doc-${documentId}`);
    await mkdir(destination); // Reserve exclusively before invoking the model.
    try {
      const doc = await this.parseDocument(input);
      this.reportImportStep(documentId, doc.map.originalFileName, "saving");
      await persist(doc, destination);
      return doc;
    } catch (error) {
      await rm(destination, { recursive: true, force: true });
      throw error;
    }
  }

  private reportImportStep(documentId: number, fileName: string | undefined, phase: "reading" | "saving"): void {
    this.options.onProgress?.({ documentId, fileName, phase, step: "start", current: 0, total: 1,
      unit: "documents", phasePercent: 0, percent: phase === "reading" ? 0 : 100,
      message: phase === "reading" ? "Lettura del file" : "Salvataggio nella KB" });
  }

  async parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]> {
    const documents: ParsedDocument[] = [];
    for (const [index, input] of inputs.entries()) {
      documents.push(await this.parseSingleDocument(input, { current: index + 1, total: inputs.length }));
    }
    return documents;
  }

  private async parseSingleDocument(input: DocumentInput, batch?: BatchPosition): Promise<ParsedDocument> {
    try {
      ParserUtils.validateSectionSize(input.sectionSize);
      const originalFileName = ParserUtils.extractOriginalFileName(input.fileName);
      const onProgress = this.options.onProgress;

      const emit = (event: DocumentParseProgress) => {
        if (!onProgress) return;
        const percent = overallPercent(event.phase, event.phasePercent);
        onProgress({
          ...event,
          percent,
          ...(batch && {
            batch: {
              current: batch.current,
              total: batch.total,
              percent: Math.floor(((batch.current - 1) * 100 + percent) / batch.total),
            },
          }),
        });
      };

      const converted = await convertDocument(input, onProgress && (event => emit({ ...event, documentId: input.documentId })));
      const lines = ParserUtils.splitLines(converted.markdown);
      const totalTokens = this.options.countTokens(converted.markdown);
      const common = {
        documentId: input.documentId,
        ...(originalFileName && { fileName: originalFileName }),
      };

      const { sections, overview } = await this.analyze(lines, input.sectionSize, {
        totalTokens,
        report: onProgress && ((event: AnalysisProgressEvent) => emit({ ...common, percent: 0, ...event })),
      });
      const mappedSections = this.buildDocumentSections(sections, lines, converted.pages, totalTokens);

      emit({
        ...common,
        phase: "completed",
        step: "done",
        lineCount: lines.length,
        totalTokens,
        sectionCount: mappedSections.length,
        current: 1,
        total: 1,
        unit: "documents",
        phasePercent: 100,
        percent: 100,
        message: `Analisi completata: ${mappedSections.length} sezioni.`,
      });
      return {
        ...converted,
        map: {
          documentId: input.documentId,
          ...(originalFileName && { originalFileName }),
          lineCount: lines.length,
          ...overview,
          sections: mappedSections,
        },
      };
    } catch (cause) {
      throw new DocumentParseError(input.documentId, cause);
    }
  }

  private buildDocumentSections(
    sections: readonly AnalyzedSection[],
    lines: readonly string[],
    pages: readonly DocumentPage[] | undefined,
    totalTokens: number,
  ): DocumentSection[] {
    return sections.map((section, index): DocumentSection => {
      const matching = ParserUtils.matchingPages(pages, section.range);
      const text = ParserUtils.sliceLines(lines, section.range);
      const order = index + 1;
      return {
        ...section,
        id: order,
        order,
        tokens: this.options.countTokens(text),
        totalTokens,
        ...(matching.length > 0 && { pageRange: [matching[0].page, matching[matching.length - 1].page] }),
      };
    });
  }
}

export function createDocumentParser(options: ParserOptions): DocumentParser {
  return new DefaultDocumentParser(options);
}

export function getDocumentTableOfContents(doc: ParsedDocument): DocumentTableOfContents {
  const { documentId, short_description, sections } = doc.map;
  return {
    documentId,
    short_description,
    sections: sections.map(({ id, title, short_description }) => ({ id, title, short_description })),
  };
}

export function getSectionMarkdown(
  doc: ParsedDocument,
  sectionId: number,
  options: { pageTags?: boolean } = {},
): string {
  return ParserUtils.renderSectionMarkdown(doc, sectionId, options.pageTags);
}

export async function saveDocumentMarkdown(
  doc: ParsedDocument,
  filePath: string,
  options: { sectionMarkers?: boolean } = {},
): Promise<void> {
  const markdown = ParserUtils.renderAnnotatedMarkdown(doc, options.sectionMarkers);
  await writeFile(filePath, markdown, "utf8");
}

function overallPercent(phase: DocumentParsePhase, phasePercent: number): number {
  const [start, end] = PHASE_RANGES[phase];
  return start + Math.floor(((end - start) * phasePercent) / 100);
}
