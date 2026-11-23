import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { mapBackend } from '../backends/map/factory.js';
import { LocalObjectStore } from '../stores/local/object-store.js';
import { DefaultKnowledgeBase } from '../core/knowledge-base.js';
import type { LocalKnowledgeBase, LocalKnowledgeBaseConfig } from './types.js';

export function openLocalKnowledgeBase({ id, directory, ...settings }: LocalKnowledgeBaseConfig): LocalKnowledgeBase {
  mkdirSync(directory, { recursive: true });
  if (existsSync(join(directory, 'originals.sqlite'))) {
    throw new Error('This directory contains a SQLite originals store. Use a new directory and reimport the originals.');
  }
  const store = new LocalObjectStore(join(directory, 'originals'));
  try {
    const backend = mapBackend(store, { ...settings, filename: join(directory, 'map.sqlite') });
    const kb = new DefaultKnowledgeBase({ id, store, ...backend });
    let closing: Promise<void> | undefined;
    return {
      kb,
      store,
      indexer: backend.indexer,
      reconcile: backend.reconcile,
      close() {
        closing ??= backend.close().finally(() => store.close());
        return closing;
      },
    };
  } catch (error) {
    store.close();
    throw error;
  }
}