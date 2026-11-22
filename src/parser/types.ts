import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type DocumentLineRange = [start: number, end: number];
export type DocumentPageRange = [startPage: number, endPage: number];

export type DocumentParsePhase =
  | "reading"
  | "saving"
  | "conversion"
  | "segmentation"
  | "sections"
  | "overview"
  | "completed";

export type DocumentParseProgressUnit = "documents" | "pages" | "lines" | "sections";

export interface DocumentBatchProgress {
  current: number;
  total: number;
  percent: number;
}

export interface DocumentParseProgressBase {
  documentId: number;
  fileName?: string;
  batch?: DocumentBatchProgress;
  phase: DocumentParsePhase;
  /** Overall document progress from 0 to 100. */
  percent: number;
  /** Completed units within the current phase. */
  current: number;
  /** Total units within the current phase. */
  total: number;
  unit: DocumentParseProgressUnit;
  /** Current phase progress from 0 to 100. */
  phasePercent: number;
  message: string;
}

export interface ConversionProgress extends DocumentParseProgressBase {
  phase: "conversion";
  step:
    | "start"
    | "page-extract"
    | "page-ocr-fallback"
    | "ocr-init"
    | "ocr-render"
    | "ocr-progress"
    | "page-done"
    | "done";
  format: string;
  bytes: number;
  page?: number;
  totalPages?: number;
  pageSource?: "native" | "ocr" | "blank";
  ocrPercent?: number;
}

export interface SegmentationProgress extends DocumentParseProgressBase {
  phase: "segmentation";
  step: "start" | "window-request" | "window-fallback" | "window-recovery" | "window-done";
  lineCount: number;
  totalTokens: number;
  totalWindows: number;
  window?: number;
  lineRange?: DocumentLineRange;
  attempt?: number;
  maxAttempts?: number;
}

export interface SectionSummaryProgress extends DocumentParseProgressBase {
  phase: "sections";
  step: "section-start" | "llm-request" | "section-done";
  sectionIndex: number;
  totalSections: number;
  attempt?: number;
  maxAttempts?: number;
}

export interface OverviewSummaryProgress extends DocumentParseProgressBase {
  phase: "overview";
  step: "llm-request" | "done";
  attempt?: number;
  maxAttempts?: number;
}

export interface CompletedParseProgress extends DocumentParseProgressBase {
  phase: "completed";
  step: "done";
  lineCount: number;
  totalTokens: number;
  sectionCount: number;
}

export type DocumentParseProgress =
  | (DocumentParseProgressBase & { phase: "reading" | "saving"; step: "start" })
  | ConversionProgress
  | SegmentationProgress
  | SectionSummaryProgress
  | OverviewSummaryProgress
  | CompletedParseProgress;

export interface DocumentInput {
  documentId: number;
  bytes: Uint8Array;
  fileName?: string;
  sectionSize?: { minChars: number; maxChars: number };
}

export interface ImportFileOptions extends Pick<DocumentInput, "documentId" | "sectionSize"> {
  kbFolder: string;
}

export interface ImportDocumentInput extends DocumentInput {
  kbFolder: string;
}

export interface ParserOptions {
  onProgress?: (progress: DocumentParseProgress) => void;
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
  importFile(path: string, options: ImportFileOptions): Promise<ParsedDocument>;
  importDocument(input: ImportDocumentInput): Promise<ParsedDocument>;
  parseDocument(input: DocumentInput): Promise<ParsedDocument>;
  parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]>;
}

export class DocumentParseError extends Error {
  constructor(readonly documentId: number, cause: unknown) {
    super(`Document ${documentId}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    this.name = "DocumentParseError";
  }
}
