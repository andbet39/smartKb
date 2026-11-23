import assert from 'node:assert/strict';
import { mkdtemp, readdir, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';
import { test } from 'node:test';
import { PDFiumLibrary } from '@hyzyla/pdfium';
import { PDFDocument } from 'pdf-lib';
import { PNG } from 'pngjs';
import { LocalObjectStore, mapBackend, MarkdownIngestor, openLocalKnowledgeBase } from '../dist/index.js';
import { DocumentMapIndexer } from '../dist/backends/map/indexer.js';
import { MapRepository } from '../dist/backends/map/repository.js';

const markdown = { contentType: 'text/markdown' };

async function tempDirectory(t) {
  const directory = await mkdtemp(join(tmpdir(), 'kb-v2-map-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  return directory;
}

test('the index engine loads the saved map by ID and emits ranked section references', async t => {
  const directory = await tempDirectory(t);
  const store = new LocalObjectStore(join(directory, 'originals'));
  const repository = new MapRepository(join(directory, 'map.sqlite'), true);
  t.after(() => repository.close());
  const engine = new DocumentMapIndexer(store, repository, '0'.repeat(64), {
    modelId: 'deterministic', dimensions: 2,
    async embedDocuments(texts) { return texts.map(text => text.includes('valve') ? [1, 0] : [0, 1]); },
    async embedQuery() { return [1, 0]; },
  });
  const documentId = 'manual';
  const text = '# Valve\nvalve calibration\n# Fan\nfan calibration';
  await store.write(documentId, Buffer.from(text), markdown);
  await assert.rejects(engine.index(documentId), { code: 'not_found' });
  await store.writeDocumentMarkdown(documentId, text);
  const map = await new MarkdownIngestor().ingest(text);
  map.sections.forEach((section, index) => { section.sectionId = index === 0 ? 42 : 86; });
  await store.writeDocumentMap(documentId, map);
  await engine.index(documentId);
  const first = await engine.searchKeyword('calibration', { limit: 1 });
  assert.ok(first.nextCursor);
  const second = await engine.searchKeyword('calibration', { cursor: first.nextCursor });
  assert.deepEqual([...first.matches, ...second.matches].map(match => match.sectionId).sort(), [42, 86]);
  const { matches, nextCursor } = await engine.searchSemantic('pressure', { minScore: 1, limit: 1 });
  assert.deepEqual(matches, [{ documentId, sectionId: 42, score: 1, revision: first.matches[0].revision }]);
  assert.equal(nextCursor, undefined);
  await assert.rejects(engine.searchSemantic('pressure', { minScore: 2 }), RangeError);
  await engine.remove(documentId);
  assert.deepEqual((await engine.searchKeyword('calibration')).matches, []);
  assert.ok(await store.readDocumentMap(documentId));
});

test('keyword hits group passages, honor filters, paginate, and can be read by exact coordinates', async t => {
  const directory = await tempDirectory(t);
  const date = new Date('2026-11-23');
  const metadata = { author: 'Alba', tags: ['blue'], createdAt: date };
  const base = new MarkdownIngestor();
  const local = openLocalKnowledgeBase({ id: 'example', directory, pipelineVersion: 'metadata-test',
    ingestor: { async ingest(text) { return { ...await base.ingest(text), metadata }; } },
  });
  const { kb } = local;
  try {
    const bytes = Buffer.from('# Alpha\r\nCalibration\r\n# Beta\r\nCalibration of valves\r\n');
    const first = await kb.write(bytes, { ...markdown, originalFileName: 'manual.md' }, 'ERP/42');
    const second = await kb.write(bytes, markdown);
    const third = await kb.write(bytes, markdown);
    assert.notEqual(second.documentId, third.documentId);
    assert.equal(first.sha, second.sha);
    assert.equal(first.metadata, undefined);
    await local.reconcile();
    const artifacts = join(directory, 'map.sqlite.artifacts');
    const [key, ...others] = await readdir(artifacts);
    assert.deepEqual(others, []);
    const artifact = join(artifacts, key);
    assert.match(await readFile(join(artifact, 'document.md'), 'utf8'), /Calibration of valves/);
    const map = JSON.parse(await readFile(join(artifact, 'map.json'), 'utf8'));
    assert.equal(map.sections.length, 2);
    assert.equal('text' in map, false);
    assert.equal(await local.indexer.status(first.documentId), 'indexed');
    const page = await kb.searchKeyword('calibration', { topK: 1 });
    assert.equal(page.hits.length, 1);
    assert.equal(page.hits[0].rank, 1);
    assert.equal(page.hits[0].passages.length, 2);
    const next = await kb.searchKeyword('calibration', { cursor: page.nextCursor });
    assert.deepEqual(next.hits.map(hit => hit.rank), [2, 3]);
    assert.equal(new Set([...page.hits, ...next.hits].map(hit => hit.documentId)).size, 3);
    await assert.rejects(kb.searchKeyword('different', { cursor: page.nextCursor }), TypeError);
    const result = await kb.searchKeyword('calibration', { topK: 1, filter: {
      author: ['Alba'], tags: 'blue', createdAt: { gte: date }, originalFileName: 'manual.md',
    } });
    const [hit] = result.hits;
    assert.equal(hit.documentId, first.documentId);
    assert.deepEqual(hit.metadata, metadata);
    assert.deepEqual((await local.store.readDocumentMap(first.documentId)).metadata, metadata);
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
    assert.deepEqual(await readdir(artifacts), [key]);
    assert.equal((await kb.searchKeyword('calibration')).hits.length, 2);
    await kb.delete(second.documentId);
    await kb.delete(third.documentId);
    await local.reconcile();
    assert.deepEqual((await kb.searchKeyword('calibration')).hits, []);
    assert.deepEqual(await readdir(artifacts), []);
  } finally { await local.close(); }
});

test('PDF preserves page coordinates and indexes text found only by local OCR', async t => {
  const directory = await tempDirectory(t);
  const local = openLocalKnowledgeBase({ id: 'pdf', directory, pipelineVersion: 'page-test',
    analyzer: { async analyze({ pages }) {
      return pages.map(({ lineStart, lineEnd }) => ({ title: '', summary: '', lineStart, lineEnd }));
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
  const local = openLocalKnowledgeBase({ id: 'semantic', directory, embedder });
  try {
    await local.kb.write(Buffer.from('fan'), markdown, 'a-fan');
    await local.kb.write(Buffer.from('valve'), markdown, 'b-valve');
    await local.reconcile();
    const result = await local.kb.searchSemantic('pressure', { topK: 1 });
    assert.equal(result.hits[0].documentId, 'b-valve');
    assert.equal(result.hits[0].score, 1);
    assert.ok(result.nextCursor);
    offline = true;
    await assert.rejects(local.kb.searchSemantic('pressure'), { code: 'backend_unavailable' });
  } finally { await local.close(); }
});

test('reconciliation rebuilds from originals, retries errors and updates source info without repeating analysis', async t => {
  const directory = await tempDirectory(t);
  const store = new LocalObjectStore(join(directory, 'originals'));
  const filename = join(directory, 'map.sqlite');
  let attempts = 0;
  let fail = true;
  const options = {
    filename, pipelineVersion: 'test-1', onError: () => {},
    analyzer: { async analyze({ text }) {
      attempts++;
      if (fail) throw new Error('model unavailable');
      return [{ title: 'Calibration', summary: text, lineStart: 1, lineEnd: 1 }];
    } },
  };
  let backend;
  try {
    const body = Buffer.from('calibration');
    await store.write('external', body, { ...markdown, originalFileName: 'first.md' });
    backend = mapBackend(store, options);
    await backend.reconcile();
    assert.equal(await backend.indexer.status('external'), 'failed');
    assert.deepEqual((await backend.engine.searchKeyword('calibration')).hits, []);
    fail = false;
    await backend.reconcile();
    assert.equal(await backend.indexer.status('external'), 'indexed');
    await store.write('external', body, { ...markdown, originalFileName: 'second.md' });
    await backend.reconcile();
    assert.equal(attempts, 2);
    assert.equal((await backend.engine.searchKeyword('calibration', { filter: { originalFileName: 'second.md' } })).hits.length, 1);
    await backend.close();
    await rm(filename);
    backend = mapBackend(store, options);
    await backend.reconcile();
    assert.equal((await backend.engine.searchKeyword('calibration')).hits[0].originalFileName, 'second.md');
    assert.equal(attempts, 2);
    const artifacts = `${filename}.artifacts`;
    const [key] = await readdir(artifacts);
    await rm(join(artifacts, key, 'document.md'));
    await backend.reconcile();
    assert.equal((await backend.engine.searchKeyword('calibration')).hits[0].passages[0].text, 'calibration');
    assert.equal(attempts, 2);
  } finally {
    await backend?.close();
    store.close();
  }
});

test('prepared Markdown and map survive indexing failure, reindexing and replacement', async t => {
  const directory = await tempDirectory(t);
  const id = 'separate/stages';
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
  function open(pipelineVersion, modelId, label) {
    const markdownIngestor = new MarkdownIngestor();
    return openLocalKnowledgeBase({ id: 'pipeline', directory, pipelineVersion, converter, onError() {},
      ingestor: { async ingest(text) {
        ingestions++;
        assert.equal(text, converted);
        const map = await markdownIngestor.ingest(text);
        map.sections[0].shortDescription = label;
        map.sections[0].keywords = ['manutenzione'];
        return map;
      } },
      embedder: { modelId, dimensions: 2, async embedQuery() { return [1, 0]; },
        async embedDocuments(inputs) {
          assert.match(inputs[0], /Pump calibration/);
          assert.match(inputs[0], new RegExp(label));
          assert.match(inputs[0], /manutenzione/);
          if (failEmbedding) throw new Error('embedding unavailable');
          embeddings++;
          return inputs.map(() => [1, 0]);
        } },
    });
  }
  let local = open('ingestion-v1', 'embedding-v1', 'prima');
  try {
    await local.kb.write(Buffer.from('raw original'), { contentType: 'application/pdf' }, id);
    await local.reconcile();
    assert.equal(await local.indexer.status(id), 'failed');
    assert.deepEqual((await local.kb.searchKeyword('calibration')).hits, []);
    assert.equal((await local.kb.read(id)).text, converted);
    assert.equal((await local.store.readDocumentMap(id)).sections[0].shortDescription, 'prima');
    assert.deepEqual(await local.store.listDocumentSections(id), [
      { sectionId: 1, order: 1, title: 'Guide', shortDescription: 'prima', lineStart: 1, lineEnd: 2 },
    ]);
    assert.equal((await local.store.readDocumentSection(id, 1)).markdown, converted);
    assert.deepEqual((await local.store.readDocumentSection(id, 1)).keywords, ['manutenzione']);
    assert.equal(await local.store.readDocumentSection(id, 2), undefined);
    assert.equal(await local.store.readDocumentMarkdown(id, { start: 2, end: 2 }), 'Pump calibration');
    failEmbedding = false;
    await local.reconcile();
    assert.equal(await local.indexer.status(id), 'indexed');
    assert.equal((await local.kb.searchKeyword('manutenzione')).hits[0].documentId, id);
    assert.deepEqual([conversions, ingestions, embeddings], [1, 1, 1]);
    await local.close();

    local = open('ingestion-v1', 'embedding-v2', 'prima');
    await local.reconcile();
    assert.deepEqual([conversions, ingestions, embeddings], [1, 1, 2]);
    assert.equal((await local.kb.searchSemantic('calibration')).hits[0].documentId, id);
    await local.close();

    local = open('ingestion-v2', 'embedding-v2', 'seconda');
    await local.reconcile();
    assert.deepEqual([conversions, ingestions, embeddings], [2, 2, 3]);
    assert.equal((await local.store.readDocumentSection(id, 1)).shortDescription, 'seconda');
    assert.equal((await local.kb.searchKeyword('seconda')).hits[0].documentId, id);
    assert.equal((await local.kb.searchKeyword('prima')).hits.length, 0);
    await local.kb.delete(id);
    await local.reconcile();
    assert.equal(await local.store.readDocumentMap(id), undefined);
  } finally { await local.close(); }
});

test('derived content is keyed by document ID and cleared when the original changes', async t => {
  const store = new LocalObjectStore(await tempDirectory(t));
  const body = Buffer.from('Same bytes');
  const first = await store.write('first', body, { ...markdown, originalFileName: 'input.md' });
  const second = await store.write('second', body, markdown);
  assert.equal(first.sha, second.sha);
  assert.equal(first.originalFileName, 'input.md');
  await store.writeDocumentMarkdown('first', 'Same bytes');
  await store.writeDocumentMap('first', await new MarkdownIngestor().ingest('Same bytes'));
  assert.equal(await store.readDocumentMap('second'), undefined);
  await store.write('first', body, { ...markdown, originalFileName: 'renamed.md' });
  assert.equal((await store.stat('first')).originalFileName, 'renamed.md');
  assert.equal((await store.readDocumentSection('first', 1)).markdown, 'Same bytes');
  assert.deepEqual((await store.readDocumentSection('first', 1)).keywords, ['same', 'bytes']);
  const map = await store.readDocumentMap('first');
  map.sections[0].sectionId = 42;
  await store.writeDocumentMap('first', map);
  assert.equal(await store.readDocumentSection('first', 1), undefined);
  assert.equal((await store.readDocumentSection('first', 42)).order, 1);
  await store.write('first', Buffer.from('New bytes'), markdown);
  assert.equal(await store.readDocumentMarkdown('first'), undefined);
  assert.equal(await store.readDocumentMap('first'), undefined);
});

test('opening an older map database rebuilds the index without touching originals', async t => {
  const directory = await tempDirectory(t);
  const store = new LocalObjectStore(join(directory, 'originals'));
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
    backend = mapBackend(store, { filename });
    await backend.reconcile();
    assert.equal((await backend.engine.searchKeyword('calibration')).hits.length, 1);
    const index = new DatabaseSync(filename, { readOnly: true });
    try {
      assert.deepEqual(index.prepare("SELECT name FROM pragma_table_info('artifacts')").all().map(row => row.name), ['key']);
      assert.equal(index.prepare('SELECT text FROM section_search').get().text, null);
    } finally { index.close(); }
  } finally {
    await backend?.close();
    store.close();
  }
});

test('stale jobs do not publish overwritten or deleted documents', async t => {
  const directory = await tempDirectory(t);
  const entered = Promise.withResolvers();
  const release = Promise.withResolvers();
  const deleteEntered = Promise.withResolvers();
  const deleteRelease = Promise.withResolvers();
  const local = openLocalKnowledgeBase({ id: 'race', directory, pipelineVersion: 'race',
    analyzer: { async analyze({ text }) {
      if (text === 'outdated') { entered.resolve(); await release.promise; }
      if (text === 'deleted') { deleteEntered.resolve(); await deleteRelease.promise; }
      return [{ title: text, summary: text, lineStart: 1, lineEnd: 1 }];
    } },
  });
  const { kb } = local;
  try {
    await kb.write(Buffer.from('outdated'), markdown, 'race');
    await entered.promise;
    assert.deepEqual((await kb.list()).items, ['race']);
    assert.equal(await local.indexer.status('race'), 'pending');
    await assert.rejects(kb.read('race'), { code: 'not_found' });
    const current = await kb.write(Buffer.from('current'), markdown, 'race');
    release.resolve();
    await local.reconcile();
    assert.deepEqual((await kb.searchKeyword('outdated')).hits, []);
    assert.equal((await kb.read('race')).sha, current.sha);
    await kb.write(Buffer.from('deleted'), markdown, 'race');
    await deleteEntered.promise;
    await assert.rejects(kb.read('race'), { code: 'not_found' });
    assert.equal((await kb.searchKeyword('current')).hits[0].sha, current.sha);
    await kb.delete('race');
    deleteRelease.resolve();
    await local.reconcile();
    assert.deepEqual((await kb.list()).items, []);
    assert.deepEqual((await kb.searchKeyword('deleted current')).hits, []);
    assert.equal(await local.indexer.status('race'), 'absent');
  } finally {
    release.resolve();
    deleteRelease.resolve();
    await local.close();
  }
});