# 📚 smartDocKb

**Integra nella tua applicazione la conversione dei documenti in Markdown e la ricerca nelle fonti.**

Libreria **TypeScript** per **Node.js 20.12+** (ESM). Il nome del pacchetto negli import è `smartDocKb`.

[Quickstart](#quickstart) · [Parser](#parser) · [Knowledge base](#knowledge-base) · [Test e benchmark](#test-e-benchmark) · [CLI: KB Studio](#kb-studio)

| Componente | A cosa serve | Modello remoto |
| --- | --- | --- |
| 📄 [Parser](./src/parser) | Converte i documenti in Markdown. Per i formati di cui supporta la paginazione (attualmente i PDF), estrae il testo pagina per pagina e restituisce in `pages` il numero di ogni pagina e il relativo intervallo di righe nel Markdown. Per le scansioni usa l’OCR locale. Può generare indice, sezioni e sintesi. | Solo per analisi, sezionamento e sintesi tramite il parser LangChain con output strutturato. |
| 🔎 [KB manager](./src/kb) | Apre una KB su disco, consulta documenti e sezioni, cerca per parole chiave o regex. | Non serve per la consultazione diretta. Serve per la ricerca agentica. |

Parser e manager sono disponibili entrambi dall’entry point principale. Il manager è accessibile anche dal sotto-percorso `smartDocKb/kb`.

<a id="quickstart"></a>

## 🚀 Quickstart: integra la libreria

Da un altro progetto Node.js, usa il **parser** per importare un documento e `KbSmartManager` per consultarlo. Una volta salvato, puoi riaprire e cercare il documento senza invocare il modello.

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
import { AzureChatOpenAI } from "@langchain/openai";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser } from "smartDocKb";

const llm = new AzureChatOpenAI({ model: process.env.AZURE_OPENAI_MODEL || "gpt-4o" });
const encoding = getEncoding("o200k_base");
const parser = createDocumentParser({
  llm,
  countTokens: text => encoding.encode(text).length,
});

const doc = await parser.importFile("./manuale.pdf", {
  documentId: 42, // Scegli un ID univoco all’interno della KB.
  kbFolder: "./mia-kb",
});
```

`importFile` crea la KB se manca e restituisce il `ParsedDocument` dopo aver salvato Markdown e manifest nella sottocartella `doc-42`. Se la sottocartella esiste già, non la sovrascrive. Per salvare un upload senza un file temporaneo, usa `await parser.importDocument({ bytes, fileName, documentId: 42, kbFolder: "./mia-kb" })`. Per analizzarlo senza salvarlo, usa `parseDocument`.

### 3. Apri e consulta la KB anche senza modello

Questo blocco può girare in un altro processo: servono solo la libreria e i file salvati, non il parser configurato né le credenziali Azure.

```js
import { KbSmartManager } from "smartDocKb/kb";

const kb = await KbSmartManager.open("./mia-kb");
console.log(await kb.kbGetTableOfContents());

const { matches } = await kb.kbFileSearchByKeywords(
  { kind: "keywords", keywords: ["installazione"] },
  { documentIds: [42] },
  { beforeLines: 1, afterLines: 1 },
);

for (const { snippet, source } of matches) {
  console.log(source.originalFileName, source.fromLine, source.toLine, snippet);
}
```

Per fare domande in linguaggio naturale dalla tua app, vedi la [ricerca agentica](#ricerca-agentica-dalla-libreria).

<a id="parser"></a>

## 📄 Parser

### Solo Markdown, senza modello

```ts
import { convertDocument } from "smartDocKb";

const { markdown, pages } = await convertDocument({ bytes, fileName: "manuale.pdf" });
```

`bytes` è un `Uint8Array` o `Buffer`. La conversione (OCR incluso quando necessario) è locale: non richiede ID, tokenizer o adapter LangChain e non scrive nella KB. `pages` è presente solo nei PDF. Per seguire l’avanzamento, passa una callback come secondo argomento.

### Integrazione TypeScript con il proprio adapter LangChain

L’applicazione configura il proprio chat model LangChain e passa al parser `llm` e una funzione `countTokens` adatta al modello. Il parser richiede il supporto a `withStructuredOutput`, non un provider specifico. Azure nel quickstart è solo un esempio.

```ts
import { createDocumentParser, getSectionMarkdown, type ParserOptions } from "smartDocKb";

export async function processUpload(bytes: Buffer, options: ParserOptions) {
  const parser = createDocumentParser(options);
  const doc = await parser.parseDocument({
    documentId: 42,
    bytes,
    fileName: "manuale.pdf",
    sectionSize: { minChars: 1500, maxChars: 3000 },
  });
  for (const section of doc.map.sections) {
    console.log(getSectionMarkdown(doc, section.id, { pageTags: true }));
  }
  return doc;
}
```

`getDocumentModel()` è un helper facoltativo per usare la configurazione Azure del repository. Se passi il tuo adapter, non devi configurare la libreria con credenziali Azure. La conversione del file è locale; il parser invia al modello scelto il testo delle finestre e le sintesi.

### OCR locale e avanzamento

1. **Estrazione nativa.** AnyDoc prova a leggere il testo nativo di ogni pagina PDF.
2. **Fallback OCR.** Se AnyDoc segnala `needsOcr`, classifica la pagina come `ImageBased` senza testo estraibile o restituisce testo vuoto, PDFium renderizza la pagina in memoria e Tesseract.js la legge con il modello italiano.
3. **Risultato.** L’OCR estrae testo, ma non ricostruisce necessariamente tabelle o impaginazione. Una scansione senza testo riconoscibile produce un errore con il numero di pagina. Se AnyDoc estrae testo nativo, eventuali scansioni incorporate nella stessa pagina non vengono rilette.

Motore e dati linguistici sono inclusi nelle dipendenze npm: dopo l’installazione non servono connessione, eseguibili di sistema, chiavi API o fallback remoti.

`prova:ocr` e `prova` mostrano su **stderr** il tempo trascorso, la percentuale, la fase corrente, le pagine elaborate e lo stato del riconoscimento. `prova` segnala anche richieste al modello, righe analizzate e salvataggio della KB. Durante le attese viene ripetuta l’ultima fase nota. I log non contengono il testo del documento e non alterano il Markdown o il JSON su **stdout**. Nella libreria l’avanzamento è facoltativo e fornisce un oggetto strutturato `DocumentParseProgress` (con `phase`, `step`, `percent`, `current`, `total`, `phasePercent`, `batch` opzionale e `message`): passa ad esempio `onProgress: p => console.error(`[${p.percent}%] ${p.message}`)` a `createDocumentParser`.

### Indice per un LLM

La descrizione breve del documento è disponibile in `doc.map.short_description`.
Per ottenere l'indice come JSON compatto, senza ulteriori chiamate al modello:

```ts
import { getDocumentTableOfContents } from "smartDocKb";

const tocJson = JSON.stringify(getDocumentTableOfContents(doc));
```

```json
{
  "documentId": 42,
  "short_description": "Manuale per installare e configurare il prodotto.",
  "sections": [
    { "id": 1, "title": "Installazione", "short_description": "Requisiti e passaggi di installazione." },
    { "id": 2, "title": "Configurazione", "short_description": "Impostazioni iniziali del prodotto." }
  ]
}
```

`documentId` è l'ID passato al parser. Le sezioni sono nell'ordine del documento e i loro `id` si possono usare con `getSectionMarkdown`. Un documento senza testo ha `short_description: ""` e `sections: []`.

### Salvataggio e ricaricamento

Per salvare e ricaricare un `ParsedDocument` senza richiamare il modello:

```ts
import { persist, load } from "smartDocKb";

await persist(doc, "./archivio/manuale");
const documento = await load("./archivio/manuale");
```

Usa una cartella per documento. `persist` crea la cartella se manca e, quando disponibile, conserva il nome originale nei file salvati: `a.pdf` diventa `a.pdf.md` e `a.pdf.json` (mappa completa e pagine, se presenti). Senza nome originale usa `document.md` e `metadata.json`. Gli intervalli di righe restano validi dopo il caricamento.

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
| `sectionSize` | Suggerisce una lunghezza in unità UTF-16 (come `String.length`), non un limite rigido. |
| `windowTokens` | Limita il contenuto di una singola chiamata (default `4096`). Lascia spazio per schema, istruzioni e risposta. Se una riga non entra da sola, il parser restituisce un errore esplicito. |
| `targetChars` | Suggerisce lunghezze in caratteri, ad esempio `{ documentSummary: 800, sectionSummary: 300, shortDescription: 80 }`. Non tronca il testo. `shortDescription` vale per documento e sezioni. Per un documento con una sola sezione, il parser ne riusa sintesi e descrizione breve, salvo richiesta di una sintesi dedicata con `documentSummary`. |

- **Righe e intervalli.** `markdown` usa newline LF senza newline finale. Righe e pagine partono da 1 e gli estremi sono inclusi. `map.sections[].range` si riferisce sempre al Markdown originale, non al prompt o al testo con tag.
- **Paginazione.** Nei PDF le pagine sono quelle fisiche, copertina inclusa. Una pagina senza contenuti o annotazioni ha `range: null`; una pagina non estraibile non viene dichiarata vuota. La conversione per pagina può interrompere la formattazione delle tabelle multipagina. Negli altri formati `pages` e `pageRange` sono omessi.
- **Token.** `tokens` conta il Markdown della sezione; `totalTokens` conta l’intero documento ed è ripetuto in ogni sezione. `getSectionMarkdown` funziona anche dopo un round trip JSON.
- **Elaborazione in batch.** `parseDocuments(inputs)` mantiene l’ordine e si ferma al primo errore. `DocumentParseError` espone `documentId` e `cause`.

<a id="knowledge-base"></a>

## 🔎 Knowledge base

### Consultazione diretta

`KbSmartManager` carica ricorsivamente i manifest JSON, inclusi quelli alla radice della KB. Può aprire più manifest nella stessa cartella senza invocare il parser o un LLM. Indicizza le mappe all’apertura e legge il Markdown solo per consultazione e ricerca.

I file originali possono avere lo stesso nome, ma ciascun `documentId` deve essere univoco. Dopo aver concluso le modifiche su disco, chiama `await kb.refresh()` per aggiornare il catalogo di tutte le cartelle aperte, senza ricreare il manager o i suoi tool. Se un manifest non è valido o un ID è duplicato, `refresh()` segnala l’errore e mantiene il catalogo precedente. Il Markdown viene comunque letto dal disco: il catalogo non è una copia di sicurezza dei file.

```ts
import { KbSmartManager } from "smartDocKb/kb";

const kb = await KbSmartManager.open("./archivio");
const indice = await kb.kbGetTableOfContents();
const sezioni = await kb.kbFileGetTableOfContents(42);
const info = await kb.kbFileGetInfo(42);
const sintesi = await kb.kbFileReadSummary(42);
const completo = await kb.kbFileRead(42);

const { matches, truncated } = await kb.kbFileSearchByKeywords(
  { kind: "keywords", keywords: ["installazione", "requisiti"] },
  { documentIds: [42] },
  { beforeLines: 2, afterLines: 3 },
);
for (const { snippet, source, matchLines } of matches) {
  console.log(source.originalFileName, source.fromLine, source.toLine, matchLines, snippet);
  if (source.sectionId !== undefined) {
    const sezione = await kb.kbFileReadSection(source.documentId, source.sectionId);
    console.log(sezione.markdown);
  }
}
if (truncated) console.log("Risultati parziali: restringere la ricerca.");
```

**Regole della ricerca:**

- **Query e ambito.** La modalità `keywords` trova le righe che contengono almeno una delle parole o stringhe richieste. In alternativa, usa `{ kind: "regex", pattern: "^art\\." }` (sintassi JavaScript). Entrambe ignorano maiuscole e minuscole salvo `caseSensitive: true`. Ometti `fileSpec` per cercare in tutta la KB.
- **Contesto.** Con `beforeLines` e `afterLines` a zero (default), la ricerca restituisce una voce per riga trovata. Con il contesto attivo, le finestre sovrapposte si uniscono: `source` copre tutto lo snippet e `matchLines` indica solo le righe corrispondenti. Nel tool agentico, passa `beforeLines` e `afterLines` allo stesso livello di `query` e `fileSpec`.
- **Fonti.** Una voce citabile include `source.documentId` e `source.originalFileName`. Il nome in `map.originalFileName` conserva l’estensione, non il percorso; nelle mappe precedenti o senza nome la fonte riporta `null`. I passaggi aggiungono le righe assolute inclusive e `pages`, una lista di `{ pageNumber, fromLine, toLine }` limitata al testo citato (`null` senza paginazione). Sintesi, metadati e documenti vuoti non riportano coordinate fittizie.
- **Risultati ed errori.** Nessuna corrispondenza restituisce `{ matches: [] }`. Regex non valide, documenti o sezioni sconosciuti e intervalli fuori limite producono un errore.

`await kb.deleteDocument(42)` rimuove il documento dalla KB e aggiorna subito l'indice. Cancella il manifest e il Markdown se non è condiviso con altri documenti; non tocca il file originale. Un ID sconosciuto produce un errore.

### Ricerca agentica dalla libreria

Passa il tuo chat model LangChain con supporto a `bindTools` nell’opzione `llm` di `open`: verrà usato da `kbAgentSearch` e da `kb.getAgentSearchTool()`. Se lo ometti, la ricerca agentica usa l’helper Azure del repository. L’apertura della KB e la consultazione diretta non richiedono un modello. Resta supportata la firma posizionale `open(cartelle, llm, selection, options)`.

```ts
const kb = await KbSmartManager.open(["./manuali", "./procedure"], { llm });
const { answer, references } = await kb.kbAgentSearch("Quali sono i requisiti di installazione?");
```

Puoi passare anche una sola cartella. Gli ID dei documenti devono essere univoci tra tutte le cartelle. Ogni domanda avvia una ricerca indipendente e restituisce `{ answer, references }`: `answer` è la risposta in Markdown, mentre `references` include i passaggi letti esplicitamente e le sole righe citate tra i risultati di ricerca (indici, metadati e sintesi usati per orientare la ricerca non diventano riferimenti). Senza selettore, il modello riceve subito l'indice di tutti i documenti e delle relative sezioni, insieme alla domanda; il testo viene letto con i tool su richiesta. Se il modello continua a richiedere tool dopo otto turni di tool calling, il metodo segnala un errore.

Per omettere l’indice dal system prompt, usa `open(cartella, { llm, tocMode: "tools" })`. L’agente può consultare gli indici tramite i tool. Il default è `"prompt"`; se è configurato un decision model, l’opzione viene ignorata.

Per ridurre l’indice iniziale, passa un modello LangChain con `withStructuredOutput` nell’opzione `selection`:

```ts
const kb = await KbSmartManager.open("./archivio", {
  llm: searchModel,
  selection: { decisionModel, threshold: 0.5, maxDocuments: 5 },
});
```

Per ogni domanda il selettore valuta schede compatte (nome, titolo, descrizione breve e keyword) in batch da massimo 20, senza leggere il Markdown o le sezioni. Il prompt di ricerca include solo le TOC meglio classificate sopra o alla soglia (da 0 a 1, predefinita `0.5`), fino a `maxDocuments` (intero positivo, predefinito `5`). I tool restano globali: se non ci sono candidati o la selezione fallisce, l'agente parte senza TOC e può consultare il catalogo o cercare per keyword in tutta la KB.

<a id="test-e-benchmark"></a>

## 🧪 Test e benchmark

Dalla root del repository:

| Comando | Cosa fa |
| --- | --- |
| `npm run --silent prova:ocr -- "./scansione.pdf"` | Stampa il Markdown senza credenziali, senza chiamate al modello e senza modificare la KB. |
| `npm run prova -- "./manuale.pdf"` | Compila, analizza il PDF usando la [configurazione Azure della root](.env.example) e salva il risultato in KB1 con ID `1`. |
| `npm test` | Esegue i test con AnyDoc e `AzureChatOpenAI` reali e risposte HTTP locali predeterminate. Non serve un deployment. |
| `npm run test:azure` | Esegue una prova live con un CSV sintetico. Consuma risorse sul deployment; risulta **skipped** se mancano le variabili Azure. |

> **Attenzione:** `prova` può sovrascrivere un’esportazione omonima o creare un conflitto con il documento che ha già ID `1` in [KB1](./kb1). Per ottenere solo JSON su stdout e non toccare KB1, dopo la build esegui [lo script di prova](prova-documento.mjs) con `node` da una cartella temporanea, passando percorsi assoluti allo script e al PDF. Lo script salva la propria KB nella cartella corrente.

La [guida ai benchmark](benchmarks/search-agent/README.md) confronta tre strategie su KB1 e KB2: indice nel prompt, selettore e indice via tool. Distingue le esecuzioni live, che consumano token sul deployment, dalle simulazioni offline di costo.

<a id="kb-studio"></a>

## 💬 KB Studio — CLI opzionale

[KB Studio](./kb-agent-cli/cli.mjs) è un’applicazione separata che usa la libreria per fare domande a una KB da terminale e gestirne i documenti. Non serve per integrare il parser o il manager in un’altra applicazione.

### Configurazione Azure

I due file di configurazione sono indipendenti ed esclusi da Git. La libreria legge il file della root; nella CLI, le variabili già presenti nell’ambiente di processo hanno precedenza sul file locale. Per ogni gruppo configura chiave, istanza oppure endpoint, deployment, versione API e modello. Non inserire le chiavi nel sorgente.

| Configurazione | Variabili | Uso |
| --- | --- | --- |
| [Esempio della CLI](kb-agent-cli/.env.example) | `AZURE_OPENAI_*` | Deep Agent della CLI; richiede tool calling. |
| [Esempio della CLI](kb-agent-cli/.env.example) | `KB_SEARCH_AZURE_OPENAI_*` | Agente di ricerca nella KB; richiede tool calling. |
| [Esempio della CLI](kb-agent-cli/.env.example) | `KB_IMPORT_AZURE_OPENAI_*` | Parser per `/add`; richiede output strutturato. Non usa la configurazione della root come fallback. |

Per le istanze configurate con `gpt-6-luna`, la CLI invia `reasoning_effort: "none"` per poter usare i tool su Chat Completions.

**Selettore facoltativo.** Imposta `KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME` con l’ID esatto del gateway (es. `Decision-1.1`). L’adapter LangChain chiama `POST /systemone` sullo stesso host HTTPS e con la stessa chiave di `KB_SEARCH_AZURE_OPENAI_*`, senza usare la versione API di Chat Completions. I punteggi da 0–2 vengono normalizzati a 0–1 prima di applicare la soglia. `KB_DECISION_THRESHOLD` e `KB_DECISION_MAX_DOCUMENTS` sono facoltative; turni e token del selettore hanno metriche separate.

### Avvio

Parti dall’esempio di configurazione della CLI nella tabella, senza sovrascrivere un file locale già presente. Una volta configurato, dalla root del repository esegui:

```sh
npm ci
npm run build
cd kb-agent-cli
npm ci
npm start -- ../kb1
```

Il comando apre la [KB1 di esempio](./kb1). Al prompt `›` puoi chiedere, per esempio, **«Come funziona una porta XOR?»**.

### Comandi interattivi

| Comando | Effetto |
| --- | --- |
| Una domanda al prompt `›` | Avvia una ricerca indipendente e mostra la risposta in Markdown. |
| `/tools`, `/tools on`, `/tools off` | Mostra lo stato oppure abilita o disabilita la visualizzazione dei risultati dei tool per le domande successive. I risultati sono nascosti all’avvio. |
| `/add "./Manuale tecnico.pdf"` | Importa un file nella KB aperta. I percorsi relativi partono dalla cartella di avvio. |
| `/delete 42` oppure `/delete #42` | Rimuove definitivamente il documento dalla KB e aggiorna il pannello, senza cancellare l’originale. Usa l’ID nel pannello **Documenti in KB**. |
| Invio a vuoto | Esce dalla CLI. |

Durante `/add` il pannello destro mostra le fasi reali del parser e, quando disponibili, le percentuali. Ogni file viene salvato in una sottocartella distinta ed è interrogabile quando compare **Pronto nella KB**, senza riavviare. La CLI elabora una richiesta alla volta. Importa solo file che puoi inviare al deployment di importazione.

### Come avviene la ricerca

Il Deep Agent della CLI ha accesso solo a `kbAgentSearch`, fornito da `kb.getAgentSearchTool()`: non usa un motore di ricerca esterno. I deployment del Deep Agent e dell’agente di ricerca ricevono le domande e i risultati dei rispettivi tool.

Il tool restituisce `answer` (Markdown) e `references` (passaggi senza duplicati, con documento, righe, sezione e pagine quando disponibili). I riferimenti possono includere passaggi letti ma non citati nella risposta finale; le sintesi non diventano riferimenti.

### Traccia e metriche

- **Avvio interattivo.** KB Studio pulisce l’area visibile del terminale e mostra un libro in ASCII sopra il prompt. Dopo Invio, il campo si svuota e il benvenuto scorre con la traccia. Con input o output rediretto, lo schermo non viene pulito e il benvenuto non viene mostrato.
- **Traccia Ink.** Chiamate, argomenti ed errori appaiono in tempo reale. Ogni evento mostra i millisecondi trascorsi; il numero della chiamata collega i risultati ai tool anche in parallelo. La risposta Markdown ha un riquadro separato. Gli errori e le metriche restano visibili anche con `/tools off`.
- **Metriche elaborazione.** Per ogni domanda, anche in caso di errore, il riquadro mostra durata totale, turni del modello (una chiamata avviata vale un turno), chiamate ai tool ed errori. I token di input e output sono sommati separatamente per **Deep Agent (CLI)** e **Agente KbSmartManager**. `—` indica che il modello non è stato chiamato, `n/d` che i conteggi non sono disponibili, e `(2/3 turni)` che la somma copre solo due turni su tre.
- **Documenti in KB.** `car.` conta i caratteri del Markdown indicizzato, inclusi spazi e a capo. Non misura il peso del file originale in byte.
