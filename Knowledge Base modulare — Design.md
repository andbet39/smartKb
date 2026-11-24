# Knowledge Base modulare — Design

Nov 23, 2026 · @Andrea Terzani · Stato: bozza

## 1. Scopo e principi

La knowledge base modulare offre agli agenti un'unica interfaccia per cercare, leggere e scrivere documenti, indipendente dalla tecnologia di storage e di ricerca. La V2 nasce da zero; la prima implementazione descritta è una KB a mappa markdown in modalità push (capitolo 8).

- **Lo store è la fonte di verità.** Il corpus è l'insieme degli originali nello store. Il chiamante può assegnare il `documentId` oppure lasciarlo generare alla KB. La chiave fisica dell’oggetto resta privata dello store.
- **Backend nascosto dietro le interfacce.** Nessun nome di tecnologia compare nelle firme: il vocabolario dei backend resta negli adapter.
- **Una facciata, quattro strategie.** L'agente vede solo `KnowledgeBase`; store, motore, lettore e indexer sono strategie iniettate nel costruttore.
- **Motore, lettore e indexer viaggiano in famiglia.** Condividono client e indice, quindi si costruiscono insieme da una factory; lo store si sceglie liberamente.
- **Un motore per KB.** La combinazione di più KB avviene a un livello superiore, usando il `rank` dei risultati.
- **Contratto minimo.** Identità utente, capability e stato del motore restano fuori finché non servono.

## 2. Concetti

Una KB è la composizione di uno store e di una famiglia di backend di ricerca, esposta agli agenti da una facciata.

| Componente | Responsabilità | Esempi |
| --- | --- | --- |
| `ObjectStore` | Conserva i file originali; elenca, legge, scrive e cancella | Azure Blob, S3, file system |
| `SearchEngine` | Ricerca per parole chiave e semantica; restituisce risultati con riferimenti canonici | Sinequa, motore a mappa |
| `ContentReader` | Restituisce il testo estratto di un documento, anche solo alcune righe | Sinequa, DerivedStore |
| `Indexer` | Tiene il motore allineato allo store | refresh di Sinequa, pipeline markdown |
| `KnowledgeBase` | Facciata vista dagli agenti; smista le chiamate e unica via di scrittura | `DefaultKnowledgeBase` |

Il motore e il suo indexer lavorano sullo stesso indice: sono il lato lettura e il lato scrittura della stessa tecnologia. Il collegamento tra store e motore avviene in due modi.

- **Pull.** Il motore legge lo store con i propri connettori; l'indexer si limita a sollecitarlo dopo una modifica. È il caso di Sinequa.
- **Push.** L'indexer legge lo store, prepara il contenuto e lo scrive nell'indice del motore. È il caso della KB a mappa.

Tutto ciò che deve coincidere tra indicizzazione e ricerca (formato dell'indice, modello di embedding, analizzatori del testo) appartiene alla famiglia del motore. Parsing e chunking appartengono all'indexer push e non dipendono dal motore.

## 3. Modello dati

Tutti i tipi sono comuni alle KB e non contengono concetti di un backend specifico.

| Tipo | Campi | Note |
| --- | --- | --- |
| `DocumentId` | stringa opaca non vuota | Identità pubblica stabile e univoca nella KB. Non è un percorso, un hash o un ID del motore. |
| `sha` | stringa | SHA-256 dei byte originali, in esadecimale minuscolo. Identifica il contenuto a cui si riferiscono testo e risultati; una modifica ai soli metadati non lo cambia. Lo calcola l’adapter se il backend non lo fornisce in questo formato. |
| `DocumentInfo` | `documentId`, `sha`, `metadata` | Identità confermata alla scrittura, versione dei byte e metadati. |
| `CanonicalMetadata` | `title`, `contentType`, `author`, `createdAt`, `modifiedAt`, `tags` | Schema unico per tutte le KB. I nomi sono anche i campi filtrabili. Si estende qui, mai negli adapter. |
| `Filter` | campo canonico → valore, lista di valori o intervallo `{gte, lte}` | Tutti i criteri sono in AND. |
| `SearchOptions` | `topK?`, `filter?`, `cursor?` | Uguali per le due ricerche. |
| `Passage` | `text`, `lineStart?`, `lineEnd?`, `page?` | Ogni motore valorizza la posizione che conosce. |
| `Hit` | `documentId`, `sha`, `rank`, `score?`, `metadata`, `passages` | `sha` è quello del contenuto indicizzato. `rank` parte da 1 ed è l'unico dato confrontabile tra KB; `score` è grezzo e specifico del motore. |
| `SearchResult` | `hits`, `nextCursor?` | Paginazione con cursore opaco. |
| `Document` | `documentId`, `sha`, `text`, `metadata` | Testo estratto. Se lo `sha` differisce da quello nello store, il testo è di un contenuto precedente. |

## 4. Interfacce

Gli agenti chiamano solo `KnowledgeBase`; le altre quattro interfacce sono usate dalla facciata e tra loro solo dove indicato.

| Interfaccia | Metodi | Chiamata da | Responsabilità |
| --- | --- | --- | --- |
| `KnowledgeBase` | `searchKeyword`, `searchSemantic`, `read`, `list`, `write`, `delete` | Agenti, livello di fusione | Smistare le chiamate; scrivere e poi avvisare l'indexer |
| `ObjectStore` | `stat`, `list`, `read`, `write`, `delete` | Facciata, indexer push | Conservare gli originali con semantica object storage |
| `SearchEngine` | `searchKeyword`, `searchSemantic` | Facciata | Tradurre testo e filtri nella sintassi del motore |
| `ContentReader` | `readText` | Facciata | Restituire testo estratto e metadati |
| `Indexer` | `index`, `remove`, `status` | Facciata, eventi dello store | Allineare il motore allo store |

```ts
// ── Tipi comuni ──
export type DocumentId = string;

export interface CanonicalMetadata {
  title?: string;
  contentType?: string;
  author?: string;
  createdAt?: Date;
  modifiedAt?: Date;
  tags?: string[];
}

export interface DocumentInfo {
  documentId: DocumentId;
  sha: string;            // hash del contenuto
  metadata: CanonicalMetadata;
}

/** Filtri in AND: uguaglianza, lista di valori o intervallo. */
export type Filter = Partial<Record<keyof CanonicalMetadata,
  string | number | Date | (string | number)[] | { gte?: string | number | Date; lte?: string | number | Date }>>;

export interface SearchOptions {
  topK?: number;
  filter?: Filter;
  cursor?: string;
}

export interface Passage {
  text: string;
  lineStart?: number;
  lineEnd?: number;
  page?: number;
}

export interface Hit {
  documentId: DocumentId;
  sha: string;            // contenuto indicizzato
  rank: number;           // 1-based, confrontabile tra KB
  score?: number;         // grezzo, NON confrontabile tra motori
  metadata: CanonicalMetadata;
  passages: Passage[];
}

export interface SearchResult {
  hits: Hit[];
  nextCursor?: string;
}

export interface Document {
  documentId: DocumentId;
  sha: string;            // contenuto a cui si riferisce il testo
  text: string;
  metadata: CanonicalMetadata;
}

// ── Componenti ──
export interface ObjectStore {
  stat(documentId: DocumentId): Promise<DocumentInfo>;
  list(idPrefix?: string, cursor?: string): Promise<{ items: DocumentId[]; nextCursor?: string }>;
  read(documentId: DocumentId): Promise<Uint8Array>;
  write(documentId: DocumentId, body: Uint8Array, metadata: CanonicalMetadata): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
}

export interface SearchEngine {
  searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult>;
  searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult>;
}

export interface ContentReader {
  readText(documentId: DocumentId, lines?: { start: number; end: number }): Promise<Document>;
}

export interface Indexer {
  index(documentIds: DocumentId[]): Promise<void>;
  remove(documentIds: DocumentId[]): Promise<void>;
  status(documentId: DocumentId): Promise<'indexed' | 'pending' | 'failed' | 'absent'>;
}

export interface KnowledgeBase {
  readonly id: string;
  searchKeyword(text: string, opts?: SearchOptions): Promise<SearchResult>;
  searchSemantic(text: string, opts?: SearchOptions): Promise<SearchResult>;
  read(documentId: DocumentId, lines?: { start: number; end: number }): Promise<Document>;
  list(idPrefix?: string, cursor?: string): Promise<{ items: DocumentId[]; nextCursor?: string }>;
  write(body: Uint8Array, metadata: CanonicalMetadata, documentId?: DocumentId): Promise<DocumentInfo>;
  delete(documentId: DocumentId): Promise<void>;
}
```

## 5. Garanzie, vincoli ed errori

Ogni implementazione deve rispettare questi contratti, verificati da una suite di test comune (capitolo 9).

- **Identità.** `write(body, metadata, "ERP-42")` crea o sostituisce `ERP-42` e restituisce quel valore senza normalizzarlo. `write(body, metadata)` crea un nuovo documento e restituisce l’ID generato in `DocumentInfo.documentId`. L’ID vuoto è invalido, non equivale all’omissione. Per ripetere una scrittura senza creare duplicati il chiamante deve fornire un ID stabile. Lo stesso contenuto può appartenere a due ID distinti.
- **Indirizzamento.** `read` e `delete` richiedono solo il `documentId`. `list` restituisce ID e applica l’eventuale prefisso agli ID, non ai percorsi. Lo store traduce l’ID nella propria chiave fisica (per esempio con una codifica reversibile sicura, mai concatenando input a un percorso). La corrispondenza deve sopravvivere al riavvio e alla ricostruzione dell’indice. Anche gli eventi dello store devono poter risalire all’ID dopo una cancellazione.
- **Nessun filtro ignorato.** Un filtro su un campo che il motore non sa gestire genera un errore, mai un risultato non filtrato.
- **Ricerca non supportata esplicita.** Un motore senza ricerca semantica lancia `not_supported` su `searchSemantic`.
- **Semantica object storage.** Lo store scrive oggetti interi, conosce solo prefissi e non rinomina in modo atomico. Sulle scritture concorrenti vince l'ultima.
- **Scrittura prima dell'indice.** Una scrittura è valida appena lo store la conferma. L'avviso all'indexer è best effort: se fallisce, lo recuperano gli eventi dello store o il crawl.
- **Ritardo visibile.** Lo `sha` in `Hit` e in `Document` dice a quale contenuto si riferiscono; se differisce da quello dello store, l'indice non è ancora aggiornato. `Indexer.status` rende visibile lo stato.
- **Cancellazione idempotente.** `delete` su un ID assente non è un errore.

| Codice | Quando |
| --- | --- |
| `not_found` | ID inesistente in `stat`, `read`, `readText` |
| `unsupported_filter` | Filtro su un campo o con un operatore che il motore non gestisce |
| `not_supported` | Metodo che l'implementazione non offre, per esempio `searchSemantic` |
| `backend_unavailable` | Backend irraggiungibile o in timeout; ripetibile |

## 6. Flussi

&#91;embedded content: componenti della KB e chi chiama chi\]

Le frecce dall'alto sono le chiamate sincrone della facciata; quelle in basso sono il percorso di allineamento, in cui lo store notifica le modifiche e l'indexer aggiorna il motore. `ContentReader` legge dal motore (Sinequa) o dal DerivedStore (KB a mappa).

## 7. Composizione

La facciata riceve quattro strategie nel costruttore. Lo store si sceglie liberamente; motore, lettore e indexer arrivano insieme da una `BackendFactory`, così non si possono mescolare tecnologie incompatibili.

```ts
export interface KnowledgeBaseDeps {
  id: string;
  store: ObjectStore;
  engine: SearchEngine;
  reader: ContentReader;
  indexer: Indexer;
}

export class DefaultKnowledgeBase implements KnowledgeBase {
  constructor(private readonly d: KnowledgeBaseDeps) {}
  get id() { return this.d.id; }

  searchKeyword(text: string, opts?: SearchOptions) { return this.d.engine.searchKeyword(text, opts); }
  searchSemantic(text: string, opts?: SearchOptions) { return this.d.engine.searchSemantic(text, opts); }
  read(documentId: DocumentId, lines?: { start: number; end: number }) { return this.d.reader.readText(documentId, lines); }
  list(idPrefix?: string, cursor?: string) { return this.d.store.list(idPrefix, cursor); }

  async write(body: Uint8Array, metadata: CanonicalMetadata, documentId: DocumentId = crypto.randomUUID()) {
    if (!documentId.length) throw new TypeError('documentId vuoto');
    const info = await this.d.store.write(documentId, body, metadata);
    await this.d.indexer.index([info.documentId]).catch(err => log.warn(err)); // best effort
    return info;
  }

  async delete(documentId: DocumentId) {
    await this.d.store.delete(documentId);
    await this.d.indexer.remove([documentId]).catch(err => log.warn(err));
  }
}

/** Famiglia coerente: stesso client, stesso indice. */
export interface SearchBackend {
  engine: SearchEngine;
  reader: ContentReader;
  indexer: Indexer;
}
export type BackendFactory = (store: ObjectStore, config: unknown) => SearchBackend;
```

Le KB si definiscono in configurazione e si costruiscono al composition root con un registro di factory indicizzato per tipo.

```ts
const stores: Record<string, (cfg: any) => ObjectStore> = {
  azure_blob: c => new AzureBlobStore(c),
  s3: c => new S3Store(c),
  fs: c => new FsStore(c),
};
const backends: Record<string, BackendFactory> = { sinequa: sinequaBackend, map: mapBackend };

export function buildKnowledgeBase(def: KbDefinition): KnowledgeBase {
  const store = stores[def.store.type](def.store.config);
  return new DefaultKnowledgeBase({ id: def.id, store, ...backends[def.backend.type](store, def.backend.config) });
}
```

Ogni `BackendFactory` verifica le combinazioni non valide all'avvio, per esempio uno store che il connettore di Sinequa non sa leggere. Le credenziali dei backend arrivano dalla configurazione degli adapter, non dalle firme.

## 8. Implementazione con mappa markdown (push)

L'utente carica file di qualsiasi formato; l'indexer li converte in markdown, li divide in sezioni semantiche e produce una mappa JSON con riassunti e intervalli di righe, che il motore usa per cercare.

### Mappatura

| Interfaccia | Implementazione | Note |
| --- | --- | --- |
| `SearchEngine` | `MapSearchEngine` | Cerca sulle mappe: titoli, riassunti e testo delle sezioni. Restituisce come passaggi le sezioni con il loro intervallo di righe. |
| `ContentReader` | `MarkdownReader` | Legge dal DerivedStore il markdown intero o solo le righe richieste. |
| `Indexer` | `MapIndexer` | Converte, divide in sezioni, genera i riassunti, salva markdown e mappa nel DerivedStore. |

### DerivedStore

Nel backend locale, Markdown e mappa sono file distinti sul filesystem. Il database è un indice ricostruibile: conserva riferimenti, coordinate, termini di ricerca e vettori, non una copia della mappa o del Markdown.

- Contiene il markdown e la mappa di ogni documento, con chiave formata dallo `sha` dell'originale e dalla versione della pipeline. Un contenuto identico non viene rielaborato.
- È una cache rigenerabile: l’indice associa ogni `documentId` alla versione elaborata. `list` mostra solo gli ID degli originali; due ID possono condividere lo stesso artefatto.
- Un nuovo `sha` genera nuovi artefatti; cancellare un documento rimuove la sua associazione. L’artefatto può essere eliminato solo quando nessun altro documento lo usa.
- Una conversione errata si corregge rilanciando la pipeline con un'altra configurazione, mai modificando il markdown a mano.

### Forma della mappa

```json
{
  "sha": "9f2c41...",
  "sections": [
    { "id": "s1", "title": "Oggetto del contratto", "summary": "...", "lineStart": 1, "lineEnd": 42 },
    { "id": "s2", "title": "Penali", "summary": "...", "lineStart": 43, "lineEnd": 97, "parentId": "s1" }
  ]
}
```

### Limiti noti

- **Tempo di elaborazione.** Conversione e riassunti con l'LLM richiedono da secondi a minuti; nel frattempo `status` restituisce `pending`.
- **Costo dei riassunti.** Cambiare modello o prompt richiede di rigenerare le mappe; i risultati intermedi salvati per stadio limitano il lavoro da rifare.

## 9. Verifica del contratto V2

La suite comune parte da una KB vuota, senza corpus o consumer V1. Verifica almeno questi casi:

1. Scrivere con `ERP-42`, aggiornare lo stesso ID con byte diversi: una sola voce in `list`, stesso ID, nuovo `sha` confermato da `stat`. Dopo l’indicizzazione `Hit` e `Document` riportano ID e SHA aggiornati.
2. Scrivere due volte senza ID, anche con gli stessi byte: due ID distinti restituiti. Usarli direttamente per leggere e cancellare; dopo la prima cancellazione l’altro documento resta leggibile. Ripetere la cancellazione è innocuo.
3. Riaprire lo store e ricostruire l’indice: gli ID esterni e generati non cambiano. Nessuna chiave fisica compare nei risultati. Gli ID contenenti separatori restano opachi.
4. Rifiutare l’ID vuoto prima della scrittura, segnalare i filtri non supportati e verificare che un errore di notifica non annulli la scrittura già confermata.

## 10. Decisioni

**Perimetro di sviluppo.** La prima iterazione comprende la facciata `KnowledgeBase`, le quattro strategie e la famiglia a mappa. È utilizzabile direttamente, senza tool per agenti. L’indexer può già produrre sezioni e riassunti per la ricerca: è la loro esposizione ai consumer a essere rinviata, non la loro produzione.

Nella seconda iterazione si progetterà il modulo `agent-tools` sopra la facciata. I tool portabili useranno `KnowledgeBase`; per catalogo arricchito, TOC, riassunti e lettura per `sectionId` si valuterà un `DocumentNavigator` opzionale. La lettura per intervallo di righe resta invece parte di `KnowledgeBase.read` fin dalla prima iterazione. Le firme V1 di `KbToolsTarget` non sono un vincolo per il core.

| Decisione | Scelta | Alternative scartate | Motivo |
| --- | --- | --- | --- |
| Divisione dei componenti | Store indipendente più famiglia motore, lettore, indexer | Tre porte indipendenti; sorgente unica | Motore e indexer condividono l'indice; lo store no |
| Identità del documento | `documentId` esterno o generato, più `sha` dei byte | Esporre la chiave fisica o usare lo SHA come ID | Il chiamante può aggiornare, leggere e cancellare lo stesso documento senza conoscere lo storage |
| Ricerca | Due metodi: keyword e semantica | Modalità nella query; ibrida nel motore | Contratto minimo; l'ibrida si ottiene sopra |
| Motori per KB | Uno | Federazione dentro la KB | La fusione avviene a livello superiore con `rank` |
| Filtri | Mappa su campi canonici, in AND | Albero di filtri completo; query nativa | Basta ai casi attuali e non espone la sintassi del motore |
| Metadati | Schema canonico unico | Schema per KB scoperto a runtime | Traduzione dei filtri semplice e uniforme |
| Store | Semantica object storage, lettura e scrittura, ultima scrittura vince | File system come modello; scritture condizionali | Minimo comune denominatore; il file system lo emula |
| Contenuto per l'agente | Testo estratto e metadati | File originale | Sufficiente per gli agenti |
| Markdown derivato | Interno, cache rigenerabile | Visibile e modificabile | L'originale resta l'unica fonte di verità |
| Identità utente | Fuori dal contratto | `RequestContext`; token per chiamata | Non serve ora; si aggiunge come opzione |
| Aggiornamento dell'indice | Avviso subito dopo la scrittura più eventi dello store | Solo crawl pianificato | Requisito di ricercabilità quasi immediata |
| Costruzione | Strategie iniettate più `BackendFactory` | Singleton globali | Combinazioni coerenti, verificate all'avvio |

## 11. Questioni aperte

- [ ] Serviranno permessi per singolo documento? Fino ad allora no: si aggiungerà un `userToken` opzionale in `SearchOptions` e in `read`.
- [ ] Nella KB a mappa un documento deve essere ricercabile prima che i riassunti siano pronti? Fino a decisione contraria, compare solo a elaborazione completa.
- [ ] Il DerivedStore vive nello stesso object storage, sotto un prefisso riservato, o in un container separato? Si assume un container separato.
- [ ] Il cursore opaco basta per la paginazione di tutti i motori? Si assume di sì.
