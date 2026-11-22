import type { ParsedDocument } from "../document/types.ts";
import type { DocumentInput } from "./types.ts";

/**
 * Converts a file into a `ParsedDocument`: Markdown, sections and summaries.
 * The parser does not persist anything; pass the result to a `KbStore`.
 */
export interface DocumentParser {
  parseDocument(input: DocumentInput): Promise<ParsedDocument>;
  /** Parses the inputs in order, one at a time. */
  parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]>;
}
