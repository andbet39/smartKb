import assert from 'node:assert/strict';
import { test } from 'node:test';
import { offlineAzureChat } from '../../test/azure-model.mjs';
import { grade, questions } from './questions.mjs';
import { runBenchmark, runComparison } from './run.mjs';

test('le domande hanno risposte attese valutabili e gestiscono varianti comuni', () => {
  assert.equal(questions.length, 11);
  assert.equal(new Set(questions.map(({ id }) => id)).size, questions.length);
  for (const { id, facts } of questions) {
    assert.deepEqual(grade(facts.map(([label]) => label).join(' e '), facts), [], id);
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

test('misura i turni reali dell’agente KB con trasporto Azure simulato', async () => {
  const byQuestion = new Map(questions.map(question => [question.question, question]));
  const usage = { prompt_tokens: 100, completion_tokens: 20, total_tokens: 120 };
  const model = offlineAzureChat(({ messages }) => {
    const { id, facts } = byQuestion.get(messages.find(message => message.role === 'user').content);
    if (id === 'npw-ooe-context') {
      if (messages.at(-1).role !== 'tool') {
        return { usage, tool_calls: [{
          id: 'search-context', type: 'function',
          function: { name: 'kbFileSearchByKeywords', arguments: JSON.stringify({
            query: { kind: 'keywords', keywords: ['Req *39:'] },
            fileSpec: { documentIds: [5] }, beforeLines: 1, afterLines: 2,
          }) },
        }] };
      }
      const { matches } = JSON.parse(messages.at(-1).content);
      assert.equal(matches.length, 1);
      const [{ snippet, source, matchLines }] = matches;
      assert.deepEqual(matchLines, [146]);
      assert.deepEqual([source.documentId, source.fromLine, source.toLine], [5, 145, 148]);
      const [before, match, ...after] = snippet.split('\n');
      assert.match(before, /good variable/i);
      const threshold = match.match(/\d+%/)[0];
      const categories = after.map(line => line.match(/\bbad (?:with|without) justification\b/i)[0]);
      return { usage, content: `${[threshold, ...categories].join(', ')} [[kb:5:145:148]]` };
    }
    if (id === 'and-vcc' && !messages.some(message => message.role === 'tool')) {
      return { usage, tool_calls: [{
        id: 'read-and', type: 'function',
        function: { name: 'kbFileSearchByKeywords', arguments: JSON.stringify({ query: { kind: 'keywords', keywords: ['4.75|5|5.25'] } }) },
      }] };
    }
    if (id === 'and-vcc') assert.match(messages.at(-1).content, /4\.75\|5\|5\.25/);
    if (id === 'and-tphl') return { content: '27 ns' };
    if (id === 'stm32-clock') throw new Error('offline transport failure');
    return { usage, content: facts.map(([label]) => label).join(', ') };
  });

  const report = await runBenchmark({ model });
  assert.equal(report.summary.accuracy, (questions.length - 2) / questions.length);
  assert.equal(report.summary.incorrect, 1);
  assert.equal(report.summary.errors, 1);
  assert.deepEqual(report.results[0].tokens.search, {
    modelTurns: 2,
    input: { observed: 200, turnsWithUsage: 2 },
    output: { observed: 40, turnsWithUsage: 2 },
    total: { observed: 240, turnsWithUsage: 2 },
  });
  assert.deepEqual(report.results[1].tokens.total, { observed: null, turnsWithUsage: 0 });
  assert.equal(report.results[2].status, 'error');
  const context = report.results.find(({ id }) => id === 'npw-ooe-context');
  assert.equal(context.status, 'correct');
  assert.equal(context.answer, '20%, bad without justification, bad with justification');
  assert.deepEqual(context.references.map(({ source }) => [source.documentId, source.fromLine, source.toLine]), [[5, 145, 148]]);
  assert.equal(context.tokens.search.modelTurns, 2);
  assert.equal(report.summary.tokens.modelTurns, questions.length + 2);
  assert.deepEqual(report.summary.tokens.total, { observed: questions.length * 120, turnsWithUsage: questions.length });
});

test('confronta le stesse domande e separa il costo del selettore dalla ricerca', async () => {
  const byQuestion = new Map(questions.map(question => [question.question, question]));
  const searchPrompts = [];
  const decisionQuestions = [];
  const model = offlineAzureChat(({ messages }) => {
    const { content: prompt } = messages[0];
    searchPrompts.push(prompt);
    const { facts } = byQuestion.get(messages[1].content);
    const inputTokens = prompt.includes('No table of contents is provided') ? 20 : 30;
    return { content: facts.map(([label]) => label).join(', '),
      usage: { prompt_tokens: inputTokens, completion_tokens: 10, total_tokens: inputTokens + 10 } };
  });
  const decisionModel = offlineAzureChat(({ messages }) => {
    const { question, documents } = JSON.parse(messages[1].content);
    decisionQuestions.push(question);
    return {
      content: JSON.stringify({ scores: documents.map(({ documentId }) => ({ documentId, score: 1 })) }),
      usage: { prompt_tokens: 10, completion_tokens: 5, total_tokens: 15 },
    };
  });
  const { withoutDecision, withDecision, withoutDecisionTocViaTools, delta, tocViaToolsDelta } = await runComparison({
    model, selection: { decisionModel, maxDocuments: 1 },
  });
  const expectedQuestions = [...byQuestion.keys()];
  for (const run of [withoutDecision, withDecision, withoutDecisionTocViaTools]) {
    assert.deepEqual(run.results.map(({ question }) => question), expectedQuestions);
    assert.equal(run.summary.accuracy, 1);
    assert.equal(run.summary.decisionErrors, 0);
    assert.equal(run.summary.tokens.search.total.observed, questions.length * (run.tocMode === 'tools' ? 30 : 40));
  }
  assert.deepEqual(decisionQuestions, expectedQuestions);
  assert.equal(withoutDecision.summary.tokens.decision.modelTurns, 0);
  assert.equal(withoutDecisionTocViaTools.summary.tokens.decision.modelTurns, 0);
  assert.deepEqual([withoutDecision.tocMode, withDecision.tocMode, withoutDecisionTocViaTools.tocMode], ['prompt', 'prompt', 'tools']);
  assert.deepEqual(withDecision.summary.tokens.decision.total, { observed: questions.length * 15, turnsWithUsage: questions.length });
  assert.equal(withDecision.summary.tokens.total.observed, questions.length * 55);
  assert.ok(searchPrompts.slice(0, questions.length).every(prompt => prompt.includes('all loaded documents')));
  assert.ok(searchPrompts.slice(questions.length, 2 * questions.length).every(prompt => JSON.parse(prompt.split('candidate documents (JSON):\n')[1]).length === 1));
  assert.ok(searchPrompts.slice(2 * questions.length).every(prompt => prompt.includes('kbFileGetTableOfContents') && !prompt.includes('documents (JSON):')));
  assert.deepEqual(delta, {
    correct: 0, accuracy: 0,
    tokens: { input: questions.length * 10, output: questions.length * 5, total: questions.length * 15 },
  });
  assert.deepEqual(tocViaToolsDelta, {
    correct: 0, accuracy: 0,
    tokens: { input: -questions.length * 10, output: 0, total: -questions.length * 10 },
  });
});