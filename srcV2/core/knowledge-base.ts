import { randomUUID } from 'node:crypto';
import type { KnowledgeBase, KnowledgeBaseDeps } from '../contracts/interfaces.js';
import type { DocumentSourceInfo, DocumentId, LineRange, SearchOptions } from '../contracts/types.js';
import { validateDocumentId } from '../shared/document-id.js';

export class DefaultKnowledgeBase implements KnowledgeBase {
  constructor(private readonly deps: KnowledgeBaseDeps) {}

  get id() { return this.deps.id; }

  searchKeyword(text: string, opts?: SearchOptions) {
    return this.deps.engine.searchKeyword(text, opts);
  }

  searchSemantic(text: string, opts?: SearchOptions) {
    return this.deps.engine.searchSemantic(text, opts);
  }

  read(documentId: DocumentId, lines?: LineRange) {
    return this.deps.store.readText(documentId, lines);
  }

  list(idPrefix?: string, cursor?: string) {
    return this.deps.store.list(idPrefix, cursor);
  }

  async write(body: Uint8Array, source?: DocumentSourceInfo, documentId: DocumentId = randomUUID()) {
    validateDocumentId(documentId);
    const info = await this.deps.store.write(documentId, body, source);
    await this.notifyIndexer(() => this.deps.indexer.index([info.documentId]));
    return info;
  }

  async delete(documentId: DocumentId): Promise<void> {
    validateDocumentId(documentId);
    await this.deps.store.delete(documentId);
    await this.notifyIndexer(() => this.deps.indexer.remove([documentId]));
  }

  private async notifyIndexer(notify: () => Promise<void>): Promise<void> {
    try {
      await notify();
    } catch (error) {
      console.warn('Could not notify the KB indexer', error);
    }
  }
}