import type { KBSearchEngine } from "./interfaces.ts";
import type { KeywordQuery, SearchHit, SemanticQuery } from "./types.ts";

export abstract class SearchEngine implements KBSearchEngine {
  abstract keywordSearch(query: KeywordQuery): Promise<SearchHit[]>;
  declare readonly semanticSearch?: (query: SemanticQuery) => Promise<SearchHit[]>;
}