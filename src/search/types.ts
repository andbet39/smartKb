import type { DocumentId, DocumentSection } from "../document/types.ts";

export interface KeywordQuery {
  /** Matched in OR, each as a phrase of whole words. */
  keywords: string[];
  caseSensitive?: boolean;
  documentIds?: DocumentId[];
  limit: number;
  fullSection?: boolean;
}

export interface SemanticQuery {
  text: string;
  documentIds?: DocumentId[];
  limit: number;
  fullSection?: boolean;
}

/** A pointer to one section of one document map. */
export type SearchHit = Pick<DocumentSection, "sectionId" | "title" | "shortDescription"> &
  Partial<Pick<DocumentSection, "summary">> & {
    documentId: DocumentId;
    /** Higher is more relevant; comparable only within one response. */
    score?: number;
    /** Keyword search only: absolute matching lines, possibly empty. */
    lines?: number[];
    /** Only with `fullSection: true`: the section text. */
    markdown?: string;
  };
