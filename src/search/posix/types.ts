import type { EmbeddingsInterface } from "@langchain/core/embeddings";
import type { DocumentId, DocumentSection } from "../../document/types.ts";

export interface POSIXSearchOptions {
  /** Root of an already initialized POSIX KB. */
  root: string;
  /** Maximum results per query. Default 100. */
  maxLimit?: number;
  semantic?: { embeddings: Pick<EmbeddingsInterface, "embedQuery">; modelId: string };
}

export type RankedSectionRow = Pick<
  DocumentSection, "sectionId" | "title" | "shortDescription" | "summary" | "fromLine" | "toLine"
> & {
  documentId: DocumentId;
  /** BM25 rank or cosine distance: lower is better. */
  rank: number;
};