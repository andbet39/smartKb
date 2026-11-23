import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { AzureChatOpenAI } from "@langchain/openai";
import { openLocalKnowledgeBase } from "smartdoc-kb-v2";
import { makeAgent } from "./agent.mjs";
import { traceQuestion } from "./trace.mjs";

function offlineChat(reply) {
  let completionId = 0;
  return new AzureChatOpenAI({
    model: "gpt-4o", azureOpenAIApiKey: "offline", azureOpenAIApiInstanceName: "offline",
    azureOpenAIApiDeploymentName: "test", azureOpenAIApiVersion: "2024-10-21", maxRetries: 0,
    configuration: { fetch: async (_url, init) => {
      const message = reply(JSON.parse(init.body));
      return Response.json({
        id: `offline-${++completionId}`, object: "chat.completion", model: "gpt-4o",
        usage: { prompt_tokens: 20, completion_tokens: 4, total_tokens: 24 },
        choices: [{ index: 0, finish_reason: message.tool_calls ? "tool_calls" : "stop",
          message: { role: "assistant", ...message } }],
      });
    } },
  });
}

function call(name, args) {
  return { content: null, tool_calls: [{ id: `call-${name}`, type: "function",
    function: { name, arguments: JSON.stringify(args) } }] };
}

test("l'agente cerca e verifica le righe tramite i soli tool V2", async t => {
  const directory = await mkdtemp(join(tmpdir(), "kb-cli-agent-"));
  const local = openLocalKnowledgeBase({ id: "test", directory });
  t.after(async () => { await local.close(); await rm(directory, { recursive: true }); });
  const documentId = "ERP-42";
  const { sha } = await local.kb.write(Buffer.from("# Manuale\nPressione nominale: 5 bar."),
    { title: "Manuale", contentType: "text/markdown" }, documentId);
  await local.reconcile();

  const answer = "5 bar (ERP-42, riga 2).";
  let turn = 0;
  const llm = offlineChat(({ tools, messages }) => {
    assert.deepEqual(tools.map(tool => tool.function.name), ["kbList", "kbSearchKeyword", "kbRead"]);
    if (++turn === 1) return call("kbSearchKeyword", { text: "pressione" });
    const result = JSON.parse(messages.at(-1).content);
    if (turn === 2) {
      assert.equal(result.hits[0].documentId, documentId);
      assert.equal(result.hits[0].sha, sha);
      return call("kbRead", { documentId, lines: { start: 2, end: 2 } });
    }
    assert.equal(result.sha, sha);
    assert.equal(result.text, "Pressione nominale: 5 bar.");
    return { content: answer };
  });

  const events = [];
  await traceQuestion(makeAgent(local.kb, llm), "Qual è la pressione?", event => events.push(event), true);
  assert.equal(turn, 3);
  assert.equal(events.find(event => event.title === "Risposta finale")?.detail, answer);
  assert.ok(events.some(event => event.title.startsWith("Risultato #2 kbRead")));
  assert.match(events.find(event => event.title === "Metriche elaborazione").detail,
    /Token input: 60  ·  Token output: 12/);
});

test("il tool semantico inoltra query e cursore alla KB", async () => {
  const searchResult = { hits: [], nextCursor: "pagina-3" };
  const kb = { searchSemantic(text, options) {
    assert.equal(text, "alimentazione");
    assert.deepEqual(options, { topK: 5, cursor: "pagina-2" });
    return searchResult;
  } };
  let turn = 0;
  const llm = offlineChat(({ tools, messages }) => {
    assert.ok(tools.some(tool => tool.function.name === "kbSearchSemantic"));
    if (++turn === 1) return call("kbSearchSemantic", { text: "alimentazione", cursor: "pagina-2" });
    assert.deepEqual(JSON.parse(messages.at(-1).content), searchResult);
    return { content: "Nessun risultato in questa pagina." };
  });
  const { messages } = await makeAgent(kb, llm, { semantic: true }).invoke({
    messages: [{ role: "user", content: "Come è alimentata la turbina?" }],
  });
  assert.equal(turn, 2);
  assert.equal(messages.at(-1).text, "Nessun risultato in questa pagina.");
});

test("con embeddings espone il tool semantico ma rifiuta i tool integrati", async () => {
  const llm = offlineChat(({ tools }) => {
    assert.deepEqual(tools.map(tool => tool.function.name), ["kbList", "kbSearchKeyword", "kbRead", "kbSearchSemantic"]);
    return call("write_todos", { todos: [] });
  });
  await assert.rejects(makeAgent({}, llm, { semantic: true }).invoke({
    messages: [{ role: "user", content: "Quali documenti ci sono?" }],
  }), /Only KB tools are available/);
});