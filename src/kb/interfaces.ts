import type { DocumentId, DocumentTableOfContents, ParsedDocument } from "../document/types.ts";
import type {
  AgentSearchResult,
  DocumentContent,
  DocumentInfo,
  DocumentSummary,
  KbTableOfContents,
  SearchOptions,
  SearchQuery,
  SearchResult,
  SemanticSearchResult,
  TableOfContentsQuery,
} from "./types.ts";

/** What the LangChain tools call. Implemented by `KbSmartManager`. */
export interface KbToolsTarget {
  readonly hasSemanticSearch: boolean;
  kbGetTableOfContents(query?: TableOfContentsQuery): Promise<KbTableOfContents>;
  kbDocumentGetTableOfContents(documentId: DocumentId): Promise<DocumentTableOfContents>;
  kbDocumentGetInfo(documentId: DocumentId): Promise<DocumentInfo>;
  kbDocumentReadSummary(documentId: DocumentId): Promise<DocumentSummary>;
  kbDocumentRead(documentId: DocumentId): Promise<DocumentContent>;
  kbDocumentReadSection(documentId: DocumentId, sectionId: number): Promise<DocumentContent>;
  kbDocumentReadSection(documentId: DocumentId, fromLine: number, toLine: number): Promise<DocumentContent>;
  kbDocumentSearchByKeywords(query: SearchQuery, documentIds?: DocumentId[], options?: SearchOptions): Promise<SearchResult>;
  kbDocumentSearchSemantic(text: string, documentIds?: DocumentId[], options?: Pick<SearchOptions, "fullSection">): Promise<SemanticSearchResult>;
}

export interface AgentSearchTarget {
  kbAgentSearch(question: string): Promise<AgentSearchResult>;
}

/** Cached document access used by the search helpers. */
export interface DocumentReader {
  getDocument(documentId: DocumentId): Promise<Omit<ParsedDocument, "markdown">>;
  readLines(documentId: DocumentId): Promise<string[]>;
}
