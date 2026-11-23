import { createHash } from 'node:crypto';
import { KbError } from '../../contracts/errors.js';
import type { DocumentMapStore, IndexEngine } from '../../contracts/interfaces.js';
import type { DocumentId, DocumentInfo, DocumentMap, IndexMatch, IndexSearchOptions, IndexSearchResult,
  SemanticIndexSearchOptions } from '../../contracts/types.js';
import type { IndexTarget } from '../../core/indexing-worker.js';
import { encodeCursor } from '../../shared/cursor.js';
import { sourceFingerprint } from '../../shared/metadata.js';
import type { Embedder } from './interfaces.js';
import type { MapRepository } from './repository.js';
import { indexKey, publicationMetadata } from './revision.js';
import { compareText, embedQuery, keywordQuery, readOffset } from './search-query.js';
import type { Artifact } from './types.js';
import { normalizeVector } from './vector.js';

export class DocumentMapIndexer implements IndexEngine, IndexTarget {
  constructor(private readonly store: Pick<DocumentMapStore, 'stat' | 'readDocumentMap' | 'readDocumentMarkdown'>,
    private readonly repository: MapRepository, private readonly version: string, private readonly embedder?: Embedder) {}

  listPublished(): DocumentId[] { return this.repository.listPublished(); }
  async remove(id: DocumentId): Promise<void> { this.repository.remove(id); }

  isCurrent(info: DocumentInfo, map: DocumentMap): boolean {
    const published = this.repository.getPublication(info.documentId);
    return published?.sha === info.sha && published.key === indexKey(this.version, map) &&
      published.metadata === publicationMetadata(info, map) && this.repository.hasIndexedArtifact(published.key);
  }

  async index(documentId: DocumentId): Promise<void> {
    const info = await this.store.stat(documentId);
    const map = await this.store.readDocumentMap(documentId);
    if (!map) throw new KbError('not_found', 'Missing document map for indexing');
    const key = indexKey(this.version, map);
    let artifact: Artifact | undefined;
    let vectors: Float32Array[] | undefined;
    if (!this.repository.hasIndexedArtifact(key)) {
      const text = await this.store.readDocumentMarkdown(documentId);
      if (text === undefined) throw new KbError('not_found', 'Missing Markdown revision for indexing');
      if (createHash('sha256').update(text).digest('hex') !== map.markdownSha) {
        throw new Error('The map does not match the stored Markdown');
      }
      const { metadata: _metadata, ...sectionMap } = map;
      artifact = { ...sectionMap, text };
      const embedder = this.embedder;
      if (embedder && map.sections.length) {
        const lines = text.split('\n');
        const inputs = map.sections.map(section => [section.title, section.shortDescription, section.summary,
          section.keywords.join(', '),
          lines.slice(section.lineStart - 1, section.lineEnd).join('\n')].join('\n'));
        const result = await embedder.embedDocuments(inputs);
        if (result.length !== inputs.length) throw new TypeError('The embedder must return one vector per section');
        vectors = result.map(vector => normalizeVector(vector, embedder.dimensions));
      }
    }
    const current = await this.store.stat(documentId);
    if (sourceFingerprint(current) !== sourceFingerprint(info)) {
      throw new Error('Cannot publish indexes for a stale original');
    }
    this.repository.publish(info, publicationMetadata(info, map), key, artifact, vectors);
  }

  async searchKeyword(text: string, opts?: IndexSearchOptions): Promise<IndexSearchResult> {
    const paginate = prepareCandidates('keyword', text, opts);
    const query = keywordQuery(text);
    return paginate(query ? this.repository.keywordCandidates(query) : []);
  }

  async searchSemantic(text: string, opts?: SemanticIndexSearchOptions): Promise<IndexSearchResult> {
    if (!this.embedder) throw new KbError('not_supported', 'Semantic search requires an embedder');
    const paginate = prepareCandidates('semantic', text, opts, opts?.minScore);
    const query = await embedQuery(text, this.embedder);
    return paginate(this.repository.semanticCandidates(this.version, query));
  }

}

function prepareCandidates(kind: 'keyword' | 'semantic', text: string,
  { limit = 10, cursor }: IndexSearchOptions = {}, minScore?: number) {
  if (!text.trim()) throw new TypeError('Expected a non-empty search query');
  if (!Number.isSafeInteger(limit) || limit < 1) throw new RangeError('limit must be a positive integer');
  if (minScore !== undefined && (!Number.isFinite(minScore) || minScore < -1 || minScore > 1)) {
    throw new RangeError('minScore must be a cosine similarity between -1 and 1');
  }
  const fingerprint = createHash('sha256').update(JSON.stringify(['index', kind, text, minScore])).digest('hex');
  const offset = cursor === undefined ? 0 : readOffset(cursor, fingerprint);
  return (candidates: IndexMatch[]): IndexSearchResult => {
    const ordered = (minScore === undefined ? candidates : candidates.filter(({ score }) => score >= minScore))
      .sort((a, b) => b.score - a.score || compareText(a.documentId, b.documentId) || a.sectionId - b.sectionId);
    const matches = ordered.slice(offset, offset + limit);
    const next = offset + matches.length;
    return next < ordered.length ? { matches, nextCursor: encodeCursor([fingerprint, next]) } : { matches };
  };
}
