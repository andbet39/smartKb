import { createHash } from 'node:crypto';
import { KbError } from '../contracts/errors.js';
import type { DocumentStore, IngestionEngine, MarkdownConverter } from '../contracts/interfaces.js';
import type { DocumentInfo, DocumentMap, ProgressReporter } from '../contracts/types.js';
import type { DocumentIngestion } from '../indexing/indexing-worker.js';

export class DefaultDocumentIngestion implements DocumentIngestion {
  constructor(private readonly store: DocumentStore, private readonly converter: MarkdownConverter,
    private readonly ingestionEngine: IngestionEngine) {}

  async find(info: DocumentInfo): Promise<DocumentMap | undefined> {
    return this.store.readDocumentMap(info.documentId);
  }

  async run(info: DocumentInfo, onProgress?: ProgressReporter): Promise<DocumentMap | undefined> {
    const { documentId, sha, contentType } = info;
    const bytes = await this.store.read(documentId);
    if (digest(bytes) !== sha) throw new Error('The bytes read from the store do not match the original SHA');
    const { markdown, pages } = await this.converter.convert(bytes, contentType, onProgress);
    const map = { ...await this.ingestionEngine.ingest(markdown, { pages, onProgress }), pages };
    if (map.markdownSha !== digest(markdown)) throw new TypeError('The map does not match the Markdown SHA');

    let current: DocumentInfo;
    try { current = await this.store.stat(documentId); } catch (error) {
      if (error instanceof KbError && error.code === 'not_found') return undefined;
      throw error;
    }
    if (sha !== current.sha || contentType !== current.contentType) return undefined;
    await this.store.writeDocumentArtifacts(documentId, { markdown, map });
    return map;
  }

}

function digest(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}