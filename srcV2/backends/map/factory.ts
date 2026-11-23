import { createHash } from 'node:crypto';
import type { DocumentMapStore } from '../../contracts/interfaces.js';
import { DefaultDocumentPreparation } from '../../core/document-preparation.js';
import { IndexingWorker } from '../../core/indexing-worker.js';
import { MarkdownIngestor } from '../../ingestion/markdown-ingestor.js';
import { documentMarkdownConverter } from '../../ingestion/extraction.js';
import { DocumentMapIndexer } from './indexer.js';
import type { ManagedMapBackend } from './interfaces.js';
import { MapRepository } from './repository.js';
import { MapSearchEngine } from './search-engine.js';
import type { MapBackendConfig } from './types.js';

export function mapBackend(store: DocumentMapStore, config: unknown): ManagedMapBackend {
  validateConfig(config);
  const { filename, pipelineVersion = '1', analyzer, ingestor = new MarkdownIngestor(analyzer),
    converter = documentMarkdownConverter, embedder,
    reconcileIntervalMs = 30_000, onError } = config;
  const indexVersion = createHash('sha256').update(JSON.stringify([
    2, embedder?.modelId, embedder?.dimensions,
  ])).digest('hex');
  const repository = new MapRepository(filename, embedder !== undefined);
  const report = onError ?? ((error: unknown) => console.warn('Map indexing failed', error));
  const preparation = new DefaultDocumentPreparation(store, converter, ingestor, `4:${pipelineVersion}`);
  const target = new DocumentMapIndexer(store, repository, indexVersion, embedder);
  const indexer = new IndexingWorker(store, preparation, target, report);
  const reconcileInBackground = () => {
    void indexer.reconcile().catch(error => {
      try { report(error); } catch (callbackError) { console.warn('Map backend error callback failed', callbackError); }
    });
  };
  reconcileInBackground();
  const timer = setInterval(reconcileInBackground, reconcileIntervalMs).unref();
  let closing: Promise<void> | undefined;
  return {
    engine: new MapSearchEngine(target, store, indexVersion),
    indexer,
    reconcile: () => indexer.reconcile(),
    close() {
      clearInterval(timer);
      closing ??= indexer.close().finally(() => repository.close());
      return closing;
    },
  };
}

function validateConfig(value: unknown): asserts value is MapBackendConfig {
  if (!value || typeof value !== 'object') throw new TypeError('Expected a map backend configuration');
  const { filename, pipelineVersion, analyzer, ingestor, converter, embedder, reconcileIntervalMs, onError } = value as MapBackendConfig;
  if (typeof filename !== 'string' || !filename) throw new TypeError('Expected a map database filename');
  if (pipelineVersion !== undefined && (typeof pipelineVersion !== 'string' || !pipelineVersion)) {
    throw new TypeError('Expected a non-empty pipelineVersion');
  }
  if (analyzer !== undefined && (!analyzer || typeof analyzer.analyze !== 'function' || !pipelineVersion)) {
    throw new TypeError('A custom analyzer requires analyze() and an explicit pipelineVersion');
  }
  if (ingestor !== undefined && (!ingestor || typeof ingestor.ingest !== 'function' || !pipelineVersion || analyzer !== undefined)) {
    throw new TypeError('A custom ingestor requires ingest(), an explicit pipelineVersion and no analyzer');
  }
  if (converter !== undefined && (!converter || typeof converter.convert !== 'function' || !pipelineVersion)) {
    throw new TypeError('A custom converter requires convert() and an explicit pipelineVersion');
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