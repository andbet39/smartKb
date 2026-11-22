import { v7 as uuidv7 } from "uuid";
import { documentIdSchema } from "../document/id.ts";
import { splitLines, sliceLines } from "../document/lines.ts";
import type { DocumentPage, DocumentSection, ParsedDocument } from "../document/types.ts";
import { createAnalysis, type AnalysisProgressEvent, type AnalyzedSection } from "./analysis.ts";
import { convertToMarkdown } from "./convert.ts";
import { DocumentParseError } from "./errors.ts";
import type { DocumentParser } from "./interfaces.ts";
import type { DocumentInput, DocumentParsePhase, DocumentParseProgress, ParserOptions } from "./types.ts";
import { ParserUtils } from "./utils.ts";

/** Share of the overall progress (0–100) covered by each phase. */
const PHASE_RANGES: Record<DocumentParsePhase, readonly [start: number, end: number]> = {
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

/** Pipeline: local conversion to Markdown → LLM segmentation and summaries → document map. */
export class DefaultDocumentParser implements DocumentParser {
  private readonly analyze: ReturnType<typeof createAnalysis>;

  constructor(private readonly options: ParserOptions) {
    ParserUtils.validatePositiveInteger(options.windowTokens, "windowTokens");
    this.analyze = createAnalysis(options);
  }

  parseDocument(input: DocumentInput): Promise<ParsedDocument> {
    return this.parseSingleDocument(input);
  }

  async parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]> {
    const documents: ParsedDocument[] = [];
    for (const [index, input] of inputs.entries()) {
      documents.push(await this.parseSingleDocument(input, { current: index + 1, total: inputs.length }));
    }
    return documents;
  }

  private async parseSingleDocument(input: DocumentInput, batch?: BatchPosition): Promise<ParsedDocument> {
    const documentId = input.documentId === undefined ? uuidv7() : input.documentId;
    try {
      documentIdSchema.parse(documentId);
      ParserUtils.validateSectionSize(input.sectionSize);
      const originalFileName = ParserUtils.extractOriginalFileName(input.fileName);
      const emit = this.createEmitter(batch);

      const converted = await convertToMarkdown(input, emit && (event => emit({ ...event, documentId })));
      const lines = splitLines(converted.markdown);
      const totalTokens = this.options.countTokens(converted.markdown);
      const common = {
        documentId,
        ...(originalFileName && { fileName: originalFileName }),
      };

      const { sections, overview } = await this.analyze(lines, input.sectionSize, {
        totalTokens,
        report: emit && ((event: AnalysisProgressEvent) => emit({ ...common, percent: 0, ...event })),
      });
      const mappedSections = this.buildDocumentSections(sections, lines, converted.pages, totalTokens);

      emit?.({
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
          documentId,
          ...(originalFileName && { originalFileName }),
          lineCount: lines.length,
          ...overview,
          sections: mappedSections,
        },
      };
    } catch (cause) {
      throw new DocumentParseError(documentId, cause);
    }
  }

  /** Adds overall and batch percentages to each event; `undefined` without `onProgress`. */
  private createEmitter(batch?: BatchPosition): ((event: DocumentParseProgress) => void) | undefined {
    const onProgress = this.options.onProgress;
    if (!onProgress) return undefined;
    return event => {
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
  }

  private buildDocumentSections(
    sections: readonly AnalyzedSection[],
    lines: readonly string[],
    pages: readonly DocumentPage[] | undefined,
    totalTokens: number,
  ): DocumentSection[] {
    return sections.map((section, index): DocumentSection => {
      const matching = ParserUtils.matchingPages(pages, section.fromLine, section.toLine);
      const text = sliceLines(lines, section.fromLine, section.toLine);
      const order = index + 1;
      return {
        ...section,
        sectionId: order,
        order,
        tokens: this.options.countTokens(text),
        totalTokens,
        ...(matching.length > 0 && { fromPage: matching[0].pageNumber, toPage: matching.at(-1)!.pageNumber }),
      };
    });
  }
}

function overallPercent(phase: DocumentParsePhase, phasePercent: number): number {
  const [start, end] = PHASE_RANGES[phase];
  return start + Math.floor(((end - start) * phasePercent) / 100);
}
