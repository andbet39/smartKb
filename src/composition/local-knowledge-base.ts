import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { mapBackend } from '../indexing/map/factory.js';
import { LocalObjectStore } from '../object-store/local-object-store.js';
import { DocumentMapStore } from '../document-store/document-map-store.js';
import { composeKnowledgeBase } from './knowledge-base.js';
import { requireKbIdentity } from '../knowledge-base/knowledge-base.js';
import type { LocalKnowledgeBase, LocalKnowledgeBaseConfig } from './types.js';

export function openLocalKnowledgeBase({ id, name, description, directory, ...settings }: LocalKnowledgeBaseConfig): LocalKnowledgeBase {
  requireKbIdentity({ id, name });
  mkdirSync(directory, { recursive: true });
  if (existsSync(join(directory, 'originals.sqlite'))) {
    throw new Error('This directory contains a SQLite originals store. Use a new directory and reimport the originals.');
  }
  const objects = new LocalObjectStore(join(directory, 'originals'));
  const store = new DocumentMapStore(objects);
  try {
    const backend = mapBackend(store, { ...settings, directory });
    return composeKnowledgeBase({
      id, name, description, documentStore: store, ingestionEngine: backend.ingestionEngine, indexEngine: backend.indexEngine,
      searchEngine: backend.searchEngine, scheduler: backend.scheduler, reconcile: backend.reconcile,
      closeBackend: () => backend.close(), closeStore: () => objects.close(),
    });
  } catch (error) {
    objects.close();
    throw error;
  }
}