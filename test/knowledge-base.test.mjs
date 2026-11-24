import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { ingestionEngine } from './model-fixture.mjs';
import { composeKnowledgeBase, DefaultKnowledgeBase, DocumentMapStore, LocalObjectStore, openLocalKnowledgeBase } from '../dist/index.js';

test('LangChain tools delegate read-only calls to the public KB with typed arguments', async t => {
  const kb = new DefaultKnowledgeBase({ id: 42, name: 'Manuals' }, {});
  const tools = Object.fromEntries(kb.getLangchainTools().map(tool => [tool.name, tool]));
  const iso = '2026-01-01T00:00:00Z';
  const opts = { topK: 2, filter: { tags: 'manual', createdAt: { gte: iso }, modifiedAt: iso } };
  const typed = { topK: 2, filter: { tags: 'manual', createdAt: { gte: new Date(iso) }, modifiedAt: new Date(iso) } };
  const cases = [
    ['list', { idPrefix: 'ERP', cursor: 'next' }, ['ERP', 'next']],
    ['read', { documentId: 'doc', lines: { start: 1, end: 2 } }, ['doc', { start: 1, end: 2 }]],
    ['getDocumentsToc', { documentIds: ['a', 'b'] }, [['a', 'b']]],
    ['searchDocumentsToc', { mode: 'semantic', text: 'valve', opts }, ['semantic', 'valve', typed]],
    ['searchKeyword', { text: 'valve', opts }, ['valve', typed]],
    ['searchSemantic', { text: 'valve' }, ['valve', undefined]],
  ];
  assert.deepEqual(Object.keys(tools).sort(), [...cases.map(([name]) => name), 'readSection', 'readSectionSummary'].map(name => `42_${name}`).sort());
  for (const [name, input, args] of cases) {
    const expected = { result: name };
    const method = t.mock.method(kb, name, async () => expected);
    assert.deepEqual(await tools[`42_${name}`].invoke(input), expected);
    assert.deepEqual(method.mock.calls[0].arguments, args);
  }
  await assert.rejects(tools['42_searchKeyword'].invoke({ text: 'valve', opts: { filter: { unknown: 'x' } } }));
  assert.equal(kb.searchKeyword.mock.callCount(), 1);
});

test('KB tools can coexist with the same display name and route to their own store', async () => {
  const tools = new Map();
  for (const [id, description] of [[0, 'Datasheets'], ['28a1825f-794b-4d13-a561-39b92688370c', 'Repairs']]) {
    const kb = new DefaultKnowledgeBase({ id, name: 'Manuals', description,
      documentStore: { async list() { return { items: [description] }; } },
    }, {});
    for (const tool of kb.getLangchainTools()) {
      assert.ok(!tools.has(tool.name));
      assert.ok(tool.description.includes('Manuals') && tool.description.includes(description));
      tools.set(tool.name, tool);
    }
  }
  assert.deepEqual(await tools.get('0_list').invoke({}), { items: ['Datasheets'] });
  assert.deepEqual(await tools.get('28a1825f-794b-4d13-a561-39b92688370c_list').invoke({}), { items: ['Repairs'] });
  for (const missing of [{ id: 0 }, { name: 'Manuals' }]) {
    assert.throws(() => new DefaultKnowledgeBase(missing, {}), /id and name are required/);
  }
});

test('section tools reject invalid IDs and explain when a section is unavailable', async () => {
  const kb = new DefaultKnowledgeBase({ id: 'test', name: 'Test', documentStore: {
    async readDocumentSection() { return undefined; },
    async readDocumentMap() { return { sections: [{ sectionId: 1 }] }; },
  } }, {});
  const tools = kb.getLangchainTools().filter(({ name }) => name.startsWith('test_readSection'));
  assert.equal(tools.length, 2);
  for (const tool of tools) {
    await assert.rejects(tool.invoke({ documentId: 'doc', sectionId: 0 }));
    assert.match(await tool.invoke({ documentId: 'doc', sectionId: 2 }), /Section not found.*test_getDocumentsToc/);
  }
});

test('facade delegates reads and notifies only after a successful store mutation', async t => {
  const events = [];
  const info = { documentId: 'ERP/42', sha: 'sha' };
  const store = {
    async write(id, body, metadata) {
      events.push(['write', id, body, metadata]);
      if (id === 'failure') throw new Error('write failed');
      return info;
    },
    async list(...args) { events.push(['list', ...args]); return { items: [] }; },
    async delete(id) { events.push(['delete', id]); },
    async readText(...args) { events.push(['readText', ...args]); return { ...info, text: '' }; },
  };
  const searchEngine = {
    async searchKeyword(...args) { events.push(['keyword', ...args]); return { hits: [] }; },
    async searchSemantic(...args) { events.push(['semantic', ...args]); return { hits: [] }; },
  };
  const ingestionEngine = { async ingest() { return { markdownSha: '', lineCount: 0, sections: [] }; } };
  const indexer = {
    index(ids) { events.push(['index', ids]); throw new Error('offline'); },
    async remove(ids) { events.push(['remove', ids]); },
  };
  const kb = new DefaultKnowledgeBase({ id: 'test', name: 'Test', documentStore: store, ingestionEngine, searchEngine, indexEngine: {} }, indexer);
  const bytes = Buffer.from('original');
  const range = { start: 1, end: 2 };
  const options = { topK: 2 };
  assert.equal(kb.id, 'test');
  await assert.rejects(kb.write(bytes, {}, info.documentId), /offline/);
  await assert.rejects(kb.write(bytes, {}, ''), TypeError);
  await assert.rejects(kb.write(bytes, {}, 'failure'), /write failed/);
  await kb.searchKeyword('query', options);
  await kb.searchSemantic('query', options);
  await kb.read(info.documentId, range);
  await kb.list('ERP', 'cursor');
  await kb.delete(info.documentId);
  assert.deepEqual(events, [
    ['write', info.documentId, bytes, {}], ['index', [info.documentId]], ['write', 'failure', bytes, {}],
    ['keyword', 'query', options], ['semantic', 'query', options], ['readText', info.documentId, range],
    ['list', 'ERP', 'cursor'], ['delete', info.documentId], ['remove', [info.documentId]],
  ]);
});

test('composition accepts a caller-selected store and backend family', async () => {
  const events = [];
  const info = { documentId: 'custom', sha: 'sha' };
  const store = {
    async write(id) { events.push(['write', id]); return info; },
    async list() { return { items: [] }; },
    async delete() { events.push(['delete']); },
    async readText() { return { ...info, text: '' }; },
    close() { events.push(['close-store']); },
  };
  const indexer = {
    async index(ids) { events.push(['index', ids]); },
    async remove(ids) { events.push(['remove', ids]); },
    async status() { return 'indexed'; },
  };
  const searchEngine = {
    async searchKeyword() { return { hits: [] }; },
    async searchSemantic() { return { hits: [] }; },
  };
  const ingestionEngine = { async ingest() { return { markdownSha: '', lineCount: 0, sections: [] }; } };
  const indexEngine = { async index(id) { events.push(['publish', id]); } };
  const local = composeKnowledgeBase({
    id: 'custom', name: 'Custom', documentStore: store, ingestionEngine, indexEngine, searchEngine, scheduler: indexer,
    async reconcile() { events.push(['reconcile']); },
    async closeBackend() { events.push(['close-backend']); },
    closeStore: () => store.close(),
  });
  assert.equal(local.kb.documentStore, store);
  assert.equal(local.kb.ingestionEngine, ingestionEngine);
  assert.equal(local.kb.indexEngine, indexEngine);
  assert.equal(local.kb.searchEngine, searchEngine);

  await local.kb.write(Buffer.from('document'), {}, 'custom');
  await local.reconcile();
  await local.close();

  assert.deepEqual(events, [
    ['write', 'custom'], ['index', ['custom']], ['reconcile'], ['close-backend'], ['close-store'],
  ]);
});

test('document store persists exact IDs and original bytes, with literal prefix and keyset pagination', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'kb-v2-store-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const baseDirectory = join(folder, 'originals');
  const body = Buffer.from([0, 1, 255]);
  const source = { originalFileName: 'payload.bin', contentType: 'application/octet-stream' };
  const id = 'Manuale 42';
  const objects = new LocalObjectStore(baseDirectory);
  const store = new DocumentMapStore(objects);
  try {
    const info = await store.write(id, body, source);
    assert.deepEqual(info, { documentId: id, sha: createHash('sha256').update(body).digest('hex'), ...source });
    assert.deepEqual(await store.stat(id), info);
    assert.deepEqual(await readdir(baseDirectory), [id]);
    const object = join(baseDirectory, id);
    assert.deepEqual((await readdir(object)).sort(), ['metadata.json', 'original.bin']);
    const payload = join(object, 'original.bin');
    assert.deepEqual(await readFile(payload), body);
    assert.deepEqual(await store.read(id), body);
    for (const invalid of ['..', '../outside', 'ERP/42', 'a\\b', 'CON.txt', 'trail.', 'a:b', 'x\0y']) {
      await assert.rejects(store.write(invalid, body), /documentId/);
      await assert.rejects(store.delete(invalid), /documentId/);
    }
    if (process.platform === 'win32') await assert.rejects(store.delete(id.toLowerCase()), /collision/);
    const manifest = JSON.parse(await readFile(join(object, 'metadata.json'), 'utf8'));
    assert.equal(manifest.documentId, id);
    assert.equal(manifest.sha, info.sha);
    for (let index = 0; index < 102; index++) await store.write(`ERP-%_${String(index).padStart(3, '0')}`, body, {});
    await store.write('ERP-xxxx', body, {});
    const page = await store.list('ERP-%_');
    assert.equal(page.items.length, 100);
    const last = await store.list('ERP-%_', page.nextCursor);
    assert.deepEqual(last.items, ['ERP-%_100', 'ERP-%_101']);
    await assert.rejects(store.list('other', page.nextCursor), TypeError);
  } finally { objects.close(); }

  const reopenedObjects = new LocalObjectStore(baseDirectory);
  const reopened = new DocumentMapStore(reopenedObjects);
  try {
    assert.deepEqual(Buffer.from(await reopened.read(id)), body);
    assert.equal((await reopened.stat(id)).originalFileName, source.originalFileName);
    assert.equal((await reopened.stat(id)).contentType, source.contentType);
    assert.deepEqual((await reopened.list('Manuale')).items, [id]);
    assert.deepEqual((await reopened.list()).items.length, 100);
    const updated = await reopened.write(id, Buffer.from('new bytes'), {});
    assert.deepEqual((await readdir(join(baseDirectory, id))).sort(), ['metadata.json', 'original']);
    assert.notEqual(updated.sha, createHash('sha256').update(body).digest('hex'));
    await reopened.delete(id);
    await reopened.delete(id);
    await assert.rejects(reopened.stat(id), { code: 'not_found' });
    await assert.rejects(reopened.read(id), { code: 'not_found' });
  } finally { reopenedObjects.close(); }
});

test('write forwards module progress only to the matching write, including after it resolves', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'kb-v2-progress-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const gate = Promise.withResolvers();
  const warning = t.mock.method(console, 'warn', () => {});
  const local = openLocalKnowledgeBase({ id: 'progress', name: 'Progress', directory, ingestionEngine,
    converter: { async convert(bytes, _type, report) {
      await gate.promise;
      const markdown = new TextDecoder().decode(bytes);
      report?.({ percent: 75, message: markdown });
      return { markdown };
    } },
  });
  const events = [];
  const skipped = [];
  const latest = [];
  const source = { contentType: 'text/plain' };
  try {
    const { documentId } = await local.kb.write(Buffer.from('first'), source, undefined, (update, id) => {
      events.push({ ...update, id });
      if (update.percent === 75) throw new Error('observer failed');
    });
    await local.kb.write(Buffer.from('old'), source, 'same', update => skipped.push(update));
    await local.kb.write(Buffer.from('new'), source, 'same', (update, id) => latest.push({ ...update, id }));
    gate.resolve();
    await local.reconcile();
    assert.deepEqual(events.map(e => e.percent), [75, 0, 50, 100, 0, 100]);
    assert.equal(events[0].message, 'first');
    assert.ok(events.every(e => e.id === documentId));
    assert.deepEqual(skipped, []);
    assert.equal(latest[0].message, 'new');
    assert.ok(latest.every(e => e.id === 'same'));
    assert.equal(warning.mock.callCount(), 1);
    assert.equal(await local.indexStatus(documentId), 'indexed');
    await local.kb.write(Buffer.from('new'), source, 'same', update => skipped.push(update));
    await local.reconcile();
    assert.deepEqual(skipped, []);
  } finally { gate.resolve(); await local.close(); }
});

test('local KB uses the configured directory and does not silently replace SQLite originals', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'kb-v2-local-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  assert.throws(() => openLocalKnowledgeBase({ id: 'local', name: 'Local', directory }), /ingestion engine/);
  const local = openLocalKnowledgeBase({ id: 'local', name: 'Local', directory, ingestionEngine });
  try {
    await local.kb.write(Buffer.from('example'), { contentType: 'text/plain' }, 'example');
    await local.reconcile();
    assert.equal((await local.kb.read('example')).text, 'example');
    assert.ok((await readdir(directory)).includes('originals'));
    assert.ok(!(await readdir(directory)).includes('originals.sqlite'));
  } finally { await local.close(); }

  const oldStore = join(directory, 'originals.sqlite');
  await writeFile(oldStore, 'old store marker');
  assert.throws(() => openLocalKnowledgeBase({ id: 'local', name: 'Local', directory }), /SQLite originals store/);
  assert.equal(await readFile(oldStore, 'utf8'), 'old store marker');
});