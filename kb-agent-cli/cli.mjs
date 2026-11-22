import { createInterface } from "node:readline";
import { basename } from "node:path";
import { createPosixStore, KbSmartManager, POSIXSearchEngine } from "smartDocKb";
import { makeAgent } from "./agent.mjs";
import { traceQuestion } from "./trace.mjs";
import { openScreen } from "./screen.mjs";
import { importFile } from "./import-file.mjs";
import { createCliModel, createCliEmbeddings } from "./models.mjs";

const folder = process.argv[2] ?? "../kb1";
let documentLlm;
let store, searchEngine, kb, agent, screen, documents;
let showToolResults = false;

// The sidebar shows the first catalog page only.
async function sidebarDocuments(kb) {
  const { documents } = await kb.kbGetTableOfContents();
  for (const doc of documents) {
    const { markdown } = await kb.kbDocumentRead(doc.documentId);
    doc.characters = markdown.length;
  }
  return documents;
}

function parseDeleteId(value) {
  if (/^\d+$/.test(value)) {
    const id = Number(value);
    if (Number.isSafeInteger(id)) return id;
  }
  if (/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(value)) return value;
  throw new Error("Uso: /delete <ID documento>");
}

async function submit(line) {
  line = line.trim();
  if (!line) return screen.close();
  screen.busy(true);
  try {
    if (/^\/tools(?:\s|$)/.test(line)) {
      const mode = line.slice(6).trim();
      if (mode && mode !== "on" && mode !== "off") throw new Error("Uso: /tools on oppure /tools off");
      if (mode) showToolResults = mode === "on";
      screen.append({ title: `Risultati dei tool: ${showToolResults ? "visibili" : "nascosti"}`, color: "cyan" });
    } else if (/^\/add(?:\s|$)/.test(line)) {
      const file = line.slice(4).trim().replace(/^(["'])(.*)\1$/, "$2");
      if (!file) throw new Error('Uso: /add "percorso del file"');
      const name = basename(file);
      documentLlm ??= createCliModel("KB_IMPORT_AZURE_OPENAI_");
      const id = await importFile(file, store, undefined, documentLlm,
        step => screen.progress(`${name} (${step.percent}%)\n${step.message}`));
      documents = await sidebarDocuments(kb);
      screen.documents(documents);
      screen.append({ title: `Pronto nella KB: #${id} ${name}`, color: "green" });
    } else if (/^\/delete(?:\s|$)/.test(line)) {
      const documentId = parseDeleteId(line.slice(7).trim().replace(/^#/, ""));
      const info = await kb.kbDocumentGetInfo(documentId);
      await kb.deleteDocument(documentId);
      documents = documents.filter(doc => doc.documentId !== documentId);
      screen.documents(documents);
      screen.append({ title: `Rimosso dalla KB: #${documentId} ${info.originalFileName ?? info.title ?? "Senza nome"}`, color: "green" });
    } else {
      await traceQuestion(agent, line, screen.append, showToolResults);
    }
  } catch (error) {
    screen.append({ title: "Operazione non riuscita", detail: error.message, color: "red" });
  } finally {
    screen.progress("");
    screen.busy(false);
  }
}

function reportError(error) {
  console.error(error);
  process.exitCode = 1;
}

let pendingSubmission;
try {
  const deepAgentLlm = createCliModel("AZURE_OPENAI_");
  const kbSearchLlm = createCliModel("KB_SEARCH_AZURE_OPENAI_");
  const semantic = {
    embeddings: createCliEmbeddings("KB_SEARCH_AZURE_OPENAI_"),
    modelId: "text-embedding-3-large",
  };
  store = await createPosixStore({ root: folder, semantic });
  searchEngine = await POSIXSearchEngine.open({ root: folder, semantic });
  kb = await KbSmartManager.open(store, searchEngine, { llm: kbSearchLlm });
  documents = await sidebarDocuments(kb);
  agent = makeAgent(kb, deepAgentLlm);
  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  screen = openScreen(folder, deepAgentLlm.model, line => {
    pendingSubmission = submit(line).catch(reportError);
  }, interactive);
  screen.documents(documents);

  if (interactive) {
    await screen.wait();
  } else {
    for await (const line of createInterface({ input: process.stdin })) {
      if (!line.trim()) break;
      await submit(line);
    }
  }
} catch (error) {
  reportError(error);
} finally {
  await pendingSubmission;
  try {
    screen?.close();
  } catch (error) {
    reportError(error);
  }
  for (const resource of [searchEngine, store]) {
    try {
      await resource?.close();
    } catch (error) {
      reportError(error);
    }
  }
}
