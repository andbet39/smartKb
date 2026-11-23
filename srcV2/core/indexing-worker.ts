import { KbError } from '../contracts/errors.js';
import type { IndexEngine, Indexer, ObjectStore } from '../contracts/interfaces.js';
import type { DocumentId, DocumentInfo, DocumentMap, IndexStatus } from '../contracts/types.js';
import { validateDocumentId } from '../shared/document-id.js';
import { sourceFingerprint } from '../shared/metadata.js';

export interface IndexTarget extends Pick<IndexEngine, 'index' | 'remove'> {
  isCurrent(info: DocumentInfo, map: DocumentMap): boolean;
  listPublished(): DocumentId[];
}

export interface DocumentPreparation {
  find(info: DocumentInfo): Promise<DocumentMap | undefined>;
  prepare(info: DocumentInfo): Promise<DocumentMap | undefined>;
}

export class IndexingWorker implements Indexer {
  private readonly queued = new Set<DocumentId>();
  private readonly failed = new Map<DocumentId, string>();
  private worker?: Promise<void>;
  private reconciliation?: Promise<void>;
  private closing?: Promise<void>;
  private active?: DocumentId;
  private stopped = false;

  constructor(
    private readonly store: ObjectStore,
    private readonly preparation: DocumentPreparation,
    private readonly target: IndexTarget,
    private readonly onError?: (error: unknown, documentId?: DocumentId) => void,
  ) {}

  async index(documentIds: DocumentId[]): Promise<void> { this.enqueue(documentIds); }

  async remove(documentIds: DocumentId[]): Promise<void> { this.enqueue(documentIds); }

  async status(documentId: DocumentId): Promise<IndexStatus> {
    validateDocumentId(documentId);
    const info = await this.findOriginal(documentId);
    if (!info) return 'absent';
    if (this.queued.has(documentId) || this.active === documentId) return 'pending';
    const map = await this.preparation.find(info);
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

  private enqueue(documentIds: DocumentId[]): void {
    if (this.stopped) throw new Error('The map indexer is closed');
    documentIds.forEach(validateDocumentId);
    for (const id of documentIds) this.queued.add(id);
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
    await this.worker;
  }

  private async runQueue(): Promise<void> {
    try {
      for (const id of this.queued) {
        this.queued.delete(id);
        this.active = id;
        try { await this.synchronize(id); } catch (error) { this.report(error, id); }
      }
    } finally {
      this.active = undefined;
      this.worker = undefined;
    }
  }

  private async synchronize(id: DocumentId): Promise<void> {
    const info = await this.findOriginal(id);
    if (!info) {
      await this.target.remove(id);
      this.failed.delete(id);
      return;
    }
    try {
      const map = await this.preparation.find(info) ?? await this.preparation.prepare(info);
      if (!map) return;
      if (!this.target.isCurrent(info, map)) await this.target.index(id);
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
    try { this.onError?.(error, id); } catch (callbackError) {
      console.warn('Map backend error callback failed', callbackError);
    }
  }
}

function fingerprint(info: DocumentInfo): string { return sourceFingerprint(info); }