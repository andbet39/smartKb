import type { IndexEngine, IngestionEngine, SearchEngine } from '../../contracts/interfaces.js';
import type { Indexer } from '../indexing-worker.js';

export interface Embedder {
  readonly modelId: string;
  readonly dimensions: number;
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

export interface ManagedMapBackend {
  searchEngine: SearchEngine;
  ingestionEngine: IngestionEngine;
  indexEngine: IndexEngine;
  scheduler: Indexer;
  reconcile(): Promise<void>;
  close(): Promise<void>;
}