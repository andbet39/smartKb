import { createHash } from 'node:crypto';
import { KbError } from '../../contracts/errors.js';
import type { DocumentStore, IndexEngine } from '../../contracts/interfaces.js';
import type { DocumentId, DocumentInfo, DocumentMap, IndexMatch, IndexSearchOptions, IndexSearchResult,
  ProgressReporter, SemanticIndexSearchOptions } from '../../contracts/types.js';
import type { IndexTarget } from '../indexing-worker.js';
import { encodeCursor } from '../../shared/cursor.js';
import { splitLines } from '../../shared/markdown.js';
import { sourceFingerprint } from '../../shared/metadata.js';
import type { Embedder } from './interfaces.js';
import { MapRepository } from './repository.js';
import { indexKey } from './index-key.js';
import { compareText, embedQuery, keywordQuery, readOffset } from './search-query.js';
import { normalizeVector } from './vector.js';

export class DocumentMapIndexer implements IndexEngine, IndexTarget {
  private readonly repository: MapRepository;

  constructor(private readonly store: Pick<DocumentStore, 'stat' | 'readDocumentMap' | 'readDocumentMarkdown'>,
    directory: string, private readonly version: string, private readonly embedder?: Embedder) {
    this.repository = new MapRepository(directory, embedder !== undefined);
  }

  close(): void { this.repository.close(); }

  listPublished(): DocumentId[] { return this.repository.listPublished(); }
  async remove(id: DocumentId): Promise<void> { this.repository.remove(id); }

  isCurrent(info: DocumentInfo, map: DocumentMap): boolean {
    return this.repository.hasIndex(info.documentId, indexKey(this.version, map));
  }

  async index(documentId: DocumentId, onProgress?: ProgressReporter): Promise<void> {
    const info = await this.store.stat(documentId);
    const map = await this.store.readDocumentMap(documentId);
    if (!map) throw new KbError('not_found', 'Missing document map for indexing');
    const key = indexKey(this.version, map);
    if (this.repository.hasIndex(documentId, key)) return;
    onProgress?.({ percent: 0, message: 'Building section indexes' });
    const text = await this.store.readDocumentMarkdown(documentId);
    if (text === undefined) throw new KbError('not_found', 'Missing Markdown for indexing');
    if (createHash('sha256').update(text).digest('hex') !== map.markdownSha) {
      throw new Error('The map does not match the stored Markdown');
    }
    const lines = splitLines(text);
    const sections = map.sections.map(section => ({
      section, text: lines.slice(section.lineStart - 1, section.lineEnd).join('\n'),
    }));
    let vectors: Float32Array[] | undefined;
    const embedder = this.embedder;
    if (embedder && sections.length) {
      const inputs = sections.map(({ section, text }) => [section.title, section.shortDescription, section.summary,
        section.keywords.join(', '), text].join('\n'));
      const result = await embedder.embedDocuments(inputs);
      if (result.length !== inputs.length) throw new TypeError('The embedder must return one vector per section');
      vectors = result.map(vector => normalizeVector(vector, embedder.dimensions));
    }
    const current = await this.store.stat(documentId);
    if (sourceFingerprint(current) !== sourceFingerprint(info)) {
      throw new Error('Cannot publish indexes for a stale original');
    }
    this.repository.publish(documentId, key, sections, vectors);
    onProgress?.({ percent: 100, message: 'Section indexes published' });
  }

  async searchKeyword(text: string, opts?: IndexSearchOptions): Promise<IndexSearchResult> {
    const paginate = prepareCandidates('keyword', text, opts);
    const query = keywordQuery(text);
    return paginate(query ? this.repository.keywordCandidates(query) : []);
  }

  async searchSemantic(text: string, opts?: SemanticIndexSearchOptions): Promise<IndexSearchResult> {
    if (!this.embedder) throw new KbError('not_supported', 'Semantic search requires an embedder');
    const paginate = prepareCandidates('semantic', text, opts, opts?.threshold);
    const query = await embedQuery(text, this.embedder);
    return paginate(this.repository.semanticCandidates(this.version, query));
  }

}

function prepareCandidates(kind: 'keyword' | 'semantic', text: string,
  { limit = 10, cursor }: IndexSearchOptions = {}, threshold?: number) {
  if (!text.trim()) throw new TypeError('Expected a non-empty search query');
  if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('limit must be a positive integer');
  if (threshold !== undefined && (!Number.isFinite(threshold) || threshold < -1 || threshold > 1)) {
    throw new RangeError('threshold must be a cosine similarity between -1 and 1');
  }
  const fingerprint = createHash('sha256').update(JSON.stringify(['index', kind, text, threshold])).digest('hex');
  const offset = cursor === undefined ? 0 : readOffset(cursor, fingerprint);
  return (candidates: IndexMatch[]): IndexSearchResult => {
    const ordered = (threshold === undefined ? candidates : candidates.filter(({ score }) => score >= threshold))
      .sort((a, b) => b.score - a.score || compareText(a.documentId, b.documentId) || a.sectionId - b.sectionId);
    const matches = ordered.slice(offset, offset + limit);
    const next = offset + matches.length;
    return next < ordered.length ? { matches, nextCursor: encodeCursor([fingerprint, next]) } : { matches };
  };
}
