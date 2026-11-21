# Workspace Document Parser

Libreria TypeScript per Node.js 20+ (ESM). Converte file in memoria con AnyDoc e usa un chat model LangChain con output strutturato per ottenere una mappa delle sezioni.

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

Usa una cartella per documento. `persist` crea la cartella se manca e sovrascrive `document.md` (Markdown originale senza marcatori) e `metadata.json` (mappa completa e pagine, se presenti). Gli intervalli di righe restano validi dopo il caricamento.

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
- Per i PDF le pagine sono quelle fisiche, copertina inclusa. La conversione separata puo interrompere la formattazione delle tabelle multipagina. Una pagina PDF senza contenuti o annotazioni ha `range: null`; una pagina non estraibile non viene dichiarata vuota. Nessun OCR o fallback remoto. Per gli altri formati `pages` e `pageRange` sono omessi.
- `tokens` conta il Markdown della sezione; `totalTokens` conta l'intero documento ed e ripetuto per ogni sezione. `getSectionMarkdown` funziona anche dopo un round trip JSON.
- `parseDocuments(inputs)` mantiene l'ordine e si arresta al primo errore. `DocumentParseError` contiene `documentId` e `cause`.

## Verifica

Per provare un file dalla root, configura il blocco `azureConfig` in [prova-documento.mjs](./prova-documento.mjs). Le variabili d'ambiente hanno precedenza; per istanza, deployment, versione API e modello puoi anche scrivere i valori direttamente nello script. Per la chiave usa `AZURE_OPENAI_API_KEY`, senza salvarla nel sorgente.

```powershell
npm run prova -- ".\manuale.pdf"
```

Il comando compila la libreria e stampa il risultato JSON completo (Markdown, pagine e mappa). Scegli un documento di prova che puoi inviare ad Azure. Per salvare solo il JSON, dopo la build usa `node .\prova-documento.mjs ".\manuale.pdf" > risultato.json`.

```sh
npm test
npm run test:azure
```

Il primo comando usa AnyDoc e `AzureChatOpenAI` reali con risposte HTTP locali predeterminate. Non richiede un deployment. Il secondo esegue una prova live con un CSV sintetico, comporta consumo sul deployment e viene segnalato come **skipped** se mancano le variabili Azure. Non inserire chiavi nel sorgente.
