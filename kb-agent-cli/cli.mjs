import { createInterface } from "node:readline";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { openLocalKnowledgeBase } from "smartdoc-kb-v2";
import { makeAgent } from "./agent.mjs";
import { traceQuestion } from "./trace.mjs";
import { openScreen } from "./screen.mjs";
import { importFile } from "./import-file.mjs";
import { createCliModel, createCliEmbedder } from "./models.mjs";
import { createCliSectionAnalyzer } from "./section-analyzer.mjs";

const folder = process.argv[2] ? resolve(process.argv[2]) : fileURLToPath(new URL("../.kb/cli-v2", import.meta.url));
let local, kb, agent, screen;
let showToolResults = false;

// The sidebar shows the first catalog page only.
async function refreshDocuments() {
  const { items } = await kb.list();
  const documents = await Promise.all(items.map(async documentId => {
    try {
      const { text, metadata, originalFileName } = await kb.read(documentId);
      return { documentId, title: metadata.title ?? originalFileName, characters: text.length };
    } catch (error) {
      if (error.code !== "not_found") throw error;
      return { documentId, status: await local.indexer.status(documentId) };
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
      const { documentId, originalFileName } = await importFile(file, kb);
      screen.progress(`Salvato #${documentId} · indicizzazione in corso…`);
      await local.reconcile();
      const status = await local.indexer.status(documentId);
      await refreshDocuments();
      const title = status === "indexed" ? "Pronto nella KB" : `Salvato, indicizzazione: ${status}`;
      screen.append({ title: `${title}: #${documentId} ${originalFileName}`, color: status === "indexed" ? "green" : "yellow" });
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
  const embedder = createCliEmbedder();
  const analyzer = createCliSectionAnalyzer(deepAgentLlm);
  const pipelineVersion = createHash("sha256").update(JSON.stringify(["cli-llm-sections-v1", deepAgentLlm.model,
    ...["ENDPOINT", "BASE_PATH", "API_INSTANCE_NAME", "API_DEPLOYMENT_NAME", "API_VERSION"].map(
      key => process.env[`AZURE_OPENAI_${key}`]?.trim()),
  ])).digest("hex");
  local = openLocalKnowledgeBase({ id: "kb-studio", directory: folder, embedder, analyzer, pipelineVersion });
  kb = local.kb;
  agent = makeAgent(kb, deepAgentLlm, { semantic: Boolean(embedder) });
  const interactive = process.stdin.isTTY && process.stdout.isTTY;
  screen = openScreen(folder, deepAgentLlm.model, line => {
    pendingSubmission = submit(line).catch(reportError);
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
