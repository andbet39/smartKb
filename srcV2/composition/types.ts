import type { DocumentMapStore, Indexer, KnowledgeBase } from '../contracts/interfaces.js';
import type { MapBackendConfig } from '../backends/map/types.js';

export type LocalKnowledgeBaseConfig = Omit<MapBackendConfig, 'filename'> & { id: string; directory: string };
export type LocalKnowledgeBase = {
  kb: KnowledgeBase;
  store: DocumentMapStore;
  indexer: Indexer;
  reconcile(): Promise<void>;
  close(): Promise<void>;
};