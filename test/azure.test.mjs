import test from "node:test";
import assert from "node:assert/strict";
import { AzureChatOpenAI } from "@langchain/openai";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser } from "../dist/index.js";

const required = ["AZURE_OPENAI_API_KEY", "AZURE_OPENAI_API_INSTANCE_NAME", "AZURE_OPENAI_API_DEPLOYMENT_NAME", "AZURE_OPENAI_API_VERSION"];
const missing = required.filter(name => !process.env[name]);

test("live Azure OpenAI: structured sections cover a synthetic CSV", {
  skip: missing.length ? `Missing environment variables: ${missing.join(", ")}` : false,
}, async () => {
  const llm = new AzureChatOpenAI({ model: "gpt-4o", maxRetries: 0, timeout: 60000 });
  const tokenizer = getEncoding("o200k_base");
  const parser = createDocumentParser({ llm, countTokens: text => tokenizer.encode(text).length });
  const doc = await parser.parseDocument({
    documentId: 3, fileName: "returns.csv", bytes: Buffer.from("item,return_days\nbook,30\nlamp,15"),
  });
  assert.ok(doc.map.summary.trim());
  let next = 1;
  for (const section of doc.map.sections) {
    assert.equal(section.range[0], next);
    assert.equal(section.totalTokens, tokenizer.encode(doc.markdown).length);
    next = section.range[1] + 1;
  }
  assert.equal(next, doc.map.lineCount + 1);
});
