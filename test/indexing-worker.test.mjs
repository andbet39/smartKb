import assert from 'node:assert/strict';
import { test } from 'node:test';
import { KbError } from '../dist/contracts/errors.js';
import { IndexingWorker } from '../dist/indexing/indexing-worker.js';

test('the worker sends only the document ID to the index target after preparation', async () => {
  const info = { documentId: 'original', sha: 'original-sha' };
  const map = { markdownSha: 'markdown-sha', lineCount: 0, sections: [] };
  const published = new Set();
  let present = true;
  let prepared = false;
  const store = {
    async list() { return { items: present ? [info.documentId] : [] }; },
    async stat() {
      if (!present) throw new KbError('not_found', 'missing original');
      return info;
    },
  };
  const preparation = {
    async find() { return prepared ? map : undefined; },
    async run() { prepared = true; return map; },
  };
  const target = {
    async index(...args) {
      assert.deepEqual(args, [info.documentId]);
      assert.ok(prepared);
      published.add(args[0]);
    },
    isCurrent(document, currentMap) { return currentMap === map && published.has(document.documentId); },
    listPublished() { return [...published]; },
    async remove(id) { published.delete(id); },
  };
  const worker = new IndexingWorker(store, preparation, target);
  try {
    await worker.reconcile();
    assert.ok(published.has(info.documentId));
    assert.equal(await worker.status(info.documentId), 'indexed');
    present = false;
    await worker.reconcile();
    assert.equal(published.size, 0);
    assert.equal(await worker.status(info.documentId), 'absent');
  } finally { await worker.close(); }
});