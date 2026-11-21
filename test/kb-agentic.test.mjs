import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { persist } from "workspace-document-parser";
import { KbSmartManager } from "workspace-document-parser/kb";
import { mockDocumentAzure, mockRootEnv, offlineAzure, offlineAzureChat } from "./azure-model.mjs";

async function tempFolder(t) {
  const root = await mkdtemp(join(tmpdir(), "kb-agentic-"));
  t.after(() => rm(root, { recursive: true }));
  return root;
}

function saveDocument(folder, documentId, originalFileName, title, markdown) {
  const description = { summary: title, short_description: title, keywords: [] };
  const lineCount = markdown.split("\n").length;
  return persist({
    markdown,
    pages: [{ page: 1, range: [1, lineCount] }],
    map: {
      documentId, originalFileName, lineCount, ...description,
      sections: [{ id: 5, order: 1, title, range: [1, lineCount], tokens: 6, totalTokens: 6, ...description }],
    },
  }, folder);
}

function toolCall(id, name, args) {
  return { id, type: "function", function: { name, arguments: JSON.stringify(args) } };
}

function candidateToc(messages) {
  return JSON.parse(messages[0].content.split("Table of contents for candidate documents (JSON):\n")[1]);
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

test("TOCs can be discovered through tools without putting document metadata in the system prompt", async t => {
  const root = await tempFolder(t);
  await saveDocument(root, 1, "router.pdf", "Power supply", "Operating: 12 V.");
  const llm = offlineAzureChat(({ messages }) => {
    assert.match(messages[0].content, /kbGetTableOfContents.*kbFileGetTableOfContents/);
    assert.doesNotMatch(messages[0].content, /router\.pdf|Power supply|"documentId"|Operating: 12 V/);
    const last = messages.at(-1);
    const call = (id, name, args) => ({ content: null, tool_calls: [toolCall(id, name, args)] });
    if (last.role === "user") return call("catalog", "kbGetTableOfContents", {});
    const result = JSON.parse(last.content);
    switch (last.tool_call_id) {
      case "catalog": {
        const [{ source, shortDescription, sectionCount }] = result.documents;
        assert.deepEqual([source.originalFileName, shortDescription, sectionCount], ["router.pdf", "Power supply", 1]);
        return call("toc", "kbFileGetTableOfContents", { documentId: source.documentId });
      }
      case "toc": {
        const [{ source }] = result.sections;
        assert.equal(source.sectionTitle, "Power supply");
        return call("read", "kbFileReadSection", { documentId: source.documentId, section: { sectionId: source.sectionId } });
      }
      case "read":
        assert.equal(result.markdown, "Operating: 12 V.");
        return { content: "Use 12 V." };
      default:
        assert.fail("Unexpected tool response");
    }
  });
  const kb = await KbSmartManager.open(root, llm, undefined, { tocMode: "tools" });
  const { source } = await kb.kbFileReadSection(1, 5);
  assert.deepEqual(await kb.getAgentSearchTool().invoke({ question: "What voltage?" }), {
    answer: "Use 12 V.", references: [{ kind: "passage", source }],
  });
});

test("the decision model scores compact metadata in batches and sends only the highest ranked TOCs", async t => {
  const root = await tempFolder(t);
  const ids = Array.from({ length: 22 }, (_, i) => i + 1);
  for (const id of ids) await saveDocument(root, id, `${String(id).padStart(2, "0")}.txt`, `Title ${id}`, `Private text ${id}`);
  const batches = [];
  const observed = [];
  const decisionModel = offlineAzure((schema, messages) => {
    const { question, documents } = JSON.parse(messages[1].content);
    assert.equal(schema, "kb_document_relevance");
    assert.equal(question, "Compare sources");
    assert.deepEqual(new Set(Object.keys(documents[0])), new Set(["documentId", "originalFileName", "shortDescription", "keywords"]));
    batches.push(documents.map(doc => doc.documentId));
    const scores = { 1: 0.75, 2: 0.74, 21: 0.75, 22: 0.9 };
    return { scores: documents.map(({ documentId }) => ({ documentId, score: scores[documentId] ?? 0 })).reverse() };
  });
  const llm = offlineAzureChat(({ messages }) => {
    observed.push(candidateToc(messages));
    return { content: "Comparison" };
  });
  const kb = await KbSmartManager.open(root, llm, { decisionModel, threshold: 0.75, maxDocuments: 2 }, { tocMode: "tools" });
  assert.equal(batches.length, 0);
  await assert.rejects(kb.kbAgenticSearch("  "), /non può essere vuota/);
  assert.equal(await kb.kbAgenticSearch("Compare sources"), "Comparison");
  assert.equal((await kb.getAgentSearchTool().invoke({ question: "Compare sources" })).answer, "Comparison");
  assert.deepEqual(batches, [ids.slice(0, 20), ids.slice(20), ids.slice(0, 20), ids.slice(20)]);
  assert.deepEqual(observed.map(toc => toc.map(({ documentId, sections }) => [documentId, sections[0].title])), [
    [[22, "Title 22"], [1, "Title 1"]], [[22, "Title 22"], [1, "Title 1"]],
  ]);
});

test("selection with no candidates or bad decisions falls back to global keyword search", async t => {
  const root = await tempFolder(t);
  await saveDocument(root, 1, "router.pdf", "Hardware", "Operating: 12 V.");
  const llm = offlineAzureChat(({ messages }) => {
    assert.deepEqual(candidateToc(messages), []);
    assert.match(messages[0].content, /without a document filter/);
    if (messages.at(-1).role === "user") return { content: null, tool_calls: [
      toolCall("fallback", "kbFileSearchByKeywords", { query: { kind: "keywords", keywords: ["12 V"] } }),
    ] };
    assert.equal(JSON.parse(messages.at(-1).content).matches[0].source.documentId, 1);
    return { content: "Use 12 V. [[kb:1:1]]" };
  });
  for (const scores of [[{ documentId: 1, score: 0.4 }], [{ documentId: 1, score: 2 }], [{ documentId: 999, score: 1 }], [], null]) {
    const decisionModel = offlineAzure(() => {
      if (!scores) throw new Error("Offline deployment");
      return { scores };
    });
    const kb = await KbSmartManager.open(root, llm, { decisionModel }, { tocMode: "tools" });
    const result = await kb.getAgentSearchTool().invoke({ question: "What voltage?" });
    assert.equal(result.answer, "Use 12 V.");
    assert.deepEqual(result.references.map(ref => ref.source.documentId), [1]);
  }
});

test("decision configuration validates bounds and does not call the model for an empty catalog", async t => {
  const root = await tempFolder(t);
  const decisionModel = { withStructuredOutput: t.mock.fn(() => assert.fail("Unexpected decision call")) };
  await assert.rejects(KbSmartManager.open(root, undefined, { decisionModel, threshold: 1.1 }), /threshold/);
  await assert.rejects(KbSmartManager.open(root, undefined, { decisionModel, maxDocuments: 0 }), /maxDocuments/);
  const llm = offlineAzureChat(({ messages }) => {
    assert.deepEqual(candidateToc(messages), []);
    return { content: "Empty" };
  });
  const kb = await KbSmartManager.open(root, llm, { decisionModel });
  assert.equal(await kb.kbAgenticSearch("What is in the KB?"), "Empty");
  assert.equal(decisionModel.withStructuredOutput.mock.callCount(), 0);
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
    ["passage", 1, "router.pdf"], ["passage", 2, "avvio.pdf"],
  ]);
  for (const { source } of references) {
    assert.deepEqual([source.fromLine, source.toLine], [1, 1]);
    assert.deepEqual(source.pages, [{ pageNumber: 1, fromLine: 1, toLine: 1 }]);
  }
  assert.equal(turns, 3);
  await assert.rejects(kb.kbAgenticSearch("Cerca"), /limite di 8 turni/);
  assert.equal(repeatedCalls, 9);
});

test("only cited keyword hits become references, while explicitly read ranges are retained", async t => {
  const root = await tempFolder(t);
  await saveDocument(root, 1, "router.pdf", "Power", "Standby: 5 V.\nOperating: 12 V.\nMaximum: 24 V.");
  await saveDocument(root, 2, "startup.pdf", "Startup", "Press the power button.\nWait for the indicator.");
  const answer = "Use 12 V (router.pdf, line 2, page 1).";
  const llm = offlineAzureChat(({ messages }) => {
    if (messages.at(-1).role === "user") {
      const calls = [
        toolCall("search", "kbFileSearchByKeywords", { query: { kind: "keywords", keywords: ["V."] } }),
        toolCall("read", "kbFileReadSection", { documentId: 2, section: { sectionId: 5 } }),
      ];
      if (messages[1].content === "Read as well") {
        calls.push(toolCall("read-hit", "kbFileReadSection", { documentId: 1, section: { fromLine: 2, toLine: 2 } }));
      }
      return { content: null, tool_calls: calls };
    }
    const search = messages.find(message => message.tool_call_id === "search");
    assert.deepEqual(JSON.parse(search.content).matches.map(({ source }) => source.fromLine), [1, 2, 3]);
    if (messages[1].content === "Not found") return { content: "Not found." };
    return { content: "Use 12 V (router.pdf, line 2, page 1) [[kb:1:2]] [[kb:1:2]] [[kb:1:99]]." };
  });
  const kb = await KbSmartManager.open(root, llm);
  const search = kb.getAgentSearchTool();
  const read = await kb.kbFileReadSection(2, 5);
  const { matches: [, cited] } = await kb.kbFileSearchByKeywords({ kind: "keywords", keywords: ["V."] });
  const expected = [read.source, cited.source].map(source => ({ kind: "passage", source }));
  assert.deepEqual(await search.invoke({ question: "What is the operating voltage?" }), { answer, references: expected });
  assert.deepEqual(await search.invoke({ question: "Read as well" }), { answer, references: expected });
  assert.deepEqual(await search.invoke({ question: "Not found" }), { answer: "Not found.", references: expected.slice(0, 1) });
});

test("contextual search merges overlapping windows and keeps actual match lines", async t => {
  const root = await tempFolder(t);
  await saveDocument(root, 1, "one.pdf", "One", "HIT\nneighbor\nhit\ncontext\ngap\nlast\nhit");
  await saveDocument(root, 2, "two.pdf", "Two", "hit");
  const kb = await KbSmartManager.open(root);
  const query = { kind: "regex", pattern: "^hit$" };
  const fileSpec = { documentIds: [1] };
  const plain = await kb.kbFileSearchByKeywords(query, fileSpec);
  assert.deepEqual(plain, await kb.kbFileSearchByKeywords(query, fileSpec, { beforeLines: 0, afterLines: 0 }));
  assert.deepEqual(plain.matches.map(({ snippet }) => snippet), ["HIT", "hit", "hit"]);
  const tool = kb.getTools().find(({ name }) => name === "kbFileSearchByKeywords");
  const { matches } = await tool.invoke({ query, fileSpec, beforeLines: 1, afterLines: 1 });
  assert.deepEqual(matches.map(({ snippet, source, matchLines }) => [snippet, source.fromLine, source.toLine, matchLines]), [
    ["HIT\nneighbor\nhit\ncontext", 1, 4, [1, 3]],
    ["last\nhit", 6, 7, [7]],
  ]);
  assert.deepEqual(matches[0].source.pages, [{ pageNumber: 1, fromLine: 1, toLine: 4 }]);
  const asymmetric = await kb.kbFileSearchByKeywords(query, fileSpec, { afterLines: 1 });
  assert.deepEqual(asymmetric.matches.map(({ source }) => [source.fromLine, source.toLine]), [[1, 2], [3, 4], [7, 7]]);
  for (const beforeLines of [-1, 1.5, 21]) {
    await assert.rejects(kb.kbFileSearchByKeywords(query, fileSpec, { beforeLines }));
  }
});

test("contextual search reports when a window or text budget omits results", async t => {
  const root = await tempFolder(t);
  await saveDocument(root, 1, "many.pdf", "Many", Array(21).fill("hit\nneighbor").join("\n"));
  await saveDocument(root, 2, "long.pdf", "Long", `hit\nshort\nhit\n${"a".repeat(12_000)}`);
  const kb = await KbSmartManager.open(root);
  const query = { kind: "keywords", keywords: ["hit"] };
  const many = await kb.kbFileSearchByKeywords(query, { documentIds: [1] }, { afterLines: 1 });
  assert.equal(many.matches.length, 20);
  assert.equal(many.truncated, true);
  const long = await kb.kbFileSearchByKeywords(query, { documentIds: [2] }, { afterLines: 1 });
  assert.deepEqual(long.matches.map(({ snippet }) => snippet), ["hit\nshort"]);
  assert.equal(long.truncated, true);
});

test("the agent cites only referenced contextual ranges, without leaking markers", async t => {
  const root = await tempFolder(t);
  await saveDocument(root, 1, "one.pdf", "One", "Heading\nKey\nValue: 12 V\nGap\nKey\nValue: 24 V");
  const llm = offlineAzureChat(({ messages }) => {
    if (messages.at(-1).role === "user") return { content: null, tool_calls: [
      toolCall("context", "kbFileSearchByKeywords", { query: { kind: "keywords", keywords: ["Key"] }, beforeLines: 1, afterLines: 1 }),
    ] };
    assert.match(JSON.parse(messages.at(-1).content).matches[0].snippet, /Value: 12 V/);
    return { content: "Use 12 V. [[kb:1:1:3]] [[kb:1:1:3]] [[kb:1:2:3]]" };
  });
  const kb = await KbSmartManager.open(root, llm);
  const result = await kb.getAgentSearchTool().invoke({ question: "What is the first value?" });
  assert.equal(result.answer, "Use 12 V.");
  const { source } = await kb.kbFileReadSection(1, 1, 3);
  assert.deepEqual(result.references, [{ kind: "passage", source }]);
});