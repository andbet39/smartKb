import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { DocumentId } from "../document/types.ts";

// Input, options and progress events of the document parser.
// Document data types live in ../document/types.ts.

export type DocumentParsePhase =
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
  documentId: DocumentId;
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
  fromLine?: number;
  toLine?: number;
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
  | ConversionProgress
  | SegmentationProgress
  | SectionSummaryProgress
  | OverviewSummaryProgress
  | CompletedParseProgress;

export interface DocumentInput {
  /** If omitted, the parser generates a UUID v7. */
  documentId?: DocumentId;
  bytes: Uint8Array;
  fileName?: string;
  sectionSize?: { minChars: number; maxChars: number };
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
