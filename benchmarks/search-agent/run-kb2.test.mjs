import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createPosixStore, KbSmartManager, POSIXSearchEngine } from 'smartDocKb';
import { offlineAzureChat } from '../../test/azure-model.mjs';
import { sources, writeKb } from './kb2-corpus.mjs';
import { kb2Questions } from './kb2-questions.mjs';
import { grade } from './questions.mjs';
import { runBenchmark } from './run.mjs';
import { runKb2 } from './run-kb2.mjs';

test('la verifica accetta varianti delle unità e rifiuta cifre o fatti mancanti', () => {
  for (const { facts } of kb2Questions) assert.deepEqual(grade(facts.map(([label]) => label).join('; '), facts), []);
  assert.deepEqual(grade('299.792.458 m·s⁻¹', kb2Questions[0].facts), []);
  assert.deepEqual(grade('1299 792 458 m/s', kb2Questions[0].facts), ['299 792 458 m/s']);
  assert.deepEqual(grade('540 MHz; 683 lumen per watt', kb2Questions[3].facts), ['540 THz']);
});

test('chiude store e motore anche se l’apertura del manager e la chiusura del motore falliscono', async t => {
  const kbPath = await mkdtemp(join(tmpdir(), 'smartkb-lifecycle-'));
  t.after(() => rm(kbPath, { recursive: true, force: true }));
  const openError = new Error('manager open failed');
  const closeError = new Error('search engine close failed');
  let store, searchEngine;
  t.mock.method(KbSmartManager, 'open', async (openedStore, openedEngine) => {
    store = openedStore;
    searchEngine = openedEngine;
    const close = searchEngine.close.bind(searchEngine);
    t.mock.method(searchEngine, 'close', async () => {
      await close();
      throw closeError;
    });
    throw openError;
  });

  await assert.rejects(runBenchmark({ kbPath, model: {}, questions: kb2Questions }), error => {
    assert.ok(error instanceof AggregateError);
    assert.deepEqual(error.errors, [openError, closeError]);
    return true;
  });
  assert.ok(searchEngine instanceof POSIXSearchEngine);
  await assert.rejects(searchEngine.keywordSearch({ keywords: ['fixture'] }), { code: 'CLOSED' });
  await assert.rejects(store.list({ limit: 1 }), { code: 'CLOSED' });
});

test('mantiene le stesse domande in scenari annidati e valuta le risposte dell’agente via tool', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'smartkb-live-test-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const description = { summary: 'Fixture', shortDescription: 'Fixture', keywords: [] };
  await writeKb(folder, sources.map(({ documentId, fileName }) => ({
    markdown: `Corpus fixture ${documentId}`,
    pages: [{ pageNumber: 1, fromLine: 1, toLine: 1 }],
    map: {
      ...description, documentId, originalFileName: fileName, lineCount: 1,
      sections: [{ ...description, sectionId: 1, order: 1, title: 'Page 1', fromLine: 1, toLine: 1, fromPage: 1, toPage: 1, tokens: 3, totalTokens: 3 }],
    },
  })));
  const usage = { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 };
  const model = offlineAzureChat(({ messages }) => {
    const { id, facts } = kb2Questions.find(q => q.question === messages.find(m => m.role === 'user').content);
    if (!messages.some(m => m.role === 'tool')) {
      return { usage, tool_calls: [{ id: 'read', type: 'function', function: { name: 'kbDocumentRead', arguments: '{"documentId":1}' } }] };
    }
    assert.equal(JSON.parse(messages.at(-1).content).markdown, 'Corpus fixture 1');
    return { usage, content: id === 'si-candela' ? '540 THz' : facts.map(([value]) => value).join('; ') };
  });
  const report = await runKb2({ folder, model });
  assert.deepEqual(report.scenarios.map(s => [s.documentCount, s.pages]), [[2, 2], [4, 4], [6, 6]]);
  for (const { corpus, documentCount, documents, summary, results } of report.scenarios) {
    assert.equal(corpus, 'kb2');
    assert.equal(documents.length, documentCount);
    assert.deepEqual(results.map(({ id }) => id), kb2Questions.map(({ id }) => id));
    assert.equal(summary.accuracy, 0.75);
    assert.deepEqual(summary.sourcesNotLoaded, []);
    assert.equal(summary.tokens.total.observed, 960);
    assert.deepEqual(results.at(-1).missing, ['683 lm/W']);
    assert.equal(results[0].references[0].source.documentId, 1);
  }
  await assert.rejects(runKb2({ folder, counts: [0] }), /lista di interi/);
  const store = await createPosixStore({ root: folder });
  await store.delete(6);
  await store.close();
  await assert.rejects(runKb2({ folder, counts: [6] }), /Corpus KB2 incompleto/);
  await assert.rejects(runKb2({ folder: join(folder, 'missing'), counts: [1] }), /KB2 non pronta/);
});
