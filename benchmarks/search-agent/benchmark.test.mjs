import assert from 'node:assert/strict';
import { cp, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { offlineAzureChat } from '../../test/azure-model.mjs';
import { grade, questions } from './questions.mjs';
import { runBenchmark } from './run.mjs';

const kb1Path = fileURLToPath(new URL('../../kb1/', import.meta.url));

// A copy of KB1 without its derived index: the test never writes into the repository KB.
async function copyKb1(t) {
  const folder = await mkdtemp(join(tmpdir(), 'smartkb-kb1-'));
  t.after(() => rm(folder, { recursive: true, force: true }));
  await cp(kb1Path, folder, { recursive: true, filter: source => basename(source) !== '.kb' });
  return folder;
}

function toolCall(id, name, args) {
  return { tool_calls: [{ id, type: 'function', function: { name, arguments: JSON.stringify(args) } }] };
}

test('le domande hanno risposte attese valutabili e gestiscono varianti comuni', () => {
  assert.equal(questions.length, 11);
  assert.equal(new Set(questions.map(({ id }) => id)).size, questions.length);
  for (const { id, facts, source } of questions) {
    assert.deepEqual(grade(facts.map(([label]) => label).join(' e '), facts), [], id);
    assert.ok(Number.isInteger(source.documentId) && source.fromLine <= source.toLine, id);
  }

  const check = (id, answer) => grade(answer, questions.find(question => question.id === id).facts);
  assert.deepEqual(check('and-vcc', '**5,0 volt**'), []);
  assert.deepEqual(check('and-vcc', '5,25 V'), ['5 V']);
  assert.deepEqual(check('xor-vcc', 'Minimo 2 V, massimo 6 V'), []);
  assert.deepEqual(check('xor-vcc', 'da 2 a 5 V'), ['da 2 V a 6 V']);
  assert.deepEqual(check('stm8-clock-ram', '16 MHz, 2 KB'), ['1 Kbyte']);
  assert.deepEqual(check('npw-criticality', 'C1, C2, C3, C4 e non definito'), []);
  assert.deepEqual(check('npw-ooe-context', '20%, bad senza giustificazione'), ['bad with justification']);
});

test('misura i turni reali dell’agente KB via tool con trasporto Azure simulato', async t => {
  const byQuestion = new Map(questions.map(question => [question.question, question]));
  const usage = { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 };
  const model = offlineAzureChat(({ messages }) => {
    const { id, facts } = byQuestion.get(messages.find(message => message.role === 'user').content);
    const results = messages.filter(message => message.role === 'tool').map(({ content }) => JSON.parse(content));
    if (id === 'and-vcc') {
      if (!results.length) return { usage, ...toolCall('catalog', 'kbGetTableOfContents', { text: 'DM7408' }) };
      if (results.length === 1) {
        assert.deepEqual(results[0].documents.map(({ documentId }) => documentId), [1]);
        return { usage, ...toolCall('read', 'kbDocumentReadSection', { documentId: 1, section: { fromLine: 41, toLine: 43 } }) };
      }
      const nominal = results[1].markdown.match(/\|VCC\|Supply Voltage\|[\d.]+\|([\d.]+)\|/)[1];
      return { usage, content: `${nominal} V` };
    }
    if (id === 'xor-gates') {
      if (!results.length) {
        return { usage, ...toolCall('search', 'kbDocumentSearchByKeywords', {
          query: { kind: 'keywords', keywords: ['independent'] }, documentIds: [2], beforeLines: 1, afterLines: 1,
        }) };
      }
      const { snippet, source } = results[0].matches.find(({ matchLines }) => matchLines.includes(370));
      assert.deepEqual([source.documentId, source.fromLine, source.toLine], [2, 369, 371]);
      const [, count] = snippet.match(/contains (\w+) independent/);
      return { usage, content: `${count} porte [[kb:2:369:371]]` };
    }
    if (id === 'and-tphl') return { content: '27 ns' };
    if (id === 'stm32-clock') throw new Error('offline transport failure');
    return { usage, content: facts.map(([label]) => label).join(', ') };
  });

  const report = await runBenchmark({ model, kbPath: await copyKb1(t) });
  assert.deepEqual(report.documents.map(({ documentId }) => documentId), [1, 2, 3, 4]);
  assert.equal(report.summary.accuracy, (questions.length - 2) / questions.length);
  assert.equal(report.summary.incorrect, 1);
  assert.equal(report.summary.errors, 1);
  // The NPW App document is not in KB1: its questions stay in the set and are flagged.
  assert.deepEqual(report.summary.sourcesNotLoaded, ['npw-ooe', 'npw-criticality', 'npw-ooe-context']);

  const [andVcc, andTphl, stm32Clock] = report.results;
  assert.equal(andVcc.status, 'correct');
  assert.deepEqual(andVcc.references.map(({ source }) => [source.documentId, source.fromLine, source.toLine]), [[1, 41, 43]]);
  assert.deepEqual(andVcc.tokens, {
    modelTurns: 3,
    input: { observed: 300, turnsWithUsage: 3 },
    output: { observed: 60, turnsWithUsage: 3 },
    total: { observed: 360, turnsWithUsage: 3 },
  });
  assert.deepEqual(andTphl.tokens.total, { observed: null, turnsWithUsage: 0 });
  assert.equal(stm32Clock.status, 'error');
  const xorGates = report.results.find(({ id }) => id === 'xor-gates');
  assert.equal(xorGates.status, 'correct');
  assert.equal(xorGates.answer, 'four porte');
  assert.deepEqual(xorGates.references.map(({ source }) => [source.documentId, source.fromLine, source.toLine]), [[2, 369, 371]]);
  assert.equal(report.summary.tokens.modelTurns, questions.length + 3);
  assert.deepEqual(report.summary.tokens.total, { observed: (questions.length + 1) * 120, turnsWithUsage: questions.length + 1 });
});
