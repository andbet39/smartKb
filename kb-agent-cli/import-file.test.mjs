import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { KbSmartManager } from "workspace-document-parser/kb";
import { mockRootEnv, offlineAzure, offlineAzureChat } from "../test/azure-model.mjs";
import { importFile } from "./import-file.mjs";

test("import: avanzamento reale, file omonimi distinti e ricerca dopo riapertura", async t => {
  const root = await mkdtemp(join(tmpdir(), "cli-import-"));
  t.after(() => rm(root, { recursive: true }));
  const folder = join(root, "kb"), file = join(root, "listino prezzi.csv");
  await mkdir(folder);
  mockRootEnv(t, "");
  const documentLlm = offlineAzure((_schema, messages) => ({
    continuesPrevious: false, sections: [{
      startLine: 1, endLine: Number(/through (\d+)/.exec(messages[0].content)[1]),
      title: "Listino", summary: "Prezzi", keywords: ["prezzi"], short_description: "Prezzi",
    }],
  }));
  const searchLlm = offlineAzureChat(() => ({ content: "I due listini sono disponibili." }));
  const progress = [];
  for (const id of [1, 2]) {
    await writeFile(file, `prodotto,prezzo\nlibro,${id * 100}`);
    await importFile(file, folder, id, documentLlm, step => progress.push(step));
  }
  assert.ok(progress.some(step => step.includes("100%")));
  const kb = await KbSmartManager.open(folder, searchLlm);
  assert.equal((await kb.kbGetTableOfContents()).documents.length, 2);
  for (const id of [1, 2]) {
    const { matches } = await kb.kbFileSearchByKeywords({ kind: "keywords", keywords: [String(id * 100)] });
    assert.deepEqual(matches.map(m => m.source.documentId), [id]);
  }
  assert.equal(await kb.kbAgenticSearch("Quali listini sono disponibili?"), "I due listini sono disponibili.");
});
