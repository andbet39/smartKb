import assert from "node:assert/strict";
import test from "node:test";
import { KbSmartManager } from "smartDocKb";
import { offlineAzureChat } from "./azure-model.mjs";
import { makeDocument, openKb } from "./kb-fixtures.mjs";

const uuid = "019ab123-4567-7abc-8def-0123456789ab";

test("the manager sends catalog and search requests to separate dependencies", async () => {
  const calls = [];
  const store = {
    maxLimit: 3,
    async list(query) { calls.push(["catalog", query]); return { cards: [] }; },
  };
  const searchEngine = {
    async keywordSearch(query) { calls.push(["keyword", query]); return []; },
    async semanticSearch(query) { calls.push(["semantic", query]); return []; },
  };
  const kb = await KbSmartManager.open(store, searchEngine, { searchLimit: 7 });
  await kb.kbGetTableOfContents({ text: "power", tags: ["manual"] });
  await kb.kbDocumentSearchByKeywords({ kind: "keywords", keywords: ["power"] }, [uuid]);
  await kb.kbDocumentSearchSemantic("power", [uuid]);
  assert.deepEqual(calls.map(([kind, { limit }]) => [kind, limit]), [["catalog", 3], ["keyword", 7], ["semantic", 7]]);
  assert.equal(calls[0][1].text, "power");
  assert.deepEqual(calls[0][1].tags, ["manual"]);
  assert.deepEqual(calls[1][1].documentIds, [uuid]);
  assert.deepEqual(calls[2][1].documentIds, [uuid]);
  assert.ok(kb.getTools().some(tool => tool.name === "kbDocumentSearchSemantic"));
  const keywordOnly = await KbSmartManager.open(store, { keywordSearch: searchEngine.keywordSearch });
  assert.ok(!keywordOnly.getTools().some(tool => tool.name === "kbDocumentSearchSemantic"));
});

function toolCall(id, name, args) {
  return { id, type: "function", function: { name, arguments: JSON.stringify(args) } };
}

test("opening the KB does not require a model; agentic search does", async t => {
  const kb = await openKb(t);
  await assert.rejects(kb.kbAgentSearch("   "), /non può essere vuota/);
  await assert.rejects(kb.getAgentSearchTool().invoke({ question: "   " }));
  await assert.rejects(kb.kbAgentSearch("Cerca"), /richiede un modello/);
});

test("the supplied LangChain model handles both search entry points without root Azure configuration", async t => {
  const questions = [];
  const llm = offlineAzureChat(({ tools, messages }) => {
    assert.ok(tools.some(tool => tool.function.name === "kbDocumentReadSection"));
    const question = messages.at(-1).content;
    questions.push(question);
    return { content: `Risposta: ${question}` };
  });
  const kb = await openKb(t, [], { llm });
  assert.deepEqual(await kb.kbAgentSearch("Ricerca diretta"), {
    answer: "Risposta: Ricerca diretta", references: [],
  });
  assert.deepEqual(await kb.getAgentSearchTool().invoke({ question: "Ricerca via tool" }), {
    answer: "Risposta: Ricerca via tool", references: [],
  });
  assert.deepEqual(questions, ["Ricerca diretta", "Ricerca via tool"]);
});

test("TOCs can be discovered through tools without putting document metadata in the system prompt", async t => {
  const doc = makeDocument(uuid, "router.pdf", "Power supply", "Operating: 12 V.");
  const llm = offlineAzureChat(({ messages }) => {
    assert.match(messages[0].content, /kbGetTableOfContents.*kbDocumentGetTableOfContents/);
    assert.doesNotMatch(messages[0].content, /router\.pdf|Power supply|"documentId"|Operating: 12 V/);
    const last = messages.at(-1);
    const call = (id, name, args) => ({ content: null, tool_calls: [toolCall(id, name, args)] });
    if (last.role === "user") return call("catalog", "kbGetTableOfContents", {});
    const result = JSON.parse(last.content);
    switch (last.tool_call_id) {
      case "catalog": {
        const [{ documentId, originalFileName, shortDescription, sectionCount }] = result.documents;
        assert.deepEqual([documentId, originalFileName, shortDescription, sectionCount], [uuid, "router.pdf", "Power supply", 1]);
        return call("toc", "kbDocumentGetTableOfContents", { documentId });
      }
      case "toc": {
        const [{ source }] = result.sections;
        assert.equal(source.sectionTitle, "Power supply");
        return call("read", "kbDocumentReadSection", { documentId: source.documentId, section: { sectionId: source.sectionId } });
      }
      case "read":
        assert.equal(result.markdown, "Operating: 12 V.");
        return { content: "Use 12 V." };
      default:
        assert.fail("Unexpected tool response");
    }
  });
  const kb = await openKb(t, [doc], { llm });
  const { source } = await kb.kbDocumentReadSection(uuid, 5);
  assert.deepEqual(await kb.kbAgentSearch("What voltage?"), {
    answer: "Use 12 V.", references: [{ kind: "passage", source }],
  });
});

test("agentic search reports tool errors and bounds tool rounds", async t => {
  const docs = [
    makeDocument(1, "router.pdf", "Alimentazione", "Usa un alimentatore da 12 V."),
    makeDocument(2, "avvio.pdf", "Primo avvio", "Premi il pulsante di avvio."),
  ];

  const question = "Come avvio il router?";
  const answer = "- Usa **12 V** (router.pdf, riga 1, pagina 1).\n- Premi il pulsante (avvio.pdf, riga 1, pagina 1).";
  let turns = 0;
  let repeatedCalls = 0;
  const llm = offlineAzureChat(({ messages, tools }) => {
    if (messages[1].content === "Cerca") {
      assert.equal(messages.length, 2 + 2 * repeatedCalls);
      return { content: null, tool_calls: [toolCall(`repeat-${++repeatedCalls}`, "kbGetTableOfContents", {})] };
    }
    assert.equal(tools.length, 7);
    assert.ok(tools.every(tool => /^(List|Read|Search)\b/.test(tool.function.description)));
    assert.ok(tools.some(tool => tool.function.name === "kbDocumentReadSection"));
    switch (++turns) {
      case 1: {
        assert.deepEqual(messages.map(message => message.role), ["system", "user"]);
        const prompt = messages[0].content;
        assert.match(prompt, /^Answer in Markdown in the language of the question\./);
        assert.doesNotMatch(prompt, /alimentatore da 12 V|Premi il pulsante/);
        assert.equal(messages[1].content, question);
        return { content: null, tool_calls: [
          toolCall("call-1", "kbDocumentReadSection", { documentId: 1, section: { sectionId: 5 } }),
          toolCall("call-2", "kbDocumentReadSection", { documentId: 2, section: { sectionId: 99 } }),
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
          toolCall("call-4", "kbDocumentReadSection", { documentId: 2, section: { sectionId: 5 } }),
          toolCall("call-5", "kbDocumentSearchByKeywords", { query: { kind: "keywords", keywords: ["12 V"] } }),
          toolCall("call-6", "kbDocumentReadSummary", { documentId: 2 }),
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

  const kb = await openKb(t, docs, { llm });
  assert.equal(turns, 0);
  const { answer: markdown, references } = await kb.kbAgentSearch(question);
  assert.equal(markdown, answer);
  assert.deepEqual(references.map(({ kind, source }) => [kind, source.documentId, source.originalFileName]), [
    ["passage", 1, "router.pdf"], ["passage", 2, "avvio.pdf"],
  ]);
  for (const { source } of references) {
    assert.deepEqual([source.fromLine, source.toLine], [1, 1]);
    assert.deepEqual(source.pages, [{ pageNumber: 1, fromLine: 1, toLine: 1 }]);
  }
  assert.equal(turns, 3);
  await assert.rejects(kb.kbAgentSearch("Cerca"), /limite di 8 turni/);
  assert.equal(repeatedCalls, 9);
});

test("only cited keyword hits become references, while explicitly read ranges are retained", async t => {
  const docs = [
    makeDocument(1, "router.pdf", "Power", "Standby: 5 V.\nOperating: 12 V.\nMaximum: 24 V."),
    makeDocument(2, "startup.pdf", "Startup", "Press the power button.\nWait for the indicator."),
  ];
  const answer = "Use 12 V (router.pdf, line 2, page 1).";
  const llm = offlineAzureChat(({ messages }) => {
    if (messages.at(-1).role === "user") {
      const calls = [
        toolCall("search", "kbDocumentSearchByKeywords", { query: { kind: "keywords", keywords: ["V."] } }),
        toolCall("read", "kbDocumentReadSection", { documentId: 2, section: { sectionId: 5 } }),
      ];
      if (messages[1].content === "Read as well") {
        calls.push(toolCall("read-hit", "kbDocumentReadSection", { documentId: 1, section: { fromLine: 2, toLine: 2 } }));
      }
      return { content: null, tool_calls: calls };
    }
    const search = messages.find(message => message.tool_call_id === "search");
    assert.deepEqual(JSON.parse(search.content).matches.map(({ source }) => source.fromLine), [1, 2, 3]);
    if (messages[1].content === "Not found") return { content: "Not found." };
    return { content: "Use 12 V (router.pdf, line 2, page 1) [[kb:1:2]] [[kb:1:2]] [[kb:1:99]]." };
  });
  const kb = await openKb(t, docs, { llm });
  const read = await kb.kbDocumentReadSection(2, 5);
  const { matches: [, cited] } = await kb.kbDocumentSearchByKeywords({ kind: "keywords", keywords: ["V."] });
  const expected = [read.source, cited.source].map(source => ({ kind: "passage", source }));
  assert.deepEqual(await kb.kbAgentSearch("What is the operating voltage?"), { answer, references: expected });
  assert.deepEqual(await kb.kbAgentSearch("Read as well"), { answer, references: expected });
  assert.deepEqual(await kb.kbAgentSearch("Not found"), { answer: "Not found.", references: expected.slice(0, 1) });
});

test("contextual search merges overlapping windows and keeps actual match lines", async t => {
  const kb = await openKb(t, [
    makeDocument(1, "one.pdf", "One", "HIT\nneighbor\nhit\ncontext\ngap\nlast\nhit"),
    makeDocument(2, "two.pdf", "Two", "hit"),
  ]);
  const query = { kind: "regex", pattern: "^hit$" };
  const documentIds = [1];
  const plain = await kb.kbDocumentSearchByKeywords(query, documentIds);
  assert.deepEqual(plain, await kb.kbDocumentSearchByKeywords(query, documentIds, { beforeLines: 0, afterLines: 0 }));
  assert.deepEqual(plain.matches.map(({ snippet }) => snippet), ["HIT", "hit", "hit"]);
  const tool = kb.getTools().find(({ name }) => name === "kbDocumentSearchByKeywords");
  const { matches } = await tool.invoke({ query, documentIds, beforeLines: 1, afterLines: 1 });
  assert.deepEqual(matches.map(({ snippet, source, matchLines }) => [snippet, source.fromLine, source.toLine, matchLines]), [
    ["HIT\nneighbor\nhit\ncontext", 1, 4, [1, 3]],
    ["last\nhit", 6, 7, [7]],
  ]);
  assert.deepEqual(matches[0].source.pages, [{ pageNumber: 1, fromLine: 1, toLine: 4 }]);
  const asymmetric = await kb.kbDocumentSearchByKeywords(query, documentIds, { afterLines: 1 });
  assert.deepEqual(asymmetric.matches.map(({ source }) => [source.fromLine, source.toLine]), [[1, 2], [3, 4], [7, 7]]);
  for (const beforeLines of [-1, 1.5, 21]) {
    await assert.rejects(kb.kbDocumentSearchByKeywords(query, documentIds, { beforeLines }));
  }
});

test("contextual search reports when a window or text budget omits results", async t => {
  const kb = await openKb(t, [
    makeDocument(1, "many.pdf", "Many", Array(21).fill("hit\nneighbor").join("\n")),
    makeDocument(2, "long.pdf", "Long", `hit\nshort\nhit\n${"a".repeat(12_000)}`),
  ]);
  const query = { kind: "keywords", keywords: ["hit"] };
  const many = await kb.kbDocumentSearchByKeywords(query, [1], { afterLines: 1 });
  assert.equal(many.matches.length, 20);
  assert.equal(many.truncated, true);
  const long = await kb.kbDocumentSearchByKeywords(query, [2], { afterLines: 1 });
  assert.deepEqual(long.matches.map(({ snippet }) => snippet), ["hit\nshort"]);
  assert.equal(long.truncated, true);
});

test("the agent cites only referenced UUID contextual ranges, without leaking markers", async t => {
  const doc = makeDocument(uuid, "one.pdf", "One", "Heading\nKey\nValue: 12 V\nGap\nKey\nValue: 24 V");
  const llm = offlineAzureChat(({ messages }) => {
    if (messages.at(-1).role === "user") return { content: null, tool_calls: [
      toolCall("context", "kbDocumentSearchByKeywords", {
        query: { kind: "keywords", keywords: ["Key"] }, documentIds: [uuid], beforeLines: 1, afterLines: 1,
      }),
    ] };
    assert.match(JSON.parse(messages.at(-1).content).matches[0].snippet, /Value: 12 V/);
    return { content: `Use 12 V. [[kb:${uuid}:1:3]] [[kb:${uuid}:1:3]] [[kb:${uuid}:2:3]]` };
  });
  const kb = await openKb(t, [doc], { llm });
  const result = await kb.kbAgentSearch("What is the first value?");
  assert.equal(result.answer, "Use 12 V.");
  const { source } = await kb.kbDocumentReadSection(uuid, 1, 3);
  assert.deepEqual(result.references, [{ kind: "passage", source }]);
});