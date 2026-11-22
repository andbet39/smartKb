// Data types shared by the parser, the store and the KB manager.
// Line and page numbers are 1-based and inclusive.

/** A physical page. A blank page has no line range. */
export interface DocumentPage {
  pageNumber: number;
  fromLine?: number;
  toLine?: number;
}

export interface DocumentSection {
  sectionId: number;
  order: number;
  title: string;
  fromLine: number;
  toLine: number;
  fromPage?: number;
  toPage?: number;
  tokens: number;
  totalTokens: number;
  summary: string;
  shortDescription: string;
  keywords: string[];
}

/** A canonical UUID v7 or a non-negative safe integer retained for compatibility. */
export type DocumentId = string | number;

export interface DocumentMap {
  documentId: DocumentId;
  originalFileName?: string;
  title?: string;
  author?: string;
  fileType?: string;
  tags?: string[];
  lineCount: number;
  summary: string;
  shortDescription: string;
  keywords: string[];
  sections: DocumentSection[];
}

/** A parsed document: canonical Markdown (LF, no trailing newline) plus its map. */
export interface ParsedDocument {
  markdown: string;
  pages?: DocumentPage[];
  map: DocumentMap;
}

/** Identifies a document in citations. */
export type DocumentSource = Pick<DocumentMap, "documentId" | "originalFileName" | "title">;

/** A line range inside a document, with the pages it actually covers. */
export interface PassageSource extends DocumentSource {
  fromLine: number;
  toLine: number;
  /** Pages with lines in the range; `null` when the document has no page map. */
  pages: Required<DocumentPage>[] | null;
  /** Present when the range lies entirely within one section. */
  sectionId?: number;
  sectionTitle?: string;
}

export interface SectionSource extends PassageSource {
  sectionId: number;
  sectionTitle: string;
}

export interface DocumentTableOfContents {
  source: DocumentSource;
  shortDescription: string;
  sections: { source: SectionSource; shortDescription: string }[];
}
