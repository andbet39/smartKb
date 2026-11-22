import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import type { DocumentId } from "../../document/types.ts";

export interface CatalogFilter {
  /** Exclusive cursor: numbers sort first (numerically), UUIDs next (binary lexicographic order). */
  afterDocumentId?: DocumentId;
  ftsQuery?: string;
  tags?: string[];
  limit: number;
}

export interface PosixStoreOptions {
  /** KB folder; created if missing. */
  root: string;
  /** Upper bound for catalog page sizes. Default 100. */
  maxLimit?: number;
  /** Enables writing the semantic index. */
  semantic?: PosixSemanticOptions;
}

export interface PosixSemanticOptions {
  embeddings: EmbeddingsInterface;
  /** Recorded in the index: a different model on a later open is reported as `INDEX_MISMATCH`. */
  modelId: string;
  /** Sections embedded per request. Default 64. */
  batchSize?: number;
}

/** Contents of `.kb/store.json`. */
export interface PosixStoreSettings {
  embedding?: { modelId: string; dimensions: number };
}
