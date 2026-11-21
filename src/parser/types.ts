import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type DocumentLineRange = [start: number, end: number];
export type DocumentPageRange = [startPage: number, endPage: number];

export interface DocumentInput {
  documentId: number;
  bytes: Uint8Array;
  fileName?: string;
  sectionSize?: { minChars: number; maxChars: number };
}

export interface ParserOptions {
  onProgress?: (message: string) => void;
  llm: Pick<BaseChatModel, "withStructuredOutput">;
  countTokens(text: string): number;
  /** Payload budget, excluding instructions, schema and response. */
  windowTokens?: number;
  /** Approximate character counts for model-generated text, not hard limits. */
  targetChars?: {
    documentSummary?: number;
    sectionSummary?: number;
    shortDescription?: number;
  };
}

export interface DocumentSection {
  id: number;
  order: number;
  title: string;
  range: DocumentLineRange;
  pageRange?: DocumentPageRange;
  tokens: number;
  totalTokens: number;
  summary: string;
  short_description: string;
  keywords: string[];
}

export interface DocumentMap {
  documentId: number;
  originalFileName?: string;
  title?: string;
  author?: string;
  fileType?: string;
  tags?: string[];
  lineCount: number;
  summary: string;
  short_description: string;
  keywords: string[];
  sections: DocumentSection[];
}

export interface DocumentTableOfContents {
  documentId: number;
  short_description: string;
  sections: Pick<DocumentSection, "id" | "title" | "short_description">[];
}

export interface DocumentPage {
  page: number;
  range: DocumentLineRange | null;
}

export interface ParsedDocument {
  markdown: string;
  pages?: DocumentPage[];
  map: DocumentMap;
}

export interface DocumentParser {
  parseDocument(input: DocumentInput): Promise<ParsedDocument>;
  parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]>;
}

export class DocumentParseError extends Error {
  constructor(readonly documentId: number, cause: unknown) {
    super(`Document ${documentId}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    this.name = "DocumentParseError";
  }
}
