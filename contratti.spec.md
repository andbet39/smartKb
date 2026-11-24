# Contratti

## Metodi di interfaccia

`KnowledgeBase.write` genera un UUID v7 se `documentId` è omesso. Nello store locale l’ID è il nome letterale della cartella del documento: un nome non valido viene rifiutato, non trasformato. Le riscritture dello stesso ID non creano versioni.

`ObjectStore` elenca, legge, scrive e cancella file per chiave. Una lettura restituisce i byte del file oppure `undefined` se manca. `new DocumentMapStore(objectStore)` implementa `DocumentStore`: sceglie le chiavi di originale, metadati e artefatti e usa le stesse operazioni su file per tutti e tre.

```ts
interface MarkdownConverter {
  convert(body: Uint8Array, contentType?: string, onProgress?: ProgressReporter): Promise<ConvertedMarkdown>;
}

interface DocumentStore {
  stat(documentId: DocumentId): Promise<DocumentInfo>;
  list(idPrefix?: string, cursor?: string): Promise<DocumentPage>;
  read(documentId: DocumentId): Promise<Uint8Array>;
  write(documentId: DocumentId, body: Uint8Array, source?: DocumentSourceInfo): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
  readDocumentArtifacts(documentId: DocumentId): Promise<{ map: DocumentMap; markdown: string; info: DocumentInfo } | undefined>;
  writeDocumentArtifacts(documentId: DocumentId, artifacts: DocumentArtifacts): Promise<void>;
  readText(documentId: DocumentId, lines?: LineRange): Promise<Document>;
  readDocumentMarkdown(documentId: DocumentId, lines?: LineRange): Promise<string | undefined>;
  readDocumentMap(documentId: DocumentId): Promise<DocumentMap | undefined>;
  listDocumentSections(documentId: DocumentId): Promise<DocumentSectionOverview[] | undefined>;
  getDocumentsToc(documentIds: DocumentId | readonly DocumentId[]): Promise<DocumentToc[]>;
  readDocumentSection(documentId: DocumentId, sectionId: number): Promise<DocumentSectionContent | undefined>;
}

interface IngestionEngine {
  ingest(markdown: string, context?: { pages?: MarkdownPage[]; onProgress?: ProgressReporter }): Promise<DocumentMap>;
}

interface IndexEngine {
  index(documentId: DocumentId, onProgress?: ProgressReporter): Promise<void>;
  remove(documentId: DocumentId): Promise<void>;
  searchKeyword(text: string, opts?: IndexSearchOptions): Promise<IndexSearchResult>;
  searchSemantic(text: string, opts?: SemanticIndexSearchOptions): Promise<IndexSearchResult>;
}

interface SearchEngine {
  searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult>;
  searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult>;
}

interface KnowledgeBase {
  getLangchainTools(options?: { semantic?: boolean }): StructuredToolInterface[];
  readonly id: string | number;
  readonly name: string;
  readonly description?: string;
  readonly documentStore: DocumentStore;
  readonly ingestionEngine: IngestionEngine;
  readonly indexEngine: IndexEngine;
  readonly searchEngine: SearchEngine;
  getDocumentsToc(documentIds: DocumentId | readonly DocumentId[]): Promise<DocumentToc[]>;
  searchDocumentsToc(mode: 'keyword' | 'semantic', text: string, opts?: SearchOptions): Promise<DocumentToc[]>;
  searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult>;
  searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult>;
  read(documentId: DocumentId, lines?: LineRange): Promise<Document>;
  list(idPrefix?: string, cursor?: string): Promise<DocumentPage>;
  write(body: Uint8Array, source?: DocumentSourceInfo, documentId?: DocumentId,
    onProgress?: (update: ProgressUpdate, documentId: DocumentId) => void): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
}
```

## Tipi

```ts
interface ProgressUpdate {
  percent: number;
  message: string;
}
type ProgressReporter = (update: ProgressUpdate) => void;
```

`percent` va da 0 a 100 per il modulo in esecuzione e può ripartire da zero al cambio di fase.

La lettura diretta conserva l'ordine degli ID e ignora duplicati e documenti senza mappa. Una mappa vuota produce una TOC con `sections: []`.
La ricerca applica il filtro metadati e `topK` come la ricerca corrispondente. Restituisce le TOC complete in ordine di rilevanza, senza passaggi di testo.

```ts
DocumentId = string;
type DocumentToc = { documentId: DocumentId; sections: DocumentSectionOverview[] };
DocumentSourceInfo = { originalFileName?: string; contentType?: string };

DocumentInfo = {
  documentId: DocumentId;
  sha: string;
  originalFileName?: string;
  contentType?: string;
};

DocumentFields = {
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
};

Document = {
  documentId: DocumentId;
  sha: string;
  originalFileName?: string;
  contentType?: string;
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
  text: string;
};

DocumentSection = {
  sectionId: number;
  order: number;
  title: string;
  shortDescription: string;
  summary: string;
  keywords: string[];
  lineStart: number;
  lineEnd: number;
};

DocumentSectionOverview = {
  sectionId: number;
  order: number;
  title: string;
  shortDescription: string;
  lineStart: number;
  lineEnd: number;
};

DocumentSectionContent = {
  sectionId: number;
  order: number;
  title: string;
  shortDescription: string;
  summary: string;
  keywords: string[];
  lineStart: number;
  lineEnd: number;
  markdown: string;
};

MarkdownPage = { page: number; lineStart: number; lineEnd: number };
ConvertedMarkdown = { markdown: string; pages?: MarkdownPage[] };
LineRange = { start: number; end: number };
DocumentPage = { items: DocumentId[]; nextCursor?: string };

DocumentMap = {
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
  summary?: string;
  markdownSha: string;
  lineCount: number;
  sections: DocumentSection[];
  pages?: MarkdownPage[];
};

DocumentArtifacts = { map: DocumentMap; markdown: string };

IndexSearchOptions = { limit?: number; cursor?: string };
SemanticIndexSearchOptions = { limit?: number; cursor?: string; threshold?: number };
SearchOptions = { topK?: number; filter?: Filter };

Filter = {
  title?: string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date };
  author?: string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date };
  createdAt?: string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date };
  modifiedAt?: string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date };
  tags?: string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date };
  originalFileName?: string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date };
  contentType?: string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date };
};

IndexMatch = { documentId: DocumentId; sectionId: number; score: number };
IndexSearchResult = { matches: IndexMatch[]; nextCursor?: string };

Passage = { text: string; lineStart?: number; lineEnd?: number; page?: number };

Hit = {
  documentId: DocumentId;
  sha: string;
  originalFileName?: string;
  contentType?: string;
  title?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
  rank: number;
  score?: number;
  passages: Passage[];
};

SearchResult = { hits: Hit[] };
IndexStatus = 'indexed' | 'pending' | 'failed' | 'absent';
KbErrorCode = 'not_found' | 'unsupported_filter' | 'not_supported' | 'backend_unavailable';
```
