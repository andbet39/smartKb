# Parser e KB manager

## Metodi di interfaccia

**Parser**

```ts
export function createDocumentParser(options: ParserOptions): DocumentParser;

export interface DocumentParser {
  parseDocument(input: DocumentInput): Promise<ParsedDocument>;
  parseDocuments(inputs: readonly DocumentInput[]): Promise<ParsedDocument[]>;
}
```

Se il modello propone due suddivisioni non valide per le stesse righe, il parser segnala il recupero tramite `onProgress` e sintetizza quelle righe come una sezione unica, senza rielaborare le finestre precedenti. Se anche la sintesi resta non valida, segnala un errore.

Un documento senza testo produce una descrizione breve vuota e nessuna sezione. Gli errori di parsing sono segnalati con `DocumentParseError`. `parseDocuments` conserva l'ordine degli input e si ferma al primo errore.

```ts
export function getDocumentTableOfContents(doc: ParsedDocument): DocumentTableOfContents;
export function getSectionMarkdown(
  doc: ParsedDocument,
  sectionId: number,
  options?: { pageTags?: boolean },
): string;
```

L'indice mantiene l'ordine delle sezioni senza richiamare il modello. `getSectionMarkdown` segnala un errore per una sezione sconosciuta; con `pageTags: true` marca la prima riga citata di ogni pagina.

```ts
export function saveDocumentMarkdown(
  doc: ParsedDocument,
  filePath: string,
  options?: { sectionMarkers?: boolean },
): Promise<void>;
```

Sovrascrive il file in UTF-8 e marca ogni pagina PDF, anche vuota. Con `sectionMarkers: true` marca anche l'inizio di ogni sezione; a parità di riga, il marcatore di pagina precede quello di sezione.

```ts
export function persist(doc: ParsedDocument, folder: string): Promise<void>;
export function load(folder: string): Promise<ParsedDocument>;
```

`persist` crea la cartella se manca e scrive `<nome-originale>.md` e `<nome-originale>.json`; senza nome usa `document.md` e `metadata.json`. `load` ricarica senza richiamare il modello: preferisce `metadata.json`, altrimenti richiede un solo manifest JSON.

**KB manager**

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

- `open` legge i manifest in ogni radice e nelle sottocartelle, anche più di uno per cartella. Metadati non validi o ID documento duplicati, anche tra radici diverse, impediscono l'apertura.
- `deleteDocument` rimuove il manifest, il Markdown se non condiviso e la voce dall'indice corrente. Non rimuove i file originali né le cartelle.
- `getTools` espone i sette metodi di consultazione come tool LangChain; non espone `kbAgenticSearch` né `deleteDocument`.
- `getAgentSearchTool` restituisce il tool LangChain `kbAgentSearch`, che accetta un oggetto con una `question` non vuota e restituisce un `AgentSearchResult`. Le fonti rappresentano i passaggi e le sintesi recuperati, senza duplicati; indici e metadati non contano come fonti.
- `kbAgenticSearch` e `kbAgentSearch` usano il modello LangChain passato a `open`, che deve supportare `bindTools`. Se omesso, usano il modello Azure configurato nel file `.env` della root.
- `kbAgenticSearch` richiede una domanda non vuota. Invia nel prompt di sistema gli indici di tutti i documenti e delle sezioni caricate. Restituisce la risposta Markdown del modello; segnala un errore se il modello chiede altri tool dopo otto turni di tool calling.
- `kbFileRead` restituisce una stringa vuota e la sola fonte del documento se non ci sono righe.
- `kbFileReadSection` per intervallo richiede righe intere con `1 ≤ fromLine ≤ toLine ≤ lineCount`; altrimenti segnala `RangeError`.
- `kbFileSearchByKeywords` cerca in tutta la KB se `fileSpec` è omesso. Con un filtro, visita gli ID indicati senza duplicati. Restituisce una voce per riga corrispondente, in ordine di riga per documento, oppure `matches: []`.

Un ID di documento o di sezione sconosciuto produce un errore. La lettura del testo e la ricerca falliscono se il numero di righe del Markdown non coincide con i metadati.

## Tipi

```ts
export type AgentSearchReference =
  | { kind: "passage"; source: PassageSource }
  | { kind: "summary"; source: DocumentSource };

export interface AgentSearchResult {
  answer: string;
  references: AgentSearchReference[];
}
```

**Parser**

```ts
export interface DocumentInput {
  documentId: number;
  bytes: Uint8Array;
  fileName?: string;
  sectionSize?: { minChars: number; maxChars: number };
}

export interface ParserOptions {
  llm: Pick<BaseChatModel, "withStructuredOutput">;
  countTokens(text: string): number;
  onProgress?: (message: string) => void;
  windowTokens?: number;
  targetChars?: {
    documentSummary?: number;
    sectionSummary?: number;
    shortDescription?: number;
  };
}
```

- `fileName` aiuta a riconoscere il formato; non apre un percorso.
- `sectionSize` suggerisce lunghezze in unità UTF-16: `minChars` e `maxChars` sono interi positivi con `minChars ≤ maxChars`, non limiti rigidi.
- `windowTokens` è un intero positivo, pari a 4096 token se omesso. Limita il contenuto della richiesta, esclusi istruzioni, schema e risposta. Una riga che supera da sola il budget produce un errore.
- I valori di `targetChars` sono interi positivi in caratteri: orientano il modello senza troncare il testo. `shortDescription` vale per documento e sezioni.

```ts
export declare class DocumentParseError extends Error {
  readonly documentId: number;
  constructor(documentId: number, cause: unknown);
}
```

La proprietà `cause` conserva l'errore originale.

```ts
export type DocumentLineRange = [start: number, end: number];
export type DocumentPageRange = [startPage: number, endPage: number];

export interface DocumentPage {
  page: number;
  range: DocumentLineRange | null;
}

export interface ParsedDocument {
  markdown: string;
  pages?: DocumentPage[];
  map: DocumentMap;
}
```

Il Markdown usa LF senza newline finale. Righe e pagine partono da 1; gli estremi sono inclusi. Le righe si riferiscono al Markdown senza marcatori. Nei PDF si contano le pagine fisiche, copertina inclusa: `range: null` indica una pagina vuota, mentre una scansione illeggibile dopo l'OCR produce un errore con il numero di pagina. Negli altri formati `pages` e `pageRange` sono omessi.

```ts
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

export interface DocumentTableOfContents {
  documentId: number;
  short_description: string;
  sections: Pick<DocumentSection, "id" | "title" | "short_description">[];
}
```

`id` e `order` numerano le sezioni in ordine di testo a partire da 1. `tokens` conta i token della sezione; `totalTokens` quelli dell'intero documento. `originalFileName` conserva il nome con estensione, senza percorso. Se la sezione è unica, il documento ne riusa sintesi e descrizione breve, salvo richiesta di una sintesi dedicata con `targetChars.documentSummary`.

**KB manager**

```ts
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
```

Senza nome originale la fonte riporta `null`. Ogni pagina cita solo le righe comprese nel passaggio; senza paginazione `pages` è `null`. I riferimenti di sezione compaiono solo se l'intero passaggio appartiene alla stessa sezione.

```ts
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
```

```ts
export type SearchQuery =
  | { kind: "keywords"; keywords: string[]; caseSensitive?: boolean }
  | { kind: "regex"; pattern: string; caseSensitive?: boolean };

export interface FileSpec {
  documentIds: number[];
}

export interface SearchResult {
  matches: { snippet: string; source: PassageSource }[];
}
```

`keywords` richiede almeno una stringa e non ammette stringhe vuote: basta che una compaia come sottostringa. `regex` richiede un'espressione JavaScript valida. Entrambe le modalità ignorano maiuscole e minuscole salvo `caseSensitive: true`. `snippet` contiene la riga intera.
