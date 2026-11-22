import type { DocumentMap } from "../document/types.ts";

// Data types of the KB store contract. The contract itself is in ./interfaces.ts.

/** Lightweight catalog entry (about 600 bytes), so pages of the catalog stay small. */
export type DocumentCard = Pick<
  DocumentMap,
  "documentId" | "originalFileName" | "title" | "shortDescription" | "keywords" | "tags"
> & { sectionCount: number };

export interface CatalogQuery {
  /** Full-text filter on title, file name, short description and keywords. */
  text?: string;
  /** Only documents that have all these tags. */
  tags?: string[];
  limit: number;
  /** `nextCursor` of the previous page. */
  cursor?: string;
}

export interface CatalogPage {
  cards: DocumentCard[];
  /** Absent on the last page. */
  nextCursor?: string;
}

export type KbStoreErrorCode =
  | "NOT_FOUND"
  | "ALREADY_EXISTS"
  | "INVALID_DOCUMENT"
  | "INVALID_QUERY"
  | "INDEX_MISMATCH"
  | "CLOSED"
  | "BACKEND";
