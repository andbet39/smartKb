import assert from "node:assert/strict";
import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";
import test from "node:test";
import { createPosixStore, KbStoreError, POSIXSearchEngine } from "smartDocKb";
import { getLoadablePath } from "sqlite-vec";
import { fakeEmbeddings, makeDocument, openStore, tempFolder } from "./kb-fixtures.mjs";

const code = expected => error => error instanceof KbStoreError && error.code === expected;
const earlierUuid = "019ab123-4567-7abc-8def-0123456789ab";
const laterUuid = "019ab123-4568-7abc-8def-0123456789ab";

async function openSearch(t, options) {
  const search = await POSIXSearchEngine.open(options);
  t.after(() => search.close());
  return search;
}

test("opening a search reader without an index does not create one", async t => {
  const root = await tempFolder(t);
  await assert.rejects(POSIXSearchEngine.open({ root }), code("BACKEND"));
  assert.deepEqual(await readdir(root), []);

  const kbFolder = join(root, ".kb");
  await mkdir(kbFolder);
  await assert.rejects(POSIXSearchEngine.open({ root }), code("BACKEND"));
  assert.deepEqual(await readdir(kbFolder), []);
});

test("add stores the canonical files and the index; get and read return them", async t => {
  const root = await tempFolder(t);
  const store = await createPosixStore({ root });
  t.after(() => store.close());
  const doc = makeDocument(7, "manuale.pdf", "Manuale", "# Manuale\n\nCittà");
  await store.add(doc);

  assert.deepEqual(await store.get(7), { map: doc.map, pages: doc.pages });
  assert.equal(await store.read(7), doc.markdown);
  assert.equal(await readFile(join(root, "doc-7", "document.md"), "utf8"), doc.markdown);
  assert.deepEqual(JSON.parse(await readFile(join(root, "doc-7", "manifest.json"), "utf8")), { map: doc.map, pages: doc.pages });
  assert.deepEqual((await readdir(join(root, "doc-7"))).sort(), ["document.md", "manifest.json"]);

  // Reopening reads the same index.
  await store.close();
  const reopened = await createPosixStore({ root });
  t.after(() => reopened.close());
  assert.equal(await reopened.read(7), doc.markdown);
  await assert.rejects(store.get(7), code("CLOSED"));
});

test("add validates the document and rejects duplicate IDs", async t => {
  const store = await openStore(t);
  const doc = makeDocument(1, "a.txt", "A", "one\ntwo");
  await store.add(doc);
  await assert.rejects(store.add(doc), code("ALREADY_EXISTS"));
  await assert.rejects(store.add({ ...doc, map: { ...doc.map, documentId: 2, lineCount: 3 } }), code("INVALID_DOCUMENT"));
  await assert.rejects(store.add({ ...doc, map: { ...doc.map, documentId: 2, lineCount: -1 } }), code("INVALID_DOCUMENT"));
  await assert.rejects(store.get(2), code("NOT_FOUND"));
  await assert.rejects(store.read(2), code("NOT_FOUND"));
});

test("concurrent adds of the same UUID commit exactly one document without overwriting it", async t => {
  const root = await tempFolder(t);
  const firstStore = await createPosixStore({ root });
  t.after(() => firstStore.close());
  const secondStore = await createPosixStore({ root });
  t.after(() => secondStore.close());
  const candidates = [
    makeDocument(earlierUuid, "first.txt", "First", "alpha"),
    makeDocument(earlierUuid, "second.txt", "Second", "beta\nextra line"),
  ];

  const results = await Promise.allSettled([firstStore.add(candidates[0]), secondStore.add(candidates[1])]);
  const winnerIndex = results.findIndex(result => result.status === "fulfilled");
  assert.notEqual(winnerIndex, -1);
  const loser = results[1 - winnerIndex];
  assert.equal(loser.status, "rejected");
  assert.ok(code("ALREADY_EXISTS")(loser.reason), String(loser.reason));

  const { markdown, ...manifest } = candidates[winnerIndex];
  const folder = join(root, `doc-${earlierUuid}`);
  assert.equal(await readFile(join(folder, "document.md"), "utf8"), markdown);
  assert.deepEqual(JSON.parse(await readFile(join(folder, "manifest.json"), "utf8")), manifest);
  assert.deepEqual(await firstStore.get(earlierUuid), manifest);
  assert.equal(await secondStore.read(earlierUuid), markdown);
  assert.deepEqual((await firstStore.list({ limit: 10 })).cards.map(card => card.documentId), [earlierUuid]);
});

test("delete removes the document from every read and search; unknown IDs return false", async t => {
  const root = await tempFolder(t);
  const store = await createPosixStore({ root });
  t.after(() => store.close());
  const search = await openSearch(t, { root });
  const query = { keywords: ["shared"], limit: 10 };
  assert.deepEqual(await search.keywordSearch(query), []);
  await store.add(makeDocument(1, "a.txt", "Alpha", "shared word"));
  await store.add(makeDocument(2, "b.txt", "Beta", "shared word"));
  assert.deepEqual((await search.keywordSearch(query)).map(hit => hit.documentId), [1, 2]);
  assert.equal(await store.delete(1), true);
  assert.equal(await store.delete(1), false);
  await assert.rejects(store.get(1), code("NOT_FOUND"));
  assert.deepEqual((await store.list({ limit: 10 })).cards.map(card => card.documentId), [2]);
  assert.deepEqual((await search.keywordSearch(query)).map(hit => hit.documentId), [2]);
  assert.ok(!(await readdir(root)).includes("doc-1"));
  await store.add(makeDocument(1, "a.txt", "Alpha again", "new text"));
  assert.equal(await store.read(1), "new text");
});

test("list pages by ID and filters by text and tags", async t => {
  const store = await openStore(t);
  for (const id of [3, 1, 2, 4]) {
    await store.add(makeDocument(id, `${id}.pdf`, `Documento ${id}`, `testo ${id}`, {
      tags: id % 2 ? ["dispari", "tutti"] : ["tutti"],
      keywords: id === 4 ? ["perché"] : [],
    }));
  }
  const first = await store.list({ limit: 3 });
  assert.deepEqual(first.cards.map(card => card.documentId), [1, 2, 3]);
  assert.deepEqual(first.cards[0], {
    documentId: 1, originalFileName: "1.pdf", shortDescription: "Documento 1", keywords: [],
    tags: ["dispari", "tutti"], sectionCount: 1,
  });
  const second = await store.list({ limit: 3, cursor: first.nextCursor });
  assert.deepEqual(second, { cards: [(await store.list({ limit: 4 })).cards[3]] });
  assert.deepEqual((await store.list({ limit: 10, tags: ["dispari", "tutti"] })).cards.map(c => c.documentId), [1, 3]);
  assert.deepEqual((await store.list({ limit: 10, text: "PERCHE" })).cards.map(c => c.documentId), [4]);
  assert.deepEqual((await store.list({ limit: 10, text: "documento 2" })).cards.map(c => c.documentId), [2]);
  await assert.rejects(store.list({ limit: 0 }), code("INVALID_QUERY"));
  await assert.rejects(store.list({ limit: 101 }), code("INVALID_QUERY"));
  await assert.rejects(store.list({ limit: 1, cursor: "x" }), code("INVALID_QUERY"));
});

test("keyword search returns ranked section pointers with literal match lines", async t => {
  const root = await tempFolder(t);
  const store = await createPosixStore({ root });
  t.after(() => store.close());
  const search = await openSearch(t, { root });
  await store.add(makeDocument(1, "router.pdf", "Power", "Standby: 5 V.\nOperating: 12 V.\nMaximum: 24 V."));
  await store.add(makeDocument(2, "note.txt", "Note", "Perché no?\nCanone mensile"));

  const [hit] = await search.keywordSearch({ keywords: ["12 V"], limit: 10 });
  assert.deepEqual({ ...hit, score: typeof hit.score }, {
    documentId: 1, sectionId: 5, title: "Power", shortDescription: "Power", summary: "Power", score: "number", lines: [2],
  });
  assert.deepEqual((await search.keywordSearch({ keywords: ["v."], limit: 10 }))[0].lines, [1, 2, 3]);
  // Whole words only, accents ignored by the index but not by the literal line match.
  assert.deepEqual(await search.keywordSearch({ keywords: ["canon"], limit: 10 }), []);
  const [accent] = await search.keywordSearch({ keywords: ["perche"], limit: 10 });
  assert.deepEqual([accent.documentId, accent.lines], [2, []]);
  assert.deepEqual(await search.keywordSearch({ keywords: ["standby"], caseSensitive: true, limit: 10 }), []);
  assert.equal((await search.keywordSearch({ keywords: ["Standby"], caseSensitive: true, limit: 10 })).length, 1);
  assert.deepEqual(await search.keywordSearch({ keywords: ["12 V"], documentIds: [2], limit: 10 }), []);
  assert.deepEqual(await search.keywordSearch({ keywords: ["12 V"], documentIds: [], limit: 10 }), []);
  const [full] = await search.keywordSearch({ keywords: ["mensile"], fullSection: true, limit: 10 });
  assert.equal(full.markdown, "Perché no?\nCanone mensile");
  await assert.rejects(search.keywordSearch({ keywords: [""], limit: 10 }), code("INVALID_QUERY"));
  // FTS5 operators typed by the user are taken literally.
  assert.deepEqual(await search.keywordSearch({ keywords: ['" OR *'], limit: 10 }), []);
});

test("read detects Markdown that no longer matches the index", async t => {
  const root = await tempFolder(t);
  const store = await createPosixStore({ root });
  t.after(() => store.close());
  await store.add(makeDocument(1, "a.txt", "A", "one\ntwo"));
  await writeFile(join(root, "doc-1", "document.md"), "one");
  await assert.rejects(store.read(1), code("BACKEND"));
});

test("semantic search ranks sections by meaning and records the embedding model", async t => {
  const root = await tempFolder(t);
  const embeddings = fakeEmbeddings(["voltage", "button", "warranty"]);
  const semantic = { embeddings, modelId: "fake-1" };
  const store = await createPosixStore({ root, semantic: { ...semantic, batchSize: 1 } });
  t.after(() => store.close());
  const search = await openSearch(t, { root, semantic });
  const query = { text: "which voltage?", limit: 5 };
  assert.deepEqual(await search.semanticSearch(query), []);

  await store.add(makeDocument(1, "power.pdf", "Voltage", "Use 12 V."));
  assert.deepEqual((await search.semanticSearch(query)).map(hit => hit.documentId), [1]);
  await store.add(makeDocument(2, "start.pdf", "Button", "Press the button."));
  await store.add(makeDocument(3, "empty.txt", "Empty", ""));
  assert.deepEqual(embeddings.calls, [["Voltage\nVoltage"], ["Button\nButton"]]);

  const hits = await search.semanticSearch(query);
  assert.deepEqual(hits.map(hit => hit.documentId), [1, 2]);
  assert.ok(hits[0].score > hits[1].score);
  assert.equal(hits[0].markdown, undefined);
  const [filtered] = await search.semanticSearch({ text: "voltage", documentIds: [2], limit: 5, fullSection: true });
  assert.deepEqual([filtered.documentId, filtered.markdown], [2, "Press the button."]);
  assert.equal(await store.delete(1), true);
  assert.deepEqual((await search.semanticSearch(query)).map(hit => hit.documentId), [2]);
  assert.deepEqual(JSON.parse(await readFile(join(root, ".kb", "store.json"), "utf8")), {
    embedding: { modelId: "fake-1", dimensions: 3 },
  });
  await store.close();

  const mismatched = { embeddings, modelId: "fake-2" };
  const otherSearch = await openSearch(t, { root, semantic: mismatched });
  await assert.rejects(otherSearch.semanticSearch(query), code("INDEX_MISMATCH"));
  const otherModel = await createPosixStore({ root, semantic: mismatched });
  t.after(() => otherModel.close());
  await assert.rejects(otherModel.add(makeDocument(4, "d.txt", "Voltage", "x")), code("INDEX_MISMATCH"));
  await assert.rejects(createPosixStore({ root }), code("INDEX_MISMATCH"));
});

test("the store defaults to a catalog limit of 100", async t => {
  const store = await openStore(t);
  assert.equal(store.maxLimit, 100);
});

test("a keyword-only reader searches an index with vectors without a writer", async t => {
  const root = await tempFolder(t);
  const semantic = { embeddings: fakeEmbeddings(["voltage", "button"]), modelId: "fake" };
  const store = await createPosixStore({ root, semantic });
  t.after(() => store.close());
  await store.add(makeDocument(1, "power.txt", "Voltage", "Use 12 V."));
  await store.close();

  const search = await openSearch(t, { root });
  assert.equal(search.semanticSearch, undefined);
  assert.deepEqual((await search.keywordSearch({ keywords: ["voltage"], limit: 10 })).map(hit => hit.documentId), [1]);
});

test("closing the search reader and the store are independent", async t => {
  const root = await tempFolder(t);
  const store = await createPosixStore({ root });
  t.after(() => store.close());
  const first = await openSearch(t, { root });
  const second = await openSearch(t, { root });
  const query = { keywords: ["shared"], limit: 10 };

  await first.close();
  await assert.rejects(first.keywordSearch(query), code("CLOSED"));
  await store.add(makeDocument(1, "a.txt", "Alpha", "shared word"));
  assert.equal(await store.read(1), "shared word");

  await store.close();
  await assert.rejects(store.read(1), code("CLOSED"));
  assert.deepEqual((await second.keywordSearch(query)).map(hit => hit.documentId), [1]);
});

test("closing the reader during embedQuery rejects the pending semantic search", { timeout: 5000 }, async t => {
  const root = await tempFolder(t);
  const modelId = "fake";
  const store = await createPosixStore({ root, semantic: { embeddings: fakeEmbeddings(["voltage", "button"]), modelId } });
  t.after(() => store.close());
  await store.add(makeDocument(1, "power.txt", "Voltage", "Use 12 V."));

  const started = Promise.withResolvers();
  const embedding = Promise.withResolvers();
  const search = await openSearch(t, {
    root,
    semantic: { modelId, embeddings: { embedQuery() { started.resolve(); return embedding.promise; } } },
  });
  const pending = search.semanticSearch({ text: "voltage", limit: 5 });
  try {
    await Promise.race([started.promise, pending.then(() => assert.fail("Search finished before embedQuery started"))]);
    await search.close();
  } finally {
    embedding.resolve([1, 0]);
  }
  await assert.rejects(pending, code("CLOSED"));
});

test("mixed IDs paginate in numeric then UUID order before and after an index rebuild", async t => {
  const root = await tempFolder(t);
  const store = await createPosixStore({ root });
  t.after(() => store.close());
  const ids = [2, 10, earlierUuid, laterUuid];
  for (const id of [...ids].reverse()) {
    await store.add(makeDocument(id, `${id}.txt`, "Manual", `Indexed text for ${id}`, { tags: ["manual"] }));
  }
  await mkdir(join(root, "doc-3")); // A folder without a manifest is not a document.

  const checkIndex = async (target, search) => {
    let cursor;
    for (const [index, id] of ids.entries()) {
      const page = await target.list({ limit: 1, cursor, text: "manual", tags: ["manual"] });
      assert.deepEqual(page.cards.map(card => card.documentId), [id]);
      assert.equal(page.nextCursor, index === ids.length - 1 ? undefined : String(id));
      cursor = page.nextCursor;
    }
    assert.deepEqual((await target.list({ limit: 10 })).cards.map(card => card.documentId), ids);
    assert.equal((await target.get(earlierUuid)).map.documentId, earlierUuid);
    assert.equal(await target.read(earlierUuid), `Indexed text for ${earlierUuid}`);
    const hits = await search.keywordSearch({ keywords: ["indexed"], documentIds: [earlierUuid, 10], limit: 10 });
    assert.deepEqual(hits.map(hit => hit.documentId).sort(), [10, earlierUuid].sort());
  };

  const search = await openSearch(t, { root });
  await checkIndex(store, search);
  await search.close();
  await store.close();
  await rm(join(root, ".kb"), { recursive: true });

  const rebuilt = await createPosixStore({ root });
  t.after(() => rebuilt.close());
  const rebuiltSearch = await openSearch(t, { root });
  await checkIndex(rebuilt, rebuiltSearch);
  await assert.rejects(rebuilt.get(3), code("NOT_FOUND"));
});

test("opening a legacy integer index preserves catalog, full-text and vector entries", async t => {
  const root = await tempFolder(t);
  const kbFolder = join(root, ".kb");
  const folder = join(root, "doc-42");
  const { markdown, map, pages } = makeDocument(42, "legacy.txt", "Voltage", "Legacy power supply", { tags: ["archived"] });
  await mkdir(kbFolder);
  await mkdir(folder);
  await writeFile(join(folder, "document.md"), markdown);
  await writeFile(join(folder, "manifest.json"), JSON.stringify({ map, pages }));
  await writeFile(join(kbFolder, "store.json"), JSON.stringify({ embedding: { modelId: "legacy", dimensions: 2 } }));

  const db = new DatabaseSync(join(kbFolder, "index.sqlite"), { allowExtension: true });
  try {
    db.loadExtension(getLoadablePath());
    db.exec(`
      CREATE TABLE documents (documentId INTEGER PRIMARY KEY, originalFileName TEXT, title TEXT,
        shortDescription TEXT NOT NULL, keywordsJson TEXT NOT NULL, tagsJson TEXT,
        sectionCount INTEGER NOT NULL, lineCount INTEGER NOT NULL, mapJson TEXT NOT NULL, pagesJson TEXT);
      CREATE TABLE document_tags (tag TEXT NOT NULL, documentId INTEGER NOT NULL, PRIMARY KEY (tag, documentId));
      CREATE TABLE sections (rowid INTEGER PRIMARY KEY, documentId INTEGER NOT NULL, sectionId INTEGER NOT NULL,
        title TEXT NOT NULL, shortDescription TEXT NOT NULL, summary TEXT NOT NULL,
        fromLine INTEGER NOT NULL, toLine INTEGER NOT NULL, UNIQUE (documentId, sectionId));
      CREATE VIRTUAL TABLE documents_fts USING fts5(title, originalFileName, shortDescription, keywords,
        content='', contentless_delete=1);
      CREATE VIRTUAL TABLE sections_fts USING fts5(title, shortDescription, summary, keywords, body,
        content='', contentless_delete=1);
      CREATE VIRTUAL TABLE section_vectors USING vec0(documentId INTEGER PARTITION KEY, sectionId INTEGER,
        embedding FLOAT[2] distance_metric=cosine);

      INSERT INTO document_tags VALUES ('archived', 42);
      INSERT INTO sections VALUES (701, 42, 5, 'Voltage', 'Voltage', 'Voltage', 1, 1);
      INSERT INTO documents_fts (rowid, title, originalFileName, shortDescription, keywords)
        VALUES (42, '', 'legacy.txt', 'Voltage', '');
      INSERT INTO section_vectors (documentId, sectionId, embedding) VALUES (42, 5, '[1,0]');
    `);
    db.prepare("INSERT INTO documents VALUES (42, 'legacy.txt', NULL, 'Voltage', '[]', '[\"archived\"]', 1, 1, ?, ?)")
      .run(JSON.stringify(map), JSON.stringify(pages));
    db.prepare("INSERT INTO sections_fts (rowid, title, shortDescription, summary, keywords, body) VALUES (701, 'Voltage', 'Voltage', 'Voltage', '', ?)")
      .run(markdown);
  } finally {
    db.close();
  }

  const embeddings = fakeEmbeddings(["voltage", "button"]);
  const semantic = { embeddings, modelId: "legacy" };
  const store = await createPosixStore({ root, semantic });
  t.after(() => store.close());
  const search = await openSearch(t, { root, semantic });
  assert.deepEqual(await store.get(42), { map, pages });
  assert.equal(await store.read(42), markdown);
  assert.deepEqual((await store.list({ text: "voltage", tags: ["archived"], limit: 10 })).cards.map(c => c.documentId), [42]);
  assert.deepEqual((await search.keywordSearch({ keywords: ["power supply"], limit: 10 })).map(h => [h.documentId, h.sectionId]), [[42, 5]]);
  assert.deepEqual((await search.semanticSearch({ text: "voltage", documentIds: [42], limit: 10 })).map(h => [h.documentId, h.sectionId]), [[42, 5]]);
  assert.deepEqual(embeddings.calls, []);

  await store.add(makeDocument(earlierUuid, "new.txt", "Button", "Press the button"));
  assert.deepEqual((await store.list({ limit: 10 })).cards.map(c => c.documentId), [42, earlierUuid]);
  assert.deepEqual((await search.semanticSearch({ text: "button", limit: 10 })).map(h => h.documentId), [earlierUuid, 42]);
});
