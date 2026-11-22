# Specifica tecnica — KB Manager

Questa specifica descrive l'implementazione corrente di `KbSmartManager`. Le voci **Enhancement** sono proposte, non funzionalità disponibili. Firme e tipi pubblici sono nel [contratto del KB Manager](parser-kbmanager.spec.md#kb-manager); generazione e persistenza dei documenti sono nella [specifica del parser](parser.technical.spec.md).

## 1. Apertura, catalogo e ciclo di vita

`open` risolve una o più radici e le attraversa ricorsivamente, includendo la radice. Ogni file regolare con suffisso `.json` è trattato come manifest, anche se nella stessa cartella ne esistono altri; i manifest della singola cartella sono letti in ordine di nome. Non c'è un ordinamento globale esplicito delle sottocartelle. La validazione del manifest è condivisa con il parser. I documenti sono indicizzati in memoria per `documentId`; una collisione tra qualsiasi coppia di manifest o una lettura non valida rigetta tutta l'apertura. L'indice conserva mappa, pagine e percorsi interni, ma non legge il Markdown e non richiede chiamate a un modello.

`deleteDocument` risolve il Markdown effettivo (anche legacy), verifica se un altro documento indicizzato nella stessa cartella lo usa confrontando dispositivo e inode, poi cancella il Markdown se non condiviso, elimina il manifest e infine modifica l'indice. Il file sorgente originale non è gestito. La sequenza non è atomica: se la cancellazione del manifest fallisce dopo quella del testo, l'indice può ancora contenere una voce il cui Markdown manca.

**Considerazioni.** Il catalogo è una fotografia dei manifest all'apertura; il testo è letto dallo stato corrente del filesystem. Non c'è rilevamento automatico di modifiche o aggiornamento del catalogo. Un JSON estraneo può bloccare l'apertura; radici sovrapposte possono scoprire due volte lo stesso documento. La radice va trattata come archivio controllato, non come raccolta di file arbitrari.

**Enhancement prioritario.** Identificare esplicitamente i manifest e definire un modello di aggiornamento per revisione. Separare la rimozione logica dalla pulizia del testo, con riconciliazione in caso di errore. Verificare con test radici sovrapposte, cancellazioni parziali e modifiche concorrenti tra lettura e rimozione.

Riferimenti: [scoperta e cancellazione](../src/kb/index.ts), [risoluzione e validazione dei file](../src/parser/persistence.ts).

## 2. Consultazione diretta e fonti

| Operazione | Origine dei dati | Risultato |
| --- | --- | --- |
| `kbGetTableOfContents` | Catalogo in memoria | Documenti, descrizioni brevi e numero di sezioni |
| `kbFileGetTableOfContents` | Mappa e pagine | Sezioni con ID, titolo, descrizione e coordinate |
| `kbFileGetInfo` / `kbFileReadSummary` | Mappa | Metadati o sintesi già salvata, senza coordinate testuali per la sintesi |
| `kbFileRead` | Markdown e mappa | Testo completo; se vuoto, solo fonte a livello di documento |
| `kbFileReadSection` | Markdown e mappa | Testo per ID di sezione oppure per intervallo di righe inclusivo |

Ogni operazione testuale rilegge il Markdown, lo divide su LF e verifica il numero di righe contro `lineCount`. ID documento o sezione sconosciuti e range espliciti non interi, invertiti o fuori da `1..lineCount` producono errori. La verifica del conteggio non rileva modifiche che conservano lo stesso numero di righe.

Un `PassageSource` identifica documento e range assoluto; include la sezione solo se il passaggio è contenuto interamente in una sezione. Ogni elemento di `pages` è l'intersezione tra il passaggio e le righe effettive di una pagina: le pagine vuote sono escluse, anche per una sezione multipagina. `pages` è `null` quando manca la mappa delle pagine, non un numero di pagina dedotto. `originalFileName` è `null` se assente; il nome non è la chiave del catalogo.

**Enhancement.** Legare il testo a un hash di revisione del manifest. Per letture parziali ripetute, usare una cache limitata alla revisione o un indice degli offset di riga: oggi una singola sezione costa una lettura completa del documento.

Riferimento: [fonti e operazioni dirette](../src/kb/index.ts).

## 3. Ricerca testuale

La scansione è per riga, senza indice. La modalità keyword usa sottostringhe letterali in OR e richiede almeno una stringa non vuota, senza elementi di lunghezza zero. Non normalizza gli accenti e non fa stemming. La modalità regex compila il pattern JavaScript una volta con flag `u` o `iu`; un pattern sintatticamente non valido rigetta la chiamata. Il default è case-insensitive in entrambe le modalità. Senza `fileSpec` si visita l'intero catalogo; altrimenti si deduplicano gli ID mantenendo l'ordine richiesto e si validano tutti prima della scansione. Un filtro vuoto non seleziona documenti.

Con contesto a zero, ogni riga corrispondente genera un risultato, senza `matchLines` e senza il limite previsto per le finestre. Con contesto attivo, `beforeLines` e `afterLines` sono interi indipendenti da 0 a 20, con default 0. Gli intervalli si limitano ai bordi del documento e si fondono solo se si sovrappongono, non quando sono soltanto adiacenti. `source` copre l'intero snippet e `matchLines` enumera le righe che hanno fatto match. Il prefisso restituito contiene al massimo 20 finestre e 12.000 unità UTF-16 di snippet, inclusi i LF interni. Se la prossima finestra eccede uno dei limiti, si interrompe e si restituisce `truncated: true`, senza saltarla per cercare finestre più piccole. Nel tool gli argomenti di contesto sono allo stesso livello di `query` e `fileSpec`.

**Considerazioni.** L'ordine è di scansione, non di pertinenza; un documento iniziale con molti match può esaurire il budget. Le regex sono eseguite in modo sincrono, senza un budget di esecuzione dedicato. Le ricerche senza contesto e le letture integrali possono produrre output molto grandi per un modello.

**Enhancement prioritario.** Applicare limiti di esecuzione per regex e budget anche ai risultati senza contesto destinati all'agente. Se si introduce paginazione, mantenere ordine stabile e coordinarla con la revisione del corpus. Per corpus grandi valutare un indice lessicale, preservando coordinate e distinguendo esplicitamente ricerca letterale esatta da ranking.

Riferimenti: [matching, finestre e limiti](../src/kb/search.ts), [contratti dei risultati](../src/kb/types.ts).

## 4. Strategia di discovery e selezione documenti

| Configurazione | Cosa riceve il modello di ricerca | Effetto operativo |
| --- | --- | --- |
| `tocMode: "prompt"` (default, senza selettore) | TOC compatta di tutti i documenti e relative sezioni | Nessuna chiamata preliminare, ma il prompt cresce con il catalogo |
| `tocMode: "tools"` (senza selettore) | Nessun metadato documentale nel prompt iniziale | Il modello può scoprire documenti e sezioni con i due tool TOC |
| Decision model configurato | TOC dei candidati ordinati dal selettore | Prevale su `tocMode`; i tool non vengono ristretti ai candidati |

Il selettore usa `withStructuredOutput` per assegnare un punteggio tra 0 e 1 su batch sequenziali di massimo 20 documenti. Le schede contengono ID, nome (fino a 255 unità UTF-16), titolo (200), descrizione (400) e fino a 12 keyword di 80 ciascuna. Non vengono passati Markdown o TOC al decision model. Ogni batch deve ottenere esattamente un punteggio per ciascun ID, senza duplicati o ID estranei. Si mantengono quelli con punteggio almeno `threshold` (default 0,5), si ordinano per punteggio decrescente e ID crescente in caso di parità, e si conservano al più `maxDocuments` (default 5). I parametri vengono validati in apertura; un catalogo vuoto non attiva il selettore.

Se un batch fallisce o dà un output invalido, si scarta l'intera selezione, anche quanto raccolto nei batch precedenti. Il prompt esplicita che i candidati sono incompleti o vuoti e invita a usare catalogo o ricerca globale prima di concludere che mancano evidenze. Si tratta di un'istruzione al modello, non di un fallback eseguito automaticamente dal manager.

**Enhancement.** Distinguere nei segnali di diagnostica selezione riuscita, nessun candidato e invocazione fallita. Per cataloghi grandi, confrontare pre-filtro deterministico, selezione attuale e discovery via tool su recall delle fonti, token complessivi e latenza, non soltanto sul numero di token del prompt iniziale.

Riferimenti: [composizione TOC](../src/kb/index.ts), [batching e ranking](../src/kb/selection.ts), [istruzioni di discovery](../src/kb/agent.ts).

## 5. Esecuzione agentica e citazioni

`kbAgentSearch` richiede una domanda non bianca e restituisce risposta Markdown e fonti strutturate (`AgentSearchResult`); `getAgentSearchTool` espone lo stesso metodo come tool LangChain. `getTools` espone le sette operazioni dirette di consultazione e ricerca, non il tool agente. Il modello iniettato deve supportare `bindTools`; in assenza viene costruito al primo utilizzo il modello Azure dalla configurazione della root, senza modificare l'ambiente della CLI. La configurazione predefinita imposta timeout di 60 secondi per richiesta e zero retry del client LangChain; non costituisce un limite sull'intera ricerca.

L'agente manda domanda e system prompt al modello, quindi esegue le chiamate richieste in sequenza e accoda un `ToolMessage` per ID chiamata. Sono ammessi otto turni con tool, più una nona invocazione per concludere: se anche questa chiede tool, la ricerca fallisce. Il limite non conta le singole chiamate dello stesso turno. Una chiamata formata in modo non valido, o senza ID quando deve essere eseguita, interrompe la ricerca. Tool non disponibili o eccezioni durante l'esecuzione ricevono un messaggio di errore generico e il modello può correggersi. Gli errori di invocazione del modello risalgono al chiamante.

Le letture esplicite di testo non bianco raccolgono sempre una fonte di passaggio, anche se la risposta finale non la usa. I match di ricerca sono invece raccolti come possibili fonti e diventano riferimenti solo con un marcatore interno corrispondente esattamente a documento e range restituiti; per una riga è ammessa la forma abbreviata. I marcatori riconosciuti sono rimossi anche se non corrispondono ad alcun match. I riferimenti sono deduplicati per `(documentId, fromLine, toLine)`, non per sovrapposizione. Il tipo pubblico ammette riferimenti `summary`, ma l'implementazione corrente emette soltanto `passage`.

**Considerazioni.** Il controllo dei marcatori verifica la provenienza dei match citati, non che tutte le affermazioni siano supportate. Il modello può anche concludere senza usare tool. Il prompt tratta TOC e output dei tool come dati; non sostituisce limiti su quantità e tipo di testo inviato al provider. Con la selezione attiva, domanda e metadati raggiungono anche il decision model.

**Enhancement prioritario.** Introdurre budget complessivi di tempo, chiamate e dimensione dei tool result, oltre a cancellazione. Separare in modo esplicito fonti consultate e citate; aggiungere diagnostica su marcatori non risolti e verificare le citazioni prima di offrire un'opzione di risposta con fonti obbligatorie.

Riferimenti: [orchestrazione, errori e citazioni](../src/kb/agent.ts), [modello Azure predefinito](../src/document-model.ts).

## 6. Verifica e ordine degli interventi

I [test agentici](../test/kb-agentic.test.mjs) coprono le modalità TOC, ranking e fallback, limite dei turni, citazioni e truncation. I [test di persistenza e catalogo](../test/parser.test.mjs) verificano anche compatibilità legacy, caricamento differito, manifest multipli e cancellazione di testo condiviso. Il [benchmark di ricerca](../benchmarks/search-agent/README.md) confronta le tre modalità a parità di domande e misura accuratezza per fatti attesi e token del provider, separando selezione e ricerca. Il punteggio testuale non certifica l'assenza di contraddizioni né la validità delle citazioni.

Ordine proposto: **P1** integrità catalogo/testo e limiti di esecuzione; **P2** osservabilità di selezione e validazione delle citazioni; **P3** cache o indicizzazione solo dopo misure su corpus fissi. Per i confronti aggiungere latenza mediana e p95, errori separati per fase, recall delle fonti attese e, per i test di affidabilità, casi senza evidenze nel corpus.