import { win32 } from "node:path";
import { sliceLines } from "../document/lines.ts";
import type { DocumentPage, DocumentSection, ParsedDocument } from "../document/types.ts";
import type { DocumentInput, ParserOptions } from "./types.ts";

type SectionSize = DocumentInput["sectionSize"];
type TargetChars = ParserOptions["targetChars"];

export class ParserUtils {
  /** Pages with at least one line in `fromLine..toLine`. */
  static matchingPages(pages: readonly DocumentPage[] | undefined, fromLine: number, toLine: number): DocumentPage[] {
    return pages?.filter(page =>
      page.fromLine !== undefined && page.toLine !== undefined && page.fromLine <= toLine && page.toLine >= fromLine,
    ) ?? [];
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

  /** Markdown with optional section markers and, when pages are known, a marker before each page. */
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
    const section = doc.map.sections.find(item => item.sectionId === sectionId);
    if (!section) {
      throw new Error(`Unknown section ${sectionId} in document ${doc.map.documentId}`);
    }
    const lines = doc.markdown.split("\n").slice(section.fromLine - 1, section.toLine);
    if (pageTags) {
      ParserUtils.applyPageTags(lines, doc.pages, section);
    }
    return lines.join("\n");
  }

  private static applySectionMarkers(lines: string[], sections: readonly DocumentSection[]): void {
    for (const section of sections) {
      const index = section.fromLine - 1;
      lines[index] = `<!--------------- SECTION ${section.sectionId} --------------->\n${lines[index]}`;
    }
  }

  private static joinPaginatedLines(lines: readonly string[], pages: readonly DocumentPage[]): string {
    const parts: string[] = [];
    for (const { pageNumber, fromLine, toLine } of pages) {
      parts.push(`<!--------------- PAGE ${pageNumber} ---------------->`);
      if (fromLine !== undefined && toLine !== undefined) {
        parts.push(sliceLines(lines, fromLine, toLine));
      }
    }
    return parts.join("\n");
  }

  /** Prefixes the first line of each page within the section with a page tag. */
  private static applyPageTags(
    sectionLines: string[],
    pages: readonly DocumentPage[] | undefined,
    section: DocumentSection,
  ): void {
    for (const page of ParserUtils.matchingPages(pages, section.fromLine, section.toLine)) {
      const offset = Math.max(section.fromLine, page.fromLine!) - section.fromLine;
      sectionLines[offset] = `<!-- page: ${page.pageNumber} -->\n${sectionLines[offset]}`;
    }
  }
}
