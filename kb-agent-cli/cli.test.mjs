import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { HumanMessage } from "@langchain/core/messages";
import { z } from "zod";
import { persist } from "workspace-document-parser";
import { KbSmartManager } from "workspace-document-parser/kb";
import { createCliDocumentSelection, createCliModel } from "./models.mjs";

const run = promisify(execFile);
const cliPath = fileURLToPath(new URL("./cli.mjs", import.meta.url));
const env = {
  AZURE_OPENAI_API_KEY: "deep-test-key",
  AZURE_OPENAI_ENDPOINT: "https://deep.example.test",
  AZURE_OPENAI_API_DEPLOYMENT_NAME: "deep-test",
  AZURE_OPENAI_API_VERSION: "2024-10-21",
  AZURE_OPENAI_MODEL: "gpt-4o",
  KB_SEARCH_AZURE_OPENAI_API_KEY: "kb-test-key",
  KB_SEARCH_AZURE_OPENAI_API_INSTANCE_NAME: "kb-instance",
  KB_SEARCH_AZURE_OPENAI_API_DEPLOYMENT_NAME: "kb-test",
  KB_SEARCH_AZURE_OPENAI_API_VERSION: "2025-04-01-preview",
  KB_SEARCH_AZURE_OPENAI_MODEL: "gpt-4o-mini",
};

test("the CLI uses independent Azure configuration for each model", async t => {
  const previousEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
  process.env.AZURE_OPENAI_ENDPOINT = env.AZURE_OPENAI_ENDPOINT;
  t.after(() => {
    if (previousEndpoint === undefined) delete process.env.AZURE_OPENAI_ENDPOINT;
    else process.env.AZURE_OPENAI_ENDPOINT = previousEndpoint;
  });
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    const { model } = JSON.parse(init.body);
    requests.push([String(url), new Headers(init.headers).get("api-key"), model]);
    return Response.json({
      id: "offline", object: "chat.completion", model,
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "OK" } }],
    });
  });

  await createCliModel("AZURE_OPENAI_", env).invoke("Cerca");
  await createCliModel("KB_SEARCH_AZURE_OPENAI_", env).invoke("Cerca");
  assert.deepEqual(requests, [
    ["https://deep.example.test/openai/deployments/deep-test/chat/completions?api-version=2024-10-21", "deep-test-key", "gpt-4o"],
    ["https://kb-instance.openai.azure.com/openai/deployments/kb-test/chat/completions?api-version=2025-04-01-preview", "kb-test-key", "gpt-4o-mini"],
  ]);
  assert.throws(() => createCliModel("KB_SEARCH_AZURE_OPENAI_", {
    ...env, KB_SEARCH_AZURE_OPENAI_API_KEY: "",
  }), /KB_SEARCH_AZURE_OPENAI_API_KEY/);
});

test("the selector uses SystemOne and reports normalized scores and token usage", async t => {
  assert.equal(createCliDocumentSelection(env), undefined);
  const selection = createCliDocumentSelection({
    ...env, KB_SEARCH_AZURE_OPENAI_ENDPOINT: "https://gateway.example.test",
    KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME: "Decision-1.1",
    KB_DECISION_THRESHOLD: "0.65", KB_DECISION_MAX_DOCUMENTS: "3",
  });
  assert.equal(selection.threshold, 0.65);
  assert.equal(selection.maxDocuments, 3);
  const input = { question: "What voltage?", documents: [{ documentId: 7, title: "Hardware" }, { documentId: 8, title: "Cooking" }] };
  const invokeInput = [new HumanMessage(JSON.stringify(input))];
  let reply = { doc_7: { type: "score", score: 1.5 }, doc_8: { type: "score", score: 0.2 } };
  let status = 200;
  const request = t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(String(url), "https://gateway.example.test/systemone");
    assert.equal(init.method, "POST");
    assert.equal(init.redirect, "error");
    assert.equal(new Headers(init.headers).get("authorization"), "Bearer kb-test-key");
    const body = JSON.parse(init.body);
    assert.equal(body.model, "Decision-1.1");
    assert.deepEqual(JSON.parse(body.state), input);
    assert.deepEqual(Object.keys(body.questions), ["doc_7", "doc_8"]);
    for (const id of [7, 8]) {
      const { type, criteria } = body.questions[`doc_${id}`];
      assert.equal(type, "score");
      assert.equal(criteria.length, 3);
      assert.ok(criteria.every(text => text.includes(`document ID ${id}`)));
    }
    return Response.json({ answers: reply, usage: { input_tokens: 40, output_tokens: 2 } }, { status });
  });
  const schema = z.object({ scores: z.array(z.object({ documentId: z.int(), score: z.number() })) });
  let usage;
  const model = selection.decisionModel.withStructuredOutput(schema, { name: "kb_document_relevance" });
  assert.deepEqual(await model.invoke(invokeInput, { callbacks: [{
    name: "usage", awaitHandlers: true,
    handleLLMEnd({ generations }) { usage = generations[0][0].message.usage_metadata; },
  }] }), { scores: [{ documentId: 7, score: 0.75 }, { documentId: 8, score: 0.1 }] });
  assert.deepEqual(usage, { input_tokens: 40, output_tokens: 2, total_tokens: 42 });

  reply = { doc_7: { type: "score", score: 1.5 } };
  await assert.rejects(model.invoke(invokeInput), /Invalid SystemOne relevance score/);
  status = 404;
  await assert.rejects(model.invoke(invokeInput), /404 SystemOne/);
  assert.equal(request.mock.callCount(), 3);
});

test("/delete rimuove per ID, aggiorna il pannello e segnala gli ID non validi", async t => {
  const root = await mkdtemp(join(tmpdir(), "cli-delete-"));
  t.after(() => rm(root, { recursive: true }));
  for (const documentId of [1, 2, 3]) {
    await persist({ markdown: "Test", map: {
      documentId, originalFileName: `${documentId}.txt`, lineCount: 1,
      summary: "", short_description: "", keywords: [], sections: [],
    } }, join(root, `doc-${documentId}`));
  }

  const cli = run(process.execPath, [cliPath, root], {
    env,
    timeout: 15_000,
  });
  cli.child.stdin.end("/delete nope\n/delete 99\n/delete #2\n/delete 3\n");
  const { stdout } = await cli;
  assert.match(stdout, /Uso: \/delete <ID documento>/);
  assert.match(stdout, /Unknown document 99/);
  assert.match(stdout, /Rimosso dalla KB: #2 2\.txt/);
  assert.match(stdout, /Rimosso dalla KB: #3 3\.txt/);
  assert.match(stdout, /Documenti in KB \(1\)/);
  const kb = await KbSmartManager.open(root);
  assert.deepEqual((await kb.kbGetTableOfContents()).documents.map(doc => doc.source.documentId), [1]);
});

test("/add usa il deployment di importazione dal file di ambiente della CLI", async t => {
  const root = await mkdtemp(join(tmpdir(), "cli-add-"));
  t.after(() => rm(root, { recursive: true }));
  const folder = join(root, "kb");
  await mkdir(folder);
  await writeFile(join(root, "listino.csv"), "prodotto,prezzo\nlibro,100");

  const requests = [];
  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw);
    requests.push([req.url, req.headers["api-key"], body.model, body.response_format?.type]);
    const content = JSON.stringify({
      continuesPrevious: false, sections: [{
        startLine: 1, endLine: Number(/through (\d+)/.exec(body.messages[0].content)?.[1]),
        title: "Listino", summary: "Prezzi", keywords: ["prezzi"], short_description: "Prezzi",
      }],
    });
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({
      id: "offline-import", object: "chat.completion", model: body.model,
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content } }],
    }));
  });
  server.listen(0, "127.0.0.1");
  t.after(() => new Promise(resolve => server.close(resolve)));
  await once(server, "listening");

  const cliEnv = {
    ...env,
    AZURE_OPENAI_ENDPOINT: `http://127.0.0.1:${server.address().port}`,
    KB_SEARCH_AZURE_OPENAI_ENDPOINT: `http://127.0.0.1:${server.address().port}`,
    KB_IMPORT_AZURE_OPENAI_ENDPOINT: `http://127.0.0.1:${server.address().port}`,
    KB_IMPORT_AZURE_OPENAI_API_KEY: "import-test-key",
    KB_IMPORT_AZURE_OPENAI_API_DEPLOYMENT_NAME: "import-test",
    KB_IMPORT_AZURE_OPENAI_API_VERSION: "2025-04-01-preview",
    KB_IMPORT_AZURE_OPENAI_MODEL: "gpt-4o-mini",
  };
  await writeFile(join(root, ".env"), Object.entries(cliEnv).map(([key, value]) => `${key}=${value}`).join("\n"));
  const cli = run(process.execPath, ["--env-file=.env", cliPath, folder], {
    cwd: root, env: {}, timeout: 15_000,
  });
  cli.child.stdin.end("/add listino.csv\n");
  const { stdout } = await cli;
  assert.match(stdout, /Pronto nella KB: #1 listino\.csv/);
  assert.deepEqual(requests, [[
    "/openai/deployments/import-test/chat/completions?api-version=2025-04-01-preview",
    "import-test-key", "gpt-4o-mini", "json_schema",
  ]]);
});