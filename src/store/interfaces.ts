import type { DocumentId, ParsedDocument } from "../document/types.ts";
import type { CatalogPage, CatalogQuery } from "./types.ts";

/**
 * Storage of a knowledge base. One writer per store; concurrent reads are allowed.
 * Every method rejects with a `KbStoreError`.
 *
 * Visibility: a document becomes visible to reads and searches only when `add` completes,
 * and stops being visible as soon as `delete` starts.
 */
export interface KbStore {
  /** Upper bound for catalog page sizes. */
  readonly maxLimit: number;

  /**
    * Validates and saves a document under `doc.map.documentId`.
    * Fails with `ALREADY_EXISTS` if the ID is already used.
   */
  add(doc: ParsedDocument): Promise<void>;
  /** Returns `false` if no visible document has this ID. */
  delete(documentId: DocumentId): Promise<boolean>;

  /** Map and pages, without the Markdown. */
  get(documentId: DocumentId): Promise<Omit<ParsedDocument, "markdown">>;
  /** Canonical Markdown. */
  read(documentId: DocumentId): Promise<string>;
  /** Catalog page ordered by ascending `documentId`. */
  list(query: CatalogQuery): Promise<CatalogPage>;

  close(): Promise<void>;
}
