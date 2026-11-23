import { createHash } from 'node:crypto';
import type { DocumentMapStore, IndexEngine, SearchEngine } from '../../contracts/interfaces.js';
import type { DocumentId, Hit, IndexMatch, PreparedDocument, SearchOptions, SearchResult } from '../../contracts/types.js';
import { encodeCursor } from '../../shared/cursor.js';
import { splitLines } from '../../shared/markdown.js';
import { compileFilter } from './filters.js';
import { indexKey, publicationMetadata, publicationRevision } from './revision.js';
import { compareText, readOffset } from './search-query.js';
import type { SectionMatch } from './types.js';

export class MapSearchEngine implements SearchEngine {
  constructor(
    private readonly index: IndexEngine,
    private readonly store: Pick<DocumentMapStore, 'readPreparedDocument'>,
    private readonly version: string,
  ) {}

  async searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult> {
    return this.search('Keyword', text, opts);
  }

  async searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult> {
    return this.search('Semantic', text, opts);
  }

  private async search(kind: 'Keyword' | 'Semantic', text: string, opts?: SearchOptions): Promise<SearchResult> {
    const paginate = prepareSearch(kind.toLowerCase(), text, opts);
    const sections: SectionMatch[] = [];
    const documents = new Map<DocumentId, ReturnType<typeof prepareDocument> | undefined>();
    let cursor: string | undefined;
    do {
      // The public limit counts documents, not sections. Keep every passage for the selected documents.
      const page = await this.index[`search${kind}`](text, { limit: Number.MAX_SAFE_INTEGER, cursor });
      for (const match of page.matches) {
        if (!documents.has(match.documentId)) {
          const prepared = await this.store.readPreparedDocument(match.documentId);
          documents.set(match.documentId, prepared && prepareDocument(prepared, this.version));
        }
        const found = documents.get(match.documentId)?.(match);
        if (found) sections.push(found);
      }
      cursor = page.nextCursor;
    } while (cursor !== undefined);
    return paginate(sections);
  }
}

function prepareDocument({ info, map, markdown }: PreparedDocument, version: string) {
  const revision = publicationRevision(indexKey(version, map), info.sha, publicationMetadata(info, map));
  const sections = new Map(map.sections.map(section => [section.sectionId, section]));
  const lines = splitLines(markdown);
  return ({ sectionId, score, revision: expected }: IndexMatch): SectionMatch | undefined => {
    if (expected !== revision) return undefined;
    const section = sections.get(sectionId);
    if (!section) return undefined;
    const { lineStart, lineEnd } = section;
    const page = map.pages?.find(page => page.lineStart <= lineStart && page.lineEnd >= lineEnd)?.page;
    return {
      info: { ...info, metadata: map.metadata }, score,
      passage: { text: lines.slice(lineStart - 1, lineEnd).join('\n'), lineStart, lineEnd,
        ...(page !== undefined && { page }) },
    };
  };
}

function prepareSearch(kind: string, text: string, options: SearchOptions = {}) {
  const { topK = 10, filter, cursor } = options;
  if (!text.trim()) throw new TypeError('Expected a non-empty search query');
  if (!Number.isSafeInteger(topK) || topK < 1) throw new RangeError('topK must be a positive integer');
  const matches = compileFilter(filter);
  const criteria = Object.entries(filter ?? {}).sort(([a], [b]) => compareText(a, b));
  const fingerprint = createHash('sha256').update(JSON.stringify([kind, text, criteria])).digest('hex');
  const offset = cursor === undefined ? 0 : readOffset(cursor, fingerprint);

  return (sections: SectionMatch[]): SearchResult => {
    const ordered = sections.filter(({ info }) => matches({ ...info.metadata,
      contentType: info.contentType, originalFileName: info.originalFileName,
    })).sort(compareSections);
    const documents = new Map<string, Hit>();
    for (const { info, passage, score } of ordered) {
      const current = documents.get(info.documentId);
      if (current) current.passages.push(passage);
      else documents.set(info.documentId, { ...info, score, rank: documents.size + 1, passages: [passage] });
    }
    const hits = [...documents.values()].slice(offset, offset + topK);
    const next = offset + hits.length;
    return next < documents.size ? { hits, nextCursor: encodeCursor([fingerprint, next]) } : { hits };
  };
}

function compareSections(a: SectionMatch, b: SectionMatch): number {
  return b.score - a.score || compareText(a.info.documentId, b.info.documentId) ||
    (a.passage.lineStart ?? 0) - (b.passage.lineStart ?? 0);
}