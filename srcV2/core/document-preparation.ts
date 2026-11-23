import { createHash } from 'node:crypto';
import { KbError } from '../contracts/errors.js';
import type { DocumentMapStore, Ingestor, MarkdownConverter } from '../contracts/interfaces.js';
import type { DocumentInfo, DocumentMap } from '../contracts/types.js';
import type { DocumentPreparation } from './indexing-worker.js';

export class DefaultDocumentPreparation implements DocumentPreparation {
  constructor(private readonly store: DocumentMapStore, private readonly converter: MarkdownConverter,
    private readonly ingestor: Ingestor, private readonly version: string) {}

  async find(info: DocumentInfo): Promise<DocumentMap | undefined> {
    const map = await this.store.readDocumentMap(info.documentId);
    return map?.preparationVersion === this.preparationVersion(info) ? map : undefined;
  }

  async prepare(info: DocumentInfo): Promise<DocumentMap | undefined> {
    const { documentId, sha, contentType } = info;
    const bytes = await this.store.read(documentId);
    if (digest(bytes) !== sha) throw new Error('The bytes read from the store do not match the original SHA');
    const { markdown, pages } = await this.converter.convert(bytes, contentType);
    const map = { ...await this.ingestor.ingest(markdown, { pages }), pages, preparationVersion: this.preparationVersion(info) };
    if (map.markdownSha !== digest(markdown)) throw new TypeError('The map does not match the Markdown SHA');

    let current: DocumentInfo;
    try { current = await this.store.stat(documentId); } catch (error) {
      if (error instanceof KbError && error.code === 'not_found') return undefined;
      throw error;
    }
    if (sha !== current.sha || map.preparationVersion !== this.preparationVersion(current)) return undefined;
    await this.store.writeDocumentMarkdown(documentId, markdown);
    await this.store.writeDocumentMap(documentId, map);
    return map;
  }

  private preparationVersion(info: DocumentInfo): string {
    return JSON.stringify([this.version, info.contentType]);
  }
}

function digest(value: string | Uint8Array): string {
  return createHash('sha256').update(value).digest('hex');
}