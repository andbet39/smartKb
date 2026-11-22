import { writeFile } from "node:fs/promises";
import { buildTableOfContents } from "../document/sources.ts";
import type { DocumentTableOfContents, ParsedDocument } from "../document/types.ts";
import type { DocumentParser } from "./interfaces.ts";
import { DefaultDocumentParser } from "./parser.ts";
import type { ParserOptions } from "./types.ts";
import { ParserUtils } from "./utils.ts";

export { convertDocument, type LocalConversionProgress } from "./convert.ts";

export function createDocumentParser(options: ParserOptions): DocumentParser {
  return new DefaultDocumentParser(options);
}

// Utilities for callers that use the parser without a store: they work on a document in memory.

export function getDocumentTableOfContents(doc: ParsedDocument): DocumentTableOfContents {
  return buildTableOfContents(doc);
}

export function getSectionMarkdown(
  doc: ParsedDocument,
  sectionId: number,
  options: { pageTags?: boolean } = {},
): string {
  return ParserUtils.renderSectionMarkdown(doc, sectionId, options.pageTags);
}

/** Writes an annotated export (page and optional section markers), not the canonical Markdown. */
export async function saveDocumentMarkdown(
  doc: ParsedDocument,
  filePath: string,
  options: { sectionMarkers?: boolean } = {},
): Promise<void> {
  const markdown = ParserUtils.renderAnnotatedMarkdown(doc, options.sectionMarkers);
  await writeFile(filePath, markdown, "utf8");
}
