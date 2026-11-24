import assert from "node:assert/strict";
import { test } from "node:test";
import { createLlmIngestionEngine } from "../dist/index.js";

const range = (lineStart, lineEnd) => ({ title: "Titolo", shortDescription: "Breve", summary: "Sintesi",
  keywords: ["taratura"], lineStart, lineEnd });

test("LLM ingestion maps bounded windows to contiguous document sections", async () => {
  const requests = [];
  const engine = createLlmIngestionEngine({ withStructuredOutput(schema, options) {
    if (options.name === "document_metadata") return { async invoke() {
      assert.ok(requests.length);
      return { title: "Documento", author: null, createdAt: null, modifiedAt: null, tags: [] };
    } };
    assert.equal(options.name, "document_sections");
    return { async invoke(messages) {
      const request = messages[1].content;
      requests.push(request);
      const [, start, end] = /^Map lines (\d+)–(\d+)/u.exec(request);
      return schema.parse({ sections: [range(Number(start), Number(end))] });
    } };
  } });
  assert.deepEqual((await engine.ingest("")).sections, []);
  const text = Array.from({ length: 83 }, (_, index) => `Linea ${index + 1}`).join("\n");
  const map = await engine.ingest(text);
  assert.equal(map.title, "Documento");
  assert.deepEqual(map.sections, [{ ...range(1, 80), sectionId: 1, order: 1 }, { ...range(81, 83), sectionId: 2, order: 2 }]);
  assert.match(requests[1], /81: Linea 81/u);
});

test("LLM ingestion rejects ranges with uncovered lines", async () => {
  let calls = 0;
  const engine = createLlmIngestionEngine({ withStructuredOutput() {
    return { async invoke() { calls++; return { sections: [range(1, 1)] }; } };
  } });
  await assert.rejects(engine.ingest("first\nsecond"), /lines 1–2 after retry: Sections do not cover lines 2–2/u);
  assert.equal(calls, 2);
});

test("an overlap retries only the rejected window with the expected boundary", async () => {
  const calls = [];
  const events = [];
  const engine = createLlmIngestionEngine({ withStructuredOutput(_, { name }) {
    if (name === "document_metadata") return { async invoke() {
      return { title: null, author: null, createdAt: null, modifiedAt: null, tags: [] };
    } };
    return { async invoke(messages) {
      calls.push(messages);
      if (calls.length === 1) return { sections: [range(1, 80)] };
      if (calls.length === 2) return { sections: [range(81, 82), range(82, 84)] };
      return { sections: [range(81, 82), range(83, 84)] };
    } };
  } });
  const map = await engine.ingest(Array(84).fill("test").join("\n"), { onProgress: e => events.push(e) });
  assert.equal(calls.length, 3);
  assert.equal(calls[1][1].content, calls[2][1].content);
  assert.match(calls[2][0].content, /returned 82–84; expected start 83/u);
  assert.ok(events.some(e => e.message.startsWith("Retrying lines 81–84")));
  assert.deepEqual(map.sections.map(s => [s.lineStart, s.lineEnd]), [[1, 80], [81, 82], [83, 84]]);
});

test("ingestion never substitutes missing model fields or truncates an oversized line", async () => {
  const { keywords, ...incomplete } = range(1, 1);
  const engine = createLlmIngestionEngine({ withStructuredOutput() {
    return { async invoke() { return { sections: [incomplete] }; } };
  } });
  await assert.rejects(engine.ingest("calibration"), /keywords/u);
  await assert.rejects(engine.ingest("x".repeat(4001)), /line 1 exceeds/u);
});