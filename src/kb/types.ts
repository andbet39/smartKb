import type { BaseChatModel } from "@langchain/core/language_models/chat_models";
import type { DocumentMap, DocumentSource, PassageSource, SectionSource } from "../document/types.ts";
import type { DocumentCard } from "../store/types.ts";

// Options of the KB manager and results of its kb* methods (the same JSON the tools return).

export interface KbOpenOptions {
  /** Result limit sent to the keyword engine. Default 100. */
  searchLimit?: number;
  /** Chat model with tool calling, required only by `kbAgentSearch`. */
  llm?: Pick<BaseChatModel, "bindTools">;
}

export interface TableOfContentsQuery {
  /** Full-text filter on title, file name, short description and keywords. */
  text?: string;
  tags?: string[];
  /** `nextCursor` of the previous page. */
  cursor?: string;
}

export interface KbTableOfContents {
  documents: DocumentCard[];
  /** Present when more documents follow. */
  nextCursor?: string;
}

export type DocumentInfo = DocumentCard & Pick<DocumentMap, "author" | "fileType" | "lineCount">;

export interface DocumentSummary {
  source: DocumentSource;
  kind: "summary";
  summary: string;
}

/** Text of a document or of a passage. An empty document has a document-level source. */
export interface DocumentContent {
  markdown: string;
  source: PassageSource | DocumentSource;
}

export type SearchQuery =
  | { kind: "keywords"; keywords: string[]; caseSensitive?: boolean }
  /** JavaScript regular expression (flags `u`/`iu`); requires `documentIds`. */
  | { kind: "regex"; pattern: string; caseSensitive?: boolean };

export interface SearchOptions {
  /** Lines of context before each match, 0–20. Default 0. */
  beforeLines?: number;
  /** Lines of context after each match, 0–20. Default 0. */
  afterLines?: number;
  /** Return the whole section that contains each match instead of a window of lines. */
  fullSection?: boolean;
}

export interface SearchMatch {
  snippet: string;
  source: PassageSource;
  /** Lines of the snippet that matched. */
  matchLines: number[];
}

export interface SearchResult {
  matches: SearchMatch[];
  /** Some results were left out: narrow the query or filter by document. */
  truncated?: true;
}

export interface SemanticMatch {
  source: SectionSource;
  shortDescription: string;
  summary?: string;
  score?: number;
  /** Section text, with `fullSection: true` and within the text budget. */
  markdown?: string;
}

export interface SemanticSearchResult {
  matches: SemanticMatch[];
  truncated?: true;
}

export type AgentSearchReference =
  | { kind: "passage"; source: PassageSource }
  | { kind: "summary"; source: DocumentSource };

export interface AgentSearchResult {
  answer: string;
  references: AgentSearchReference[];
}
