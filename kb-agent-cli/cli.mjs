import { createInterface } from "node:readline";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createLlmIngestionEngine, openLocalKnowledgeBase } from "smartdoc-kb-v2";
import { makeAgent } from "./agent.mjs";
import { traceQuestion } from "./trace.mjs";
import { openScreen } from "./screen.mjs";
import { importFile } from "./import-file.mjs";
import { createCliModel, createCliEmbedder } from "./models.mjs";

const folder = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL("../.kb/cli-v2", import.meta.url));
let local, kb, agent, screen;
let showToolResults = false;

// The sidebar shows the first catalog page only.
async function refreshDocuments() {
  const { items } = await kb.list();
  const documents = await Promise.all(items.map(async documentId => {
    try {
      const { text, title, originalFileName } = await kb.read(documentId);
      return { documentId, title: title ?? originalFileName, characters: text.length };
    } catch (error) {
      if (error.code !== "not_found") throw error;
      return { documentId, status: await local.indexStatus(documentId) };
    }
  }));
  screen.documents(documents);
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
      const { documentId, originalFileName } = await importFile(file, kb, undefined, ({ percent, message }, id) => {
        screen.progress(`#${id} · ${percent}% · ${message}`);
      });
      await local.reconcile();
      const status = await local.indexStatus(documentId);
      await refreshDocuments();
      if (status !== "indexed") throw new Error(`Indicizzazione di #${documentId} non completata: ${status}`);
      screen.append({ title: `Pronto nella KB: #${documentId} ${originalFileName}`, color: "green" });
    } else if (/^\/delete(?:\s|$)/.test(line)) {
      const value = line.slice(7).trim();
      const quotedId = /^(["'])(.*)\1$/.exec(value);
      const documentId = quotedId ? quotedId[2] : value.replace(/^#/, "");
      if (!documentId) throw new Error("Uso: /delete <ID documento>");
      await kb.delete(documentId);
      await local.reconcile();
      await refreshDocuments();
      screen.append({ title: `Cancellazione richiesta per #${documentId}`, color: "green" });
    } else {
      await traceQuestion(agent, line, screen.append, showToolResults);
    }
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
  const embedder = createCliEmbedder();
  const ingestionEngine = createLlmIngestionEngine(deepAgentLlm);
  local = openLocalKnowledgeBase({ id: "kb-studio", name: "KB Studio", directory: folder, embedder, ingestionEngine });
  kb = local.kb;
  agent = makeAgent(kb, deepAgentLlm, { semantic: Boolean(embedder) });
  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  screen = openScreen(folder, deepAgentLlm.model, line => {
    pendingSubmission = submit(line).catch(error => { reportError(error); screen.close(); });
  }, interactive);
  await refreshDocuments();

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
  try {
    await local?.close();
  } catch (error) {
    reportError(error);
  }
}
