import type { Ingestor, MarkdownConverter } from '../../contracts/interfaces.js';
import type { Document, DocumentId, DocumentMap, Passage } from '../../contracts/types.js';
import type { SectionAnalyzer } from '../../ingestion/types.js';
import type { Embedder } from './interfaces.js';

export type Artifact = Omit<DocumentMap, 'metadata'> & { text: string };
export type MapBackendConfig = {
  filename: string;
  pipelineVersion?: string;
  analyzer?: SectionAnalyzer;
  ingestor?: Ingestor;
  converter?: MarkdownConverter;
  embedder?: Embedder;
  reconcileIntervalMs?: number;
  onError?: (error: unknown, documentId?: DocumentId) => void;
};
export type SectionMatch = { info: Omit<Document, 'text'>; passage: Passage; score: number };