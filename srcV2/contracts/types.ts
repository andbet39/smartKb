import type { ObjectStore, SearchBackend } from './interfaces.js';

export type DocumentId = string;

export type CanonicalMetadata = {
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
};

export type DocumentSourceInfo = { originalFileName?: string; contentType?: string };

export type DocumentInfo = DocumentSourceInfo & {
  documentId: DocumentId;
  sha: string;
};

export type DocumentSection = {
  /** Positive integer unique within the current map. */
  sectionId: number;
  /** One-based position in the document. */
  order: number;
  title: string;
  shortDescription: string;
  summary: string;
  keywords: string[];
  /** One-based, inclusive coordinates in the source Markdown. */
  lineStart: number;
  lineEnd: number;
};

export type DocumentSectionOverview = Pick<DocumentSection,
  'sectionId' | 'order' | 'title' | 'shortDescription' | 'lineStart' | 'lineEnd'>;

export type DocumentSectionContent = DocumentSectionOverview & Pick<DocumentSection, 'summary' | 'keywords'> & {
  /** The verbatim Markdown lines in the section, joined by LF. */
  markdown: string;
};

export type MarkdownPage = { page: number; lineStart: number; lineEnd: number };
export type ConvertedMarkdown = { markdown: string; pages?: MarkdownPage[] };

export type DocumentMap = {
  metadata: CanonicalMetadata;
  /** Markdown checksum, not a storage key. */
  markdownSha: string;
  /** Set by the preparation pipeline to decide whether this map can be reused. */
  preparationVersion?: string;
  lineCount: number;
  /** Ordered, contiguous sections covering all lines; empty for an empty document. */
  sections: DocumentSection[];
  pages?: MarkdownPage[];
};

export type IndexMatch = {
  documentId: DocumentId;
  sectionId: number;
  /** Higher is better within the same query and search method. BM25 and cosine scores are not comparable. */
  score: number;
  /** Opaque identifier of the indexed map revision, not just the original file checksum. */
  revision: string;
};

export type PreparedDocument = { info: DocumentInfo; map: DocumentMap; markdown: string };

export type IndexSearchOptions = {
  /** Maximum number of candidate sections per page; a positive integer when specified. */
  limit?: number;
  /** Opaque continuation token from the same search method, query and threshold. */
  cursor?: string;
};

export type SemanticIndexSearchOptions = IndexSearchOptions & {
  /** Inclusive minimum cosine similarity in [-1, 1], applied before pagination. Omit for no threshold. */
  minScore?: number;
};

export type IndexSearchResult = {
  /** Candidate sections ordered by descending score, with deterministic tie-breaking. */
  matches: IndexMatch[];
  nextCursor?: string;
};

export type Filter = Partial<Record<keyof (CanonicalMetadata & DocumentSourceInfo),
  string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date }>>;

export type SearchOptions = { topK?: number; filter?: Filter; cursor?: string };
export type Passage = { text: string; lineStart?: number; lineEnd?: number; page?: number };
export type Hit = DocumentInfo & { metadata: CanonicalMetadata; rank: number; score?: number; passages: Passage[] };
export type SearchResult = { hits: Hit[]; nextCursor?: string };
export type Document = DocumentInfo & { metadata: CanonicalMetadata; text: string };
export type LineRange = { start: number; end: number };
export type DocumentPage = { items: DocumentId[]; nextCursor?: string };
export type IndexStatus = 'indexed' | 'pending' | 'failed' | 'absent';
export type KbErrorCode = 'not_found' | 'unsupported_filter' | 'not_supported' | 'backend_unavailable';
export type BackendFactory<Store extends ObjectStore = ObjectStore> = (store: Store, config: unknown) => SearchBackend;