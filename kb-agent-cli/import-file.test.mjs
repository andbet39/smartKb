import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";
import { openLocalKnowledgeBase } from "smartdoc-kb-v2";
import { importFile } from "./import-file.mjs";
import { ingestionEngine } from "../test/model-fixture.mjs";

test("l'import conserva ID espliciti e MIME; gli ID generati distinguono file uguali", async t => {
  const root = await mkdtemp(join(tmpdir(), "kb-cli-import-"));
  const file = join(root, "listino prezzi.MD");
  const options = { id: "test", name: "Test", directory: join(root, "kb"), ingestionEngine };
  let local = openLocalKnowledgeBase(options);
  t.after(async () => { await local.close(); await rm(root, { recursive: true }); });

  await writeFile(file, "# Listino\nPrezzo iniziale");
  const explicit = await importFile(file, local.kb, "ERP-42");
  const generated = await importFile(file, local.kb);
  assert.equal(explicit.documentId, "ERP-42");
  assert.match(generated.documentId, /^[0-9a-f]{8}-[0-9a-f]{4}-7[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
  assert.equal(explicit.sha, generated.sha);
  assert.notEqual(explicit.documentId, generated.documentId);
  assert.equal(explicit.originalFileName, "listino prezzi.MD");
  assert.equal(explicit.contentType, "text/markdown");
  assert.equal(explicit.metadata, undefined);

  await writeFile(file, "# Listino\nPrezzo aggiornato");
  const updated = await importFile(file, local.kb, explicit.documentId);
  assert.notEqual(updated.sha, explicit.sha);
  await local.reconcile();
  await local.close();

  local = openLocalKnowledgeBase(options);
  assert.deepEqual(new Set((await local.kb.list()).items), new Set([explicit.documentId, generated.documentId]));
  const { hits } = await local.kb.searchKeyword("aggiornato");
  assert.equal(hits[0].originalFileName, "listino prezzi.MD");
  assert.equal(hits[0].title, "Listino");
  assert.equal((await local.kb.read(explicit.documentId)).originalFileName, "listino prezzi.MD");
  assert.deepEqual(hits.map(({ documentId, sha }) => ({ documentId, sha })), [
    { documentId: explicit.documentId, sha: updated.sha },
  ]);
});