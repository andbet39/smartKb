import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { persist } from "workspace-document-parser";
import { KbSmartManager } from "workspace-document-parser/kb";
import { mockDocumentAzure, mockRootEnv, offlineAzureChat } from "./azure-model.mjs";

async function tempFolder(t) {
  const root = await mkdtemp(join(tmpdir(), "kb-agentic-"));
  t.after(() => rm(root, { recursive: true }));
  return root;
}

function saveDocument(folder, documentId, originalFileName, title, markdown) {
  const description = { summary: title, short_description: title, keywords: [] };
  return persist({
    markdown,
    pages: [{ page: 1, range: [1, 1] }],
    map: {
      documentId, originalFileName, lineCount: 1, ...description,
      sections: [{ id: 5, order: 1, title, range: [1, 1], tokens: 6, totalTokens: 6, ...description }],
    },
  }, folder);
}

function toolCall(id, name, args) {
  return { id, type: "function", function: { name, arguments: JSON.stringify(args) } };
}

test("opening the KB does not require Azure; agentic search validates the root configuration on demand", async t => {
  mockRootEnv(t, "");
  const kb = await KbSmartManager.open(await tempFolder(t));
  await assert.rejects(kb.kbAgenticSearch("   "), /non può essere vuota/);
  await assert.rejects(kb.kbAgenticSearch("Cerca"), /AZURE_OPENAI_MODEL mancante/);
});

test("the supplied LangChain model handles both search entry points without root Azure configuration", async t => {
  mockRootEnv(t, "");
  const questions = [];
  const llm = offlineAzureChat(({ tools, messages }) => {
    assert.ok(tools.some(tool => tool.function.name === "kbFileReadSection"));
    const question = messages.at(-1).content;
    questions.push(question);
    return { content: `Risposta: ${question}` };
  });
  const kb = await KbSmartManager.open(await tempFolder(t), llm);
  assert.equal(await kb.kbAgenticSearch("Ricerca diretta"), "Risposta: Ricerca diretta");
  assert.deepEqual(await kb.getAgentSearchTool().invoke({ question: "Ricerca via tool" }), {
    answer: "Risposta: Ricerca via tool", references: [],
  });
  assert.deepEqual(questions, ["Ricerca diretta", "Ricerca via tool"]);
});

test("agentic search uses the root model, sends every TOC, and bounds tool rounds", async t => {
  const root = await tempFolder(t);
  const manuali = join(root, "manuali");
  const procedure = join(root, "procedure");
  await saveDocument(join(manuali, "dispositivi"), 1, "router.pdf", "Alimentazione", "Usa un alimentatore da 12 V.");
  await saveDocument(procedure, 2, "avvio.pdf", "Primo avvio", "Premi il pulsante di avvio.");

  const question = "Come avvio il router?";
  const answer = "- Usa **12 V** (router.pdf, riga 1, pagina 1).\n- Premi il pulsante (avvio.pdf, riga 1, pagina 1).";
  let turns = 0;
  let repeatedCalls = 0;
  mockDocumentAzure(t, ({ messages, tools }) => {
    if (messages[1].content === "Cerca") {
      assert.equal(messages.length, 2 + 2 * repeatedCalls);
      return { content: null, tool_calls: [toolCall(`repeat-${++repeatedCalls}`, "kbGetTableOfContents", {})] };
    }
    assert.equal(tools.length, 7);
    assert.ok(tools.every(tool => /^(List|Read|Search)\b/.test(tool.function.description)));
    assert.ok(tools.some(tool => tool.function.name === "kbFileReadSection"));
    switch (++turns) {
      case 1: {
        assert.deepEqual(messages.map(message => message.role), ["system", "user"]);
        const prompt = messages[0].content;
        assert.match(prompt, /^Answer in Markdown in the language of the question\./);
        const toc = JSON.parse(prompt.split("Table of contents for all loaded documents (JSON):\n")[1]);
        assert.deepEqual(toc.map(({ documentId, originalFileName, sections }) =>
          [documentId, originalFileName, sections[0].sectionId, sections[0].title]), [
          [1, "router.pdf", 5, "Alimentazione"],
          [2, "avvio.pdf", 5, "Primo avvio"],
        ]);
        assert.doesNotMatch(prompt, /alimentatore da 12 V|Premi il pulsante/);
        assert.equal(messages[1].content, question);
        return { content: null, tool_calls: [
          toolCall("call-1", "kbFileReadSection", { documentId: 1, section: { sectionId: 5 } }),
          toolCall("call-2", "kbFileReadSection", { documentId: 2, section: { sectionId: 99 } }),
          toolCall("call-3", "missingTool", {}),
        ] };
      }
      case 2: {
        const [read, badSection, unknownTool] = messages.slice(-3);
        assert.deepEqual([read, badSection, unknownTool].map(msg => [msg.role, msg.tool_call_id]), [
          ["tool", "call-1"], ["tool", "call-2"], ["tool", "call-3"],
        ]);
        const { markdown, source } = JSON.parse(read.content);
        assert.equal(markdown, "Usa un alimentatore da 12 V.");
        assert.deepEqual(source.pages, [{ pageNumber: 1, fromLine: 1, toLine: 1 }]);
        assert.match(badSection.content, /Check the arguments/);
        assert.match(unknownTool.content, /Tool unavailable/);
        return { content: null, tool_calls: [
          toolCall("call-4", "kbFileReadSection", { documentId: 2, section: { sectionId: 5 } }),
          toolCall("call-5", "kbFileSearchByKeywords", { query: { kind: "keywords", keywords: ["12 V"] } }),
          toolCall("call-6", "kbFileReadSummary", { documentId: 2 }),
        ] };
      }
      case 3:
        assert.equal(messages.at(-3).tool_call_id, "call-4");
        assert.equal(JSON.parse(messages.at(-3).content).markdown, "Premi il pulsante di avvio.");
        return { content: answer };
      default:
        assert.fail("Unexpected model turn");
    }
  });

  const kb = await KbSmartManager.open([manuali, procedure]);
  assert.equal(turns, 0);
  const { answer: markdown, references } = await kb.getAgentSearchTool().invoke({ question });
  assert.equal(markdown, answer);
  assert.deepEqual(references.map(({ kind, source }) => [kind, source.documentId, source.originalFileName]), [
    ["passage", 1, "router.pdf"], ["passage", 2, "avvio.pdf"], ["summary", 2, "avvio.pdf"],
  ]);
  for (const { source } of references.slice(0, 2)) {
    assert.deepEqual([source.fromLine, source.toLine], [1, 1]);
    assert.deepEqual(source.pages, [{ pageNumber: 1, fromLine: 1, toLine: 1 }]);
  }
  assert.ok(!("fromLine" in references[2].source));
  assert.equal(turns, 3);
  await assert.rejects(kb.kbAgenticSearch("Cerca"), /limite di 8 turni/);
  assert.equal(repeatedCalls, 9);
});