import type { ObjectStore } from './interfaces.js';

export type DocumentId = string;

export interface ProgressUpdate {
  /** Completion of the current module, from 0 to 100. */
  percent: number;
  message: string;
}

export type ProgressReporter = (update: ProgressUpdate) => void;

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

export type DocumentToc = { documentId: DocumentId; sections: DocumentSectionOverview[] };

export type DocumentSectionContent = DocumentSectionOverview & Pick<DocumentSection, 'summary' | 'keywords'> & {
  /** The verbatim Markdown lines in the section, joined by LF. */
  markdown: string;
};

export type MarkdownPage = { page: number; lineStart: number; lineEnd: number };
export type ConvertedMarkdown = { markdown: string; pages?: MarkdownPage[] };

export type DocumentFields = {
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
};

export type DocumentMap = DocumentFields & {
  summary?: string;
  /** Markdown checksum, not a storage key. */
  markdownSha: string;
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
};

export type DocumentArtifacts = { map: DocumentMap; markdown: string };

export type IndexSearchOptions = {
  /** Maximum number of candidate sections per page; a positive integer when specified. */
  limit?: number;
  /** Opaque continuation token from the same search method, query and threshold. */
  cursor?: string;
};

export type SemanticIndexSearchOptions = IndexSearchOptions & {
  /** Inclusive minimum cosine similarity in [-1, 1], applied before pagination. Omit for no threshold. */
  threshold?: number;
};

export type IndexSearchResult = {
  /** Candidate sections ordered by descending score, with deterministic tie-breaking. */
  matches: IndexMatch[];
  nextCursor?: string;
};

export type Filter = Partial<Record<keyof (DocumentFields & DocumentSourceInfo),
  string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date }>>;

export type SearchOptions = { topK?: number; filter?: Filter };
export type Passage = { text: string; lineStart?: number; lineEnd?: number; page?: number };
export type Hit = DocumentInfo & DocumentFields & { rank: number; score?: number; passages: Passage[] };
export type SearchResult = { hits: Hit[] };
export type Document = DocumentInfo & DocumentFields & { text: string };
export type LineRange = { start: number; end: number };
export type DocumentPage = { items: DocumentId[]; nextCursor?: string };
export type IndexStatus = 'indexed' | 'pending' | 'failed' | 'absent';
export type KbErrorCode = 'not_found' | 'unsupported_filter' | 'not_supported' | 'backend_unavailable';