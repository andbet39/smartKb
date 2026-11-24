import type { IngestionEngine, MarkdownConverter } from '../../contracts/interfaces.js';
import type { Document, DocumentId, DocumentSection, Passage } from '../../contracts/types.js';
import type { Embedder } from './interfaces.js';

export type IndexSection = { section: DocumentSection; text: string };
export type MapBackendConfig = {
  directory: string;
  ingestionEngine: IngestionEngine;
  converter?: MarkdownConverter;
  embedder?: Embedder;
  reconcileIntervalMs?: number;
  onError?: (error: unknown, documentId?: DocumentId) => void;
};
export type SectionMatch = { info: Omit<Document, 'text'>; passage: Passage; score: number };