import type { SearchBackend } from '../../contracts/interfaces.js';

export interface Embedder {
  readonly modelId: string;
  readonly dimensions: number;
  embedDocuments(texts: string[]): Promise<number[][]>;
  embedQuery(text: string): Promise<number[]>;
}

export interface ManagedMapBackend extends SearchBackend {
  reconcile(): Promise<void>;
  close(): Promise<void>;
}