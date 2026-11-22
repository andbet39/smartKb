import { createInterface } from "node:readline";
import { readdir } from "node:fs/promises";
import { basename } from "node:path";
import { KbSmartManager } from "smartDocKb/kb";
import { makeAgent } from "./agent.mjs";
import { traceQuestion } from "./trace.mjs";
import { openScreen } from "./screen.mjs";
import { importFile } from "./import-file.mjs";
import { createCliDocumentSelection, createCliModel } from "./models.mjs";

const folder = process.argv[2] ?? "../kb1";
const deepAgentLlm = createCliModel("AZURE_OPENAI_");
const kbSearchLlm = createCliModel("KB_SEARCH_AZURE_OPENAI_");
const selection = createCliDocumentSelection();
let documentLlm;

async function sidebarDocuments(kb) {
  const { documents } = await kb.kbGetTableOfContents();
  for (const doc of documents) {
    const { markdown } = await kb.kbFileRead(doc.source.documentId);
    doc.characters = markdown.length;
  }
  return documents;
}

const kb = await KbSmartManager.open(folder, { llm: kbSearchLlm, selection });
let documents = await sidebarDocuments(kb);
const agent = makeAgent(kb, deepAgentLlm);
const interactive = process.stdin.isTTY && process.stdout.isTTY;
const screen = openScreen(folder, deepAgentLlm.model, submit, interactive);
screen.documents(documents);
let showToolResults = false;

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
      const occupied = new Set(await readdir(folder));
      let id = documents.reduce((max, d) => Math.max(max, d.source.documentId), 0) + 1;
      while (Number.isSafeInteger(id) && occupied.has(`doc-${id}`)) id++;
      if (!Number.isSafeInteger(id)) throw new Error("Impossibile assegnare un nuovo ID documento");
      documentLlm ??= createCliModel("KB_IMPORT_AZURE_OPENAI_");
      await importFile(file, folder, id, documentLlm, step => screen.progress(`${name} (${step.percent}%)\n${step.message}`));
      await kb.refresh();
      documents = await sidebarDocuments(kb);
      screen.documents(documents);
      screen.append({ title: `Pronto nella KB: #${id} ${name}`, color: "green" });
    } else if (/^\/delete(?:\s|$)/.test(line)) {
      const value = line.slice(7).trim().replace(/^#/, "");
      const documentId = Number(value);
      if (!/^-?\d+$/.test(value) || !Number.isSafeInteger(documentId)) {
        throw new Error("Uso: /delete <ID documento>");
      }
      const { source } = await kb.kbFileGetInfo(documentId);
      await kb.deleteDocument(documentId);
      documents = documents.filter(doc => doc.source.documentId !== documentId);
      screen.documents(documents);
      screen.append({ title: `Rimosso dalla KB: #${documentId} ${source.originalFileName ?? source.title ?? "Senza nome"}`, color: "green" });
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

if (interactive) {
  await screen.wait();
} else {
  for await (const line of createInterface({ input: process.stdin })) {
    if (!line.trim()) break;
    await submit(line);
  }
  screen.close();
}
