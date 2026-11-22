# Specifica tecnica — KB Store

2026-11-22 · Andrea Terzani · Stato: implementato

## 1. Scopo e principi

`KbStore` conserva i documenti analizzati e mantiene gli indici. `KBSearchEngine` interroga gli indici e restituisce puntamenti alle sezioni delle mappe. Le implementazioni POSIX usano lo stesso formato su disco e connessioni SQLite separate (§7). Un backend Azure è previsto in seguito.

- **Interfacce minime.** Cinque operazioni più `close` per lo store; ricerca keyword e semantica facoltativa per il motore. Contesto, regex, finestre e limiti dei tool restano nel manager.
- **Nessun catalogo in memoria.** Il catalogo si legge solo a pagine; le mappe si caricano per ID.
- **Ricerca su indice.** Keyword e semantica interrogano un indice, mai la scansione di tutto il corpus.
- **Risultati come puntamenti.** Ogni risultato indica documento e sezione, con descrizione e punteggio facoltativo.
- **Un solo scrittore per radice.** Il parser fornisce l'ID del documento; lo store verifica l'unicità durante `add`, senza prenotazioni.
- **Parser e store indipendenti.** Il parser produce un `ParsedDocument`, lo store lo salva; nessuno dei due conosce l'altro. La composizione è a carico del chiamante.
- **Composizione esplicita.** Il chiamante apre store e motore e li passa a `KbSmartManager.open(store, searchEngine, options?)`.
- **Un solo vocabolario.** Gli stessi nomi in camelCase dal modello di analisi ai tool; il concetto è sempre "Document", mai "File" (§8).
- **Superficie pubblica minima.** La libreria espone pochi metodi e tipi; i tipi derivati sono proiezioni (`Pick`) dei tipi del parser, non copie.

Scala di riferimento: centinaia di migliaia di documenti, milioni di sezioni. Su `kb1` un documento medio ha circa 2.400 righe, 125 KB di Markdown, 37 KB di mappa e 46 sezioni.

## 2. Contesto nel codice

- `src/parser/types.ts`: `ParsedDocument`, `DocumentMap`, `DocumentSection`, `DocumentPage` sono riusati, con i campi rinominati al §8.
- `src/parser/persistence.ts`: lo schema zod `metadataSchema` diventa la validazione di `add`. `persist`, `load`, `findMarkdownFile` e la risoluzione legacy si rimuovono.
- `importFile` e `importDocument` non fanno più parte del parser. Il chiamante compone `parseDocument` e `add`.
- `src/kb/index.ts`: `open(baseFolder)` con scoperta ricorsiva e la mappa `documents` in memoria vengono sostituiti dallo store. `refresh()` diventa superfluo.
- `src/kb/search.ts`: delega le keyword al motore; regex, finestre di contesto e limiti (20 finestre, 12.000 unità UTF-16) restano nel manager.
- `src/kb/tools.ts`: gli schemi dei tool restano invariati, salvo le eccezioni del §6 e le rinomine del §8.
- Struttura a strati: `src/document/` (tipi del documento, fonti, validazione), da cui dipendono `src/parser/` e `src/store/`; `src/kb/` dipende dai contratti dello store e del motore. Il backend di storage è in `src/store/posix/`; il [contratto di ricerca](../src/search/interfaces.ts) e i [tipi di ricerca](../src/search/types.ts) sono separati dal [lettore POSIX](../src/search/posix/engine.ts). Import con estensione `.ts` (`NodeNext` + `rewriteRelativeImportExtensions`).
- Gli indici SQLite POSIX con ID numerici sono migrati all'apertura (§7). Il vecchio layout precedente allo store, con manifest sparsi, non è supportato.

## 3. Modello dati

| Tipo | Campi | Note |
| --- | --- | --- |
| `ParsedDocument` | `markdown`, `map`, `pages?` | Esistente. Input di `add`. |
| `Omit<ParsedDocument, "markdown">` | `map`, `pages?` | Risultato di `get`: metadati senza il testo Markdown. |
| `DocumentCard` | `documentId`, `originalFileName?`, `title?`, `shortDescription`, `keywords`, `tags?`, `sectionCount` | `Pick` di `DocumentMap` più `sectionCount`. Scheda leggera per il catalogo, circa 600 B. Sostituisce la `DocumentCard` di `src/kb/utils.ts`. |
| `CatalogQuery` | `text?`, `tags?`, `limit`, `cursor?` | `text` cerca su titolo, nome, descrizione e keyword. `tags` in AND. |
| `CatalogPage` | `cards`, `nextCursor?` | `nextCursor` assente sull'ultima pagina. Cursore opaco. |
| `KeywordQuery` | `keywords`, `caseSensitive?`, `documentIds?`, `limit`, `fullSection?` | Keyword in OR. |
| `SemanticQuery` | `text`, `documentIds?`, `limit`, `fullSection?` | `limit` è il *k* della ricerca. |
| `SearchHit` | `documentId`, `sectionId`, `title`, `shortDescription`, `summary?`, `score?`, `lines?`, `markdown?` | Puntamento a `map.sections[]`; i campi descrittivi sono un `Pick` di `DocumentSection`. `lines` solo nella ricerca keyword. `markdown` solo con `fullSection: true`. |

Regole:

- `DocumentId` è `number | string`: intero sicuro non negativo per gli ID legacy o UUID v7 canonico in minuscolo. `add` usa `map.documentId`.
- `DocumentInput.documentId` è facoltativo. Il parser conserva un ID esplicito valido; se manca, genera un UUID v7 e usa lo stesso valore nella mappa e negli eventi di avanzamento.
- `limit` è obbligatorio. Per il catalogo vale il `maxLimit` dello store; il motore POSIX usa il proprio `maxLimit` per le query di ricerca. Entrambi accettano limiti interi da 1 al rispettivo massimo.
- `fullSection` vale `false` di default. Con `true` ogni hit porta in `markdown` il testo completo della sezione, righe da `fromLine` a `toLine` unite con LF, uguale a quello che restituirebbe `read` ritagliato sulla sezione.
- `score` è maggiore per risultati più pertinenti, comparabile solo dentro la stessa risposta.
- `lines` contiene numeri di riga assoluti (1-based) tra `fromLine` e `toLine` della sezione, in ordine crescente. Può essere vuoto: il match dell'indice non sempre coincide con una sottostringa letterale (§7, limiti noti).

## 4. Interfaccia

```ts
interface KbStore {
  readonly maxLimit: number;
  add(doc: ParsedDocument): Promise<void>;
  delete(documentId: DocumentId): Promise<boolean>;
  get(documentId: DocumentId): Promise<Omit<ParsedDocument, "markdown">>;
  read(documentId: DocumentId): Promise<string>;
  list(query: CatalogQuery): Promise<CatalogPage>;
  close(): Promise<void>;
}

interface KBSearchEngine {
  keywordSearch(query: KeywordQuery): Promise<SearchHit[]>;
  semanticSearch?(query: SemanticQuery): Promise<SearchHit[]>;
}
```

`SearchEngine` è la classe base astratta che implementa `KBSearchEngine`: dichiara `keywordSearch` astratto e `semanticSearch` facoltativo. Né l’interfaccia né la classe base impongono `maxLimit` o `close`; `POSIXSearchEngine` fornisce il proprio `close()`.

| Metodo | Chiamante | Responsabilità |
| --- | --- | --- |
| `add` | chiamante, con il risultato di `parseDocument` | Valida e salva documento, indice e vettori. Un ID duplicato non sovrascrive il documento esistente. |
| `delete` | manager | Rimuove il documento. `false` se l'ID non esiste. |
| `get` | manager (info, sintesi, TOC del documento, risoluzione sezione) | Mappa e pagine, senza Markdown. |
| `read` | manager (lettura, sezione, contesto, regex) | Markdown canonico (LF, senza newline finale). |
| `list` | manager (`kbGetTableOfContents`) | Catalogo paginato e filtrabile. |
| `keywordSearch` | manager (`kbDocumentSearchByKeywords`) | Sezioni trovate nell’indice testuale. |
| `semanticSearch` | manager (`kbDocumentSearchSemantic`) | Sezioni vicine al testo. Assente se non configurata. |

Composizione tipica:

```ts
const doc = await parser.parseDocument({ bytes, fileName });
await store.add(doc);
const id = doc.map.documentId;
```

## 5. Garanzie, vincoli ed errori

- **Unicità.** `add` rifiuta atomicamente un ID duplicato con `ALREADY_EXISTS`, senza alterare il documento esistente. Il controllo avviene al salvataggio, non prima del parsing o delle chiamate all'LLM.
- **Riuso degli ID.** Dopo `delete` l'ID torna libero e può essere riusato.

- **Visibilità atomica.** Un documento è visibile in `get`, `read`, `list` e nelle ricerche solo dopo il commit di `add`, e smette di esserlo al primo passo di `delete`. Un errore prima del commit non lascia nulla di visibile.
- **Nessun documento orfano nei risultati.** Le ricerche non restituiscono mai sezioni di documenti non visibili.
- **Ordini deterministici.** `list` per `documentId` crescente: ID numerici prima degli UUID, che sono ordinati lessicograficamente. Le ricerche per `score` decrescente, poi `documentId` e `sectionId` crescenti.
- **Filtro per ID.** Con `documentIds` le ricerche considerano solo quei documenti; ID inesistenti sono ignorati; un array vuoto restituisce `[]`.
- **Paginazione stabile.** Un cursore resta valido tra scritture; un documento aggiunto con ID maggiore dell'ultimo letto comparirà nelle pagine successive.
- **Concorrenza.** Un solo scrittore per radice; letture concorrenti ammesse. Due istanze scrittrici sulla stessa radice non sono supportate.
- **Ciclo di vita.** Store e motore POSIX si chiudono separatamente. Ciascun `close()` è idempotente; le operazioni sulla relativa risorsa chiusa falliscono con `CLOSED`.

Tutti gli errori sono `KbStoreError` con un `code`:

| Codice | Quando |
| --- | --- |
| `NOT_FOUND` | `get`/`read` su un ID non visibile. |
| `ALREADY_EXISTS` | `add` con un ID già presente. |
| `INVALID_DOCUMENT` | `add` con un documento che non supera la validazione. |
| `INVALID_QUERY` | `limit` fuori intervallo, keyword vuote, cursore non valido. |
| `INDEX_MISMATCH` | Configurazione semantica dello store incompatibile con l’indice, oppure modello o dimensioni di `semanticSearch` diversi da quelli dell’indice. |
| `CLOSED` | Chiamata dopo `close`. |
| `BACKEND` | Errore di I/O, SQLite o dell'adapter di embedding. Il messaggio originale è in `cause`. |

## 6. Uso dal manager

| Tool | Con lo store e il motore |
| --- | --- |
| `kbGetTableOfContents` | Parametri `cursor?`, `text?`, `tags?` passati a `store.list` con `limit: Math.min(100, store.maxLimit)`. Il risultato aggiunge `nextCursor` se ci sono altre pagine. La descrizione del tool chiede di sfogliare oltre solo se serve e di preferire `text`. |
| `kbDocumentGetTableOfContents`, `kbDocumentGetInfo`, `kbDocumentReadSummary` | `get(id)`. |
| `kbDocumentRead` | `read(id)`. |
| `kbDocumentReadSection` | `get(id)` per risolvere la sezione, poi `read(id)` e ritaglio. |
| `kbDocumentSearchByKeywords` (keywords) | `searchEngine.keywordSearch` con `limit: searchLimit` (default 100); il manager legge il testo dallo store e ritaglia le finestre. Hit senza righe corrispondenti, o con `fullSection`, coprono l’intera sezione. Se il motore restituisce `searchLimit` hit, il risultato ha `truncated: true`. |
| `kbDocumentSearchByKeywords` (regex) | Solo con `documentIds` non vuoto: il manager legge i documenti con `store.read(id)` e applica `RegExp` senza passare dal motore. |
| `kbDocumentSearchSemantic` | Il tool è registrato solo se `searchEngine.semanticSearch` esiste. Chiede al massimo `Math.min(10, searchLimit)` hit e li espone come `{ source: SectionSource, shortDescription, summary?, score?, markdown? }`. |

Entrambi i tool di ricerca espongono `fullSection`. Per la ricerca keyword il manager ritaglia da solo la sezione; per quella semantica passa il flag al motore. Il budget di 12.000 unità UTF-16 vale per tutto il testo restituito: nella ricerca keyword la prima finestra che non entra interrompe i risultati (`truncated: true`); nella ricerca semantica un hit il cui testo non entra nel budget residuo resta senza `markdown` e il risultato ha `truncated: true`. Una sezione più grande del budget non viene mai restituita come testo.

Il manager tiene in cache i metadati e il Markdown con una politica LRU e dimensione limitata, per le chiamate ripetute dell'agente sullo stesso documento. `deleteDocument` delega a `store.delete` e solleva un errore se restituisce `false`, come oggi.

Cambi di comportamento visibili ai tool:

- i risultati keyword sono ordinati per pertinenza (`bm25`), non per ordine di scansione;
- la keyword corrisponde per token (FTS5), non per sottostringa: "canon" non trova più "canone";
- la ricerca senza contesto ha gli stessi limiti di quella con contesto (20 voci, 12.000 unità), oggi assenti;
- la regex senza `documentIds` non è più ammessa.

## 7. Implementazione POSIX con SQLite

### Versioni

- Node.js 22.13 o successivo, come dichiarato in `engines.node`. `node:sqlite` non richiede flag; il modulo può emettere un warning sperimentale.
- `sqlite-vec` 0.1.9, ultima stabile. Le `0.1.10-alpha.*` introducono ANN: non usarle finché non sono stabili.
- `@langchain/core` 1.5.0: l'adapter di embedding è `EmbeddingsInterface` (`embedDocuments`, `embedQuery`).

### Layout

```
<root>/
  .kb/
    store.json      { embedding?: { modelId, dimensions } }
    index.sqlite    catalogo, sezioni, FTS5, vettori (WAL)
  doc-<id>/
    document.md     Markdown canonico
    manifest.json   { map, pages? }: fonte per ricostruire l'indice
```

I file in `doc-<id>/` sono la fonte canonica: se `index.sqlite` manca, l'apertura dello store lo ricostruisce indicizzando ogni cartella con un `manifest.json`. `.kb/` è quindi esclusa da Git. Lo store di una KB con indice semantico (`embedding` in `store.json`) richiede le opzioni `semantic`, altrimenti `INDEX_MISMATCH`: senza sqlite-vec la tabella dei vettori non sarebbe aggiornabile. Il motore POSIX può aprire lo stesso indice senza `semantic` per la sola ricerca keyword.

All'apertura dello store, un indice SQLite POSIX precedente con `documentId INTEGER PRIMARY KEY` viene migrato in una transazione. Gli ID numerici e i rowid di documenti e sezioni restano invariati, quindi si conservano FTS e vettori senza ricalcolare gli embedding. Il motore non crea, ricostruisce o migra l’indice.

### Schema

| Tabella | Contenuto |
| --- | --- |
| `documents` | `rowid` intero come PK, `documentId` univoco (INTEGER o TEXT), campi di `DocumentCard`, `lineCount`, `mapJson`, `pagesJson`. |
| `document_tags` | `(documentId, tag)` per i filtri di `list`. |
| `sections` | `(documentId, sectionId)` PK, `title`, `shortDescription`, `summary`, `fromLine`, `toLine`. |
| `documents_fts` | FTS5 *contentless* su titolo, nome, descrizione e keyword del documento. |
| `sections_fts` | FTS5 *contentless* su titolo, descrizione, summary, keyword e Markdown della sezione. |
| `section_vectors` | `vec0` con `documentId` *partition key* contenente il `documents.rowid` interno, `sectionId`, `embedding float[D]`. Solo con semantica configurata. |

FTS5 usa `tokenize="unicode61 remove_diacritics 2"` e `contentless_delete=1`. Le tabelle FTS usano il rowid di `documents` o `sections`, non l’ID pubblico.

### Operazioni

| Metodo | Esecuzione | Note |
| --- | --- | --- |
| `add` | Valida il documento, acquisisce la cartella `doc-<id>/` senza sovrascrivere cartelle esistenti e scrive i file. Una transazione SQLite inserisce catalogo, sezioni, FTS e vettori. | Il commit SQLite è il punto di visibilità. Se l'operazione fallisce dopo aver creato la cartella, lo store tenta di ripulire solo quella cartella. |
| `delete` | Rimozione di `manifest.json`; transazione che cancella righe, FTS e vettori; rimozione di `doc-<id>/`. | Una cartella rimasta per errore è invisibile e non viene reindicizzata. |
| `get` | `select map_json, pages_json from documents`. | Nessun accesso al filesystem. |
| `read` | Lettura di `doc-<id>/document.md` e verifica del numero di righe contro `lineCount`. | ID non presente in `documents` → `NOT_FOUND`. |
| `list` | Query su `documents`, con join FTS e tag se richiesti; `documentId > cursor` e `limit`. | Il cursore è l'ultimo `documentId`. |
| `keywordSearch` | `sections_fts match` con le keyword in OR, `bm25` → `score`; per ogni sezione trovata, lettura del Markdown e calcolo di `lines` per sottostringa. | Con `caseSensitive` si scartano le sezioni senza almeno una riga che corrisponde esattamente. |
| `semanticSearch` | `embedQuery(text)`; KNN su `section_vectors` con `k = limit`; gli eventuali ID pubblici sono risolti nei rowid interni. | `score = 1 - distance` (coseno). |

Con `fullSection: true` il motore legge una volta il `document.md` di ogni documento presente nei risultati e ritaglia le sezioni. Nella ricerca keyword il Markdown della sezione è già letto per calcolare `lines`, quindi il costo aggiuntivo è nullo.

I rowid passati a `vec0` sono `BigInt`: un `number` JS arriva come FLOAT e la *partition key* lo rifiuta.

### Ricerca semantica

- Un vettore per sezione, calcolato su `title + "\n" + summary`.
- `modelId` e `dimensions` sono in `store.json`. `semanticSearch` verifica che coincidano con il modello configurato e con la dimensione del vettore di query; in caso contrario dà `INDEX_MISMATCH`. Senza indice vettoriale la ricerca restituisce `[]`.
- La ricerca è esaustiva. Misurato con vettori binari da 1.536 dimensioni: 200.000 vettori, k = 50, circa 150 ms. Con 3,5 milioni di sezioni la stima lineare è circa 2,7 s su tutta la KB; con `documentIds` il costo è proporzionale alle sole sezioni filtrate.
- Quando l'ANN di sqlite-vec sarà stabile si attiverà nella stessa tabella, senza cambiare interfaccia né layout.

### Configurazione

```ts
interface PosixStoreOptions {
  root: string;
  maxLimit?: number; // Solo per il catalogo, default 100
  semantic?: { embeddings: EmbeddingsInterface; modelId: string; batchSize?: number };
}

interface POSIXSearchOptions {
  root: string;
  semantic?: { embeddings: Pick<EmbeddingsInterface, "embedQuery">; modelId: string };
  maxLimit?: number; // Solo per la ricerca, default 100
}
```

`createPosixStore` crea `root` e `.kb/` se mancano, apre il database in scrittura in modalità WAL, carica sqlite-vec solo se `semantic` è configurato e legge da `store.json` il modello dell’indice. `POSIXSearchEngine.open({ root, semantic?, maxLimit? })` apre una connessione propria con `readOnly: true` su un indice già inizializzato. Non richiede un’istanza dello store e carica sqlite-vec solo se gli si passa `semantic`.

```ts
const root = "./kb";
const semantic = { embeddings, modelId: "text-embedding-3-small" };
const store = await createPosixStore({ root, semantic });
try {
  const searchEngine = await POSIXSearchEngine.open({ root, semantic, maxLimit: 50 });
  try {
    const kb = await KbSmartManager.open(store, searchEngine, { llm, searchLimit: 50 });
    console.log(await kb.kbGetTableOfContents());
  } finally {
    await searchEngine.close();
  }
} finally {
  await store.close();
}
```

`kb.close()` equivale a chiudere lo store, non il motore. Imposta `searchLimit` in modo che non superi il `maxLimit` del motore POSIX; il `maxLimit` dello store non partecipa al calcolo dei limiti di ricerca.

### Limiti noti

- **Token e sottostringhe.** FTS5 trova "perche" in "Perché" ma la riga viene calcolata per sottostringa: la sezione viene restituita con `lines` vuoto. Il manager mostra allora la sezione intera o la sua sintesi.
- **Dimensione dei vettori.** In float32, 3,5 milioni × 1.536 dimensioni occupano circa 21 GB. Mitigazione: quantizzazione `int8` o binaria (da misurare sulla qualità).
- **Tre passi in `delete`.** Prima il manifest, poi la transazione, poi la cartella. Un'interruzione lascia al più una cartella senza manifest, che una ricostruzione non reindicizza.
- **Ricostruzione completa.** La ricostruzione all'apertura rilegge tutte le cartelle e ricalcola tutti gli embedding: a centinaia di migliaia di documenti è un'operazione lunga, da lanciare consapevolmente.

## 8. Refactor del vocabolario

Lo stesso dato oggi ha nomi diversi nel modello di analisi, in `DocumentMap` e negli output dei tool, e ogni tool lo traduce a mano. Il refactor fissa un solo vocabolario, in camelCase, dagli schemi zod di `src/parser/analysis.ts` fino ai tool. Il concetto è sempre "Document"; "File" resta solo dove si parla del file sorgente o del filesystem.

### Campi

| Oggi | Diventa | Dove |
| --- | --- | --- |
| `short_description` | `shortDescription` | schemi di `analysis.ts`, prompt, `DocumentMap`, `DocumentSection` |
| `startLine` / `endLine` | `fromLine` / `toLine` | schemi di `analysis.ts` |
| `range: [start, end]` | `fromLine`, `toLine` | `DocumentSection`, `DocumentPage` (`null` se la pagina è vuota diventa assenza dei due campi) |
| `pageRange: [a, b]` | `fromPage`, `toPage` | `DocumentSection` |
| `DocumentSection.id` | `sectionId` | `DocumentSection` |
| `DocumentPage.page` | `pageNumber` | `DocumentPage` |
| `originalFileName: string \| null` | `originalFileName?` | `DocumentSource`: stessa forma di `DocumentMap` |

`sectionTitle` in `PassageSource` resta invariato: `title` vi indica già il titolo del documento.

`DocumentLineRange` e `DocumentPageRange` spariscono.

### Nomi "File" → "Document"

| Oggi | Diventa |
| --- | --- |
| `kbFileGetTableOfContents` | `kbDocumentGetTableOfContents` |
| `kbFileGetInfo` | `kbDocumentGetInfo` |
| `kbFileReadSummary` | `kbDocumentReadSummary` |
| `kbFileRead` | `kbDocumentRead` |
| `kbFileReadSection` | `kbDocumentReadSection` |
| `kbFileSearchByKeywords` | `kbDocumentSearchByKeywords` |
| `FileInfo`, `FileSummary`, `FileContent` | `DocumentInfo`, `DocumentSummary`, `DocumentContent` |
| `FileTableOfContents` | fuso con `DocumentTableOfContents` del parser |
| `FileSpec` / `fileSpec` | eliminato: parametro `documentIds?: DocumentId[]` |

Restano invariati, perché indicano davvero un file: `originalFileName`, `fileType`, `DocumentInput.fileName`.

### Proiezioni al posto di copie

Le proiezioni di `DocumentMap` costruite a mano (`DocumentCard` e `AgentDocumentToc` in `src/kb/utils.ts`, la voce di `KbTableOfContents`, `DocumentInfo`) diventano `Pick` dei tipi del parser. `buildDocumentSource`, `buildSelectionCards` e `buildAgentToc` si riducono a selezioni di campi senza rinomina.

### Superficie pubblica

`src/index.ts` sostituisce `export *` con esportazioni esplicite:

| Esportato | Contenuto |
| --- | --- |
| `createDocumentParser` | `parseDocument`, `parseDocuments`. Nessun riferimento allo store. |
| `convertDocument` | `(input: Pick<DocumentInput, "bytes" \| "fileName">, onProgress?) → Promise<string>`: solo conversione (PDF, OCR), senza LLM; restituisce il Markdown pulito. La versione con `pages` resta interna e la usa `parseDocument`. |
| Utility del parser | `getDocumentTableOfContents`, `getSectionMarkdown`, `saveDocumentMarkdown`: lavorano su un `ParsedDocument` in memoria, per chi usa il parser senza lo store. Adottano il vocabolario del §8. |
| `createPosixStore` | Restituisce un `KbStore`. |
| `POSIXSearchEngine` | `open(options)`, `keywordSearch()`, `semanticSearch?()` e `close()` della connessione di ricerca. |
| `KbSmartManager` | `open(store, searchEngine, options?)`, `getTools()`, `getAgentSearchTool()`, `kbAgentSearch()`, `deleteDocument()`, `close()` (solo store) e i metodi `kb*` dei tool, che restano chiamabili direttamente. |
| Tipi del documento | `DocumentId`, `ParsedDocument`, `DocumentMap`, `DocumentSection`, `DocumentPage`. |
| Tipi dello store | `KbStore`, `KbStoreError`, `PosixStoreOptions`, `DocumentCard`. |
| Contratti di ricerca | `KBSearchEngine`, classe astratta `SearchEngine`, `POSIXSearchOptions`, `KeywordQuery`, `SemanticQuery`, `SearchHit`. |
| Tipi del manager | Opzioni di `open`, `SearchQuery`, `SearchContextOptions` e gli output dei metodi `kb*` (`KbTableOfContents`, `DocumentTableOfContents`, `DocumentInfo`, `DocumentSummary`, `DocumentContent`, `SearchResult`, fonti, `AgentSearchResult`). |
| Tipi del parser | `ParserOptions`, `DocumentInput`, `DocumentParseProgress` (unione), `DocumentParseError`. |

Escono dalla superficie pubblica: `persist`, `load`, `ConvertedDocument` e `ConversionInput`, `getDocumentModel` (spostato in `scripts/shared/document-model.mjs`; il manager non ha più un modello di default) e i tipi di progresso per fase (si ricavano da `DocumentParseProgress` con `Extract`). Si eliminano `importFile`, `importDocument`, `ImportFileOptions`, `ImportDocumentInput` e le fasi di progresso `reading` e `saving`, emesse solo dall'import. `kb-agent-cli/import-file.mjs`, i test e `benchmarks/search-agent/kb2-corpus.mjs` usano la composizione del §4. `README.md`, `examples/prova-ocr.mjs` e `test/parser.test.mjs:395` leggono oggi `{ markdown, pages }` da `convertDocument` e vanno adattati; il test sulle pagine passa per `parseDocument` o per la funzione interna.

### Impatto

- **Modello di analisi.** Cambiano le chiavi dell'output strutturato e il testo dei prompt che le citano (`analysis.ts:80`, `:86`, `:457`).
- **Agente.** Vanno aggiornati il prompt di sistema in `src/kb/agent.ts` e il riconoscimento delle fonti per nome in `recordToolSources()`. Spariscono `tocMode` e il selettore: si eliminano `src/kb/selection.ts`, `AgentSearchOptions`, `DocumentSelectionOptions`, `buildAgentToc`, `buildSelectionCards` e la TOC nel prompt. `KbOpenOptions` contiene `{ llm?, searchLimit? }` e si passa come terzo argomento di `open`.
- **Benchmark.** `benchmarks/search-agent/decision-model.mjs` e il confronto tra modalità in `run.mjs`, `run-kb2.mjs` e `simulate-cost.mjs` perdono due dei tre bracci; resta il solo percorso via tool.
- **Test, CLI e benchmark.** Rinomina meccanica in `test/*.mjs`, `kb-agent-cli/` e `benchmarks/search-agent/` (circa 30 occorrenze di `shortDescription`/`short_description` nei soli test e CLI).
- **Dati.** `kb1/` e i corpus dei benchmark vanno rigenerati. I risultati dei benchmark prima e dopo il refactor non sono direttamente confrontabili, perché l'LLM vede nomi di tool diversi.

## 9. Decisioni

| Decisione | Scelta | Alternative scartate | Motivo |
| --- | --- | --- | --- |
| Superficie dello store | 5 operazioni + `close`; ricerca in `KBSearchEngine` | Ricerca incorporata nello store, `readLines`, revisioni | Persistenza e ricerca evolvono separatamente; il manager ritaglia da solo righe e sezioni. |
| Lettura | `get` (mappa) e `read` (Markdown) separati | Un solo `get` con Markdown | `kbDocumentGetInfo` non deve leggere 125 KB di testo. |
| Catalogo | `list` paginato su indice | Mappe o schede tutte in memoria | A 100.000 documenti le mappe sono circa 3,7 GB. |
| Risultati di ricerca | `SearchHit` per sezione, `lines?` per le keyword | Solo righe; solo sezioni | Un tipo comune alle due ricerche, senza perdere gli snippet di `kbDocumentSearchByKeywords`. |
| Indice testuale | SQLite FTS5 | Scansione JS, GNU grep | La scansione di circa 12,5 GB non è praticabile; BSD grep su macOS non supporta `-P`. |
| Regex | Nel manager, solo con `documentIds` non vuoto | Nel motore; eliminazione | FTS5 non valuta regex; il raffinamento su pochi documenti resta disponibile. |
| Motore vettoriale | sqlite-vec esaustivo nello stesso database | LanceDB, usearch, ANN alpha di sqlite-vec | Un file e una transazione; la latenza di 1–3 s su tutta la KB è accettata. |
| Una radice per store | Sì | `open(baseFolder[])` | Aggregazioni si fanno sopra il contratto. |
| Layout | Cartelle canoniche invariate; migrazione dell'indice numerico | Rigenerazione della KB | Conserva documenti, ricerca testuale e vettori. |
| Vocabolario | camelCase unico, `fromLine`/`toLine` | snake_case e tuple del parser; due vocabolari con traduzione | Elimina le traduzioni nei tool; nessun vincolo di compatibilità. |
| "File" vs "Document" | Sempre "Document" | Nomi attuali | Un concetto, un nome; "File" solo per il file sorgente. |
| Filtro per documenti | `documentIds?: DocumentId[]` | `FileSpec` | Un tipo in meno con un solo campo. |
| Metodi `kb*` | Pubblici su `KbSmartManager` | Solo tool LangChain | Restano utilizzabili da codice e test senza passare dai tool. |
| Esportazioni | Elenco esplicito in `src/index.ts` | `export *` | Superficie pubblica minima e controllata. |
| Catalogo nel tool | `kbGetTableOfContents` paginato (`cursor`, `text`, `tags`; 100 per pagina) | Solo filtro; prime N schede troncate | Riusa `list`; permette sia di sfogliare sia di filtrare. |
| Scoperta dei documenti nell'agente | Solo tool (`kbGetTableOfContents` paginato e ricerche) | `tocMode: "prompt"`; selettore LLM; selettore sui risultati di una ricerca | A 100.000 documenti la TOC nel prompt supera ogni contesto e il selettore richiede 5.000 chiamate per domanda. Il selettore sui risultati si può reintrodurre se i benchmark lo giustificano. |
| Parser e store | Indipendenti; il chiamante compone `parseDocument` e `add` | `importFile`/`importDocument` con lo store; `add` che chiama il parser | Nessun accoppiamento in nessuna direzione. |
| Identità dei documenti | UUID v7 generato dal parser o ID esplicito; unicità in `add` | ID sequenziali e prenotazioni prima del parsing | La CLI non deve esaminare il catalogo o riprovare per assegnare un ID. |
| `convertDocument` | Pubblico, restituisce `string` | Rimozione; restituire `{ markdown, pages }` | Conversione senza LLM per chi ne ha bisogno, con un tipo in meno. |
| `DocumentContent` | Un tipo per documento e passaggio | `SectionContent` separato | Stessa forma; il documento vuoto ha una fonte di documento. |
| Indice mancante | Ricostruito all'apertura dello store dalle cartelle | Comando `rebuild` esplicito | La KB in Git resta fatta di file leggibili; nessun binario versionato. |
| Utility del parser | Restano pubbliche | Rimozione | Il parser resta usabile da solo, senza store. |
| Testo nei risultati | `markdown?` in `SearchHit`, attivato da `fullSection` | Lettura separata con `get` + `read` | L'agente ottiene la sezione in una chiamata; senza il flag i risultati restano leggeri. |

## 10. Questioni aperte

- `docs/parser.technical.spec.md` e `docs/parser-kbmanager.spec.md` descrivono ancora l'API precedente e vanno riscritte.
- Quantizzazione dei vettori (float32, int8, binaria con rescore): da misurare su qualità e latenza.
- Prefissi nelle keyword (`canon*`) per ridurre la perdita rispetto alla sottostringa: da valutare.
- Da verificare: costo di `contentless_delete` su FTS5 con milioni di righe; dimensione dell'indice FTS rispetto al corpus.
- Backend Azure (Blob Storage + Azure AI Search): capitolo dedicato.
