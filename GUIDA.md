# smartDocKb V2 — prima iterazione

Package autonomo Node.js (>= 22.13). Dalla root: `npm ci`, `npm run build`, `npm test`. Non richiede servizi esterni per i test.

Il [servizio documento → Markdown](src/services/document-to-markdown) è un modulo interno della libreria V2: non richiede un pacchetto separato, un server, uno store o un modello LLM. Per usarlo direttamente:

```js
import { readFile } from 'node:fs/promises';
import { toMarkdown } from 'smartdoc-kb-v2';

const markdown = await toMarkdown(await readFile('manuale.pdf'));
```

`toMarkdown(bytes, options?)` restituisce una `Promise<string>`. Per testo UTF-8 o Markdown passare `contentType: 'text/plain'` o `'text/markdown'`. Le callback opzionali `onProgress` e `onPages` notificano rispettivamente l'avanzamento e le coordinate delle pagine PDF, senza cambiare il valore restituito.

Le implementazioni sono separate per responsabilità:

- [Object store](src/object-store): persiste i byte, senza conoscere i documenti.
- [Document store](src/document-store): usa un `ObjectStore` per gestire originali, Markdown e mappe.
- [Ingestion](src/ingestion): produce la mappa dal Markdown. La [conversione](src/conversion) resta separata.
- [Indexing](src/indexing): contiene il worker e il [backend Map](src/indexing/map), che implementa indicizzazione e ricerca.
- [Knowledge base](src/knowledge-base): espone la facciata della KB. La [composizione](src/composition) collega i moduli; i [tool LangChain](src/langchain/tools.ts) restano separati.

I [contratti condivisi](src/contracts) e gli import pubblici della KB non cambiano.

`new LocalObjectStore(directory)` usa la cartella indicata per gli oggetti. `mapBackend(store, { directory, ingestionEngine })` passa la cartella all’indicizzatore SQLite, che vi crea o riapre `map.sqlite`. Entrambi creano la propria cartella se manca. Con `openLocalKnowledgeBase({ directory, ... })`, gli oggetti restano nella sottocartella `originals/` e `map.sqlite` nella cartella della KB.

La [demo per un singolo documento](scripts/demo-documento.mjs) usa il modello Azure della CLI: installare anche le dipendenze di `kb-agent-cli` e impostare nell’ambiente le variabili `AZURE_OPENAI_*` del suo [file di esempio](kb-agent-cli/.env.example). La demo salva l’originale in una KB temporanea, aspetta l’indicizzazione, cerca per parole chiave e rilegge le righe del primo passaggio. Dalla root, `npm run demo:documento` usa il documento incorporato; `npm run demo:documento -- manuale.pdf pressione ERP-42` usa un file e, facoltativamente, un ID scelto dal chiamante. La demo rimuove i dati temporanei alla fine.

```js
import { createLlmIngestionEngine, openLocalKnowledgeBase } from './dist/index.js';

// chatModel è un modello LangChain già configurato con supporto per output strutturato.
const ingestionEngine = createLlmIngestionEngine(chatModel);
const local = openLocalKnowledgeBase({ id: 'manuali', name: 'Manuali tecnici', directory: './data', ingestionEngine });
try {
  const { kb } = local;
  await kb.write(Buffer.from('# Caldaia\nPressione nominale: 3 bar.'),
    { contentType: 'text/markdown' }, 'ERP-42');
  await local.reconcile(); // Attende il worker; non è un metodo della facciata.
  const { hits: [hit] } = await kb.searchKeyword('pressione');
  const { lineStart: start, lineEnd: end } = hit.passages[0];
  const excerpt = await kb.read(hit.documentId, { start, end });
  if (excerpt.sha === hit.sha) console.log(excerpt.text);
} finally {
  await local.close();
}
```

`kb.write()` salva i byte e accetta solo informazioni sulla sorgente (`originalFileName` e `contentType`). L’`IngestionEngine` scrive `title`, `author`, `createdAt`, `modifiedAt` e `tags` direttamente nella `DocumentMap`. Anche `Document` e `Hit` espongono questi campi senza un oggetto `metadata`; i campi non rilevati restano assenti. `write()` e `stat()` restituiscono solo le informazioni sull’originale.

Per osservare una singola scrittura, passare una callback come quarto argomento:

```ts
await kb.write(bytes, source, undefined, ({ percent, message }, documentId) => {
  console.log(documentId, `${percent}%`, message);
});
```

Gli aggiornamenti possono arrivare dopo il ritorno di `write()`. La percentuale misura il lavoro del modulo corrente (conversione, ingestion o indicizzazione), non l’intero documento. Le fasi saltate non emettono eventi; una scrittura sostituita prima dell’elaborazione non riceve un completamento. Un errore della callback produce un avviso senza fermare il worker.

`DocumentMap.summary` è il riassunto opzionale dell’intero documento, distinto dai riassunti delle sezioni. L’ingestion Markdown lo ricava dalle sezioni in ordine di lettura e lo omette per i documenti vuoti.

`composeKnowledgeBase()` compone un `KnowledgeBase` da `documentStore`, `ingestionEngine`, `indexEngine` e `searchEngine` espliciti. La stessa facciata espone questi moduli come proprietà, oltre alle operazioni di lettura e ricerca; `openLocalKnowledgeBase()` è la composizione predefinita con store locale e backend Map.

Alla costruzione sono obbligatori `id` (stringa, anche UUID, oppure numero) e `name`; `description` è facoltativa. I tool LangChain si chiamano `<id>_<operazione>` (es. `manuali_searchKeyword`) e nella descrizione riportano il nome e, se fornita, la descrizione della KB. Quando si uniscono i tool di più KB, scegliere ID distinti in forma testuale e compatibili con il provider: `42` e `"42"` producono lo stesso prefisso. Non vengono aggiunti suffissi né normalizzati gli ID.

- Lo store locale salva ogni documento direttamente in `originals/<documentId>/`, con `metadata.json`, l’originale (ad esempio `original.pdf`) e, dopo l’ingestion, `artifacts.json`. Viene mantenuta l’ultima estensione del nome sorgente se composta da 1–32 caratteri alfanumerici ASCII; altrimenti il file si chiama `original`. Una riscrittura sostituisce il documento senza conservare versioni.
- `kb.write()` genera un UUID v7 quando l’ID è omesso. Un ID esplicito è il nome letterale della cartella: lo store locale rifiuta percorsi, nomi non validi su Windows e collisioni con una cartella di un altro ID. Non è prevista migrazione dal formato con directory hash e versioni: reimportare i documenti in una directory KB nuova.
- Il worker esegue tre passaggi: `MarkdownConverter` converte l'originale, `IngestionEngine` crea la `DocumentMap` dal Markdown e, dopo il salvataggio dei derivati, il worker chiama `IndexEngine.index(documentId)`. `DocumentMapIndexer` legge la mappa dallo store e costruisce gli indici senza ripetere l'ingestion. Lo store locale (`local.documentStore`) accede a originale, Markdown, mappa e sezioni con il solo `documentId`. Lo SHA è un checksum; documenti con ID diversi possono avere gli stessi byte. Il nome dell'originale, se noto, è in `DocumentInfo.originalFileName`, distinto dal titolo. Cambiare i byte invalida i derivati; una nuova ingestion sostituisce la mappa e può cambiare il significato degli ID posizionali delle sezioni.
- Markdown, mappa e coordinate dei passaggi si leggono dallo store degli originali. `map.sqlite` indicizza le sezioni per `documentId`: due copie identiche hanno embedding separati e contano entrambe nel calcolo dei punteggi BM25. Cambiare solo le pagine o i metadati del documento non richiede nuovi embedding.
- All’apertura il backend riconosce i vecchi indici ad artefatti condivisi e li ricostruisce dai derivati nello store, senza modificare gli originali. Rimuove anche le vecchie copie riconoscibili in `map.sqlite.artifacts/`. Se l’indice manca o cambia il modello di embedding, non occorre ripetere l’ingestion.
- Le directory del precedente store SQLite non vengono convertite automaticamente: se è presente `originals.sqlite`, usare una nuova directory e reimportare gli originali. Il vecchio database non viene modificato.
- Aprire una sola istanza scrivente per directory. `write` attende lo store, non la conversione. Nella composizione `scheduler` accoda il lavoro; `kb.indexEngine` è il motore che pubblica le mappe preparate e cerca sezioni candidate. Il worker verifica i cambiamenti all’avvio e periodicamente. `local.indexStatus(documentId)` distingue `pending`, `indexed`, `failed` e `absent`.
- Per Markdown e testo semplice dichiarare il `contentType`. I PDF sono convertiti in Markdown per pagina con AnyDoc e OCR italiano locale quando manca il testo. Il `converter` è sostituibile; `ingestionEngine` è obbligatorio. Se l’LLM fallisce, `local.reconcile()` rigetta con l’errore: l’originale resta nello store, ma non viene pubblicata una mappa sostitutiva. Le mappe già salvate restano riutilizzabili.
- Per segmentare per argomento, passare `ingestionEngine: createLlmIngestionEngine(chatModel)` a `openLocalKnowledgeBase()`, come fa la CLI. Il modello LangChain deve supportare l'output strutturato: riceve finestre di Markdown numerate e restituisce titoli, descrizioni, sintesi e parole chiave, oltre ai metadati estratti dall'inizio del documento in una richiesta separata. Se gli intervalli non coprono esattamente la finestra, l’ingestion segnala il problema nel progresso e chiede una sola correzione per quella finestra. Se la correzione è ancora errata, l’ingestion fallisce senza salvare una mappa parziale.
- Se la connessione ad Azure si interrompe, il modello chat della CLI ritenta una volta la stessa richiesta. Le finestre già elaborate non vengono ripetute durante il retry. Se anche il secondo tentativo fallisce, l’errore viene propagato senza usare un altro modello.
- La semantica è disponibile configurando un `Embedder`. Il motore usa FTS5 per le parole chiave e la distanza coseno esatta di `sqlite-vec` per i vettori. La ricerca pubblica applica i filtri e restituisce i primi `topK` documenti (10 per impostazione predefinita), senza cursore.
- Una scrittura è visibile subito in `list`. Conversione e ingestion lavorano in memoria; solo quando entrambe riescono lo store pubblica Markdown e mappa insieme. `read` restituisce `not_found` finché gli artefatti non sono disponibili. Gli originali esistenti restano validi: il worker rigenera gli artefatti nel nuovo formato se mancano.
- La ricerca collega indice e store tramite `documentId` e `sectionId`. Non confronta revisioni: durante un aggiornamento un candidato del vecchio indice può puntare al testo nuovo della stessa sezione, finché il worker non riallinea l’indice.