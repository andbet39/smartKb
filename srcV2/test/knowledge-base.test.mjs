import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { DefaultKnowledgeBase, LocalObjectStore, openLocalKnowledgeBase } from '../dist/index.js';

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
    async readText(...args) { events.push(['readText', ...args]); return { ...info, metadata: {}, text: '' }; },
  };
  const engine = {
    async searchKeyword(...args) { events.push(['keyword', ...args]); return { hits: [] }; },
    async searchSemantic(...args) { events.push(['semantic', ...args]); return { hits: [] }; },
  };
  const indexer = {
    index(ids) { events.push(['index', ids]); throw new Error('offline'); },
    async remove(ids) { events.push(['remove', ids]); },
  };
  t.mock.method(console, 'warn', () => {});
  const kb = new DefaultKnowledgeBase({ id: 'test', store, engine, indexer });
  const bytes = Buffer.from('original');
  const range = { start: 1, end: 2 };
  const options = { topK: 2 };
  assert.equal(kb.id, 'test');
  assert.equal(await kb.write(bytes, {}, info.documentId), info);
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
  assert.equal(console.warn.mock.callCount(), 1);
});

test('object store persists exact IDs and original bytes, with literal prefix and keyset pagination', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'kb-v2-store-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const baseDirectory = join(folder, 'originals');
  const body = Buffer.from([0, 1, 255]);
  const source = { originalFileName: 'payload.bin', contentType: 'application/octet-stream' };
  const id = 'ERP/../%_\u0000\ud800';
  const store = new LocalObjectStore(baseDirectory);
  try {
    const info = await store.write(id, body, source);
    assert.deepEqual(info, { documentId: id, sha: createHash('sha256').update(body).digest('hex'), ...source });
    assert.deepEqual(await store.stat(id), info);
    const [key] = await readdir(baseDirectory);
    const object = join(baseDirectory, key);
    const version = await readFile(join(object, 'current'), 'utf8');
    assert.deepEqual(await readFile(join(object, version, 'original')), body);
    const manifest = JSON.parse(await readFile(join(object, version, 'metadata.json'), 'utf8'));
    assert.equal(manifest.documentId, id);
    assert.equal(manifest.sha, info.sha);
    for (let index = 0; index < 102; index++) await store.write(`ERP/%_${String(index).padStart(3, '0')}`, body, {});
    await store.write('ERP/xxxx', body, {});
    const page = await store.list('ERP/%_');
    assert.equal(page.items.length, 100);
    const last = await store.list('ERP/%_', page.nextCursor);
    assert.deepEqual(last.items, ['ERP/%_100', 'ERP/%_101']);
    await assert.rejects(store.list('other', page.nextCursor), TypeError);
  } finally { store.close(); }

  const reopened = new LocalObjectStore(baseDirectory);
  try {
    assert.deepEqual(Buffer.from(await reopened.read(id)), body);
    assert.equal((await reopened.stat(id)).originalFileName, source.originalFileName);
    assert.equal((await reopened.stat(id)).contentType, source.contentType);
    assert.deepEqual((await reopened.list('ERP/../')).items, [id]);
    assert.deepEqual((await reopened.list()).items.length, 100);
    const updated = await reopened.write(id, Buffer.from('new bytes'), {});
    assert.notEqual(updated.sha, createHash('sha256').update(body).digest('hex'));
    await reopened.delete(id);
    await reopened.delete(id);
    await assert.rejects(reopened.stat(id), { code: 'not_found' });
    await assert.rejects(reopened.read(id), { code: 'not_found' });
  } finally { reopened.close(); }
});

test('local KB uses the configured directory and does not silently replace SQLite originals', async t => {
  const directory = await mkdtemp(join(tmpdir(), 'kb-v2-local-'));
  t.after(() => rm(directory, { recursive: true, force: true }));
  const local = openLocalKnowledgeBase({ id: 'local', directory });
  try {
    await local.kb.write(Buffer.from('example'), { contentType: 'text/plain' }, 'example');
    await local.reconcile();
    assert.equal((await local.kb.read('example')).text, 'example');
    assert.ok((await readdir(directory)).includes('originals'));
    assert.ok(!(await readdir(directory)).includes('originals.sqlite'));
  } finally { await local.close(); }

  const oldStore = join(directory, 'originals.sqlite');
  await writeFile(oldStore, 'old store marker');
  assert.throws(() => openLocalKnowledgeBase({ id: 'local', directory }), /SQLite originals store/);
  assert.equal(await readFile(oldStore, 'utf8'), 'old store marker');
});