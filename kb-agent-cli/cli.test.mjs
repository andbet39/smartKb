import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { DocumentMapStore, LocalObjectStore, openLocalKnowledgeBase } from "smartdoc-kb-v2";
import { createCliEmbedder, createCliModel } from "./models.mjs";
import { ingestionEngine } from "../test/model-fixture.mjs";

const run = promisify(execFile);
const cliPath = fileURLToPath(new URL("./cli.mjs", import.meta.url));
const chatEnv = {
  AZURE_OPENAI_API_KEY: "chat-test-key", AZURE_OPENAI_ENDPOINT: "https://chat.example.test",
  AZURE_OPENAI_API_DEPLOYMENT_NAME: "chat-test", AZURE_OPENAI_API_VERSION: "2024-10-21",
  AZURE_OPENAI_MODEL: "gpt-4o",
};

test("Azure chat ed embeddings usano configurazioni distinte; gli embeddings sono facoltativi", async t => {
  assert.equal(createCliEmbedder(chatEnv), undefined);
  const env = { ...chatEnv,
    KB_SEARCH_AZURE_OPENAI_API_KEY: "embed-test-key",
    KB_SEARCH_AZURE_OPENAI_ENDPOINT: "https://embed.example.test/",
    KB_SEARCH_AZURE_OPENAI_API_VERSION: "2024-10-21",
    KB_SEARCH_AZURE_OPENAI_EMBEDDINGS_DEPLOYMENT_NAME: "embed-test",
    KB_SEARCH_AZURE_OPENAI_EMBEDDINGS_DIMENSIONS: "3",
  };
  const requests = [];
  t.mock.method(globalThis, "fetch", async (url, init) => {
    const body = JSON.parse(init.body);
    requests.push([String(url), new Headers(init.headers).get("api-key"), body.dimensions]);
    if (String(url).includes("/embeddings")) {
      const embedding = body.encoding_format === "base64"
        ? Buffer.from(new Float32Array([1, 0, 0]).buffer).toString("base64") : [1, 0, 0];
      return Response.json({ data: [{ index: 0, embedding }], model: body.model });
    }
    return Response.json({ id: "offline", object: "chat.completion", model: body.model,
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "OK" } }] });
  });
  await createCliModel("AZURE_OPENAI_", env).invoke("Cerca");
  const embedder = createCliEmbedder(env);
  assert.equal(embedder.dimensions, 3);
  assert.deepEqual(await embedder.embedQuery("Cerca"), [1, 0, 0]);
  assert.deepEqual(await embedder.embedDocuments(["Manuale"]), [[1, 0, 0]]);
  const embeddingRequest = ["https://embed.example.test/openai/deployments/embed-test/embeddings?api-version=2024-10-21", "embed-test-key", 3];
  assert.deepEqual(requests, [
    ["https://chat.example.test/openai/deployments/chat-test/chat/completions?api-version=2024-10-21", "chat-test-key", undefined],
    embeddingRequest, embeddingRequest,
  ]);
  assert.throws(() => createCliEmbedder({ ...env, KB_SEARCH_AZURE_OPENAI_EMBEDDINGS_DIMENSIONS: "0" }), /DIMENSIONS/);
});

test("il modello Azure ritenta la stessa richiesta dopo ECONNRESET e propaga un secondo reset", async t => {
  const requests = [];
  t.mock.method(globalThis, "fetch", async (_url, init) => {
    requests.push(init.body);
    if (requests.length !== 2) {
      throw new TypeError("fetch failed", { cause: Object.assign(new Error("socket reset"), { code: "ECONNRESET" }) });
    }
    return Response.json({ id: "offline", object: "chat.completion", model: "gpt-4o",
      choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: "OK" } }] });
  });
  const model = createCliModel("AZURE_OPENAI_", chatEnv);
  assert.equal((await model.invoke("prima finestra")).content, "OK");
  assert.equal(requests.length, 2);
  assert.equal(requests[0], requests[1]);
  await assert.rejects(model.invoke("seconda finestra"), error => error.cause?.cause?.code === "ECONNRESET");
  assert.equal(requests.length, 4);
  assert.equal(requests[2], requests[3]);
});

test("/add salva una mappa prodotta dal modello chat; /delete rimuove gli originali", async t => {
  const root = await mkdtemp(join(tmpdir(), "kb-cli-"));
  t.after(() => rm(root, { recursive: true }));
  const directory = join(root, "kb");
  const options = { id: "kb-studio", name: "KB Studio", directory, ingestionEngine };
  const seed = openLocalKnowledgeBase(options);
  try {
    for (const id of ["ERP-42", "#letterale"]) {
      await seed.kb.write(Buffer.from("Da rimuovere"), { contentType: "text/plain" }, id);
    }
    await seed.reconcile();
  } finally { await seed.close(); }

  const markdown = "# Manuale\nTurbina idraulica.";
  await writeFile(join(root, "manuale tecnico.md"), markdown);
  const offline = await mockSectionModel(root);
  const cli = run(process.execPath, ["--import", pathToFileURL(offline).href, cliPath, directory], { cwd: root, env: chatEnv, timeout: 60_000 });
  cli.child.stdin.end('/add "manuale tecnico.md"\n/delete #ERP-42\n/delete #ERP-42\n/delete "#letterale"\n');
  const { stdout } = await cli;
  const added = /Pronto nella KB: #(\S+) manuale tecnico\.md/.exec(stdout);
  assert.ok(added, stdout);
  assert.equal([...stdout.matchAll(/Cancellazione richiesta per #ERP-42/g)].length, 2);
  assert.match(stdout, /Cancellazione richiesta per ##letterale/);

  const [, documentId] = added;
  for (const message of ["Markdown conversion complete", "Document map complete", "Section indexes published"]) {
    assert.ok(stdout.includes(`#${documentId} · 100% · ${message}`), stdout);
  }
  const objects = new LocalObjectStore(join(directory, "originals"));
  const store = new DocumentMapStore(objects);
  assert.equal((await store.readDocumentSection(documentId, 1)).shortDescription, "Descrizione dal modello");
  assert.deepEqual((await store.readDocumentSection(documentId, 1)).keywords, ["energia idraulica"]);
  const map = await store.readDocumentMap(documentId);
  assert.equal(map.title, "Manuale tecnico");
  assert.deepEqual(map.createdAt, new Date("2026-11-23"));
  assert.deepEqual(map.tags, ["turbine"]);
  assert.equal(map.modifiedAt, undefined);
  objects.close();
  const reopened = openLocalKnowledgeBase(options);
  try {
    assert.deepEqual((await reopened.kb.list()).items, [documentId]);
    assert.match((await reopened.kb.read(documentId)).text, /Turbina idraulica/);
    assert.deepEqual((await reopened.kb.searchKeyword("turbina")).hits.map(hit => hit.documentId), [documentId]);
    assert.equal((await readdir(join(directory, "originals"))).length, 1);
  } finally { await reopened.close(); }
});

test("/add rifiuta metadati non validi senza annunciare il completamento", async t => {
  const root = await mkdtemp(join(tmpdir(), "kb-cli-invalid-"));
  t.after(() => rm(root, { recursive: true }));
  const directory = join(root, "kb");
  const offline = await mockSectionModel(root);
  await writeFile(join(root, "invalid.md"), "Invalid metadata");
  const rejected = run(process.execPath, ["--import", pathToFileURL(offline).href, cliPath, directory], { cwd: root, env: chatEnv, timeout: 60_000 });
  rejected.child.stdin.end('/add invalid.md\n');
  await assert.rejects(rejected, error => {
    assert.equal(error.code, 1, `${error.stdout}\n${error.stderr}`);
    assert.match(error.stderr, /modifiedAt/);
    assert.doesNotMatch(error.stdout, /Pronto nella KB/);
    return true;
  });
});

async function mockSectionModel(directory) {
  const path = join(directory, "mock-azure.mjs");
  await writeFile(path, `
    globalThis.fetch = async (url, init) => {
      const body = JSON.parse(init.body);
      const tool = body.tools?.[0]?.function.name;
      const range = /^Map lines (\\d+)–(\\d+)/u.exec(body.messages.at(-1).content);
      const content = JSON.stringify(range ? { sections: [{ title: 'Titolo dal modello', shortDescription: 'Descrizione dal modello',
        summary: 'Sintesi dal modello', keywords: [' energia idraulica ', 'Energia idraulica'], lineStart: Number(range[1]), lineEnd: Number(range[2]) }] }
        : { title: 'Manuale tecnico', author: null, createdAt: '2026-11-23',
          modifiedAt: body.messages.at(-1).content === 'Invalid metadata' ? '2026-02-30' : null, tags: [' turbine ', 'turbine'] });
      const message = tool ? { role: 'assistant', content: null, tool_calls: [
        { id: 'tool-1', type: 'function', function: { name: tool, arguments: content } },
      ] } : { role: 'assistant', content };
      return Response.json({ id: 'offline', object: 'chat.completion', model: body.model,
        choices: [{ index: 0, finish_reason: tool ? 'tool_calls' : 'stop', message }] });
    };
  `);
  return path;
}