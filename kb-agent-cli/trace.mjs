import { stripVTControlCharacters } from "node:util";

const CLI_AGENT = "Deep Agent (CLI)";
const KB_AGENT = "Agente KbSmartManager";
const KB_SELECTOR = "Selettore documenti KB";

function display(value) {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch (error) { if (!(error instanceof SyntaxError)) throw error; }
  }
  return stripVTControlCharacters(typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? "");
}

function agentLabel(tags) {
  if (tags?.includes("kb-document-selection")) return KB_SELECTOR;
  return tags?.includes("kb-internal-search") ? KB_AGENT : CLI_AGENT;
}

function formatTokens({ turns, usage }, key) {
  if (!turns) return "—";
  const values = usage.map(turn => turn[key]).filter(Number.isFinite);
  if (!values.length) return "n/d";
  const sum = values.reduce((a, b) => a + b, 0).toLocaleString("it-IT");
  return values.length === turns ? sum : `${sum} (${values.length}/${turns} turni)`;
}

export async function traceQuestion(agent, question, append, showToolResults = false) {
  const started = Date.now();
  const runs = new Map();
  const modelRuns = new Map();
  const modelMetrics = new Map([CLI_AGENT, KB_AGENT].map(label => [label, { turns: 0, usage: [] }]));
  let turns = 0, toolErrors = 0;
  function log(title, value, color = "cyan", panel = false, format) {
    append({ title, detail: format === "markdown" ? value : display(value), color, elapsed: Date.now() - started, panel, format });
  }
  const callbacks = [{
    name: "kb-trace",
    handleChatModelStart(_model, _messages, id, _parent, _extra, tags) {
      const label = agentLabel(tags);
      modelRuns.set(id, label);
      if (!modelMetrics.has(label)) modelMetrics.set(label, { turns: 0, usage: [] });
      modelMetrics.get(label).turns++;
      log(`${label}: turno modello ${++turns} in corso`);
    },
    handleLLMEnd({ generations }, id, _parent, tags) {
      // Match the completion to its start; internal and external model calls can interleave.
      const label = modelRuns.get(id) ?? agentLabel(tags);
      const message = generations[0][0].message;
      if (message.usage_metadata && modelRuns.has(id)) modelMetrics.get(label).usage.push(message.usage_metadata);
      modelRuns.delete(id);
      const calls = message.tool_calls ?? [];
      const ready = label === KB_SELECTOR ? "valutazione ricevuta" :
        label === KB_AGENT ? "risultato per kbAgentSearch pronto" : "risposta pronta";
      log(`${label}: ` + (calls.length && label !== KB_SELECTOR ? `richiede ${calls.map(c => c.name).join(", ")}` : ready),
        calls.length ? message.text : "");
    },
    handleToolStart(tool, input, id, _parent, tags, _metadata, name) {
      const label = `#${runs.size + 1} ${name ?? tool.id.at(-1)} [${agentLabel(tags)}]`;
      runs.set(id, label);
      log(`Chiamata ${label}`, input, "yellow");
    },
    handleToolEnd(output, id) {
      if (showToolResults) log(`Risultato ${runs.get(id)}`, output?.content ?? output, "green");
    },
    handleToolError(error, id) { toolErrors++; log(`Errore ${runs.get(id)}`, error.message, "red"); },
    handleLLMError(error, id, _parent, tags) {
      const label = modelRuns.get(id) ?? agentLabel(tags);
      modelRuns.delete(id);
      log(`${label}: errore modello`, error.message, "red");
    },
  }];
  try {
    log("Ricerca documentale", question);
    const { messages } = await agent.invoke({ messages: [{ role: "user", content: question }] }, { callbacks });
    log("Risposta finale", messages.at(-1).text, "green", true, "markdown");
  } catch (error) {
    log("Richiesta interrotta", error.message, "red", true);
  } finally {
    const tokenLines = Array.from(modelMetrics, ([label, metrics]) =>
      `${label} (${metrics.turns} turni): Token input: ${formatTokens(metrics, "input_tokens")}  ·  Token output: ${formatTokens(metrics, "output_tokens")}`,
    );
    log("Metriche elaborazione", [
      `Turni modello: ${turns}  ·  Chiamate tool: ${runs.size}  ·  Errori tool: ${toolErrors}`,
      ...tokenLines,
      `Durata totale: ${Date.now() - started} ms`,
    ].join("\n"), "cyan", true);
  }
}
