import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { PDFiumLibrary } from '@hyzyla/pdfium';
import { PDFDocument } from 'pdf-lib';
import { PNG } from 'pngjs';
import { DocumentMapStore, LocalObjectStore, mapBackend, openLocalKnowledgeBase, toMarkdown } from '../dist/index.js';
import { ingestionEngine } from './model-fixture.mjs';
import { DocumentMapIndexer } from '../dist/indexing/map/indexer.js';

const markdown = { contentType: 'text/markdown' };

test('standalone converter returns normalized Markdown without a knowledge base', async () => {
  assert.equal(await toMarkdown(Buffer.from('# Titolo\r\nCorpo\r\n'), markdown), '# Titolo\nCorpo');
  await assert.rejects(toMarkdown(Uint8Array.of(0xff), markdown), TypeError);
});

async function tempDirectory(t) {
  const directory = await mkdtemp(join(tmpdir(), 'kb-v2-map-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('the index engine loads the saved map by ID and emits ranked section references', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'kb-v2-map-'));
  let engine;
  t.after(async () => {
    engine?.close();
    await rm(directory, { recursive: true, force: true });
  });
  const store = new DocumentMapStore(new LocalObjectStore(join(directory, 'originals')));
  const indexDirectory = join(directory, 'indexes', 'manuals');
  engine = new DocumentMapIndexer(store, indexDirectory, '0'.repeat(64), {
    modelId: 'deterministic', dimensions: 2,
    async embedDocuments(texts) { return texts.map(text => text.includes('valve') ? [1, 0] : [0, 1]); },
    async embedQuery() { return [1, 0]; },
  });
  assert.ok((await readdir(indexDirectory)).includes('map.sqlite'));
  assert.throws(() => new DocumentMapIndexer(store, '', '0'.repeat(64)), TypeError);
  const documentId = 'manual';
  const text = '# Valve\nvalve calibration\n# Fan\nfan calibration';
  await store.write(documentId, Buffer.from(text), markdown);
  await assert.rejects(engine.index(documentId), { code: 'not_found' });
  const map = await ingestionEngine.ingest(text);
  map.sections.forEach((section, index) => { section.sectionId = index === 0 ? 42 : 86; });
  await store.writeDocumentArtifacts(documentId, { markdown: text, map });
  await engine.index(documentId);
  const first = await engine.searchKeyword('calibration', { limit: 1 });
  assert.ok(first.nextCursor);
  const second = await engine.searchKeyword('calibration', { cursor: first.nextCursor });
  assert.deepEqual([...first.matches, ...second.matches].map(match => match.sectionId).sort(), [42, 86]);
  const { matches, nextCursor } = await engine.searchSemantic('pressure', { threshold: 1, limit: 1 });
  assert.deepEqual(matches, [{ documentId, sectionId: 42, score: 1 }]);
  assert.equal(nextCursor, undefined);
  await assert.rejects(engine.searchSemantic('pressure', { threshold: 2 }), RangeError);
  await engine.remove(documentId);
  assert.deepEqual((await engine.searchKeyword('calibration')).matches, []);
  assert.ok(await store.readDocumentMap(documentId));
});

test('identical documents are embedded independently but page-only edits reuse their index', async t => {
  const directory = await tempDirectory(t);
  let embeddings = 0;
  const local = openLocalKnowledgeBase({ id: 'copies', name: 'Copies', directory, ingestionEngine, embedder: {
    modelId: 'test', dimensions: 2, async embedQuery() { return [1, 0]; },
    async embedDocuments(inputs) { embeddings += inputs.length; return inputs.map(() => [1, 0]); },
  } });
  try {
    const text = 'Calibration';
    for (const id of ['a', 'b']) await local.kb.write(Buffer.from(text), markdown, id);
    await local.reconcile();
    assert.equal(embeddings, 2);
    const map = await local.documentStore.readDocumentMap('a');
    map.pages = [{ page: 7, lineStart: 1, lineEnd: 1 }];
    await local.documentStore.writeDocumentArtifacts('a', { markdown: text, map });
    await local.reconcile();
    const { hits } = await local.kb.searchSemantic('calibration');
    assert.deepEqual(hits.map(hit => [hit.documentId, hit.passages[0].page]), [['a', 7], ['b', undefined]]);
    assert.equal(embeddings, 2);
  } finally { await local.close(); }
});

test('keyword hits group passages, honor filters and topK, and can be read by exact coordinates', async t => {
  const directory = await tempDirectory(t);
  const date = new Date('2026-11-23');
  const metadata = { author: 'Alba', tags: ['blue'], createdAt: date };
  const local = openLocalKnowledgeBase({ id: 'example', name: 'Example', directory,
    ingestionEngine: { async ingest(text, context) { return { ...await ingestionEngine.ingest(text, context), ...metadata }; } },
  });
  const { kb } = local;
  try {
    const bytes = Buffer.from('# Alpha\r\nCalibration\r\n# Beta\r\nCalibration of valves\r\n');
    const first = await kb.write(bytes, { ...markdown, originalFileName: 'manual.md' }, 'ERP-42');
    const second = await kb.write(bytes, markdown);
    const third = await kb.write(bytes, markdown);
    assert.notEqual(second.documentId, third.documentId);
    assert.equal(first.sha, second.sha);
    assert.equal(first.metadata, undefined);
    await local.reconcile();
    const artifacts = join(directory, 'map.sqlite.artifacts');
    await assert.rejects(readdir(artifacts), { code: 'ENOENT' });
    assert.match(await local.documentStore.readDocumentMarkdown(first.documentId), /Calibration of valves/);
    const map = await local.documentStore.readDocumentMap(first.documentId);
    assert.equal(map.sections.length, 2);
    assert.equal(map.summary, 'Calibration Calibration of valves');
    assert.equal('text' in map, false);
    assert.equal(await local.indexStatus(first.documentId), 'indexed');
    const candidates = await kb.indexEngine.searchKeyword('calibration');
    assert.ok(candidates.matches.some(match => match.documentId === first.documentId));
    const all = await kb.searchKeyword('calibration');
    assert.deepEqual(all.hits.map(hit => hit.rank), [1, 2, 3]);
    const best = await kb.searchKeyword('calibration', { topK: 1 });
    assert.deepEqual(best, { hits: [all.hits[0]] });
    assert.equal(best.hits[0].passages.length, 2);
    const result = await kb.searchKeyword('calibration', { topK: 1, filter: {
      author: ['Alba'], tags: 'blue', createdAt: { gte: date }, originalFileName: 'manual.md',
    } });
    const [hit] = result.hits;
    assert.equal(hit.documentId, first.documentId);
    const toc = { documentId: first.documentId, sections: await local.documentStore.listDocumentSections(first.documentId) };
    assert.deepEqual(await kb.getDocumentsToc(first.documentId), [toc]);
    assert.deepEqual((await kb.getDocumentsToc([third.documentId, 'missing', first.documentId, third.documentId]))
      .map(entry => entry.documentId), [third.documentId, first.documentId]);
    assert.deepEqual(await kb.searchDocumentsToc('keyword', 'valves', { filter: { originalFileName: 'manual.md' } }), [toc]);
    assert.deepEqual(await kb.searchDocumentsToc('keyword', 'valves', { filter: { author: 'Bea' } }), []);
    await assert.rejects(kb.searchDocumentsToc('semantic', 'valves'), { code: 'not_supported' });
    for (const result of [hit, await local.documentStore.readDocumentMap(first.documentId), await kb.read(first.documentId)]) {
      assert.equal(result.title, 'Alpha');
      assert.deepEqual({ author: result.author, tags: result.tags, createdAt: result.createdAt }, metadata);
      assert.equal('metadata' in result, false);
    }
    assert.deepEqual((await kb.searchKeyword('calibration', { filter: { author: 'Bea' } })).hits, []);
    for (const passage of hit.passages) {
      const found = await kb.read(hit.documentId, { start: passage.lineStart, end: passage.lineEnd });
      assert.equal(found.sha, hit.sha);
      assert.equal(found.text, passage.text);
    }
    await assert.rejects(kb.searchKeyword('calibration', { filter: { author: { gte: 'A' } } }), { code: 'unsupported_filter' });
    await assert.rejects(kb.searchSemantic('calibration'), { code: 'not_supported' });
    await assert.rejects(kb.read(first.documentId, { start: 0, end: 1 }), RangeError);
    await kb.delete(first.documentId);
    await kb.delete(first.documentId);
    await local.reconcile();
    await assert.rejects(kb.read(first.documentId), { code: 'not_found' });
    assert.match((await kb.read(second.documentId)).text, /Calibration/);
    assert.equal((await kb.searchKeyword('calibration')).hits.length, 2);
    await kb.delete(second.documentId);
    await kb.delete(third.documentId);
    await local.reconcile();
    assert.deepEqual((await kb.searchKeyword('calibration')).hits, []);
    await assert.rejects(readdir(artifacts), { code: 'ENOENT' });
  } finally { await local.close(); }
});

test('PDF preserves page coordinates and indexes text found only by local OCR', async t => {
  const directory = await tempDirectory(t);
  const local = openLocalKnowledgeBase({ id: 'pdf', name: 'PDF', directory,
    ingestionEngine: { async ingest(text, context) {
      const map = await ingestionEngine.ingest(text, context);
      if (!context?.pages) return map;
      return { ...map, sections: context.pages.map(({ lineStart, lineEnd }, index) => ({
        sectionId: index + 1, order: index + 1, title: '', shortDescription: '', summary: '', keywords: [],
        lineStart, lineEnd,
      })) };
    } },
  });
  try {
    const document = await PDFDocument.create();
    const scannedPage = document.addPage([350, 140]);
    const scan = await document.embedPng(await renderScan('Pressione nominale'));
    scannedPage.drawImage(scan, { x: 0, y: 0, width: 350, height: 140 });
    document.addPage().drawText('Turbine calibration');
    const info = await local.kb.write(await document.save(), { contentType: 'application/pdf' });
    await local.reconcile();
    const [hit] = (await local.kb.searchKeyword('turbine')).hits;
    assert.equal(hit.documentId, info.documentId);
    assert.equal(hit.passages[0].page, 2);
    const [ocrHit] = (await local.kb.searchKeyword('pressione')).hits;
    assert.equal(ocrHit.passages[0].page, 1);
    const extracted = await local.kb.read(info.documentId);
    assert.match(extracted.text, /Pressione nominale/i);
    assert.match(extracted.text, /Turbine calibration/);
  } finally { await local.close(); }
});

async function renderScan(text) {
  const source = await PDFDocument.create();
  source.addPage([350, 140]).drawText(text, { x: 30, y: 65, size: 24 });
  const library = await PDFiumLibrary.init();
  try {
    const pdf = await library.loadDocument(await source.save());
    try {
      const { data } = await pdf.getPage(0).render({ scale: 2, render: async ({ width, height, data }) => {
        const png = new PNG({ width, height });
        png.data = Buffer.from(data);
        return PNG.sync.write(png);
      } });
      return Buffer.from(data);
    } finally { pdf.destroy(); }
  } finally { library.destroy(); }
}

test('semantic ranks by cosine similarity with the configured model', async t => {
  const directory = await tempDirectory(t);
  let offline = false;
  const embedder = {
    modelId: 'deterministic', dimensions: 2,
    async embedDocuments(texts) { return texts.map(text => text.includes('valve') ? [1, 0] : [0, 1]); },
    async embedQuery() {
      if (offline) throw new Error('embedding provider timed out');
      return [1, 0];
    },
  };
  const local = openLocalKnowledgeBase({ id: 'semantic', name: 'Semantic', directory, embedder, ingestionEngine });
  try {
    await local.kb.write(Buffer.from('fan'), markdown, 'a-fan');
    await local.kb.write(Buffer.from('valve'), markdown, 'b-valve');
    await local.reconcile();
    const result = await local.kb.searchSemantic('pressure', { topK: 1 });
    assert.equal(result.hits[0].documentId, 'b-valve');
    assert.equal(result.hits[0].score, 1);
    assert.equal(result.hits.length, 1);
    assert.equal('nextCursor' in result, false);
    offline = true;
    await assert.rejects(local.kb.searchSemantic('pressure'), { code: 'backend_unavailable' });
  } finally { await local.close(); }
});

test('reconciliation rebuilds from originals, retries errors and updates source info without repeating analysis', async t => {
  const directory = await tempDirectory(t);
  const objects = new LocalObjectStore(join(directory, 'originals'));
  const store = new DocumentMapStore(objects);
  const filename = join(directory, 'map.sqlite');
  let attempts = 0;
  let fail = true;
  const options = {
    directory, onError: () => {},
    ingestionEngine: { async ingest(text, context) {
      attempts++;
      if (fail) throw new Error('model unavailable');
      const map = await ingestionEngine.ingest(text, context);
      return { ...map, sections: map.sections.map(section => ({ ...section, title: 'Calibration', summary: text })) };
    } },
  };
  let backend;
  try {
    const body = Buffer.from('calibration');
    await store.write('external', body, { ...markdown, originalFileName: 'first.md' });
    backend = mapBackend(store, options);
    await assert.rejects(backend.reconcile(), /model unavailable/);
    assert.equal(await store.readDocumentMap('external'), undefined);
    assert.equal(await backend.scheduler.status('external'), 'failed');
    assert.deepEqual((await backend.searchEngine.searchKeyword('calibration')).hits, []);
    fail = false;
    await backend.reconcile();
    assert.equal(await backend.scheduler.status('external'), 'indexed');
    await store.write('external', body, { ...markdown, originalFileName: 'second.md' });
    await backend.reconcile();
    assert.equal(attempts, 2);
    assert.equal((await backend.searchEngine.searchKeyword('calibration', { filter: { originalFileName: 'second.md' } })).hits.length, 1);
    await backend.close();
    await rm(filename);
    backend = mapBackend(store, options);
    await backend.reconcile();
    assert.equal((await backend.searchEngine.searchKeyword('calibration')).hits[0].originalFileName, 'second.md');
    assert.equal(attempts, 2);
    await backend.close();
    const artifacts = `${filename}.artifacts`;
    const legacy = join(artifacts, `${'a'.repeat(64)}-${'b'.repeat(64)}`);
    await mkdir(legacy, { recursive: true });
    await writeFile(join(legacy, 'document.md'), 'calibration');
    await writeFile(join(legacy, 'map.json'), '{}');
    backend = mapBackend(store, options);
    await backend.reconcile();
    assert.equal((await backend.searchEngine.searchKeyword('calibration')).hits[0].passages[0].text, 'calibration');
    await assert.rejects(readdir(artifacts), { code: 'ENOENT' });
    assert.equal(await store.readDocumentMarkdown('external'), 'calibration');
    assert.equal(attempts, 2);
  } finally {
    await backend?.close();
    objects.close();
  }
});

test('prepared Markdown and map survive indexing failure and embedding reindexing', async t => {
  const directory = await tempDirectory(t);
  const id = 'separate-stages';
  const converted = '# Guide\nPump calibration';
  let conversions = 0;
  let ingestions = 0;
  let embeddings = 0;
  let failEmbedding = true;
  const converter = { async convert(body) {
    conversions++;
    assert.equal(Buffer.from(body).toString(), 'raw original');
    return { markdown: converted };
  } };
  function open(modelId, label) {
    return openLocalKnowledgeBase({ id: 'pipeline', name: 'Pipeline', directory, converter, onError() {},
      ingestionEngine: { async ingest(text, context) {
        ingestions++;
        assert.equal(text, converted);
        const map = await ingestionEngine.ingest(text, context);
        map.sections[0].shortDescription = label;
        map.sections[0].keywords = ['manutenzione'];
        return map;
      } },
      embedder: { modelId, dimensions: 2, async embedQuery() { return [1, 0]; },
        async embedDocuments(inputs) {
          assert.match(inputs[0], /Pump calibration/);
          assert.match(inputs[0], /prima/);
          assert.match(inputs[0], /manutenzione/);
          if (failEmbedding) throw new Error('embedding unavailable');
          embeddings++;
          return inputs.map(() => [1, 0]);
        } },
    });
  }
  let local = open('embedding-v1', 'prima');
  try {
    await local.kb.write(Buffer.from('raw original'), { contentType: 'application/pdf' }, id);
    await assert.rejects(local.reconcile());
    assert.equal(await local.indexStatus(id), 'failed');
    assert.deepEqual((await local.kb.searchKeyword('calibration')).hits, []);
    assert.equal((await local.kb.read(id)).text, converted);
    assert.equal((await local.documentStore.readDocumentMap(id)).sections[0].shortDescription, 'prima');
    assert.deepEqual(await local.documentStore.listDocumentSections(id), [
      { sectionId: 1, order: 1, title: 'Guide', shortDescription: 'prima', lineStart: 1, lineEnd: 2 },
    ]);
    assert.equal((await local.documentStore.readDocumentSection(id, 1)).markdown, converted);
    assert.deepEqual((await local.documentStore.readDocumentSection(id, 1)).keywords, ['manutenzione']);
    assert.equal(await local.documentStore.readDocumentSection(id, 2), undefined);
    assert.equal(await local.documentStore.readDocumentMarkdown(id, { start: 2, end: 2 }), 'Pump calibration');
    failEmbedding = false;
    await local.reconcile();
    assert.equal(await local.indexStatus(id), 'indexed');
    assert.equal((await local.kb.searchKeyword('manutenzione')).hits[0].documentId, id);
    assert.deepEqual([conversions, ingestions, embeddings], [1, 1, 1]);
    await local.close();

    local = open('embedding-v2', 'seconda');
    await local.reconcile();
    assert.deepEqual([conversions, ingestions, embeddings], [1, 1, 2]);
    assert.equal((await local.documentStore.readDocumentSection(id, 1)).shortDescription, 'prima');
    assert.equal((await local.kb.searchSemantic('calibration')).hits[0].documentId, id);
    await local.kb.delete(id);
    await local.reconcile();
    assert.equal(await local.documentStore.readDocumentMap(id), undefined);
  } finally { await local.close(); }
});

test('derived content is keyed by document ID and cleared when the original changes', async t => {
  const store = new DocumentMapStore(new LocalObjectStore(await tempDirectory(t)));
  const body = Buffer.from('Same bytes');
  const first = await store.write('first', body, { ...markdown, originalFileName: 'input.md' });
  const second = await store.write('second', body, markdown);
  assert.equal(first.sha, second.sha);
  assert.equal(first.originalFileName, 'input.md');
  await store.writeDocumentArtifacts('first', { markdown: 'Same bytes', map: await ingestionEngine.ingest('Same bytes') });
  assert.equal(await store.readDocumentMap('second'), undefined);
  await store.write('first', body, { ...markdown, originalFileName: 'renamed.md' });
  assert.equal((await store.stat('first')).originalFileName, 'renamed.md');
  assert.equal((await store.readDocumentSection('first', 1)).markdown, 'Same bytes');
  assert.deepEqual((await store.readDocumentSection('first', 1)).keywords, ['fixture']);
  const map = await store.readDocumentMap('first');
  map.sections[0].sectionId = 42;
  await assert.rejects(store.writeDocumentArtifacts('first', { markdown: 'Invalid replacement', map }), TypeError);
  assert.equal((await store.readDocumentSection('first', 1)).markdown, 'Same bytes');
  await store.writeDocumentArtifacts('first', { markdown: 'Same bytes', map });
  assert.equal(await store.readDocumentSection('first', 1), undefined);
  assert.equal((await store.readDocumentSection('first', 42)).order, 1);
  await store.write('first', Buffer.from('New bytes'), markdown);
  assert.equal(await store.readDocumentMarkdown('first'), undefined);
  assert.equal(await store.readDocumentMap('first'), undefined);
});

test('document stores share originals and final artifacts through the injected object store', async () => {
  const records = new Map();
  const objects = {
    async list(prefix = '') { return [...records.keys()].filter(key => key.startsWith(prefix)); },
    async write(key, body) { records.set(key, body); },
    async read(key) { return records.get(key); },
    async delete(key) { records.delete(key); },
  };
  const writer = new DocumentMapStore(objects);
  const reader = new DocumentMapStore(objects);
  const body = Buffer.from('original bytes');
  const info = await writer.write('manual', body, markdown);
  const text = 'Converted text';
  const map = await ingestionEngine.ingest(text);
  await writer.writeDocumentArtifacts('manual', { map, markdown: text });
  assert.deepEqual(await reader.list(), { items: ['manual'] });
  assert.deepEqual(await reader.read('manual'), body);
  assert.deepEqual(await reader.readDocumentArtifacts('manual'), { map, markdown: text, info });
  await reader.delete('manual');
  assert.equal(records.size, 0);
  assert.equal(await writer.readDocumentMap('manual'), undefined);
});

test('opening an older map database rebuilds the index without touching originals', async t => {
  const directory = await tempDirectory(t);
  const objects = new LocalObjectStore(join(directory, 'originals'));
  const store = new DocumentMapStore(objects);
  const filename = join(directory, 'map.sqlite');
  const oldIndex = new DatabaseSync(filename);
  try {
    oldIndex.exec(`
      CREATE TABLE artifacts (key TEXT PRIMARY KEY, data TEXT NOT NULL);
      CREATE TABLE published (id BLOB PRIMARY KEY, artifact TEXT REFERENCES artifacts(key));
      CREATE TABLE sections (artifact TEXT REFERENCES artifacts(key), text TEXT);
      CREATE VIRTUAL TABLE section_search USING fts5(title, summary, text);
      INSERT INTO artifacts VALUES ('old', '{"text":"legacy"}');
      INSERT INTO published VALUES (x'6100', 'old');
    `);
  } finally { oldIndex.close(); }

  let backend;
  try {
    await store.write('a', Buffer.from('calibration'), markdown);
    backend = mapBackend(store, { directory, ingestionEngine });
    await backend.reconcile();
    assert.equal((await backend.searchEngine.searchKeyword('calibration')).hits.length, 1);
    const index = new DatabaseSync(filename, { readOnly: true });
    try {
      assert.equal(index.prepare("SELECT 1 FROM sqlite_schema WHERE name = 'artifacts'").get(), undefined);
      assert.equal(index.prepare('SELECT text FROM section_search').get().text, null);
    } finally { index.close(); }
  } finally {
    await backend?.close();
    objects.close();
  }
});

test('stale jobs do not publish overwritten or deleted documents', async t => {
  const directory = await tempDirectory(t);
  const entered = Promise.withResolvers();
  const release = Promise.withResolvers();
  const deleteEntered = Promise.withResolvers();
  const deleteRelease = Promise.withResolvers();
  const local = openLocalKnowledgeBase({ id: 'race', name: 'Race', directory,
    ingestionEngine: { async ingest(text, context) {
      if (text === 'outdated') { entered.resolve(); await release.promise; }
      if (text === 'deleted') { deleteEntered.resolve(); await deleteRelease.promise; }
      const map = await ingestionEngine.ingest(text, context);
      return { ...map, sections: map.sections.map(section => ({ ...section, title: text, summary: text })) };
    } },
  });
  const { kb } = local;
  try {
    await kb.write(Buffer.from('outdated'), markdown, 'race');
    await entered.promise;
    assert.deepEqual((await kb.list()).items, ['race']);
    assert.equal(await local.indexStatus('race'), 'pending');
    await assert.rejects(kb.read('race'), { code: 'not_found' });
    const current = await kb.write(Buffer.from('current'), markdown, 'race');
    release.resolve();
    await local.reconcile();
    assert.deepEqual((await kb.searchKeyword('outdated')).hits, []);
    assert.equal((await kb.read('race')).sha, current.sha);
    await kb.write(Buffer.from('deleted'), markdown, 'race');
    await deleteEntered.promise;
    await assert.rejects(kb.read('race'), { code: 'not_found' });
    assert.deepEqual((await kb.searchKeyword('current')).hits, []);
    await kb.delete('race');
    deleteRelease.resolve();
    await local.reconcile();
    assert.deepEqual((await kb.list()).items, []);
    assert.deepEqual((await kb.searchKeyword('deleted current')).hits, []);
    assert.equal(await local.indexStatus('race'), 'absent');
  } finally {
    release.resolve();
    deleteRelease.resolve();
    await local.close();
  }
});