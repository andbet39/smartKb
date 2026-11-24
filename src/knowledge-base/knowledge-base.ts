import { v7 as uuidv7 } from 'uuid';
import type { KnowledgeBase, KnowledgeBaseComposition } from '../contracts/interfaces.js';
import type { Indexer } from '../indexing/indexing-worker.js';
import type { DocumentSourceInfo, DocumentId, LineRange, ProgressUpdate, SearchOptions } from '../contracts/types.js';
import { validateDocumentId } from '../shared/document-id.js';
import { createLangchainTools } from '../langchain/tools.js';

function warnProgressError(error: unknown): void { console.warn('KB progress callback failed', error); }

export function requireKbIdentity({ id, name }: Pick<KnowledgeBaseComposition, 'id' | 'name'>): void {
  if (id == null || name == null) throw new TypeError('Knowledge base id and name are required.');
}

export class DefaultKnowledgeBase implements KnowledgeBase {
  constructor(private readonly deps: KnowledgeBaseComposition, private readonly scheduler: Pick<Indexer, 'index' | 'remove'>) {
    requireKbIdentity(deps);
  }

  get id() { return this.deps.id; }
  get name() { return this.deps.name; }
  get description() { return this.deps.description; }
  get documentStore() { return this.deps.documentStore; }
  get ingestionEngine() { return this.deps.ingestionEngine; }
  get indexEngine() { return this.deps.indexEngine; }
  get searchEngine() { return this.deps.searchEngine; }

  getLangchainTools(options?: { semantic?: boolean }) {
    return createLangchainTools(this, options);
  }

  getDocumentsToc(documentIds: DocumentId | readonly DocumentId[]) {
    return this.documentStore.getDocumentsToc(documentIds);
  }

  async searchDocumentsToc(mode: 'keyword' | 'semantic', text: string, opts?: SearchOptions) {
    if (mode !== 'keyword' && mode !== 'semantic') throw new TypeError('Expected keyword or semantic search');
    const { hits } = mode === 'keyword' ? await this.searchKeyword(text, opts) : await this.searchSemantic(text, opts);
    return this.getDocumentsToc(hits.map(hit => hit.documentId));
  }

  searchKeyword(text: string, opts?: SearchOptions) {
    return this.deps.searchEngine.searchKeyword(text, opts);
  }

  searchSemantic(text: string, opts?: SearchOptions) {
    return this.deps.searchEngine.searchSemantic(text, opts);
  }

  read(documentId: DocumentId, lines?: LineRange) {
    return this.documentStore.readText(documentId, lines);
  }

  list(idPrefix?: string, cursor?: string) {
    return this.documentStore.list(idPrefix, cursor);
  }

  async write(body: Uint8Array, source?: DocumentSourceInfo, documentId: DocumentId = uuidv7(),
    onProgress?: (update: ProgressUpdate, documentId: DocumentId) => void) {
    validateDocumentId(documentId);
    const info = await this.documentStore.write(documentId, body, source);
    const report = onProgress && ((update: ProgressUpdate) => {
      try {
        void Promise.resolve(onProgress(update, documentId)).catch(warnProgressError);
      } catch (error) { warnProgressError(error); }
    });
    await this.scheduler.index([info.documentId], { info, report });
    return info;
  }

  async delete(documentId: DocumentId): Promise<void> {
    validateDocumentId(documentId);
    await this.documentStore.delete(documentId);
    await this.scheduler.remove([documentId]);
  }
}