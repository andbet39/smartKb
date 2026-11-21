export interface DocumentSource {
  documentId: number;
  originalFileName: string | null;
  title?: string;
}

export interface PageSpan {
  pageNumber: number;
  fromLine: number;
  toLine: number;
}

export interface PassageSource extends DocumentSource {
  fromLine: number;
  toLine: number;
  pages: PageSpan[] | null;
  sectionId?: number;
  sectionTitle?: string;
}

export interface SectionSource extends PassageSource {
  sectionId: number;
  sectionTitle: string;
}

export interface KbTableOfContents {
  documents: { source: DocumentSource; shortDescription: string; sectionCount: number }[];
}

export interface FileTableOfContents {
  source: DocumentSource;
  sections: { source: SectionSource; shortDescription: string }[];
}

export interface FileInfo {
  source: DocumentSource;
  author?: string;
  fileType?: string;
  tags?: string[];
  shortDescription: string;
  keywords: string[];
  lineCount: number;
  sectionCount: number;
}

export interface FileSummary {
  source: DocumentSource;
  kind: "summary";
  summary: string;
}

export interface SectionContent {
  markdown: string;
  source: PassageSource;
}

export type FileContent = SectionContent | { markdown: ""; source: DocumentSource };

export type SearchQuery =
  | { kind: "keywords"; keywords: string[]; caseSensitive?: boolean }
  | { kind: "regex"; pattern: string; caseSensitive?: boolean };

export interface FileSpec {
  documentIds: number[];
}

export interface SearchResult {
  matches: { snippet: string; source: PassageSource }[];
}

export type AgentSearchReference =
  | { kind: "passage"; source: PassageSource }
  | { kind: "summary"; source: DocumentSource };

export interface AgentSearchResult {
  answer: string;
  references: AgentSearchReference[];
}
