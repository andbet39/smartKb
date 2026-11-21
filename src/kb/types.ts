import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface AgentSearchOptions {
  /** How to provide TOCs without a decision model. Defaults to "prompt"; ignored with document selection. */
  tocMode?: "prompt" | "tools";
}

export interface DocumentSelectionOptions {
  decisionModel: Pick<BaseChatModel, "withStructuredOutput">;
  /** Minimum relevance score, inclusive, between 0 and 1. Defaults to 0.5. */
  threshold?: number;
  /** Maximum number of document TOCs in the initial prompt. Defaults to 5. */
  maxDocuments?: number;
}

export interface DocumentSource {
  documentId: number;
  originalFileName: string | null;
  title?: string;
}

export interface PageSpan {
  pageNumber: number;
  fromLine: number;
  toLine: number;
}

export interface PassageSource extends DocumentSource {
  fromLine: number;
  toLine: number;
  pages: PageSpan[] | null;
  sectionId?: number;
  sectionTitle?: string;
}

export interface SectionSource extends PassageSource {
  sectionId: number;
  sectionTitle: string;
}

export interface KbTableOfContents {
  documents: { source: DocumentSource; shortDescription: string; sectionCount: number }[];
}

export interface FileTableOfContents {
  source: DocumentSource;
  sections: { source: SectionSource; shortDescription: string }[];
}

export interface FileInfo {
  source: DocumentSource;
  author?: string;
  fileType?: string;
  tags?: string[];
  shortDescription: string;
  keywords: string[];
  lineCount: number;
  sectionCount: number;
}

export interface FileSummary {
  source: DocumentSource;
  kind: "summary";
  summary: string;
}

export interface SectionContent {
  markdown: string;
  source: PassageSource;
}

export type FileContent = SectionContent | { markdown: ""; source: DocumentSource };

export type SearchQuery =
  | { kind: "keywords"; keywords: string[]; caseSensitive?: boolean }
  | { kind: "regex"; pattern: string; caseSensitive?: boolean };

export interface FileSpec {
  documentIds: number[];
}

export interface SearchContextOptions {
  beforeLines?: number;
  afterLines?: number;
}

export interface SearchResult {
  matches: { snippet: string; source: PassageSource; matchLines?: number[] }[];
  truncated?: true;
}

export type AgentSearchReference =
  | { kind: "passage"; source: PassageSource }
  | { kind: "summary"; source: DocumentSource };

export interface AgentSearchResult {
  answer: string;
  references: AgentSearchReference[];
}
