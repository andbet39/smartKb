import { stripVTControlCharacters } from "node:util";

function display(value) {
  if (typeof value === "string") {
    try { value = JSON.parse(value); } catch (error) { if (!(error instanceof SyntaxError)) throw error; }
  }
  return stripVTControlCharacters(typeof value === "string" ? value : JSON.stringify(value, null, 2) ?? "");
}

export async function traceQuestion(agent, question, append, showToolResults = false) {
  const started = Date.now();
  const runs = new Map();
  let turns = 0, toolErrors = 0;
  const usage = [];
  function log(title, value, color = "cyan", panel = false, format) {
    append({ title, detail: format === "markdown" ? value : display(value), color, elapsed: Date.now() - started, panel, format });
  }
  const callbacks = [{
    name: "kb-trace",
    handleChatModelStart() { log(`Modello: turno ${++turns} in corso`); },
    handleLLMEnd({ generations }) {
      const message = generations[0][0].message;
      if (message.usage_metadata) usage.push(message.usage_metadata);
      const calls = message.tool_calls ?? [];
      log("Modello: " + (calls.length ? `richiede ${calls.map(c => c.name).join(", ")}` : "risposta pronta"),
        calls.length ? message.text : "");
    },
    handleToolStart(tool, input, id, _parent, _tags, _metadata, name) {
      const label = `#${runs.size + 1} ${name ?? tool.id.at(-1)}`;
      runs.set(id, label);
      log(`Chiamata ${label}`, input, "yellow");
    },
    handleToolEnd(output, id) {
      if (showToolResults) log(`Risultato ${runs.get(id)}`, output?.content ?? output, "green");
    },
    handleToolError(error, id) { toolErrors++; log(`Errore ${runs.get(id)}`, error.message, "red"); },
    handleLLMError(error) { log("Errore modello", error.message, "red"); },
  }];
  try {
    log("Ricerca documentale", question);
    const { messages } = await agent.invoke({ messages: [{ role: "user", content: question }] }, { callbacks });
    log("Risposta finale", messages.at(-1).text, "green", true, "markdown");
  } catch (error) {
    log("Richiesta interrotta", error.message, "red", true);
  } finally {
    const tokens = key => {
      const values = usage.map(turn => turn[key]).filter(Number.isFinite);
      if (!values.length) return "n/d";
      const sum = values.reduce((a, b) => a + b, 0).toLocaleString("it-IT");
      return values.length === turns ? sum : `${sum} (${values.length}/${turns} turni)`;
    };
    log("Metriche elaborazione", [
      `Turni modello: ${turns}  ·  Chiamate tool: ${runs.size}  ·  Errori tool: ${toolErrors}`,
      `Token input: ${tokens("input_tokens")}  ·  Token output: ${tokens("output_tokens")}`,
      `Durata totale: ${Date.now() - started} ms`,
    ].join("\n"), "cyan", true);
  }
}
