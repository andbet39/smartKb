import type { StructuredToolInterface } from '@langchain/core/tools';
import type {
  ConvertedMarkdown, Document, DocumentId, DocumentInfo, DocumentMap, DocumentPage, DocumentSourceInfo, DocumentToc,
  DocumentSectionContent, DocumentSectionOverview, IndexSearchOptions, IndexSearchResult, LineRange,
  MarkdownPage, DocumentArtifacts, ProgressReporter, ProgressUpdate, SearchOptions, SearchResult, SemanticIndexSearchOptions,
} from './types.js';

export interface ObjectStore {
  list(prefix?: string): Promise<string[]>;
  read(key: string): Promise<Uint8Array | undefined>;
  /** Atomically creates or replaces a file. */
  write(key: string, body: Uint8Array): Promise<void>;
  delete(key: string): Promise<void>;
}

export interface IngestionEngine {
  /** Builds a map from canonical Markdown (LF, no trailing newline), without persisting it. */
  ingest(markdown: string, context?: { pages?: MarkdownPage[]; onProgress?: ProgressReporter }): Promise<DocumentMap>;
}

export interface MarkdownConverter {
  convert(body: Uint8Array, contentType?: string, onProgress?: ProgressReporter): Promise<ConvertedMarkdown>;
}

export interface DocumentStore {
  stat(documentId: DocumentId): Promise<DocumentInfo>;
  list(idPrefix?: string, cursor?: string): Promise<DocumentPage>;
  read(documentId: DocumentId): Promise<Uint8Array>;
  write(documentId: DocumentId, body: Uint8Array, source?: DocumentSourceInfo): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
  /** Reads the final artifacts and source info together; undefined if unavailable. */
  readDocumentArtifacts(documentId: DocumentId): Promise<(DocumentArtifacts & { info: DocumentInfo }) | undefined>;
  /** Publishes both final artifacts together or leaves the previous pair unchanged. */
  writeDocumentArtifacts(documentId: DocumentId, artifacts: DocumentArtifacts): Promise<void>;
  /** Reads final Markdown and metadata; rejects if unavailable. */
  readText(documentId: DocumentId, lines?: LineRange): Promise<Document>;
  /** Returns undefined for missing Markdown; throws RangeError for an invalid line range. */
  readDocumentMarkdown(documentId: DocumentId, lines?: LineRange): Promise<string | undefined>;
  /** Returns undefined if the current document has no map. */
  readDocumentMap(documentId: DocumentId): Promise<DocumentMap | undefined>;
  /** Returns sections in document order, undefined for a missing map, and [] for an empty map. */
  listDocumentSections(documentId: DocumentId): Promise<DocumentSectionOverview[] | undefined>;
  /** Returns one TOC per mapped ID in first-requested order. */
  getDocumentsToc(documentIds: DocumentId | readonly DocumentId[]): Promise<DocumentToc[]>;
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
  index(documentId: DocumentId, onProgress?: ProgressReporter): Promise<void>;
  /** Removes the document from all search indexes. */
  remove(documentId: DocumentId): Promise<void>;
  /** Finds candidate sections ranked by BM25. */
  searchKeyword(text: string, opts?: IndexSearchOptions): Promise<IndexSearchResult>;
  /** Finds candidate sections ranked by cosine similarity; unsupported without an embedder. */
  searchSemantic(text: string, opts?: SemanticIndexSearchOptions): Promise<IndexSearchResult>;
}

export interface KnowledgeBaseComposition {
  readonly id: string | number;
  readonly name: string;
  readonly description?: string;
  readonly documentStore: DocumentStore;
  readonly ingestionEngine: IngestionEngine;
  readonly indexEngine: IndexEngine;
  readonly searchEngine: SearchEngine;
}

export interface KnowledgeBase extends KnowledgeBaseComposition {
  getLangchainTools(options?: { semantic?: boolean }): StructuredToolInterface[];
  getDocumentsToc(documentIds: DocumentId | readonly DocumentId[]): Promise<DocumentToc[]>;
  searchDocumentsToc(mode: 'keyword' | 'semantic', text: string, opts?: SearchOptions): Promise<DocumentToc[]>;
  searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult>;
  searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult>;
  read(documentId: DocumentId, lines?: LineRange): Promise<Document>;
  list(idPrefix?: string, cursor?: string): Promise<DocumentPage>;
  write(body: Uint8Array, source?: DocumentSourceInfo, documentId?: DocumentId,
    onProgress?: (update: ProgressUpdate, documentId: DocumentId) => void): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
}
