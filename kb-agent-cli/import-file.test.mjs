import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { createPosixStore, KbSmartManager, POSIXSearchEngine } from "smartDocKb";
import { offlineAzure, offlineAzureChat } from "../test/azure-model.mjs";
import { importFile } from "./import-file.mjs";

test("import: avanzamento reale, file omonimi distinti e ricerca dopo riapertura", async t => {
  const root = await mkdtemp(join(tmpdir(), "cli-import-"));
  const folder = join(root, "kb"), file = join(root, "listino prezzi.csv");
  let store, searchEngine;
  t.after(async () => {
    try {
      await searchEngine?.close();
    } finally {
      try {
        await store?.close();
      } finally {
        await rm(root, { recursive: true });
      }
    }
  });
  store = await createPosixStore({ root: folder });
  const documentLlm = offlineAzure((_schema, messages) => ({
    continuesPrevious: false, sections: [{
      fromLine: 1, toLine: Number(/through (\d+)/.exec(messages[0].content)[1]),
      title: "Listino", summary: "Prezzi", keywords: ["prezzi"], shortDescription: "Prezzi",
    }],
  }));
  const searchLlm = offlineAzureChat(() => ({ content: "I due listini sono disponibili." }));
  const explicitUuid = "0195f876-18a4-7ba3-b8c2-7ba84c28cb94";
  const idsByPrice = new Map();
  for (const [price, inputId] of [[100, 1], [200, undefined], [300, explicitUuid]]) {
    const progress = [];
    await writeFile(file, `prodotto,prezzo\nlibro,${price}`);
    const id = await importFile(file, store, inputId, documentLlm, step => progress.push(step));
    if (inputId === undefined) {
      assert.match(id, /^[\da-f]{8}-[\da-f]{4}-7[\da-f]{3}-[89ab][\da-f]{3}-[\da-f]{12}$/i);
    } else {
      assert.equal(id, inputId);
    }
    idsByPrice.set(price, id);
    assert.ok(progress.some(step => step.phase === "segmentation" && step.step === "window-done" && step.phasePercent === 100));
    assert.ok(progress.some(step => step.phase === "completed" && step.percent === 100 && step.sectionCount === 1));
    assert.ok(progress.every(step => step.documentId === id && step.fileName === "listino prezzi.csv" && typeof step.message === "string"));
  }

  await writeFile(file, "prodotto,prezzo\nlibro,999");
  await assert.rejects(importFile(file, store, explicitUuid, documentLlm), { code: "ALREADY_EXISTS" });
  await store.close();
  store = undefined;

  store = await createPosixStore({ root: folder });
  searchEngine = await POSIXSearchEngine.open({ root: folder });
  const kb = await KbSmartManager.open(store, searchEngine, { llm: searchLlm });
  assert.equal((await kb.kbGetTableOfContents()).documents.length, 3);
  for (const [price, id] of idsByPrice) {
    const { matches } = await kb.kbDocumentSearchByKeywords({ kind: "keywords", keywords: [String(price)] });
    assert.deepEqual(matches.map(m => m.source.documentId), [id]);
  }
  assert.equal((await kb.kbAgentSearch("Quali listini sono disponibili?")).answer, "I due listini sono disponibili.");
});
