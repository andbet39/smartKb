# Specifica tecnica — KB Manager

`KbSmartManager` coordina consultazione, ricerca e tool agentici senza dipendere da un backend concreto. Per i contratti di persistenza e ricerca si veda [KB Store](kbstore.technical.spec.md). Le voci **Enhancement** sono proposte.

Nel contratto attuale, gli ID documento usati nelle letture, nei filtri di ricerca e nelle fonti sono `DocumentId` (`string | number`): UUID v7 canonici in minuscolo o interi sicuri non negativi per gli ID legacy. Gli ID di sezione e le coordinate restano numerici.

## 1. Apertura, catalogo e ciclo di vita

```ts
declare class KbSmartManager {
	static open(store: KbStore, searchEngine: KBSearchEngine, options?: KbOpenOptions): Promise<KbSmartManager>;
	close(): Promise<void>;
}

interface KbOpenOptions {
	llm?: Pick<BaseChatModel, "bindTools">;
	searchLimit?: number;
}
```

`open` riceve dipendenze già aperte. Non carica il catalogo e non richiede un modello. `searchLimit` è un intero sicuro positivo (default 100); non deriva da `store.maxLimit` e deve essere compatibile con il limite del motore. `KBSearchEngine` espone solo `keywordSearch` e `semanticSearch` facoltativo; `SearchEngine` ne è la classe base astratta.

Con il backend POSIX, `createPosixStore` inizializza la radice e `POSIXSearchEngine.open({ root, semantic?, maxLimit? })` apre una connessione SQLite separata in sola lettura sull’indice esistente. Il manager chiude **solo lo store** tramite `kb.close()`; il chiamante chiude a parte il motore POSIX con `searchEngine.close()`.

Il catalogo è letto a pagine tramite `store.list`, non mantenuto come fotografia all’apertura. Il manager usa cache LRU limitate per mappe e testo. `deleteDocument` invalida quelle voci, delega la cancellazione allo store e segnala un errore se l’ID non esiste. Il file originale non è gestito. Se si cancella e si reinserisce lo stesso ID direttamente nello store, il manager può conservare una voce obsoleta fino all’espulsione dalla cache.

Riferimenti: [composizione e ciclo di vita del manager](../src/kb/manager.ts), [contratto di ricerca](../src/search/interfaces.ts).

## 2. Consultazione diretta e fonti

| Operazione | Origine dei dati | Risultato |
| --- | --- | --- |
| `kbGetTableOfContents` | `store.list`, con `cursor?`, `text?`, `tags?` e limite `Math.min(100, store.maxLimit)` | Schede in `documents`, con `nextCursor` se ci sono altre pagine |
| `kbDocumentGetTableOfContents` | Mappa e pagine | Sezioni con ID, titolo, descrizione e coordinate |
| `kbDocumentGetInfo` / `kbDocumentReadSummary` | Mappa | Metadati o sintesi già salvata, senza coordinate testuali per la sintesi |
| `kbDocumentRead` | Markdown e mappa | Testo completo; se vuoto, solo fonte a livello di documento |
| `kbDocumentReadSection` | Markdown e mappa | Testo per ID di sezione oppure per intervallo di righe inclusivo |

Quando il testo non è in cache, il manager legge il Markdown dallo store e lo divide su LF. Lo store POSIX verifica il numero di righe contro `lineCount`; il conteggio non rileva modifiche che lasciano invariato il numero di righe. ID documento o sezione sconosciuti e range espliciti non interi, invertiti o fuori da `1..lineCount` producono errori nelle operazioni di lettura.

Un `PassageSource` identifica documento e range assoluto; include la sezione solo se il passaggio è contenuto interamente in una sezione. Ogni elemento di `pages` è l'intersezione tra il passaggio e le righe effettive di una pagina: le pagine vuote sono escluse, anche per una sezione multipagina. `pages` è `null` quando manca la mappa delle pagine, non un numero di pagina dedotto. `originalFileName` è omesso se assente; il nome non è la chiave del catalogo.

**Enhancement.** Legare il testo a un hash di revisione del manifest. Per letture parziali ripetute, valutare una cache legata alla revisione o un indice degli offset di riga: a cache fredda, una singola sezione costa una lettura completa del documento.

Riferimento: [fonti e operazioni dirette](../src/kb/manager.ts).

## 3. Ricerca testuale e semantica

In modalità keyword, `kbDocumentSearchByKeywords` chiama `searchEngine.keywordSearch` con `limit: searchLimit`. Il motore POSIX cerca nell’indice FTS5 per frasi di parole intere in OR. Senza `documentIds` la ricerca è globale; un filtro vuoto non seleziona documenti. Il manager raggruppa gli hit per documento in ordine di prima occorrenza e usa le righe corrispondenti per costruire gli snippet. Se l’hit non contiene righe corrispondenti o `fullSection` è attivo, usa l’intera sezione.

La modalità regex resta nel manager: richiede `documentIds` non vuoto, deduplica gli ID in ordine di prima occorrenza, legge il Markdown dallo store e applica il pattern JavaScript riga per riga, senza usare il motore. Compila il pattern una volta con flag `iu` (default) o `u` con `caseSensitive: true`. Un pattern non valido produce un errore.

`beforeLines` e `afterLines` sono interi indipendenti da 0 a 20, con default 0. Gli intervalli si limitano ai bordi del documento e si fondono solo se si sovrappongono, non quando sono soltanto adiacenti. `source` copre l'intero snippet e `matchLines` enumera le righe corrispondenti. Anche senza contesto, il risultato contiene al massimo 20 finestre e 12.000 unità UTF-16 di snippet, inclusi i LF interni. Alla prima finestra che non entra nel budget, il manager si ferma con `truncated: true`. Per le keyword segnala `truncated: true` anche quando riceve esattamente `searchLimit` hit. Nel tool gli argomenti di contesto sono allo stesso livello di `query` e `documentIds`.

`kbDocumentSearchSemantic` chiede a `semanticSearch` al massimo `Math.min(10, searchLimit)` hit e passa `fullSection` al motore. Il manager risolve le fonti dalle mappe dello store. Un hit il cui `markdown` non entra nel budget residuo di 12.000 unità UTF-16 conserva fonte e metadati senza il testo; il risultato segnala `truncated: true`. Se il motore non espone `semanticSearch`, il tool non è registrato e una chiamata diretta al metodo produce un errore.

**Considerazioni.** Le regex sono sincrone e non hanno un budget di esecuzione dedicato. Le letture integrali possono produrre output molto grandi per un modello.

**Enhancement prioritario.** Applicare un limite di esecuzione alle regex. Se si introduce paginazione dei risultati di ricerca, mantenere un ordine stabile e coordinarla con la revisione del corpus.

Riferimenti: [matching, finestre e limiti](../src/kb/search.ts), [contratti dei risultati](../src/kb/types.ts).

## 4. Scoperta dei documenti

Il prompt iniziale non contiene il catalogo. L’agente scopre documenti e sezioni tramite il catalogo paginato, la TOC del singolo documento e i tool di ricerca. Il manager non esegue preselezioni con un altro modello.

Riferimento: [istruzioni di scoperta](../src/kb/agent.ts).

## 5. Esecuzione agentica e citazioni

`kbAgentSearch` richiede una domanda non bianca e restituisce risposta Markdown e fonti strutturate (`AgentSearchResult`); `getAgentSearchTool` espone lo stesso metodo come tool LangChain. `getTools` espone le operazioni dirette di consultazione e ricerca, non il tool agente. Senza un `llm` che supporti `bindTools` la ricerca agentica non è disponibile; il manager non crea un modello predefinito.

L'agente manda domanda e system prompt al modello, quindi esegue le chiamate richieste in sequenza e accoda un `ToolMessage` per ID chiamata. Sono ammessi otto turni con tool, più una nona invocazione per concludere: se anche questa chiede tool, la ricerca fallisce. Il limite non conta le singole chiamate dello stesso turno. Una chiamata formata in modo non valido, o senza ID quando deve essere eseguita, interrompe la ricerca. Tool non disponibili o eccezioni durante l'esecuzione ricevono un messaggio di errore generico e il modello può correggersi. Gli errori di invocazione del modello risalgono al chiamante.

Le letture esplicite di testo non bianco raccolgono sempre una fonte di passaggio, anche se la risposta finale non la usa. I match di ricerca sono invece raccolti come possibili fonti e diventano riferimenti solo con un marcatore interno corrispondente esattamente a documento e range restituiti; per una riga è ammessa la forma abbreviata. I marcatori riconosciuti sono rimossi anche se non corrispondono ad alcun match. I riferimenti sono deduplicati per `(documentId, fromLine, toLine)`, non per sovrapposizione. Il tipo pubblico ammette riferimenti `summary`, ma l'implementazione corrente emette soltanto `passage`.

**Considerazioni.** Il controllo dei marcatori verifica la provenienza dei match citati, non che tutte le affermazioni siano supportate. Il modello può anche concludere senza usare tool. Il prompt tratta TOC e output dei tool come dati; non sostituisce limiti su quantità e tipo di testo inviato al provider.

**Enhancement prioritario.** Introdurre budget complessivi di tempo, chiamate e dimensione dei tool result, oltre a cancellazione. Separare in modo esplicito fonti consultate e citate; aggiungere diagnostica su marcatori non risolti e verificare le citazioni prima di offrire un'opzione di risposta con fonti obbligatorie.

Riferimento: [orchestrazione, errori e citazioni](../src/kb/agent.ts).

## 6. Verifica e ordine degli interventi

I [test agentici](../test/kb-agentic.test.mjs) coprono il catalogo via tool, il limite dei turni, le citazioni e il troncamento. I [test POSIX](../test/store.test.mjs) verificano anche apertura senza scrittore, chiusura indipendente, paginazione e ricerche su indice. Il [benchmark di ricerca](../benchmarks/search-agent/README.md) misura accuratezza per fatti attesi e token del provider. Il punteggio testuale non certifica l'assenza di contraddizioni né la validità delle citazioni.

Ordine proposto: **P1** integrità catalogo/testo e limiti di esecuzione; **P2** osservabilità dei tool e validazione delle citazioni; **P3** miglioramenti a cache e indice solo dopo misure su corpus fissi. Per i confronti aggiungere latenza mediana e p95, errori separati per fase, recall delle fonti attese e, per i test di affidabilità, casi senza evidenze nel corpus.