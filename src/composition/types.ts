import type { KnowledgeBase, KnowledgeBaseComposition } from '../contracts/interfaces.js';
import type { Indexer } from '../indexing/indexing-worker.js';
import type { MapBackendConfig } from '../indexing/map/types.js';

export type ComposeKnowledgeBaseConfig = KnowledgeBaseComposition & {
  scheduler: Indexer;
  reconcile(): Promise<void>;
  closeBackend(): Promise<void>;
  closeStore?: () => void | Promise<void>;
};

export type ManagedKnowledgeBase = Pick<KnowledgeBaseComposition, 'documentStore' | 'indexEngine'> & {
  kb: KnowledgeBase;
  indexStatus: Indexer['status'];
  reconcile(): Promise<void>;
  close(): Promise<void>;
};

export type LocalKnowledgeBaseConfig = MapBackendConfig
  & Pick<KnowledgeBaseComposition, 'id' | 'name' | 'description'>;
export type LocalKnowledgeBase = ManagedKnowledgeBase;