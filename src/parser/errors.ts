import type { DocumentId } from "../document/types.ts";

/** Wraps any failure while parsing one document, keeping its ID and the original cause. */
export class DocumentParseError extends Error {
  constructor(readonly documentId: DocumentId, cause: unknown) {
    super(`Document ${documentId}: ${cause instanceof Error ? cause.message : String(cause)}`, { cause });
    this.name = "DocumentParseError";
  }
}
