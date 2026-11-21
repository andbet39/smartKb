import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { persist } from '../../dist/index.js';
import { offlineAzureChat } from '../../test/azure-model.mjs';
import { sources } from './kb2-corpus.mjs';
import { kb2Questions } from './kb2-questions.mjs';
import { grade } from './questions.mjs';
import { runKb2 } from './run-kb2.mjs';

test('la verifica accetta varianti delle unità e rifiuta cifre o fatti mancanti', () => {
  for (const { facts } of kb2Questions) assert.deepEqual(grade(facts.map(([label]) => label).join('; '), facts), []);
  assert.deepEqual(grade('299.792.458 m·s⁻¹', kb2Questions[0].facts), []);
  assert.deepEqual(grade('1299 792 458 m/s', kb2Questions[0].facts), ['299 792 458 m/s']);
  assert.deepEqual(grade('540 MHz; 683 lumen per watt', kb2Questions[3].facts), ['540 THz']);
});

test('mantiene le stesse domande in scenari annidati e valuta risposte nelle tre modalità', async t => {
  const folder = await mkdtemp(join(tmpdir(), 'smartkb-live-test-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  const description = { summary: 'Fixture', short_description: 'Fixture', keywords: [] };
  for (const { documentId, fileName } of sources) {
    await persist({ markdown: `Corpus fixture ${documentId}`, pages: [{ page: 1, range: [1, 1] }], map: {
      ...description, documentId, originalFileName: fileName, lineCount: 1, sections: [],
    } }, join(folder, `doc-${documentId}`));
  }
  const usage = { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 };
  const model = offlineAzureChat(({ messages }) => {
    const { id, facts } = kb2Questions.find(q => q.question === messages.find(m => m.role === 'user').content);
    if (!messages.some(m => m.role === 'tool')) {
      return { usage, tool_calls: [{ id: 'read', type: 'function', function: { name: 'kbFileRead', arguments: '{"documentId":1}' } }] };
    }
    assert.equal(JSON.parse(messages.at(-1).content).markdown, 'Corpus fixture 1');
    return { usage, content: id === 'si-candela' ? '540 THz' : facts.map(([value]) => value).join('; ') };
  });
  const batches = [];
  const decisionModel = offlineAzureChat(({ messages }) => {
    const { documents } = JSON.parse(messages[1].content);
    batches.push(documents.length);
    return { usage, content: JSON.stringify({ scores: documents.map(({ documentId }) => ({ documentId, score: 1 })) }) };
  });
  const report = await runKb2({ folder, model, selection: { decisionModel } });
  assert.deepEqual(report.scenarios.map(s => [s.documentCount, s.pages]), [[2, 2], [4, 4], [6, 6]]);
  assert.deepEqual(batches, [2, 2, 2, 2, 4, 4, 4, 4, 6, 6, 6, 6]);
  for (const scenario of report.scenarios) {
    for (const mode of ['withoutDecision', 'withDecision', 'withoutDecisionTocViaTools']) {
      const { corpus, documents, summary, results } = scenario[mode];
      assert.equal(corpus, 'kb2');
      assert.equal(documents.length, scenario.documentCount);
      assert.deepEqual(results.map(({ id }) => id), kb2Questions.map(({ id }) => id));
      assert.equal(summary.accuracy, 0.75);
      assert.equal(summary.tokens.search.total.observed, 960);
      assert.equal(summary.tokens.decision.modelTurns, mode === 'withDecision' ? 4 : 0);
      assert.deepEqual(results.at(-1).missing, ['683 lm/W']);
      assert.equal(results[0].references[0].source.documentId, 1);
    }
    assert.equal(scenario.delta.tokens.total, 480);
    assert.equal(scenario.tocViaToolsDelta.tokens.total, 0);
  }
  await assert.rejects(runKb2({ folder, counts: [0] }), /lista di interi/);
  await rm(join(folder, 'doc-6'), { recursive: true });
  await assert.rejects(runKb2({ folder, counts: [6] }), /Corpus KB2 incompleto/);
});