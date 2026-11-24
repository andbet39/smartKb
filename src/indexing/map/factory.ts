import { createHash } from 'node:crypto';
import type { DocumentStore } from '../../contracts/interfaces.js';
import { DefaultDocumentIngestion } from '../../ingestion/document-ingestion.js';
import { IndexingWorker } from '../indexing-worker.js';
import { documentMarkdownConverter } from '../../conversion/markdown-converter.js';
import { DocumentMapIndexer } from './indexer.js';
import type { ManagedMapBackend } from './interfaces.js';
import { MapSearchEngine } from './search-engine.js';
import type { MapBackendConfig } from './types.js';

export function mapBackend(store: DocumentStore, config: unknown): ManagedMapBackend {
  validateConfig(config);
  const { directory, ingestionEngine,
    converter = documentMarkdownConverter, embedder,
    reconcileIntervalMs = 30_000, onError } = config;
  const indexVersion = createHash('sha256').update(JSON.stringify([
    2, embedder?.modelId, embedder?.dimensions,
  ])).digest('hex');
  const report = onError ?? ((error: unknown) => console.warn('Map indexing failed', error));
  const ingestion = new DefaultDocumentIngestion(store, converter, ingestionEngine);
  const target = new DocumentMapIndexer(store, directory, indexVersion, embedder);
  const indexer = new IndexingWorker(store, ingestion, target, report);
  const reconcileInBackground = () => {
    void indexer.reconcile().catch(error => {
      try { report(error); } catch (callbackError) { console.warn('Map backend error callback failed', callbackError); }
    });
  };
  reconcileInBackground();
  const timer = setInterval(reconcileInBackground, reconcileIntervalMs).unref();
  let closing: Promise<void> | undefined;
  return {
    searchEngine: new MapSearchEngine(target, store),
    ingestionEngine,
    indexEngine: target,
    scheduler: indexer,
    reconcile: () => indexer.reconcile(),
    close() {
      clearInterval(timer);
      closing ??= indexer.close().finally(() => target.close());
      return closing;
    },
  };
}

function validateConfig(value: unknown): asserts value is MapBackendConfig {
  if (!value || typeof value !== 'object') throw new TypeError('Expected a map backend configuration');
  const { directory, ingestionEngine, converter, embedder, reconcileIntervalMs, onError } =
    value as MapBackendConfig;
  if (typeof directory !== 'string' || !directory) throw new TypeError('Expected a map index directory');
  if (!ingestionEngine || typeof ingestionEngine.ingest !== 'function') {
    throw new TypeError('Expected an ingestion engine with ingest()');
  }
  if (converter !== undefined && (!converter || typeof converter.convert !== 'function')) {
    throw new TypeError('Expected a Markdown converter with convert()');
  }
  if (embedder !== undefined && (!embedder || typeof embedder.modelId !== 'string' || !embedder.modelId ||
      !Number.isSafeInteger(embedder.dimensions) || embedder.dimensions < 1 ||
      typeof embedder.embedDocuments !== 'function' || typeof embedder.embedQuery !== 'function')) {
    throw new TypeError('Expected an embedder with a model ID, positive dimensions and both embedding methods');
  }
  if (reconcileIntervalMs !== undefined && (!Number.isInteger(reconcileIntervalMs) ||
      reconcileIntervalMs < 1 || reconcileIntervalMs > 2_147_483_647)) {
    throw new RangeError('Invalid reconciliation interval');
  }
  if (onError !== undefined && typeof onError !== 'function') throw new TypeError('Expected an onError callback');
}