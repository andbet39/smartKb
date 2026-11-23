import type {
  ConvertedMarkdown, Document, DocumentId, DocumentInfo, DocumentMap, DocumentPage, DocumentSourceInfo,
  DocumentSectionContent, DocumentSectionOverview, IndexSearchOptions, IndexSearchResult, IndexStatus, LineRange,
  MarkdownPage, PreparedDocument, SearchOptions, SearchResult, SemanticIndexSearchOptions,
} from './types.js';

export interface ObjectStore {
  stat(documentId: DocumentId): Promise<DocumentInfo>;
  list(idPrefix?: string, cursor?: string): Promise<DocumentPage>;
  read(documentId: DocumentId): Promise<Uint8Array>;
  write(documentId: DocumentId, body: Uint8Array, source?: DocumentSourceInfo): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
}

export interface Ingestor {
  /** Builds a map from canonical Markdown (LF, no trailing newline), without persisting it. */
  ingest(markdown: string, context?: { pages?: MarkdownPage[] }): Promise<DocumentMap>;
}

export interface MarkdownConverter {
  convert(body: Uint8Array, contentType?: string): Promise<ConvertedMarkdown>;
}

export interface DocumentMapStore extends ObjectStore {
  /** Reads the current source info, map and matching Markdown together; undefined if not prepared. */
  readPreparedDocument(documentId: DocumentId): Promise<PreparedDocument | undefined>;
  /** Reads the current document's prepared Markdown and metadata; rejects if not yet prepared. */
  readText(documentId: DocumentId, lines?: LineRange): Promise<Document>;
  /** Stores canonical Markdown for the current document. */
  writeDocumentMarkdown(documentId: DocumentId, markdown: string): Promise<void>;
  /** Returns undefined for missing Markdown; throws RangeError for an invalid line range. */
  readDocumentMarkdown(documentId: DocumentId, lines?: LineRange): Promise<string | undefined>;
  /** Returns undefined if the current document has no map. */
  readDocumentMap(documentId: DocumentId): Promise<DocumentMap | undefined>;
  /** Stores the map for the Markdown already stored for this document. */
  writeDocumentMap(documentId: DocumentId, map: DocumentMap): Promise<void>;
  /** Returns sections in document order, undefined for a missing map, and [] for an empty map. */
  listDocumentSections(documentId: DocumentId): Promise<DocumentSectionOverview[] | undefined>;
  /** Returns metadata and Markdown for one section, or undefined if the map or section is missing. */
  readDocumentSection(documentId: DocumentId, sectionId: number): Promise<DocumentSectionContent | undefined>;
}

export interface SearchEngine {
  searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult>;
  searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult>;
}

/** Publishes and searches section indexes without loading passages for search results. */
export interface IndexEngine {
  /** Loads the saved map and, when needed, Markdown. Resolves after publication; never performs ingestion. */
  index(documentId: DocumentId): Promise<void>;
  /** Removes the document from all search indexes. */
  remove(documentId: DocumentId): Promise<void>;
  /** Finds candidate sections ranked by BM25. */
  searchKeyword(text: string, opts?: IndexSearchOptions): Promise<IndexSearchResult>;
  /** Finds candidate sections ranked by cosine similarity; unsupported without an embedder. */
  searchSemantic(text: string, opts?: SemanticIndexSearchOptions): Promise<IndexSearchResult>;
}

/** Schedules index changes by document ID; accepting a job does not imply publication. */
export interface Indexer {
  index(documentIds: DocumentId[]): Promise<void>;
  remove(documentIds: DocumentId[]): Promise<void>;
  status(documentId: DocumentId): Promise<IndexStatus>;
}

export interface KnowledgeBase {
  readonly id: string;
  searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult>;
  searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult>;
  read(documentId: DocumentId, lines?: LineRange): Promise<Document>;
  list(idPrefix?: string, cursor?: string): Promise<DocumentPage>;
  write(body: Uint8Array, source?: DocumentSourceInfo, documentId?: DocumentId): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
}

export interface SearchBackend {
  engine: SearchEngine;
  indexer: Indexer;
}

export interface KnowledgeBaseDeps {
  id: string;
  store: DocumentMapStore;
  engine: SearchEngine;
  indexer: Indexer;
}