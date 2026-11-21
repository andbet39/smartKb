# Parser e KB Manager

## Metodi di interfaccia

### Parser

```ts
export declare function createDocumentParser(options: ParserOptions): DocumentParser;

export interface DocumentParser {
  parseDocument(input: DocumentInput): Promise<ParsedDocument>;
  parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]>;
}
```

- `createDocumentParser` richiede un modello con output strutturato e una funzione di conteggio dei token.
- `parseDocument` converte i byte in Markdown e genera indice, sezioni e sintesi. Per i PDF estrae il testo per pagina e usa l’OCR locale in italiano se manca il testo nativo. Gli errori di parsing espongono ID e causa tramite `DocumentParseError`.
- `parseDocuments` mantiene l’ordine degli input e si arresta al primo errore.

```ts
export declare function getDocumentTableOfContents(doc: ParsedDocument): DocumentTableOfContents;
export declare function getSectionMarkdown(
  doc: ParsedDocument,
  sectionId: number,
  options?: { pageTags?: boolean },
): string;
export declare function saveDocumentMarkdown(
  doc: ParsedDocument,
  filePath: string,
  options?: { sectionMarkers?: boolean },
): Promise<void>;
export declare function persist(doc: ParsedDocument, folder: string): Promise<void>;
export declare function load(folder: string): Promise<ParsedDocument>;
```

- `getDocumentTableOfContents` estrae l’indice delle sezioni con le descrizioni brevi; `getSectionMarkdown` estrae il testo per ID, con marcatori di pagina facoltativi, e segnala un errore se la sezione non esiste.
- `saveDocumentMarkdown` sovrascrive la destinazione in UTF-8. Inserisce un marcatore per ogni pagina PDF, anche vuota, e su richiesta uno per ogni sezione. I marcatori non cambiano le coordinate del documento.
- `persist` salva il Markdown senza marcatori aggiunti e un manifest JSON, creando la cartella se manca. `load` ricompone il documento senza usare il modello; se ci sono più manifest, usa `metadata.json` se presente, altrimenti segnala un errore.

### KB Manager

```ts
export declare class KbSmartManager {
  private constructor();
  static open(baseFolder: string | readonly string[], llm?: Pick<BaseChatModel, "bindTools">): Promise<KbSmartManager>;
  deleteDocument(documentId: number): Promise<void>;
  getAgentSearchTool(): StructuredToolInterface;
  getTools(): StructuredToolInterface[];
  kbAgenticSearch(question: string): Promise<string>;
  kbGetTableOfContents(): Promise<KbTableOfContents>;
  kbFileGetTableOfContents(documentId: number): Promise<FileTableOfContents>;
  kbFileGetInfo(documentId: number): Promise<FileInfo>;
  kbFileReadSummary(documentId: number): Promise<FileSummary>;
  kbFileRead(documentId: number): Promise<FileContent>;
  kbFileReadSection(documentId: number, sectionId: number): Promise<SectionContent>;
  kbFileReadSection(documentId: number, fromLine: number, toLine: number): Promise<SectionContent>;
  kbFileSearchByKeywords(query: SearchQuery, fileSpec?: FileSpec): Promise<SearchResult>;
}
```

- `open` carica ricorsivamente i manifest, anche nelle cartelle radice, e rifiuta metadati non validi o ID duplicati. Può caricare più documenti dalla stessa cartella; non legge il Markdown all’apertura e non invoca il modello.
- `kbGetTableOfContents` e `kbFileGetTableOfContents` consultano rispettivamente l’indice dei documenti e quello delle sezioni. `kbFileGetInfo` e `kbFileReadSummary` usano i metadati e la sintesi già salvati.
- `kbFileRead` legge il Markdown completo; `kbFileReadSection` legge una sezione per ID o un intervallo di righe incluso tra `1` e `lineCount`. ID sconosciuti, intervalli non validi e conteggi di righe incoerenti con i metadati producono un errore nelle operazioni che li usano.
- `kbFileSearchByKeywords` restituisce una corrispondenza per riga che contiene almeno una delle stringhe richieste o che soddisfa la regex JavaScript. Ignora le maiuscole salvo `caseSensitive: true`; senza `fileSpec` cerca in tutta la KB. Richiede almeno una parola chiave non vuota, senza elementi vuoti, oppure una regex valida.
- `kbAgenticSearch` richiede una domanda non vuota e produce una risposta Markdown basata sui documenti. Usa il modello passato a `open` o, in sua assenza, il modello Azure configurato nel progetto. Se il modello richiede altre chiamate dopo 8 turni di uso dei tool, segnala un errore.
- `getAgentSearchTool` espone `kbAgentSearch`, che accetta `{ question: string }` e restituisce `AgentSearchResult`; i riferimenti senza duplicati indicano i passaggi e le sintesi recuperati, non necessariamente citati. `getTools` espone i sette metodi di consultazione e ricerca diretta come tool LangChain.
- `deleteDocument` rimuove il documento dall’indice e cancella il manifest; cancella anche il Markdown se non è condiviso. Il file originale non viene cancellato.

## Tipi

### Parser

```ts
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export interface DocumentInput {
  documentId: number;
  bytes: Uint8Array;
  fileName?: string;
  sectionSize?: { minChars: number; maxChars: number };
}

export interface ParserOptions {
  onProgress?: (message: string) => void;
  llm: Pick<BaseChatModel, "withStructuredOutput">;
  countTokens(text: string): number;
  windowTokens?: number;
  targetChars?: {
    documentSummary?: number;
    sectionSummary?: number;
    shortDescription?: number;
  };
}

export declare class DocumentParseError extends Error {
  readonly documentId: number;
  constructor(documentId: number, cause: unknown);
}
```

`fileName` può aiutare a riconoscere il formato, ma non viene aperto come percorso. `sectionSize` indica un intervallo orientativo in unità UTF-16: `minChars` e `maxChars` devono essere interi positivi, con `minChars ≤ maxChars`. Anche i valori di `targetChars` sono interi positivi e indicativi, senza troncamento. `windowTokens` è un intero positivo (predefinito: 4096 token): limita il contenuto per richiesta, esclusi istruzioni, schema e risposta. Una riga che da sola non rientra nel budget produce un errore.

```ts
export type DocumentLineRange = [start: number, end: number];
export type DocumentPageRange = [startPage: number, endPage: number];

export interface DocumentPage {
  page: number;
  range: DocumentLineRange | null;
}

export interface DocumentSection {
  id: number;
  order: number;
  title: string;
  range: DocumentLineRange;
  pageRange?: DocumentPageRange;
  tokens: number;
  totalTokens: number;
  summary: string;
  short_description: string;
  keywords: string[];
}

export interface DocumentMap {
  documentId: number;
  originalFileName?: string;
  title?: string;
  author?: string;
  fileType?: string;
  tags?: string[];
  lineCount: number;
  summary: string;
  short_description: string;
  keywords: string[];
  sections: DocumentSection[];
}

export interface ParsedDocument {
  markdown: string;
  pages?: DocumentPage[];
  map: DocumentMap;
}

export interface DocumentTableOfContents {
  documentId: number;
  short_description: string;
  sections: Pick<DocumentSection, "id" | "title" | "short_description">[];
}
```

Il Markdown usa LF senza newline finale. Righe e pagine partono da 1 e gli intervalli sono inclusivi; le righe si riferiscono sempre al Markdown originale. Le pagine sono quelle fisiche del PDF, copertina inclusa: una pagina senza contenuti né annotazioni ha `range: null`. `pages` e `pageRange` sono omessi per gli altri formati. `tokens` conta il testo della sezione, `totalTokens` quello dell’intero documento.

### KB Manager

```ts
import type { StructuredToolInterface } from "@langchain/core/tools";

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
```

Nelle fonti, `originalFileName` è `null` se il nome non è disponibile; altrimenti il parser conserva il nome con estensione, senza percorso. Un passaggio riporta solo le righe effettivamente coperte da ciascuna pagina; `pages` è `null` se manca la paginazione. I dati della sezione sono presenti se l’intero passaggio ricade in una sezione.

## Modello dati

La KB identifica i documenti tramite `documentId`, univoco tra tutte le cartelle aperte. L’ID di una sezione è univoco solo nel documento che la contiene. Il manifest JSON conserva mappa e paginazione; il Markdown è salvato separatamente. `persist` usa i suffissi `.json` e `.md` dopo il nome originale; se manca il nome, usa `metadata.json` e `document.md`.