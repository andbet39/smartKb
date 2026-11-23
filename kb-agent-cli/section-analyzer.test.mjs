import assert from "node:assert/strict";
import { test } from "node:test";
import { createCliSectionAnalyzer } from "./section-analyzer.mjs";

const range = (lineStart, lineEnd) => ({ title: "Titolo", shortDescription: "Breve", summary: "Sintesi",
  keywords: ["taratura"], lineStart, lineEnd });

test("the CLI section model receives bounded windows with absolute line coordinates", async () => {
  const requests = [];
  const analyzer = createCliSectionAnalyzer({ withStructuredOutput(schema, options) {
    if (options.name === "document_metadata") return { async invoke() { assert.fail("unexpected metadata call"); } };
    assert.equal(options.name, "document_sections");
    return { async invoke(messages) {
      const request = messages[1].content;
      requests.push(request);
      const [, start, end] = /^Map lines (\d+)–(\d+)/u.exec(request);
      return schema.parse({ sections: [range(Number(start), Number(end))] });
    } };
  } });
  assert.deepEqual(await analyzer.analyze({ text: "" }), []);
  const text = Array.from({ length: 83 }, (_, index) => `Linea ${index + 1}`).join("\n");
  assert.deepEqual(await analyzer.analyze({ text }), [range(1, 80), range(81, 83)]);
  assert.match(requests[1], /81: Linea 81/u);
});

test("the CLI section model rejects ranges with uncovered lines", async () => {
  const analyzer = createCliSectionAnalyzer({ withStructuredOutput() {
    return { async invoke() { return { sections: [range(1, 1)] }; } };
  } });
  await assert.rejects(analyzer.analyze({ text: "first\nsecond" }), /do not cover/u);
});