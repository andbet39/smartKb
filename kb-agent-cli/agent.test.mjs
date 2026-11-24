import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { AzureChatOpenAI } from "@langchain/openai";
import { DefaultKnowledgeBase, openLocalKnowledgeBase } from "smartdoc-kb-v2";
import { makeAgent } from "./agent.mjs";
import { ingestionEngine } from "../test/model-fixture.mjs";
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

function call(name, args, id = `call-${name}`) {
  return { content: null, tool_calls: [{ id, type: "function",
    function: { name, arguments: JSON.stringify(args) } }] };
}

test("l'agente cerca e verifica sezioni e righe tramite i soli tool V2", async t => {
  const directory = await mkdtemp(join(tmpdir(), "kb-cli-agent-"));
  const local = openLocalKnowledgeBase({ id: "test", name: "Test", directory, ingestionEngine });
  t.after(async () => { await local.close(); await rm(directory, { recursive: true }); });
  const documentId = "ERP-42";
  const { sha } = await local.kb.write(Buffer.from("# Manuale\nPressione nominale: 5 bar."),
    { title: "Manuale", contentType: "text/markdown" }, documentId);
  await local.reconcile();

  const answer = "5 bar (ERP-42, riga 2).";
  let turn = 0;
  let sectionId;
  const llm = offlineChat(({ tools, messages }) => {
    assert.deepEqual(tools.map(tool => tool.function.name).sort(),
      ["test_getDocumentsToc", "test_list", "test_read", "test_readSection", "test_readSectionSummary", "test_searchDocumentsToc", "test_searchKeyword"]);
    if (++turn === 1) return call("test_searchKeyword", { text: "pressione" });
    const result = JSON.parse(messages.at(-1).content);
    if (turn === 2) {
      assert.equal(result.hits[0].documentId, documentId);
      assert.equal(result.hits[0].sha, sha);
      return call("test_searchDocumentsToc", { text: "pressione" });
    }
    if (turn === 3) {
      assert.equal(result[0].documentId, documentId);
      return call("test_getDocumentsToc", { documentIds: [documentId] });
    }
    if (turn === 4) {
      assert.equal(result[0].sections[0].title, "Manuale");
      sectionId = result[0].sections[0].sectionId;
      return call("test_readSectionSummary", { documentId, sectionId });
    }
    if (turn === 5) {
      assert.deepEqual(result, {
        documentId, sectionId, title: "Manuale", summary: "Pressione nominale: 5 bar.", lineStart: 1, lineEnd: 2,
      });
      return call("test_readSection", { documentId, sectionId });
    }
    if (turn === 6) {
      assert.equal(result.documentId, documentId);
      assert.equal(result.sectionId, sectionId);
      assert.equal(result.markdown, "# Manuale\nPressione nominale: 5 bar.");
      assert.deepEqual([result.lineStart, result.lineEnd], [1, 2]);
      return call("test_read", { documentId, lines: { start: 2, end: 2 } });
    }
    assert.equal(result.sha, sha);
    assert.equal(result.text, "Pressione nominale: 5 bar.");
    return { content: answer };
  });

  const events = [];
  await traceQuestion(makeAgent(local.kb, llm), "Qual è la pressione?", event => events.push(event), true);
  assert.equal(turn, 7);
  assert.equal(events.find(event => event.title === "Risposta finale")?.detail, answer);
  assert.ok(events.some(event => event.title.startsWith("Risultato #6 test_read")));
  assert.match(events.find(event => event.title === "Metriche elaborazione").detail,
    /Token input: 140  ·  Token output: 28/);
});

test("senza embeddings una modalità TOC non valida permette al modello di correggere la chiamata", async () => {
  const kb = new DefaultKnowledgeBase({ id: "test", name: "Test" }, {});
  const calls = [];
  kb.searchDocumentsToc = async (...args) => { calls.push(args); return []; };
  let turn = 0;
  let feedback;
  const llm = offlineChat(({ messages }) => {
    if (++turn === 1) return call("test_searchDocumentsToc", { mode: "semantic", text: "pressione" });
    if (turn === 2) {
      feedback = messages.at(-1).content;
      return call("test_searchDocumentsToc", { text: "pressione" }, "retry-toc");
    }
    return { content: "Nessun indice trovato." };
  });
  await makeAgent(kb, llm).invoke({ messages: [{ role: "user", content: "Cerca indici sulla pressione." }] });
  assert.match(feedback, /Retry test_searchDocumentsToc without mode/);
  assert.deepEqual(calls, [["keyword", "pressione", undefined]]);
});

test("il tool semantico inoltra query e filtro alla KB", async () => {
  const searchResult = { hits: [] };
  const kb = new DefaultKnowledgeBase({ id: "test", name: "Test", searchEngine: { searchSemantic(text, options) {
    assert.equal(text, "alimentazione");
    assert.deepEqual(options, { topK: 5, filter: { tags: "manuale" } });
    return searchResult;
  } } }, {});
  let turn = 0;
  const llm = offlineChat(({ tools, messages }) => {
    assert.ok(tools.some(tool => tool.function.name === "test_searchSemantic"));
    if (++turn === 1) return call("test_searchSemantic", { text: "alimentazione", opts: { topK: 5, filter: { tags: "manuale" } } });
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
    assert.ok(tools.some(tool => tool.function.name === "test_searchSemantic"));
    return call("write_todos", { todos: [] });
  });
  await assert.rejects(makeAgent(new DefaultKnowledgeBase({ id: "test", name: "Test" }, {}), llm, { semantic: true }).invoke({
    messages: [{ role: "user", content: "Quali documenti ci sono?" }],
  }), /Only KB tools are available/);
});