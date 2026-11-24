import { KbError } from '../contracts/errors.js';
import type { DocumentStore, IndexEngine } from '../contracts/interfaces.js';
import type { DocumentId, DocumentInfo, DocumentMap, IndexStatus, ProgressReporter } from '../contracts/types.js';
import { validateDocumentId } from '../shared/document-id.js';
import { sourceFingerprint } from '../shared/metadata.js';

export interface IndexTarget extends Pick<IndexEngine, 'index' | 'remove'> {
  isCurrent(info: DocumentInfo, map: DocumentMap): boolean;
  listPublished(): DocumentId[];
}

export interface DocumentIngestion {
  find(info: DocumentInfo): Promise<DocumentMap | undefined>;
  run(info: DocumentInfo, onProgress?: ProgressReporter): Promise<DocumentMap | undefined>;
}

type WriteJob = { info: DocumentInfo; report?: ProgressReporter };

/** Schedules index changes; accepting a job does not imply publication. */
export interface Indexer {
  index(documentIds: DocumentId[], write?: WriteJob): Promise<void>;
  remove(documentIds: DocumentId[]): Promise<void>;
  status(documentId: DocumentId): Promise<IndexStatus>;
}

export class IndexingWorker implements Indexer {
  private readonly queued = new Map<DocumentId, WriteJob | undefined>();
  private readonly failed = new Map<DocumentId, string>();
  private worker?: Promise<unknown[]>;
  private reconciliation?: Promise<void>;
  private closing?: Promise<void>;
  private active?: DocumentId;
  private stopped = false;

  constructor(
    private readonly store: Pick<DocumentStore, 'list' | 'stat'>,
    private readonly ingestion: DocumentIngestion,
    private readonly target: IndexTarget,
    private readonly onError?: (error: unknown, documentId?: DocumentId) => void,
  ) {}

  async index(documentIds: DocumentId[], write?: WriteJob): Promise<void> { this.enqueue(documentIds, write); }

  async remove(documentIds: DocumentId[]): Promise<void> { this.enqueue(documentIds); }

  async status(documentId: DocumentId): Promise<IndexStatus> {
    validateDocumentId(documentId);
    const info = await this.findOriginal(documentId);
    if (!info) return 'absent';
    if (this.queued.has(documentId) || this.active === documentId) return 'pending';
    const map = await this.ingestion.find(info);
    if (map && this.target.isCurrent(info, map)) return 'indexed';
    return this.failed.get(documentId) === fingerprint(info) ? 'failed' : 'pending';
  }

  reconcile(): Promise<void> {
    if (this.stopped) return Promise.reject(new Error('The map indexer is closed'));
    this.reconciliation ??= this.reconcileStore().finally(() => { this.reconciliation = undefined; });
    return this.reconciliation;
  }

  close(): Promise<void> {
    this.stopped = true;
    this.closing ??= this.drain();
    return this.closing;
  }

  private async drain(): Promise<void> {
    try { await this.reconciliation; } finally { await this.worker; }
  }

  private enqueue(documentIds: DocumentId[], write?: WriteJob): void {
    if (this.stopped) throw new Error('The map indexer is closed');
    documentIds.forEach(validateDocumentId);
    for (const id of documentIds) {
      if (write?.info.documentId === id) this.queued.set(id, write);
      else if (!this.queued.has(id)) this.queued.set(id, undefined);
    }
    if (this.queued.size && !this.worker) this.worker = this.runQueue();
  }

  private async reconcileStore(): Promise<void> {
    const seen = new Set<DocumentId>();
    let cursor: string | undefined;
    do {
      const page = await this.store.list(undefined, cursor);
      if (this.stopped) return;
      for (const id of page.items) seen.add(id);
      cursor = page.nextCursor;
    } while (cursor !== undefined);
    for (const id of this.target.listPublished()) seen.add(id);
    for (const id of this.failed.keys()) seen.add(id);
    this.enqueue([...seen]);
    const errors = await this.worker;
    if (errors?.length === 1) throw errors[0];
    if (errors?.length) throw new AggregateError(errors, 'Multiple map indexing jobs failed');
  }

  private async runQueue(): Promise<unknown[]> {
    const errors: unknown[] = [];
    try {
      for (const [id, write] of this.queued) {
        this.queued.delete(id);
        this.active = id;
        try { await this.synchronize(id, write); } catch (error) {
          errors.push(error);
          this.report(error, id);
        }
      }
    } finally {
      this.active = undefined;
      this.worker = undefined;
    }
    return errors;
  }

  private async synchronize(id: DocumentId, write?: WriteJob): Promise<void> {
    const info = await this.findOriginal(id);
    if (!info) {
      await this.target.remove(id);
      this.failed.delete(id);
      return;
    }
    try {
      if ((write && fingerprint(info) !== fingerprint(write.info)) || this.queued.get(id)) return;
      const report = write?.report;
      const map = await this.ingestion.find(info) ?? await this.ingestion.run(info, report);
      if (!map) return;
      if (!this.target.isCurrent(info, map) && !this.queued.get(id)) {
        if (report) await this.target.index(id, report);
        else await this.target.index(id);
      }
      this.failed.delete(id);
    } catch (error) {
      const current = await this.findOriginal(id);
      if (!current || fingerprint(current) !== fingerprint(info)) return;
      this.failed.set(id, fingerprint(info));
      throw error;
    }
  }

  private async findOriginal(id: DocumentId): Promise<DocumentInfo | undefined> {
    try { return await this.store.stat(id); } catch (error) {
      if (error instanceof KbError && error.code === 'not_found') return undefined;
      throw error;
    }
  }

  private report(error: unknown, id: DocumentId): void {
    if (!this.onError) { console.error('Map indexing failed', id, error); return; }
    try { this.onError(error, id); } catch (callbackError) {
      console.error('Map indexing failed', id, error);
      console.warn('Map backend error callback failed', callbackError);
    }
  }
}

function fingerprint(info: DocumentInfo): string { return sourceFingerprint(info); }