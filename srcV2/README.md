# smartDocKb V2 — prima iterazione

Package autonomo Node.js (>= 22.13). Da questa directory: `npm ci`, `npm run build`, `npm test`. Non richiede servizi esterni per i test.

La [demo per un singolo documento](scripts/demo-documento.mjs) salva l’originale in una KB temporanea, aspetta l’indicizzazione, cerca per parole chiave e rilegge le righe del primo passaggio. Da questa directory, `npm run demo:documento` usa il documento incorporato; `npm run demo:documento -- manuale.pdf pressione ERP-42` usa un file e, facoltativamente, un ID scelto dal chiamante. La demo rimuove i dati temporanei alla fine.

```js
import { openLocalKnowledgeBase } from './dist/index.js';

const local = openLocalKnowledgeBase({ id: 'manuali', directory: './data' });
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

`kb.write()` salva i byte e accetta solo informazioni sulla sorgente (`originalFileName` e `contentType`). Titolo, autore, date e tag sono prodotti dall’ingestor e conservati in `DocumentMap.metadata`. I campi non rilevati restano assenti. `write()` e `stat()` restituiscono solo le informazioni sull’originale.

- `LocalObjectStore(baseDirectory)` crea e usa la cartella indicata, senza database. `openLocalKnowledgeBase({ id, directory })` usa la sottocartella `originals/`: ogni originale è conservato byte per byte in un file, accanto a `metadata.json`. Un puntatore aggiornato atomicamente pubblica entrambi insieme. L’ID del chiamante non diventa mai parte del percorso.
- Il worker esegue tre passaggi: `MarkdownConverter` converte l’originale, `Ingestor` crea la `DocumentMap` dal Markdown e, dopo il salvataggio dei derivati, il worker chiama `IndexEngine.index(documentId)`. `DocumentMapIndexer` legge la mappa dallo store e costruisce gli indici senza ripetere l’ingestion. Lo store locale (`local.store`) accede a originale, Markdown, mappa e sezioni con il solo `documentId`. Lo SHA è un checksum; documenti con ID diversi possono avere gli stessi byte. Il nome dell’originale, se noto, è in `DocumentInfo.originalFileName`, distinto dal titolo. Cambiare i byte invalida i derivati; una nuova ingestion sostituisce la mappa e può cambiare il significato degli ID posizionali delle sezioni.
- Il backend mantiene in `map.sqlite.artifacts/` le copie associate alle versioni indicizzate, usate per comporre i risultati di ricerca. `map.sqlite` mantiene riferimenti, metadati indicizzati, coordinate, termini FTS e vettori. Se l’indice manca o cambia il modello di embedding, lo si ricostruisce dai derivati nello store senza ripetere l’ingestion.
- Le directory del precedente store SQLite non vengono convertite automaticamente: se è presente `originals.sqlite`, usare una nuova directory e reimportare gli originali. Il vecchio database non viene modificato.
- Aprire una sola istanza scrivente per directory. `write` attende lo store, non la conversione. Il worker verifica i cambiamenti all’avvio e periodicamente. `indexer.status` distingue `pending`, `indexed`, `failed` e `absent`.
- Per Markdown e testo semplice dichiarare il `contentType`. I PDF sono convertiti in Markdown per pagina con AnyDoc e OCR italiano locale quando manca il testo. L’ingestor predefinito segmenta per intestazioni o lunghezza e genera sommari estrattivi. Si possono iniettare un `converter`, un `ingestor` o un `analyzer`; cambiare `pipelineVersion` quando cambia il loro comportamento. Gli originali già nello store vengono rielaborati in background senza reimportarli.
- La semantica è disponibile configurando un `Embedder`. Il motore usa FTS5 per le parole chiave e la distanza coseno esatta di `sqlite-vec` per i vettori. I filtri sono applicati ai documenti prima della paginazione; la paginazione della ricerca non congela l’indice tra richieste.
- Una scrittura o cancellazione è visibile subito in `list`. `read` legge Markdown e metadati della revisione corrente dallo store appena termina la preparazione; se i derivati non sono ancora disponibili restituisce `not_found`. La ricerca vede invece l’ultima revisione pubblicata nell’indice. Dopo un aggiornamento verificare lo SHA prima di usare le coordinate di un risultato.