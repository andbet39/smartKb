# 📚 smartDocKb

**Integra nella tua applicazione la conversione dei documenti in Markdown e la ricerca nelle fonti.**

Libreria **TypeScript** per **Node.js 22.13+** (ESM). Il nome del pacchetto negli import è `smartDocKb`.

[Quickstart](#quickstart) · [Parser](#parser) · [Knowledge base](#knowledge-base) · [Test e benchmark](#test-e-benchmark) · [CLI: KB Studio](#kb-studio)

| Componente | A cosa serve | Modello remoto |
| --- | --- | --- |
| 📄 [Parser](./src/parser) | Converte file in memoria con AnyDoc. Per i PDF scansionati usa l’OCR locale. Può generare indice, sezioni e sintesi. | Solo per analisi, sezionamento e sintesi tramite il parser LangChain con output strutturato. |
| 🔎 [KB manager](./src/kb) | Compone uno store e un motore di ricerca per consultare documenti e sezioni e cercare per parole chiave o regex. | Non serve per la consultazione diretta. Serve per la ricerca agentica. |

Parser e manager sono disponibili entrambi dall’entry point principale. Il manager è accessibile anche dal sotto-percorso `smartDocKb/kb`.

<a id="quickstart"></a>

## 🚀 Quickstart: integra la libreria

Da un altro progetto Node.js, usa il **parser** per analizzare un documento e lo **store** per salvarlo. Passa lo store e il **motore di ricerca** a `KbSmartManager` per consultare la KB. La ricerca per parole chiave non richiede un modello.

### 1. Installa la dipendenza nel tuo progetto

Nella root del clone di smartDocKb, compila il pacchetto:

```sh
npm ci
npm run build
```

Poi, nella root della tua applicazione, installa il pacchetto locale (sostituisci il percorso con quello del clone) e le dipendenze dell’esempio:

```sh
npm install /percorso/al/clone/smartDocKb @langchain/core@^1 @langchain/openai@1.5.8 js-tiktoken
```

### 2. Analizza il documento e salvalo nella KB

Nella tua applicazione, configura `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_INSTANCE_NAME`, `AZURE_OPENAI_API_DEPLOYMENT_NAME` e `AZURE_OPENAI_API_VERSION` nell’ambiente di processo. Puoi partire dal [file di esempio](.env.example) e caricare la tua configurazione locale con `node --env-file=.env importa.mjs`. L’esempio usa **GPT-4o** con output strutturato e il tokenizer `o200k_base`. Passando il modello al parser, non serve configurare il clone di smartDocKb. Usa solo documenti che puoi inviare al deployment.

Salva questo codice come `importa.mjs` e sostituisci il percorso del PDF con quello del tuo documento:

```js
import { readFile } from "node:fs/promises";
import { AzureChatOpenAI } from "@langchain/openai";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser, createPosixStore } from "smartDocKb";

const llm = new AzureChatOpenAI({ model: process.env.AZURE_OPENAI_MODEL || "gpt-4o" });
const encoding = getEncoding("o200k_base");
const parser = createDocumentParser({
  llm,
  countTokens: text => encoding.encode(text).length,
});

const doc = await parser.parseDocument({
  bytes: await readFile("./manuale.pdf"),
  fileName: "manuale.pdf",
});
const store = await createPosixStore({ root: "./mia-kb" });
try {
  await store.add(doc);
  console.log(doc.map.documentId);
} finally {
  await store.close();
}
```

Il parser genera un **UUID v7** se ometti `documentId`. Se fornisci un UUID v7 canonico in minuscolo o un ID numerico legacy (intero sicuro non negativo), lo conserva. `parseDocument` accetta anche direttamente i byte di un upload e non scrive su disco. `store.add` salva Markdown e manifest in `doc-<id>` e rende il documento visibile al commit dell’indice. Un ID duplicato produce `ALREADY_EXISTS` senza sovrascrivere il documento esistente. Non è necessaria una prenotazione prima del parsing.

### 3. Apri e consulta la KB anche senza modello

Questo blocco può girare in un altro processo: servono solo la libreria e i file salvati, non il parser configurato né le credenziali Azure.

```js
import { createPosixStore, KbSmartManager, POSIXSearchEngine } from "smartDocKb";

const root = "./mia-kb";
const store = await createPosixStore({ root });
try {
  const searchEngine = await POSIXSearchEngine.open({ root });
  try {
    const kb = await KbSmartManager.open(store, searchEngine);
    console.log(await kb.kbGetTableOfContents());

    const { matches } = await kb.kbDocumentSearchByKeywords(
      { kind: "keywords", keywords: ["installazione"] },
      undefined,
      { beforeLines: 1, afterLines: 1 },
    );

    for (const { snippet, source } of matches) {
      console.log(source.originalFileName, source.fromLine, source.toLine, snippet);
    }
  } finally {
    await searchEngine.close();
  }
} finally {
  await store.close();
}
```

Per fare domande in linguaggio naturale dalla tua app, vedi la [ricerca agentica](#ricerca-agentica-dalla-libreria).

<a id="parser"></a>

## 📄 Parser

### Solo Markdown, senza modello

```ts
import { convertDocument } from "smartDocKb";

const markdown = await convertDocument({ bytes, fileName: "manuale.pdf" });
```

`bytes` è un `Uint8Array` o `Buffer`. La conversione (OCR incluso quando necessario) è locale: non richiede ID, tokenizer o adapter LangChain e non scrive nella KB. `parseDocument` restituisce anche `pages` per i PDF. Per seguire l’avanzamento della sola conversione, passa una callback come secondo argomento.

### Integrazione TypeScript con il proprio adapter LangChain

L’applicazione configura il proprio chat model LangChain e passa al parser `llm` e una funzione `countTokens` adatta al modello. Il parser richiede il supporto a `withStructuredOutput`, non un provider specifico. Azure nel quickstart è solo un esempio.

```ts
import { createDocumentParser, getSectionMarkdown, type ParserOptions } from "smartDocKb";

export async function processUpload(bytes: Buffer, options: ParserOptions) {
  const parser = createDocumentParser(options);
  const doc = await parser.parseDocument({
    bytes,
    fileName: "manuale.pdf",
    sectionSize: { minChars: 1500, maxChars: 3000 },
  });
  for (const section of doc.map.sections) {
    console.log(getSectionMarkdown(doc, section.sectionId, { pageTags: true }));
  }
  return doc;
}
```

La conversione del file è locale; il parser invia al modello scelto il testo delle finestre e le sintesi.

### OCR locale e avanzamento

1. **Estrazione nativa.** AnyDoc prova a leggere il testo nativo di ogni pagina PDF.
2. **Fallback OCR.** Se AnyDoc segnala `needsOcr`, classifica la pagina come `ImageBased` senza testo estraibile o restituisce testo vuoto, PDFium renderizza la pagina in memoria e Tesseract.js la legge con il modello italiano.
3. **Risultato.** L’OCR estrae testo, ma non ricostruisce necessariamente tabelle o impaginazione. Una scansione senza testo riconoscibile produce un errore con il numero di pagina. Se AnyDoc estrae testo nativo, eventuali scansioni incorporate nella stessa pagina non vengono rilette.

Motore e dati linguistici sono inclusi nelle dipendenze npm: dopo l’installazione non servono connessione, eseguibili di sistema, chiavi API o fallback remoti.

`prova:ocr` e `prova` mostrano su **stderr** il tempo trascorso, la percentuale, la fase corrente, le pagine elaborate e lo stato del riconoscimento. `prova` segnala anche richieste al modello, righe analizzate e salvataggio della KB. Durante le attese viene ripetuta l’ultima fase nota. I log non contengono il testo del documento e non alterano il Markdown o il JSON su **stdout**. Nella libreria l’avanzamento è facoltativo e fornisce un oggetto strutturato `DocumentParseProgress` (con `phase`, `step`, `percent`, `current`, `total`, `phasePercent`, `batch` opzionale e `message`): passa ad esempio `onProgress: p => console.error(`[${p.percent}%] ${p.message}`)` a `createDocumentParser`.

### Indice per un LLM

La descrizione breve del documento è disponibile in `doc.map.shortDescription`.
Per ottenere l'indice come JSON compatto, senza ulteriori chiamate al modello:

```ts
import { getDocumentTableOfContents } from "smartDocKb";

const tocJson = JSON.stringify(getDocumentTableOfContents(doc));
```

```json
{
  "source": { "documentId": "0195f876-18a4-7ba3-b8c2-7ba84c28cb94" },
  "shortDescription": "Manuale per installare e configurare il prodotto.",
  "sections": [
    {
      "source": {
        "documentId": "0195f876-18a4-7ba3-b8c2-7ba84c28cb94",
        "sectionId": 1,
        "sectionTitle": "Installazione",
        "fromLine": 1,
        "toLine": 10,
        "pages": null
      },
      "shortDescription": "Requisiti e passaggi di installazione."
    }
  ]
}
```

`source.documentId` è l’ID presente in `doc.map.documentId`, generato dal parser o fornito dal chiamante. Le sezioni sono nell’ordine del documento e il loro `source.sectionId` si può usare con `getSectionMarkdown`.

### Salvataggio e ricaricamento

Usa `store.add(doc)` per salvare il documento. `store.get(id)` rilegge mappa e pagine, mentre `store.read(id)` restituisce il Markdown, senza ripetere il parsing.

### Esportazione con marcatori

Per salvare il documento completo come Markdown, senza richiamare il modello:

```ts
import { saveDocumentMarkdown } from "smartDocKb";

await saveDocumentMarkdown(doc, "manuale.md");
await saveDocumentMarkdown(doc, "manuale-sezioni.md", { sectionMarkers: true });
```

L’export è in UTF-8 e sovrascrive la destinazione. Inserisce `<!--------------- PAGE 4 ---------------->` prima di ogni pagina PDF, incluse quelle vuote. Con `sectionMarkers: true` aggiunge un marcatore come `<!--------------- SECTION 1 --------------->` alla prima riga di ogni sezione, anche senza paginazione. Se entrambi iniziano sulla stessa riga, `PAGE` precede `SECTION`. Gli intervalli continuano a riferirsi a `doc.markdown`, non alle righe esportate.

### Opzioni e convenzioni

| Opzione | Comportamento |
| --- | --- |
| `bytes`, `fileName` | `bytes` accetta `Buffer` e `Uint8Array`. `fileName` non apre un percorso: aiuta a riconoscere formati senza firma, come CSV. Sono supportati i formati gestiti da AnyDoc. |
| `documentId` | Facoltativo. Se assente, il parser genera un UUID v7, usato anche negli eventi di avanzamento. Un UUID esplicito o un ID numerico legacy viene conservato. |
| `sectionSize` | Suggerisce una lunghezza in unità UTF-16 (come `String.length`), non un limite rigido. |
| `windowTokens` | Limita il contenuto di una singola chiamata (default `4096`). Lascia spazio per schema, istruzioni e risposta. Se una riga non entra da sola, il parser restituisce un errore esplicito. |
| `targetChars` | Suggerisce lunghezze in caratteri, ad esempio `{ documentSummary: 800, sectionSummary: 300, shortDescription: 80 }`. Non tronca il testo. `shortDescription` vale per documento e sezioni. Per un documento con una sola sezione, il parser ne riusa sintesi e descrizione breve, salvo richiesta di una sintesi dedicata con `documentSummary`. |

- **Righe e intervalli.** `markdown` usa newline LF senza newline finale. Righe e pagine partono da 1 e gli estremi sono inclusi. `fromLine` e `toLine` si riferiscono sempre al Markdown originale, non al prompt o al testo con tag.
- **Paginazione.** Nei PDF le pagine sono quelle fisiche, copertina inclusa. Una pagina vuota non ha `fromLine` e `toLine`; una pagina non estraibile non viene dichiarata vuota. La conversione per pagina può interrompere la formattazione delle tabelle multipagina. Negli altri formati `pages`, `fromPage` e `toPage` sono omessi.
- **Token.** `tokens` conta il Markdown della sezione; `totalTokens` conta l’intero documento ed è ripetuto in ogni sezione. `getSectionMarkdown` funziona anche dopo un round trip JSON.
- **Elaborazione in batch.** `parseDocuments(inputs)` mantiene l’ordine e si ferma al primo errore. `DocumentParseError` espone `documentId` e `cause`.

<a id="knowledge-base"></a>

## 🔎 Knowledge base

### Consultazione diretta

`KbSmartManager.open(store, searchEngine, options?)` riceve uno store e un motore già aperti. `createPosixStore` usa un indice SQLite e le sottocartelle `doc-<id>`; se l’indice manca, lo ricostruisce dai manifest. Gli indici SQLite POSIX precedenti con ID numerici vengono migrati all’apertura dello store: gli ID restano numeri e possono convivere con gli UUID senza rianalizzare i documenti.

`POSIXSearchEngine.open({ root, semantic?, maxLimit? })` apre una connessione SQLite separata in sola lettura (`readOnly: true`). Usa una radice già inizializzata: il motore non crea né migra l’indice e si può aprire anche senza uno store attivo. `kb.close()` chiude solo lo store; chi ha aperto il motore deve chiamare `searchEngine.close()` separatamente.

Il manager dipende da `KBSearchEngine`, che richiede solo `keywordSearch` e prevede `semanticSearch` come metodo facoltativo. Per un backend personalizzato puoi implementare l’interfaccia o estendere la classe astratta `SearchEngine`. `searchLimit` (default 100) è il limite di hit richiesto dal manager per le keyword; per la semantica il manager ne chiede al massimo 10. Se cambi `maxLimit` del motore POSIX (default 100), imposta `searchLimit` a un valore compatibile. Per attivare la ricerca semantica apri il motore con `semantic: { embeddings, modelId }`, usando il modello di embedding con cui è stato costruito l’indice.

I file originali possono avere lo stesso nome, ma ciascun `documentId` deve essere univoco nello store. I documenti aggiunti tramite `store.add` sono consultabili dopo il commit, senza riaprire la KB.

`kbGetTableOfContents` restituisce una pagina del catalogo dallo store. Passa `text` o `tags` per filtrarla e riusa `nextCursor` come `cursor` per leggere la pagina successiva.

```ts
// Riusa store e searchEngine aperti sulla stessa radice come nel quickstart.
const kb = await KbSmartManager.open(store, searchEngine);
const indice = await kb.kbGetTableOfContents();
const id = indice.documents[0].documentId; // UUID o numero, per una KB non vuota.
const sezioni = await kb.kbDocumentGetTableOfContents(id);
const info = await kb.kbDocumentGetInfo(id);
const sintesi = await kb.kbDocumentReadSummary(id);
const completo = await kb.kbDocumentRead(id);

const { matches, truncated } = await kb.kbDocumentSearchByKeywords(
  { kind: "keywords", keywords: ["installazione", "requisiti"] },
  [id],
  { beforeLines: 2, afterLines: 3 },
);
for (const { snippet, source, matchLines } of matches) {
  console.log(source.originalFileName, source.fromLine, source.toLine, matchLines, snippet);
  if (source.sectionId !== undefined) {
    const sezione = await kb.kbDocumentReadSection(source.documentId, source.sectionId);
    console.log(sezione.markdown);
  }
}
if (truncated) console.log("Risultati parziali: restringere la ricerca.");
```

**Regole della ricerca:**

- **Query e ambito.** La modalità `keywords` usa l’indice testuale e, se ometti `documentIds`, cerca in tutta la KB. La modalità `{ kind: "regex", pattern: "^art\\." }` usa la sintassi JavaScript e richiede un elenco di `documentIds`.
- **Contesto.** `beforeLines` e `afterLines` ampliano gli snippet attorno alle righe trovate. Le finestre sovrapposte si uniscono: `source` copre tutto lo snippet e `matchLines` indica solo le righe corrispondenti. Nel tool agentico, passa `beforeLines` e `afterLines` allo stesso livello di `query` e `documentIds`.
- **Fonti.** Una voce citabile include `source.documentId` e, se noto, `source.originalFileName` con l’estensione ma senza il percorso. I passaggi aggiungono le righe assolute inclusive e `pages`, una lista di `{ pageNumber, fromLine, toLine }` limitata al testo citato (`null` senza paginazione). Sintesi, metadati e documenti vuoti non riportano coordinate fittizie.
- **Risultati ed errori.** Nessuna corrispondenza restituisce `{ matches: [] }`. Regex non valide, documenti o sezioni sconosciuti e intervalli fuori limite producono un errore.

`await kb.deleteDocument(id)` rimuove il documento dall’indice e cancella la sua copia nella KB, non il file originale. Un ID sconosciuto produce un errore.

### Ricerca agentica dalla libreria

Passa il tuo chat model LangChain con supporto a `bindTools` nell’opzione `llm` di `open`: verrà usato da `kbAgentSearch` e da `kb.getAgentSearchTool()`. Senza `llm` puoi consultare direttamente la KB, ma non usare la ricerca agentica.

```ts
// Riusa store e searchEngine aperti come nel quickstart.
const kb = await KbSmartManager.open(store, searchEngine, { llm });
const { answer, references } = await kb.kbAgentSearch("Quali sono i requisiti di installazione?");
```

Ogni domanda avvia una ricerca indipendente. L’agente consulta il catalogo e legge il testo tramite i tool, senza ricevere l’indice completo nel prompt. Restituisce `{ answer, references }`: `answer` è la risposta in Markdown, mentre `references` include i passaggi letti esplicitamente e le righe citate tra i risultati di ricerca. Indici, metadati e sintesi non diventano riferimenti.

<a id="test-e-benchmark"></a>

## 🧪 Test e benchmark

Dalla root del repository:

| Comando | Cosa fa |
| --- | --- |
| `npm run --silent prova:ocr -- "./scansione.pdf"` | Stampa il Markdown senza credenziali, senza chiamate al modello e senza modificare la KB. |
| `npm run prova -- "./manuale.pdf"` | Compila, analizza il PDF usando la [configurazione Azure della root](.env.example) e salva il risultato in KB1 con ID `1`. |
| `npm test` | Esegue i test con AnyDoc e `AzureChatOpenAI` reali e risposte HTTP locali predeterminate. Non serve un deployment. |
| `npm --prefix kb-agent-cli test` | Compila la V2 ed esegue i test della CLI senza un deployment, dopo aver installato le dipendenze di entrambi i pacchetti. |
| `npm run test:azure` | Esegue una prova live con un CSV sintetico. Consuma risorse sul deployment; risulta **skipped** se mancano le variabili Azure. |

> **Attenzione:** `prova` usa l’ID esplicito `1` e fallisce con `ALREADY_EXISTS` se l’ID è già in [KB1](./kb1), senza sovrascriverlo. Per non toccare KB1, dopo la build esegui [lo script di prova](examples/prova-documento.mjs) con `node` da una cartella temporanea, passando percorsi assoluti allo script e al PDF. Lo script salva in `./kb1`, relativo alla cartella corrente.

La [guida ai benchmark](benchmarks/search-agent/README.md) distingue le esecuzioni live, che consumano token sul deployment, dalle simulazioni offline di costo.

<a id="kb-studio"></a>

## 💬 KB Studio — CLI opzionale

[KB Studio](./kb-agent-cli/cli.mjs) usa [SmartDoc KB V2](srcV2/README.md) per interrogare e gestire documenti da terminale. Non dipende dalla libreria V1.

### Configurazione Azure

Usa il file di configurazione locale della CLI, escluso da Git; le variabili dell’ambiente di processo hanno precedenza. Non inserire le chiavi nel sorgente.

| Configurazione | Variabili | Uso |
| --- | --- | --- |
| [Esempio della CLI](kb-agent-cli/.env.example) | `AZURE_OPENAI_*` | Modello chat con tool calling. Configura modello, chiave, deployment, versione API e istanza oppure endpoint. |
| [Esempio della CLI](kb-agent-cli/.env.example) | `KB_SEARCH_AZURE_OPENAI_*` | Ricerca semantica opzionale. Configura un `EMBEDDINGS_DEPLOYMENT_NAME` per `text-embedding-3-large`, chiave, versione API e istanza oppure endpoint. `EMBEDDINGS_DIMENSIONS` vale 3072 di default. |

Per le istanze configurate con `gpt-6-luna`, la CLI invia `reasoning_effort: "none"` per poter usare i tool su Chat Completions.

### Avvio

Con Node.js 22.13 o successivo, parti dall’esempio di configurazione della CLI senza sovrascrivere un file locale già presente. Dalla root del repository esegui:

```sh
npm --prefix srcV2 ci
npm --prefix kb-agent-cli ci
npm --prefix kb-agent-cli start
```

La CLI apre la cartella `.kb/cli-v2` nella root. Per usarne un’altra, passa un percorso come argomento di `start` dopo `--`. Usa una cartella nuova e reimporta i file originali con `/add`: le KB V1 non vengono migrate automaticamente.

### Comandi interattivi

| Comando | Effetto |
| --- | --- |
| Una domanda al prompt `›` | Avvia una ricerca indipendente e mostra la risposta in Markdown. |
| `/tools`, `/tools on`, `/tools off` | Mostra lo stato oppure abilita o disabilita la visualizzazione dei risultati dei tool per le domande successive. I risultati sono nascosti all’avvio. |
| `/add "./Manuale tecnico.pdf"` | Salva una copia del file con un nuovo ID e la indicizza. I percorsi relativi partono dalla directory di lavoro della CLI (la cartella del pacchetto con `npm start`). |
| `/delete <ID>` oppure `/delete #<ID>` | Rimuove il documento e la copia salvata nella KB, senza toccare il file sorgente. Ripetere il comando è innocuo. Racchiudi tra virgolette gli ID che iniziano letteralmente con `#`. |
| Invio a vuoto | Esce dalla CLI. |

**Pronto nella KB** compare solo dopo l’indicizzazione. Se il file viene salvato ma non indicizzato, la CLI mostra lo stato separatamente. La conversione PDF → Markdown e l’OCR avvengono in locale; per creare la mappa delle sezioni la CLI invia il Markdown al modello chat configurato per il Deep Agent. Con la ricerca semantica abilitata, l’indicizzazione invia inoltre il testo delle sezioni al deployment di embeddings.

### Come avviene la ricerca

Un solo Deep Agent usa i tool V2 di sola lettura: elenco, ricerca per parole chiave, lettura per ID e intervallo di righe e, se configurata, ricerca semantica. Le domande e i risultati dei tool sono inviati al modello chat. L’agente è istruito a citare ID e righe o pagine quando disponibili.

### Traccia e metriche

- **Avvio interattivo.** KB Studio pulisce l’area visibile del terminale e mostra un libro in ASCII sopra il prompt. Dopo Invio, il campo si svuota e il benvenuto scorre con la traccia. Con input o output rediretto, lo schermo non viene pulito e il benvenuto non viene mostrato.
- **Traccia Ink.** Chiamate, argomenti ed errori appaiono in tempo reale. Ogni evento mostra i millisecondi trascorsi; il numero della chiamata collega i risultati ai tool anche in parallelo. La risposta Markdown ha un riquadro separato. Gli errori e le metriche restano visibili anche con `/tools off`.
- **Metriche elaborazione.** Per ogni domanda il riquadro mostra durata, turni del modello chat, chiamate ai tool, errori e token del modello chat. `—` indica che il modello non è stato chiamato, `n/d` che i conteggi non sono disponibili, e `(2/3 turni)` che la somma copre solo due turni su tre.
- **Documenti in KB.** Il pannello mostra la prima pagina del catalogo. `car.` conta i caratteri del Markdown indicizzato, non i byte del file originale.
