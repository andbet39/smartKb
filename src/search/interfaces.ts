import type { KeywordQuery, SearchHit, SemanticQuery } from "./types.ts";

export interface KBSearchEngine {
  keywordSearch(query: KeywordQuery): Promise<SearchHit[]>;
  semanticSearch?(query: SemanticQuery): Promise<SearchHit[]>;
}