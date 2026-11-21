import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { persist } from "workspace-document-parser";
import { KbSmartManager } from "workspace-document-parser/kb";
import { mockRootEnv, offlineAzureChat } from "../test/azure-model.mjs";
import { makeAgent } from "./agent.mjs";
import { traceQuestion } from "./trace.mjs";

test("the CLI Deep Agent delegates to kbAgentSearch without exposing any other tools", async t => {
  const folder = await mkdtemp(join(tmpdir(), "kb-cli-agent-"));
  t.after(() => rm(folder, { recursive: true }));
  const question = "Quali documenti ci sono?";
  const answer = "È caricato il manuale.";
  await persist({ markdown: "Manuale", map: {
    documentId: 1, originalFileName: "manuale.txt", lineCount: 1,
    summary: "Manuale", short_description: "Manuale", keywords: [], sections: [],
  } }, folder);
  let outerTurns = 0;
  let searchTurns = 0;
  mockRootEnv(t, "");
  const searchLlm = offlineAzureChat(({ tools, messages }) => {
    const names = tools.map(tool => tool.function.name);
    assert.equal(names.length, 7);
    assert.ok(names.includes("kbFileReadSection"));
    assert.equal(messages[1].content, question);
    if (++searchTurns === 1) return { content: null, tool_calls: [{
      id: "call-index", type: "function",
      function: { name: "kbGetTableOfContents", arguments: "{}" },
    }] };
    assert.equal(messages.at(-1).tool_call_id, "call-index");
    return { content: answer, usage: { prompt_tokens: 100, completion_tokens: 12, total_tokens: 112 } };
  });
  const llm = offlineAzureChat(({ tools, messages }) => {
    assert.deepEqual(tools.map(tool => tool.function.name), ["kbAgentSearch"]);
    if (++outerTurns === 1) return {
      content: null,
      usage: { prompt_tokens: 20, completion_tokens: 4, total_tokens: 24 },
      tool_calls: [{
        id: "call-search", type: "function",
        function: { name: "kbAgentSearch", arguments: JSON.stringify({ question }) },
      }],
    };
    assert.equal(messages.at(-1).tool_call_id, "call-search");
    assert.deepEqual(JSON.parse(messages.at(-1).content), { answer, references: [] });
    return { content: answer, usage: { prompt_tokens: 30, completion_tokens: 6, total_tokens: 36 } };
  });
  const decisionModel = offlineAzureChat(({ response_format }) => {
    assert.equal(response_format.json_schema.name, "kb_document_relevance");
    return {
      content: JSON.stringify({ scores: [{ documentId: 1, score: 1 }] }),
      usage: { prompt_tokens: 40, completion_tokens: 8, total_tokens: 48 },
    };
  });
  const kb = await KbSmartManager.open(folder, searchLlm, { decisionModel });
  const getAgentSearchTool = t.mock.method(kb, "getAgentSearchTool");
  const agent = makeAgent(kb, llm);
  assert.equal(getAgentSearchTool.mock.callCount(), 1);
  const events = [];
  await traceQuestion(agent, question, event => events.push(event));
  assert.equal(outerTurns, 2);
  assert.equal(events.find(event => event.title === "Risposta finale")?.detail, answer);
  assert.ok(events.some(event => event.title === "Deep Agent (CLI): richiede kbAgentSearch"));
  assert.ok(events.some(event => event.title === "Agente KbSmartManager: richiede kbGetTableOfContents"));
  assert.ok(events.some(event => event.title === "Agente KbSmartManager: risultato per kbAgentSearch pronto"));
  assert.deepEqual(events.filter(event => event.title.startsWith("Chiamata")).map(event => event.title), [
    "Chiamata #1 kbAgentSearch [Deep Agent (CLI)]",
    "Chiamata #2 kbGetTableOfContents [Agente KbSmartManager]",
  ]);
  assert.equal(searchTurns, 2);
  const metrics = events.find(event => event.title === "Metriche elaborazione").detail;
  assert.ok(metrics.includes("Deep Agent (CLI) (2 turni): Token input: 50  ·  Token output: 10"));
  assert.ok(metrics.includes("Agente KbSmartManager (2 turni): Token input: 100 (1/2 turni)  ·  Token output: 12 (1/2 turni)"));
  assert.ok(metrics.includes("Selettore documenti KB (1 turni): Token input: 40  ·  Token output: 8"));
});

test("the CLI Deep Agent refuses a built-in tool call", async t => {
  const llm = offlineAzureChat(() => ({ content: null, tool_calls: [{
    id: "call-todos", type: "function",
    function: { name: "write_todos", arguments: JSON.stringify({ todos: [] }) },
  }] }));
  const folder = await mkdtemp(join(tmpdir(), "kb-cli-agent-"));
  t.after(() => rm(folder, { recursive: true }));
  const kb = await KbSmartManager.open(folder);
  t.mock.method(kb, "kbAgenticSearch", () => assert.fail("Unexpected search"));
  const agent = makeAgent(kb, llm);
  await assert.rejects(
    agent.invoke({ messages: [{ role: "user", content: "Quali documenti ci sono?" }] }),
    /Only kbAgentSearch is available/,
  );
});