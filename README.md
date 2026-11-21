# Workspace Document Parser

Libreria TypeScript per Node.js 20+ (ESM). Converte file in memoria con AnyDoc e usa un chat model LangChain con output strutturato per ottenere una mappa delle sezioni.

Il codice del [parser](./src/parser) e quello del [KB manager](./src/kb) sono in cartelle separate. Entrambi restano disponibili dall'entry point principale del pacchetto.

## Uso con Azure OpenAI

Dalla cartella del progetto: `npm ci` e `npm run build`. Questo esempio usa un deployment GPT-4o; per un altro modello scegliere il tokenizer corrispondente.

```ts
import { AzureChatOpenAI } from "@langchain/openai";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser, getSectionMarkdown } from "workspace-document-parser";

const encoding = getEncoding("o200k_base");
const parser = createDocumentParser({
  llm: new AzureChatOpenAI({ model: "gpt-4o" }),
  countTokens: text => encoding.encode(text).length,
});

export async function processUpload(bytes: Buffer) {
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

Il client Azure legge `AZURE_OPENAI_API_KEY`, `AZURE_OPENAI_API_INSTANCE_NAME`, `AZURE_OPENAI_API_DEPLOYMENT_NAME` e `AZURE_OPENAI_API_VERSION` dall'ambiente. Il deployment deve supportare output strutturato. Il file viene convertito localmente; il testo delle finestre e le sintesi vengono inviati al modello configurato.

## Contratto

### Provare l'OCR senza Azure

I comandi `prova:ocr` e `prova` mostrano su **stderr** il tempo trascorso, le pagine elaborate e il progresso del riconoscimento. `prova` segnala anche le richieste al modello, le righe analizzate e il salvataggio della KB. Durante le attese viene ripetuta l'ultima fase nota; non è una stima di completamento. I log di avanzamento non contengono testo del documento e non cambiano il Markdown o il JSON su stdout. Nella libreria i messaggi sono facoltativi: passa `onProgress: message => console.error(message)` a `createDocumentParser`.

```powershell
npm ci
npm run prova:ocr -- ".\scansione.pdf"
```

Il comando stampa il Markdown senza chiamare un modello remoto né scrivere nella KB. AnyDoc prova prima a leggere il testo nativo di ogni pagina PDF. Se segnala `needsOcr`, classifica la pagina come `ImageBased` senza testo estraibile o restituisce testo vuoto, PDFium renderizza quella pagina in memoria e Tesseract.js la legge con il modello italiano. Motore e dati linguistici sono inclusi nelle dipendenze npm: dopo l'installazione non servono connessione, eseguibili di sistema o chiavi API. Una scansione senza testo riconoscibile produce un errore con il numero di pagina. L'OCR restituisce testo, non ricostruisce necessariamente tabelle o impaginazione. Una pagina con testo nativo e una scansione incorporata non viene riletta se AnyDoc restituisce testo.

### Indice per un LLM

La descrizione breve del documento è disponibile in `doc.map.short_description`.
Per ottenere l'indice come JSON compatto, senza ulteriori chiamate al modello:

```ts
import { getDocumentTableOfContents } from "workspace-document-parser";

const tocJson = JSON.stringify(getDocumentTableOfContents(doc));
```

```json
{"documentId":42,"short_description":"Manuale per installare e configurare il prodotto.","sections":[{"id":1,"title":"Installazione","short_description":"Requisiti e passaggi di installazione."},{"id":2,"title":"Configurazione","short_description":"Impostazioni iniziali del prodotto."}]}
```

`documentId` è l'ID passato al parser. Le sezioni sono nell'ordine del documento e i loro `id` si possono usare con `getSectionMarkdown`. Un documento senza testo ha `short_description: ""` e `sections: []`.

### Esportazione Markdown

Per salvare e ricaricare un `ParsedDocument` senza richiamare il modello:

```ts
import { persist, load } from "workspace-document-parser";

await persist(doc, "./archivio/manuale");
const documento = await load("./archivio/manuale");
```

Usa una cartella per documento. `persist` crea la cartella se manca e, quando disponibile, conserva il nome originale nei file salvati: `a.pdf` diventa `a.pdf.md` e `a.pdf.json` (mappa completa e pagine, se presenti). Senza nome originale usa `document.md` e `metadata.json`. Gli intervalli di righe restano validi dopo il caricamento.

### Consultare una knowledge base

`KbSmartManager` (modulo [src/kb](./src/kb)) apre ricorsivamente i manifest JSON dalla cartella indicata, inclusa la radice, senza invocare il parser o un LLM; può caricare più manifest nella stessa cartella. Ogni documento deve avere un `documentId` unico. File originali omonimi sono ammessi; una mappa non valida o un ID duplicato interrompono l'apertura. Il manager indicizza le mappe all'apertura e legge il Markdown solo per lettura e ricerca. Non modificare i file durante la consultazione; dopo un aggiornamento riaprire la KB.

```ts
import { KbSmartManager } from "workspace-document-parser/kb";

const kb = await KbSmartManager.open("./archivio");
const indice = await kb.kbGetTableOfContents();
const sezioni = await kb.kbFileGetTableOfContents(42);
const info = await kb.kbFileGetInfo(42);
const sintesi = await kb.kbFileReadSummary(42);
const completo = await kb.kbFileRead(42);

const { matches } = await kb.kbFileSearchByKeywords(
  { kind: "keywords", keywords: ["installazione", "requisiti"] },
  { documentIds: [42] },
);
for (const { snippet, source } of matches) {
  console.log(source.originalFileName, source.fromLine, source.pages, snippet);
  const riga = await kb.kbFileReadSection(source.documentId, source.fromLine, source.toLine);
  if (source.sectionId !== undefined) {
    const sezione = await kb.kbFileReadSection(source.documentId, source.sectionId);
    console.log(sezione.markdown);
  }
}
```

Ogni voce citabile include `source.documentId` e `source.originalFileName`: il parser conserva in `map.originalFileName` il nome con estensione, senza percorso. Per le mappe precedenti o gli input senza nome la fonte riporta `null`. I passaggi aggiungono le righe assolute inclusive e `pages`, una lista di `{ pageNumber, fromLine, toLine }` limitata al testo citato (`null` senza paginazione). Sintesi, metadati e documenti vuoti non inventano riferimenti di riga o pagina.

La ricerca restituisce una voce per riga che contiene almeno una parola o stringa richiesta. In alternativa usa `{ kind: "regex", pattern: "^art\\." }` (sintassi JavaScript). Entrambe le modalità ignorano maiuscole e minuscole salvo `caseSensitive: true`. Omettendo `fileSpec` si cerca in tutta la KB. Nessun risultato restituisce `{ matches: [] }`; regex non valide, documenti o sezioni sconosciuti e intervalli fuori limite producono un errore.

### Esportazione con marcatori

Per salvare il documento completo come Markdown, senza richiamare il modello:

```ts
import { saveDocumentMarkdown } from "workspace-document-parser";

await saveDocumentMarkdown(doc, "manuale.md");
await saveDocumentMarkdown(doc, "manuale-sezioni.md", { sectionMarkers: true });
```

La funzione scrive in UTF-8 e sovrascrive il file di destinazione. Inserisce un marcatore come `<!--------------- PAGE 4 ---------------->` prima di ogni pagina PDF, incluse quelle vuote. Con `sectionMarkers: true` inserisce anche `<!--------------- SECTION 1 --------------->` alla prima riga di ogni sezione, usando il suo `id`, anche nei documenti senza pagine. Se pagina e sezione iniziano insieme, `PAGE` precede `SECTION`. I range si riferiscono sempre a `doc.markdown`, non alle righe del file esportato.

- `targetChars` nelle opzioni del parser indica tre lunghezze facoltative in caratteri, ad esempio `{ documentSummary: 800, sectionSummary: 300, shortDescription: 80 }`. Sono suggerimenti per il modello: il parser non tronca il testo. `shortDescription` vale per il documento e per le sezioni. Se il documento ha una sola sezione, il parser ne riusa la sintesi e la descrizione breve, a meno che tu non imposti `documentSummary` per richiedere una sintesi dedicata.

- `bytes` accetta `Buffer` e `Uint8Array`. `fileName` non apre un percorso: serve per formati senza firma, come CSV. Sono supportati i formati gestiti da AnyDoc.
- `sectionSize` suggerisce una lunghezza in caratteri (unita UTF-16, come `String.length`), non un limite rigido. `windowTokens` nelle opzioni del parser limita invece il contenuto di una singola chiamata (default 4096): lasciare nel contesto del modello spazio aggiuntivo per schema, istruzioni e risposta. Una riga che non entra da sola produce un errore esplicito.
- `markdown` usa newline LF, senza newline finale. Tutte le righe e le pagine partono da 1; gli estremi sono inclusi. `map.sections[].range` si riferisce sempre a questo Markdown, non al prompt o al testo con tag.
- Per i PDF le pagine sono quelle fisiche, copertina inclusa. La conversione separata puo interrompere la formattazione delle tabelle multipagina. Una pagina PDF senza contenuti o annotazioni ha `range: null`; una pagina non estraibile non viene dichiarata vuota. L'OCR è locale, senza fallback remoto. Per gli altri formati `pages` e `pageRange` sono omessi.
- `tokens` conta il Markdown della sezione; `totalTokens` conta l'intero documento ed e ripetuto per ogni sezione. `getSectionMarkdown` funziona anche dopo un round trip JSON.
- `parseDocuments(inputs)` mantiene l'ordine e si arresta al primo errore. `DocumentParseError` contiene `documentId` e `cause`.

## Verifica

Parser e agent hanno due `.env` indipendenti, esclusi da Git. In un nuovo checkout copia [.env.example](./.env.example) in `.env` e in `kb-agent-cli/.env`, poi compila chiave, istanza, deployment, versione API e modello in ciascuno. I comandi `npm run prova` e `npm start` caricano il file del rispettivo progetto con Node (20.6+); le variabili già presenti nell'ambiente hanno precedenza.

```powershell
npm run prova -- ".\manuale.pdf"
```

Il comando compila la libreria, stampa il risultato JSON e scrive la KB in `kb1`, sovrascrivendo il documento precedente. Scegli un documento di prova che puoi inviare ad Azure. Per salvare solo il JSON, dopo la build usa `node --env-file=.env .\prova-documento.mjs ".\manuale.pdf" > risultato.json`.

### Fare domande alla KB

Con `AZURE_OPENAI_MODEL=gpt-6-luna` la CLI invia `reasoning_effort: "none"`: questo modello lo richiede per usare i tool su Chat Completions. Per gli altri modelli la CLI non imposta questo parametro.

Con la libreria compilata (`npm ci` e `npm run build` dalla root), avvia la [CLI](./kb-agent-cli/cli.mjs):

```powershell
cd .\kb-agent-cli
npm ci
npm start -- ..\kb1
```

`kb.getTools()` espone i sette metodi di consultazione come tool LangChain. Il Deep Agent li usa per cercare e leggere i passaggi: il prompt richiede fonte e righe (pagina se disponibile), oppure una risposta di informazione non trovata. Non viene aggiunto alcun motore di ricerca esterno. Il deployment Azure deve supportare il tool calling e riceve le domande e i risultati dei tool. Ogni domanda è indipendente; premi Invio a vuoto per uscire.

All'avvio interattivo **KB Studio** pulisce l'area visibile del terminale e mostra un benvenuto con un libro in ASCII sopra il pannello in basso. Puoi scrivere subito accanto a `›`: con Invio il campo si svuota e il benvenuto scorre insieme alla traccia. Se l'input o l'output è rediretto, non viene pulito lo schermo e non viene stampato il benvenuto. La traccia Ink mostra in tempo reale le chiamate ai tool con argomenti ed eventuali errori. Ogni evento indica i millisecondi trascorsi; il numero di chiamata collega gli eventuali risultati ai rispettivi tool anche in parallelo. La risposta finale appare in un riquadro separato.

Il riquadro **Metriche elaborazione** riepiloga la singola domanda, anche in caso di errore: durata totale, turni del modello (una chiamata avviata = un turno), chiamate ai tool ed errori dei tool. I token di input e output sono sommati su tutti i turni, non solo sulla risposta finale. Se mancano dati, `n/d` indica che non ci sono conteggi disponibili; `(2/3 turni)` indica una somma parziale sui soli due turni con dati.

Accanto a ogni nome nel pannello **Documenti in KB**, `car.` indica la lunghezza del Markdown indicizzato, inclusi spazi e a capo, non il peso del file originale in byte.

La risposta finale viene renderizzata in Markdown nel terminale. Le chiamate e i loro parametri sono sempre visibili. I risultati dei tool sono nascosti all'avvio: `/tools on` li mostra per le domande successive, `/tools off` li nasconde e `/tools` mostra lo stato corrente. Errori e metriche restano visibili in entrambe le modalità.

Per importare un documento nella KB aperta, digita `/add "C:\Documenti\Manuale tecnico.pdf"` al prompt della CLI. I percorsi relativi partono dalla cartella di avvio. Il pannello destro elenca i documenti indicizzati e mostra le fasi reali del parser durante l'importazione (incluse le percentuali quando disponibili). Il parser usa la configurazione Azure della CLI: importa solo file che puoi inviare al deployment. Ogni file viene salvato in una sottocartella distinta ed è interrogabile appena compare **Pronto nella KB**, senza riavviare. Le richieste vengono elaborate una alla volta.

```sh
npm test
npm run test:azure
```

Il primo comando usa AnyDoc e `AzureChatOpenAI` reali con risposte HTTP locali predeterminate. Non richiede un deployment. Il secondo esegue una prova live con un CSV sintetico, comporta consumo sul deployment e viene segnalato come **skipped** se mancano le variabili Azure. Non inserire chiavi nel sorgente.
