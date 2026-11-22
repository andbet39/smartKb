import test from "node:test";
import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { once } from "node:events";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";
import { createPosixStore } from "smartDocKb";
import { makeDocument } from "../test/kb-fixtures.mjs";
import { createCliModel } from "./models.mjs";

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

test("/delete rimuove per ID, aggiorna il pannello e segnala gli ID non validi", async t => {
  const root = await mkdtemp(join(tmpdir(), "cli-delete-"));
  t.after(() => rm(root, { recursive: true }));
  const store = await createPosixStore({ root });
  const uuid = "0195f876-18a4-7ba3-b8c2-7ba84c28cb94";
  for (const documentId of [1, 2, 3]) await store.add(makeDocument(documentId, `${documentId}.txt`, "", "Test"));
  await store.add(makeDocument(uuid, "uuid.txt", "", "Test"));
  await store.close();

  const cli = run(process.execPath, [cliPath, root], {
    env,
    timeout: 15_000,
  });
  cli.child.stdin.end(`/delete nope\n/delete 9007199254740992\n/delete 99\n/delete #2\n/delete 3\n/delete #${uuid}\n`);
  const { stdout } = await cli;
  assert.equal([...stdout.matchAll(/Uso: \/delete <ID documento>/g)].length, 2);
  assert.match(stdout, /Unknown document 99/);
  assert.match(stdout, /Rimosso dalla KB: #2 2\.txt/);
  assert.match(stdout, /Rimosso dalla KB: #3 3\.txt/);
  assert.ok(stdout.includes(`Rimosso dalla KB: #${uuid} uuid.txt`));
  assert.match(stdout, /Documenti in KB \(1\)/);
  const reopened = await createPosixStore({ root });
  t.after(() => reopened.close());
  assert.deepEqual((await reopened.list({ limit: 10 })).cards.map(card => card.documentId), [1]);
});

test("/add usa il deployment di importazione dal file di ambiente della CLI", async t => {
  const root = await mkdtemp(join(tmpdir(), "cli-add-"));
  t.after(() => rm(root, { recursive: true }));
  const folder = join(root, "kb");
  await mkdir(folder);
  await writeFile(join(root, "listino.csv"), "prodotto,prezzo\nlibro,100");

  const requests = [];
  const embeddingUrls = [];
  const server = createServer(async (req, res) => {
    let raw = "";
    for await (const chunk of req) raw += chunk;
    const body = JSON.parse(raw);
    if (req.url.includes("/embeddings")) {
      embeddingUrls.push(req.url);
      const inputs = [body.input].flat();
      const vector = [1, 0, 0];
      const embedding = body.encoding_format === "base64"
        ? Buffer.from(new Float32Array(vector).buffer).toString("base64") : vector;
      res.writeHead(200, { "Content-Type": "application/json" });
      return res.end(JSON.stringify({
        object: "list", model: body.model,
        data: inputs.map((_, index) => ({ object: "embedding", index, embedding })),
      }));
    }
    requests.push([req.url, req.headers["api-key"], body.model, body.response_format?.type]);
    const content = JSON.stringify({
      continuesPrevious: false, sections: [{
        fromLine: 1, toLine: Number(/through (\d+)/.exec(body.messages[0].content)?.[1]),
        title: "Listino", summary: "Prezzi", keywords: ["prezzi"], shortDescription: "Prezzi",
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
  const added = /Pronto nella KB: #([\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}) listino\.csv/i.exec(stdout);
  assert.ok(added, stdout);
  const [, id] = added;
  const manifest = JSON.parse(await readFile(join(folder, `doc-${id}`, "manifest.json"), "utf8"));
  assert.equal(manifest.map.documentId, id);
  assert.deepEqual(requests, [[
    "/openai/deployments/import-test/chat/completions?api-version=2025-04-01-preview",
    "import-test-key", "gpt-4o-mini", "json_schema",
  ]]);
  assert.ok(embeddingUrls.length > 0);
  assert.ok(embeddingUrls.every(url => url.startsWith("/openai/deployments/text-embedding-3-large/embeddings")));
});