import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { createPosixStore, KbSmartManager, POSIXSearchEngine } from 'smartDocKb';
import { getSearchModel } from './azure-model.mjs';
import { grade, questions as kb1Questions } from './questions.mjs';

const kb1Path = fileURLToPath(new URL('../../kb1/', import.meta.url));

function summarizeTokens(turns) {
  const fields = { input: 'input_tokens', output: 'output_tokens', total: 'total_tokens' };
  return {
    modelTurns: turns.length,
    ...Object.fromEntries(Object.entries(fields).map(([name, field]) => {
      const values = turns.map(usage => usage?.[field]).filter(value => Number.isInteger(value) && value >= 0);
      return [name, {
        observed: values.length ? values.reduce((sum, value) => sum + value, 0) : null,
        turnsWithUsage: values.length,
      }];
    })),
  };
}

function trackModel() {
  const runs = new Map();
  const callbacks = [BaseCallbackHandler.fromMethods({
    name: 'search-agent-benchmark',
    awaitHandlers: true,
    handleChatModelStart(_model, _messages, runId) {
      runs.set(runId, null);
    },
    handleLLMEnd({ generations }, runId) {
      if (runs.has(runId)) runs.set(runId, generations[0]?.[0]?.message?.usage_metadata ?? null);
    },
  })];
  return { runs, callbacks };
}

export async function runBenchmark({ model = getSearchModel(), onResult = () => {},
  corpus = 'kb1', kbPath = kb1Path, questions = kb1Questions } = {}) {
  if (!questions.length) throw new Error('Il benchmark richiede almeno una domanda.');
  const searchTracker = trackModel();
  const llm = {
    bindTools: tools => model.bindTools(tools).withConfig({ callbacks: searchTracker.callbacks }),
  };
  const store = await createPosixStore({ root: kbPath });
  let searchEngine, report;
  const failures = [];
  try {
    searchEngine = await POSIXSearchEngine.open({ root: kbPath });
    const kb = await KbSmartManager.open(store, searchEngine, { llm });
    report = await benchmarkQuestions(kb, searchTracker, { model, corpus, questions, onResult });
  } catch (error) {
    failures.push(error);
  }
  for (const resource of [searchEngine, store]) {
    try {
      await resource?.close();
    } catch (error) {
      failures.push(error);
    }
  }
  if (failures.length === 1) throw failures[0];
  if (failures.length > 1) throw new AggregateError(failures, 'Errori durante il benchmark o la chiusura della KB');
  return report;
}

async function benchmarkQuestions(kb, searchTracker, { model, corpus, questions, onResult }) {
  const { documents: cards } = await kb.kbGetTableOfContents();
  const documents = cards.map(({ documentId, originalFileName, title }) => ({ documentId, originalFileName, title }));
  const documentIds = new Set(documents.map(({ documentId }) => documentId));
  const results = [];
  const searchTurns = [];

  for (const { id, question, source, facts } of questions) {
    searchTracker.runs.clear();
    const started = performance.now();
    let answer = null, references = [], error = null;
    try {
      ({ answer, references } = await kb.kbAgentSearch(question));
    } catch (cause) {
      error = cause instanceof Error ? cause.message : String(cause);
    }
    const durationMs = Math.round(performance.now() - started);
    const expected = facts.map(([label]) => label);
    const missing = answer === null ? expected : grade(answer, facts);
    const searchUsage = [...searchTracker.runs.values()];
    searchTurns.push(...searchUsage);
    const result = {
      id, question, source, expected, answer, references, missing,
      status: error !== null ? 'error' : missing.length ? 'incorrect' : 'correct',
      error, durationMs, tokens: summarizeTokens(searchUsage),
    };
    results.push(result);
    onResult(result, results.length, questions.length);
  }

  const correct = results.filter(result => result.status === 'correct').length;
  const errors = results.filter(result => result.status === 'error').length;
  return {
    corpus,
    documents,
    model: model.model ?? model.modelName ?? null,
    deployment: model.azureOpenAIApiDeploymentName ?? null,
    summary: {
      questions: results.length, correct, incorrect: results.length - correct - errors, errors,
      accuracy: correct / results.length,
      sourcesNotLoaded: questions.filter(({ source }) => !documentIds.has(source.documentId)).map(({ id }) => id),
      tokens: summarizeTokens(searchTurns),
    },
    results,
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const report = await runBenchmark({
      onResult({ id, status }, index, total) {
        console.error(`[${index}/${total}] ${id}: ${status}`);
      },
    });
    const { correct, questions: count, errors, tokens } = report.summary;
    console.error(`${correct}/${count} corrette · ${errors} errori di ricerca`);
    console.error(`Token totali: ${tokens.total.observed ?? 'n/d'} (${tokens.total.turnsWithUsage}/${tokens.modelTurns} turni misurati)`);
    if (errors) process.exitCode = 1;
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(error instanceof AggregateError ? error : error.message);
    process.exitCode = 1;
  }
}