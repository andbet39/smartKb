import { writeFile } from "node:fs/promises";
import { win32 } from "node:path";
import { createAnalysis } from "./analysis.js";
import { convert } from "./convert.js";
import { DocumentParseError } from "./types.js";
import type { DocumentInput, DocumentParser, DocumentPage, DocumentLineRange, DocumentSection, DocumentTableOfContents, ParsedDocument, ParserOptions } from "./types.js";

export * from "./types.js";
export { persist, load } from "./persistence.js";

export function getDocumentTableOfContents(doc: ParsedDocument): DocumentTableOfContents {
  const { documentId, short_description, sections } = doc.map;
  return {
    documentId,
    short_description,
    sections: sections.map(({ id, title, short_description }) => ({ id, title, short_description })),
  };
}

export async function saveDocumentMarkdown(
  doc: ParsedDocument,
  filePath: string,
  options: { sectionMarkers?: boolean } = {},
): Promise<void> {
  const lines = doc.markdown.split("\n");
  if (options.sectionMarkers) {
    for (const section of doc.map.sections) {
      const index = section.range[0] - 1;
      lines[index] = `<!--------------- SECTION ${section.id} --------------->\n${lines[index]}`;
    }
  }
  let markdown: string;
  if (doc.pages?.length) {
    const parts: string[] = [];
    for (const { page, range } of doc.pages) {
      parts.push(`<!--------------- PAGE ${page} ---------------->`);
      if (range) parts.push(lines.slice(range[0] - 1, range[1]).join("\n"));
    }
    markdown = parts.join("\n");
  } else {
    markdown = lines.join("\n");
  }
  await writeFile(filePath, markdown, "utf8");
}

function matchingPages(pages: DocumentPage[] | undefined, [start, end]: DocumentLineRange) {
  return pages?.filter(p => p.range && p.range[0] <= end && p.range[1] >= start) ?? [];
}

export function createDocumentParser(options: ParserOptions): DocumentParser {
  if (options.windowTokens !== undefined && (!Number.isSafeInteger(options.windowTokens) || options.windowTokens < 1)) {
    throw new Error("windowTokens must be a positive integer");
  }
  const analyze = createAnalysis(options);
  async function parseDocument(input: DocumentInput): Promise<ParsedDocument> {
    try {
      const size = input.sectionSize;
      if (size && (!Number.isSafeInteger(size.minChars) || !Number.isSafeInteger(size.maxChars)
        || size.minChars < 1 || size.maxChars < size.minChars)) {
        throw new Error("Invalid sectionSize: expected positive integers with minChars <= maxChars");
      }
      const converted = await convert(input, options.onProgress);
      const lines = converted.markdown ? converted.markdown.split("\n") : [];
      const totalTokens = options.countTokens(converted.markdown);
      options.onProgress?.(`Analisi: ${lines.length} righe, ${totalTokens} token.`);
      const { sections, overview } = await analyze(lines, size);
      const mapped = sections.map((section, i): DocumentSection => {
        const pages = matchingPages(converted.pages, section.range);
        const text = lines.slice(section.range[0] - 1, section.range[1]).join("\n");
        const result: DocumentSection = {
          ...section, id: i + 1, order: i + 1, tokens: options.countTokens(text), totalTokens,
        };
        if (pages.length) result.pageRange = [pages[0].page, pages[pages.length - 1].page];
        return result;
      });
      // win32.basename also handles slash-separated names from non-Windows clients.
      const originalFileName = input.fileName && win32.basename(input.fileName);
      options.onProgress?.(`Analisi completata: ${mapped.length} sezioni.`);
      return {
        ...converted,
        map: {
          documentId: input.documentId,
          ...(originalFileName && { originalFileName }),
          lineCount: lines.length,
          ...overview,
          sections: mapped,
        },
      };
    } catch (cause) {
      throw new DocumentParseError(input.documentId, cause);
    }
  }
  return {
    parseDocument,
    async parseDocuments(inputs) {
      const documents = [];
      for (const input of inputs) documents.push(await parseDocument(input));
      return documents;
    },
  };
}

export function getSectionMarkdown(doc: ParsedDocument, sectionId: number, options: { pageTags?: boolean } = {}) {
  const section = doc.map.sections.find(s => s.id === sectionId);
  if (!section) throw new Error(`Unknown section ${sectionId} in document ${doc.map.documentId}`);
  const [start, end] = section.range;
  const lines = doc.markdown.split("\n").slice(start - 1, end);
  if (options.pageTags) {
    for (const page of matchingPages(doc.pages, section.range)) {
      if (!page.range) continue;
      const offset = Math.max(start, page.range[0]) - start;
      lines[offset] = `<!-- page: ${page.page} -->\n${lines[offset]}`;
    }
  }
  return lines.join("\n");
}
