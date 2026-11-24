import type { DocumentStore, IndexEngine, SearchEngine } from '../../contracts/interfaces.js';
import type { DocumentArtifacts, DocumentId, DocumentInfo, Hit, IndexMatch, SearchOptions, SearchResult } from '../../contracts/types.js';
import { splitLines } from '../../shared/markdown.js';
import { documentMetadata } from '../../shared/metadata.js';
import { compileFilter } from './filters.js';
import { compareText } from './search-query.js';
import type { SectionMatch } from './types.js';

export class MapSearchEngine implements SearchEngine {
  constructor(
    private readonly index: IndexEngine,
    private readonly store: Pick<DocumentStore, 'readDocumentArtifacts'>,
  ) {}

  async searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult> {
    return this.search('Keyword', text, opts);
  }

  async searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult> {
    return this.search('Semantic', text, opts);
  }

  private async search(kind: 'Keyword' | 'Semantic', text: string, opts?: SearchOptions): Promise<SearchResult> {
    const selectHits = prepareSearch(text, opts);
    const sections: SectionMatch[] = [];
    const documents = new Map<DocumentId, ReturnType<typeof resolveSection> | undefined>();
    let cursor: string | undefined;
    do {
      // The public limit counts documents, not sections. Keep every passage for the selected documents.
      const page = await this.index[`search${kind}`](text, { limit: Number.MAX_SAFE_INTEGER, cursor });
      for (const match of page.matches) {
        if (!documents.has(match.documentId)) {
          const artifacts = await this.store.readDocumentArtifacts(match.documentId);
          documents.set(match.documentId, artifacts && resolveSection(artifacts));
        }
        const found = documents.get(match.documentId)?.(match);
        if (found) sections.push(found);
      }
      cursor = page.nextCursor;
    } while (cursor !== undefined);
    return selectHits(sections);
  }
}

function resolveSection({ info, map, markdown }: DocumentArtifacts & { info: DocumentInfo }) {
  const sections = new Map(map.sections.map(section => [section.sectionId, section]));
  const lines = splitLines(markdown);
  const metadata = documentMetadata(info, map);
  return ({ sectionId, score }: IndexMatch): SectionMatch | undefined => {
    const section = sections.get(sectionId);
    if (!section) return undefined;
    const { lineStart, lineEnd } = section;
    const page = map.pages?.find(page => page.lineStart <= lineStart && page.lineEnd >= lineEnd)?.page;
    return {
      info: metadata, score,
      passage: { text: lines.slice(lineStart - 1, lineEnd).join('\n'), lineStart, lineEnd,
        ...(page !== undefined && { page }) },
    };
  };
}

function prepareSearch(text: string, options: SearchOptions = {}) {
  const { topK = 10, filter } = options;
  if (!text.trim()) throw new TypeError('Expected a non-empty search query');
  if (!Number.isSafeInteger(topK) || topK < 1) throw new RangeError('topK must be a positive integer');
  const matches = compileFilter(filter);

  return (sections: SectionMatch[]): SearchResult => {
    const ordered = sections.filter(({ info }) => matches(info)).sort(compareSections);
    const documents = new Map<string, Hit>();
    for (const { info, passage, score } of ordered) {
      const current = documents.get(info.documentId);
      if (current) current.passages.push(passage);
      else if (documents.size < topK) documents.set(info.documentId, { ...info, score, rank: documents.size + 1, passages: [passage] });
    }
    return { hits: [...documents.values()] };
  };
}

function compareSections(a: SectionMatch, b: SectionMatch): number {
  return b.score - a.score || compareText(a.info.documentId, b.info.documentId) ||
    (a.passage.lineStart ?? 0) - (b.passage.lineStart ?? 0);
}