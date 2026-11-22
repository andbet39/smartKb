import { win32 } from "node:path";
import type {
  DocumentInput,
  DocumentLineRange,
  DocumentPage,
  DocumentSection,
  ParsedDocument,
  ParserOptions,
} from "./types.ts";

type SectionSize = DocumentInput["sectionSize"];
type TargetChars = ParserOptions["targetChars"];

export class ParserUtils {
  static normalizeMarkdown(text: string): string {
    return text.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
  }

  static splitLines(markdown: string): string[] {
    return markdown ? markdown.split("\n") : [];
  }

  static sliceLines(lines: readonly string[], [start, end]: DocumentLineRange): string {
    return lines.slice(start - 1, end).join("\n");
  }

  static matchingPages(pages: readonly DocumentPage[] | undefined, [start, end]: DocumentLineRange): DocumentPage[] {
    return pages?.filter(page => page.range && page.range[0] <= end && page.range[1] >= start) ?? [];
  }

  static extractOriginalFileName(fileName?: string): string | undefined {
    // win32.basename also handles slash-separated names from non-Windows clients.
    return fileName ? win32.basename(fileName) : undefined;
  }

  static validatePositiveInteger(value: number | undefined, name: string): void {
    if (value !== undefined && (!Number.isSafeInteger(value) || value < 1)) {
      throw new Error(`${name} must be a positive integer`);
    }
  }

  static validateSectionSize(size: SectionSize): void {
    if (!size) return;
    const validBounds =
      Number.isSafeInteger(size.minChars) &&
      Number.isSafeInteger(size.maxChars) &&
      size.minChars >= 1 &&
      size.maxChars >= size.minChars;
    if (!validBounds) {
      throw new Error("Invalid sectionSize: expected positive integers with minChars <= maxChars");
    }
  }

  static validateTargetChars(targets: TargetChars): void {
    if (!targets) return;
    for (const [name, count] of Object.entries(targets)) {
      ParserUtils.validatePositiveInteger(count, `targetChars.${name}`);
    }
  }

  static renderAnnotatedMarkdown(doc: ParsedDocument, sectionMarkers = false): string {
    const lines = doc.markdown.split("\n");
    if (sectionMarkers) {
      ParserUtils.applySectionMarkers(lines, doc.map.sections);
    }
    return doc.pages?.length
      ? ParserUtils.joinPaginatedLines(lines, doc.pages)
      : lines.join("\n");
  }

  static renderSectionMarkdown(doc: ParsedDocument, sectionId: number, pageTags = false): string {
    const section = doc.map.sections.find(item => item.id === sectionId);
    if (!section) {
      throw new Error(`Unknown section ${sectionId} in document ${doc.map.documentId}`);
    }
    const [start, end] = section.range;
    const lines = doc.markdown.split("\n").slice(start - 1, end);
    if (pageTags) {
      ParserUtils.applyPageTags(lines, doc.pages, section.range);
    }
    return lines.join("\n");
  }

  private static applySectionMarkers(lines: string[], sections: readonly DocumentSection[]): void {
    for (const section of sections) {
      const index = section.range[0] - 1;
      lines[index] = `<!--------------- SECTION ${section.id} --------------->\n${lines[index]}`;
    }
  }

  private static joinPaginatedLines(lines: readonly string[], pages: readonly DocumentPage[]): string {
    const parts: string[] = [];
    for (const { page, range } of pages) {
      parts.push(`<!--------------- PAGE ${page} ---------------->`);
      if (range) {
        parts.push(ParserUtils.sliceLines(lines, range));
      }
    }
    return parts.join("\n");
  }

  private static applyPageTags(
    sectionLines: string[],
    pages: readonly DocumentPage[] | undefined,
    range: DocumentLineRange,
  ): void {
    const [start] = range;
    for (const page of ParserUtils.matchingPages(pages, range)) {
      if (!page.range) continue;
      const offset = Math.max(start, page.range[0]) - start;
      sectionLines[offset] = `<!-- page: ${page.page} -->\n${sectionLines[offset]}`;
    }
  }
}
