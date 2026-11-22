# Parser e KB Manager

> **Superata.** Conserva i nomi e le firme dell’API precedente a [KB Store](kbstore.technical.spec.md) (persistenza su cartelle, `tocMode`, selettore, nomi `kbFile*`, campi snake_case), con i tipi degli ID documento aggiornati al contratto attuale.

## Metodi di interfaccia

### Parser

```ts
export declare function createDocumentParser(options: ParserOptions): DocumentParser;
export declare function convertDocument(input: ConversionInput, log?: (event: LocalConversionProgress) => void): Promise<ConvertedDocument>;

export interface DocumentParser {
  importFile(path: string, options: ImportFileOptions): Promise<ParsedDocument>;
  importDocument(input: ImportDocumentInput): Promise<ParsedDocument>;
  parseDocument(input: DocumentInput): Promise<ParsedDocument>;
  parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]>;
}
```

- `createDocumentParser` richiede un modello con output strutturato e una funzione di conteggio dei token.
- `parseDocument` converte i byte in Markdown e genera indice, sezioni e sintesi. Per i PDF estrae il testo per pagina e usa l’OCR locale in italiano se manca il testo nativo. Gli errori di parsing espongono ID e causa tramite `DocumentParseError`.
- `parseDocuments` mantiene l’ordine degli input e si arresta al primo errore.
- Oggi il parser conserva un `documentId` esplicito valido oppure genera un UUID v7 se omesso. Lo stesso ID compare in `map.documentId` e negli eventi di avanzamento. Per salvare il risultato, il chiamante lo passa a `KbStore.add`, che verifica l’unicità dell’ID senza prenotazioni preventive.
- `convertDocument` converte localmente senza modello, ID o persistenza. `importDocument` salva un upload in memoria con le stesse garanzie di `importFile`.
- `importFile` legge dal percorso e salva in `kbFolder/doc-<documentId>`. Non sovrascrive una sottocartella esistente; se l’analisi o il salvataggio falliscono, elimina la sottocartella appena creata.

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
  static open(baseFolder: string | readonly string[], options?: KbOpenOptions): Promise<KbSmartManager>;
  static open(
    baseFolder: string | readonly string[],
    llm?: Pick<BaseChatModel, "bindTools">,
    selection?: DocumentSelectionOptions,
    options?: AgentSearchOptions,
  ): Promise<KbSmartManager>;
  deleteDocument(documentId: DocumentId): Promise<void>;
  refresh(): Promise<void>;
  getAgentSearchTool(): StructuredToolInterface;
  getTools(): StructuredToolInterface[];
  kbAgentSearch(question: string): Promise<AgentSearchResult>;
  kbGetTableOfContents(): Promise<KbTableOfContents>;
  kbFileGetTableOfContents(documentId: DocumentId): Promise<FileTableOfContents>;
  kbFileGetInfo(documentId: DocumentId): Promise<FileInfo>;
  kbFileReadSummary(documentId: DocumentId): Promise<FileSummary>;
  kbFileRead(documentId: DocumentId): Promise<FileContent>;
  kbFileReadSection(documentId: DocumentId, sectionId: number): Promise<SectionContent>;
  kbFileReadSection(documentId: DocumentId, fromLine: number, toLine: number): Promise<SectionContent>;
  kbFileSearchByKeywords(query: SearchQuery, fileSpec?: FileSpec, context?: SearchContextOptions): Promise<SearchResult>;
}
```

- `open` carica ricorsivamente i manifest, anche nelle cartelle radice, e rifiuta metadati non validi o ID duplicati. Può caricare più documenti dalla stessa cartella; non legge il Markdown all’apertura e non invoca il modello.
- Senza selettore, `tocMode: "prompt"` (predefinito) inserisce nel system prompt l’indice compatto di tutti i documenti e delle relative sezioni. Con `tocMode: "tools"` il prompt non contiene metadati dei documenti: l’agente può ottenere il catalogo con `kbGetTableOfContents` e consultare le sezioni per ID documento con `kbFileGetTableOfContents`.
- Con un decision model, `tocMode` è ignorato. Il selettore valuta i metadati dei documenti e il prompt include solo le TOC dei candidati meglio classificati con punteggio maggiore o uguale a `threshold`, fino a `maxDocuments`. I tool restano accessibili per tutta la KB. Se la selezione fallisce o non trova candidati, il prompt contiene un elenco candidati vuoto e la ricerca può proseguire con i tool globali.
- `kbGetTableOfContents` e `kbFileGetTableOfContents` consultano rispettivamente l’indice dei documenti e quello delle sezioni. `kbFileGetInfo` e `kbFileReadSummary` usano i metadati e la sintesi già salvati.
- `kbFileRead` legge il Markdown completo; `kbFileReadSection` legge una sezione per ID o un intervallo di righe incluso tra `1` e `lineCount`. ID sconosciuti, intervalli non validi e conteggi di righe incoerenti con i metadati producono un errore nelle operazioni che li usano.
- `kbFileSearchByKeywords` restituisce una corrispondenza per riga che contiene almeno una delle stringhe richieste o che soddisfa la regex JavaScript. Ignora le maiuscole salvo `caseSensitive: true`; senza `fileSpec` cerca in tutta la KB. Richiede almeno una parola chiave non vuota, senza elementi vuoti, oppure una regex valida.
- `beforeLines` e `afterLines` sono interi da 0 a 20, con default 0; il tool li accetta direttamente accanto a `query` e `fileSpec`. Con almeno un valore positivo, le finestre sono limitate alle righe del documento e quelle sovrapposte vengono unite. `matchLines` indica le righe assolute che hanno prodotto il match, mentre `source` copre tutto lo snippet. La ricerca con contesto restituisce al massimo 20 finestre e 12.000 unità UTF-16 complessive di snippet; si ferma prima della prima finestra che eccede i limiti e segnala `truncated: true`.
- `kbAgentSearch` richiede una domanda non vuota e restituisce `AgentSearchResult` (`answer` Markdown e `references`). Usa il modello passato a `open` o, in sua assenza, il modello Azure configurato nel progetto. Se il modello richiede altre chiamate dopo 8 turni di uso dei tool, segnala un errore. I riferimenti sono deduplicati per documento e intervallo di righe: includono i passaggi non vuoti letti esplicitamente e i risultati di ricerca per parola chiave o regex citati dall’agente. I marcatori interni delle citazioni vengono rimossi dalla risposta.
- `getAgentSearchTool` espone `kbAgentSearch` come tool LangChain con input `{ question: string }` e stesso risultato `AgentSearchResult`. `getTools` espone i sette metodi di consultazione e ricerca diretta come tool LangChain.
- `deleteDocument` rimuove il documento dall’indice e cancella il manifest; cancella anche il Markdown se non è condiviso. Il file originale non viene cancellato.

## Tipi

### Parser

```ts
import type { BaseChatModel } from "@langchain/core/language_models/chat_models";

export type DocumentId = string | number;

export interface DocumentInput {
  documentId?: DocumentId;
  bytes: Uint8Array;
  fileName?: string;
  sectionSize?: { minChars: number; maxChars: number };
}

export type ConversionInput = Pick<DocumentInput, "bytes" | "fileName">;
export type LocalConversionProgress = Omit<ConversionProgress, "documentId" | "batch">;
export interface ConvertedDocument {
  markdown: string;
  pages?: DocumentPage[];
}
export interface ImportDocumentInput extends DocumentInput {
  kbFolder: string;
}

export interface ImportFileOptions extends Pick<DocumentInput, "documentId" | "sectionSize"> {
  kbFolder: string;
}

export interface ParserOptions {
  onProgress?: (progress: DocumentParseProgress) => void;
  llm: Pick<BaseChatModel, "withStructuredOutput">;
  countTokens(text: string): number;
  windowTokens?: number;
  targetChars?: {
    documentSummary?: number;
    sectionSummary?: number;
    shortDescription?: number;
  };
}

export type DocumentParsePhase =
  | "reading"
  | "saving"
  | "conversion"
  | "segmentation"
  | "sections"
  | "overview"
  | "completed";

export type DocumentParseProgressUnit = "documents" | "pages" | "lines" | "sections";

export interface DocumentBatchProgress {
  current: number;
  total: number;
  percent: number;
}

export interface DocumentParseProgressBase {
  documentId: DocumentId;
  fileName?: string;
  batch?: DocumentBatchProgress;
  phase: DocumentParsePhase;
  percent: number;
  current: number;
  total: number;
  unit: DocumentParseProgressUnit;
  phasePercent: number;
  message: string;
}

export interface ConversionProgress extends DocumentParseProgressBase {
  phase: "conversion";
  step:
    | "start"
    | "page-extract"
    | "page-ocr-fallback"
    | "ocr-init"
    | "ocr-render"
    | "ocr-progress"
    | "page-done"
    | "done";
  format: string;
  bytes: number;
  page?: number;
  totalPages?: number;
  pageSource?: "native" | "ocr" | "blank";
  ocrPercent?: number;
}

export interface SegmentationProgress extends DocumentParseProgressBase {
  phase: "segmentation";
  step: "start" | "window-request" | "window-fallback" | "window-recovery" | "window-done";
  lineCount: number;
  totalTokens: number;
  totalWindows: number;
  window?: number;
  lineRange?: DocumentLineRange;
  attempt?: number;
  maxAttempts?: number;
}

export interface SectionSummaryProgress extends DocumentParseProgressBase {
  phase: "sections";
  step: "section-start" | "llm-request" | "section-done";
  sectionIndex: number;
  totalSections: number;
  attempt?: number;
  maxAttempts?: number;
}

export interface OverviewSummaryProgress extends DocumentParseProgressBase {
  phase: "overview";
  step: "llm-request" | "done";
  attempt?: number;
  maxAttempts?: number;
}

export interface CompletedParseProgress extends DocumentParseProgressBase {
  phase: "completed";
  step: "done";
  lineCount: number;
  totalTokens: number;
  sectionCount: number;
}

export type DocumentParseProgress =
  | (DocumentParseProgressBase & { phase: "reading" | "saving"; step: "start" })
  | ConversionProgress
  | SegmentationProgress
  | SectionSummaryProgress
  | OverviewSummaryProgress
  | CompletedParseProgress;

export declare class DocumentParseError extends Error {
  readonly documentId: DocumentId;
  constructor(documentId: DocumentId, cause: unknown);
}
```

Un `DocumentId` stringa è un UUID v7 canonico in minuscolo; un ID numerico legacy è un intero sicuro non negativo. Gli ID di sezione restano numerici.

`fileName` può aiutare a riconoscere il formato, ma non viene aperto come percorso. `onProgress` riceve eventi strutturati `DocumentParseProgress` con percentuale complessiva del documento (`percent` monotona 0–100), avanzamento della fase corrente (`phase`, `step`, `current`, `total`, `unit`, `phasePercent`), metadati specifici della fase, `batch` opzionale in `parseDocuments` e messaggio descrittivo senza testo del documento. `sectionSize` indica un intervallo orientativo in unità UTF-16: `minChars` e `maxChars` devono essere interi positivi, con `minChars ≤ maxChars`. Anche i valori di `targetChars` sono interi positivi e indicativi, senza troncamento. `windowTokens` è un intero positivo (predefinito: 4096 token): limita il contenuto per richiesta, esclusi istruzioni, schema e risposta. Una riga che da sola non rientra nel budget produce un errore.

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
  documentId: DocumentId;
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
  documentId: DocumentId;
  short_description: string;
  sections: Pick<DocumentSection, "id" | "title" | "short_description">[];
}
```

Il Markdown usa LF senza newline finale. Righe e pagine partono da 1 e gli intervalli sono inclusivi; le righe si riferiscono sempre al Markdown originale. Le pagine sono quelle fisiche del PDF, copertina inclusa: una pagina senza contenuti né annotazioni ha `range: null`. `pages` e `pageRange` sono omessi per gli altri formati. `tokens` conta il testo della sezione, `totalTokens` quello dell’intero documento.

### KB Manager

```ts
import type { StructuredToolInterface } from "@langchain/core/tools";

export interface DocumentSelectionOptions {
  decisionModel: Pick<BaseChatModel, "withStructuredOutput">;
  threshold?: number;
  maxDocuments?: number;
}

export interface AgentSearchOptions {
  tocMode?: "prompt" | "tools";
}

export interface KbOpenOptions extends AgentSearchOptions {
  llm?: Pick<BaseChatModel, "bindTools">;
  selection?: DocumentSelectionOptions;
}

export interface DocumentSource {
  documentId: DocumentId;
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
  documentIds: DocumentId[];
}

export interface SearchContextOptions {
  beforeLines?: number;
  afterLines?: number;
}

export interface SearchResult {
  matches: { snippet: string; source: PassageSource; matchLines?: number[] }[];
  truncated?: true;
}

export type AgentSearchReference =
  | { kind: "passage"; source: PassageSource }
  | { kind: "summary"; source: DocumentSource };

export interface AgentSearchResult {
  answer: string;
  references: AgentSearchReference[];
}
```

`threshold` è un numero tra 0 e 1 inclusi (predefinito: `0.5`); `maxDocuments` è un intero positivo (predefinito: `5`).

Nelle fonti, `originalFileName` è `null` se il nome non è disponibile; altrimenti il parser conserva il nome con estensione, senza percorso. Un passaggio riporta solo le righe effettivamente coperte da ciascuna pagina; `pages` è `null` se manca la paginazione. I dati della sezione sono presenti se l’intero passaggio ricade in una sezione.

## Modello dati

La KB identifica i documenti tramite `documentId`, univoco tra tutte le cartelle aperte. L’ID di una sezione è univoco solo nel documento che la contiene. Il manifest JSON conserva mappa e paginazione; il Markdown è salvato separatamente. `persist` usa i suffissi `.json` e `.md` dopo il nome originale; se manca il nome, usa `metadata.json` e `document.md`.