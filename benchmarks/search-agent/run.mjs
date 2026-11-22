import { resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { getDocumentModel } from '../../dist/document-model.js';
import { KbSmartManager } from '../../dist/kb/index.js';
import { getDecisionSelection, getSearchModel } from './azure-model.mjs';
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

function tokenBreakdown(search, decision) {
  return {
    ...summarizeTokens([...search, ...decision]),
    search: summarizeTokens(search),
    decision: summarizeTokens(decision),
  };
}

export async function runBenchmark({ model = getDocumentModel(), selection, tocMode = 'prompt', onResult = () => {},
  corpus = 'kb1', kbPath = kb1Path, questions = kb1Questions } = {}) {
  if (!questions.length) throw new Error('Il benchmark richiede almeno una domanda.');
  const searchTracker = trackModel();
  const decisionTracker = trackModel();
  let decisionError;
  const configuredSelection = selection && {
    ...selection,
    decisionModel: {
      withStructuredOutput(...args) {
        const runnable = selection.decisionModel.withStructuredOutput(...args)
          .withConfig({ callbacks: decisionTracker.callbacks });
        return {
          async invoke(...inputs) {
            try {
              return await runnable.invoke(...inputs);
            } catch (error) {
              decisionError = error instanceof Error ? error.message : String(error);
              throw error; // The production selector falls back to global search.
            }
          },
        };
      },
    },
  };
  const kb = await KbSmartManager.open(kbPath, {
    bindTools: tools => model.bindTools(tools).withConfig({ callbacks: searchTracker.callbacks }),
  }, configuredSelection, { tocMode });
  const { documents } = await kb.kbGetTableOfContents();
  const results = [];
  const searchTurns = [], decisionTurns = [];

  for (const { id, question, source, facts } of questions) {
    searchTracker.runs.clear();
    decisionTracker.runs.clear();
    decisionError = null;
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
    const decisionUsage = [...decisionTracker.runs.values()];
    searchTurns.push(...searchUsage);
    decisionTurns.push(...decisionUsage);
    const result = {
      id, question, source, expected, answer, references, missing,
      status: error !== null ? 'error' : missing.length ? 'incorrect' : 'correct',
      error, decisionError, durationMs, tokens: tokenBreakdown(searchUsage, decisionUsage),
    };
    results.push(result);
    onResult(result, results.length, questions.length);
  }

  const correct = results.filter(result => result.status === 'correct').length;
  const errors = results.filter(result => result.status === 'error').length;
  return {
    corpus,
    documents: documents.map(({ source }) => source),
    model: model.model ?? model.modelName ?? null,
    deployment: model.azureOpenAIApiDeploymentName ?? null,
    tocMode: selection ? 'prompt' : tocMode,
    decision: selection ? {
      model: selection.decisionModel.model ?? selection.decisionModel.modelName ?? null,
      deployment: selection.decisionModel.deployment ?? selection.decisionModel.azureOpenAIApiDeploymentName ?? null,
      threshold: selection.threshold ?? 0.5,
      maxDocuments: selection.maxDocuments ?? 5,
    } : null,
    summary: {
      questions: results.length, correct, incorrect: results.length - correct - errors, errors,
      accuracy: correct / results.length,
      decisionErrors: results.filter(result => result.decisionError !== null).length,
      tokens: tokenBreakdown(searchTurns, decisionTurns),
    },
    results,
  };
}

function compareSummaries(baseline, variant) {
  const comparable = !baseline.errors && !variant.errors && !variant.decisionErrors;
  const complete = (tokens, field) => tokens[field].observed !== null &&
    tokens[field].turnsWithUsage === tokens.modelTurns;
  return {
    correct: comparable ? variant.correct - baseline.correct : null,
    accuracy: comparable ? variant.accuracy - baseline.accuracy : null,
    tokens: Object.fromEntries(['input', 'output', 'total'].map(field => [field,
      complete(variant.tokens, field) && complete(baseline.tokens, field)
        ? variant.tokens[field].observed - baseline.tokens[field].observed : null,
    ])),
  };
}

export async function runComparison({ model = getDocumentModel(), selection, onResult = () => {}, ...benchmark } = {}) {
  if (!selection?.decisionModel) throw new Error('Il confronto richiede un decision model configurato.');
  const run = (mode, options) => runBenchmark({
    ...benchmark, model, ...options, onResult: (...args) => onResult(mode, ...args),
  });
  const withoutDecision = await run('withoutDecision');
  const withDecision = await run('withDecision', { selection });
  const withoutDecisionTocViaTools = await run('withoutDecisionTocViaTools', { tocMode: 'tools' });
  return {
    withoutDecision,
    withDecision,
    withoutDecisionTocViaTools,
    delta: compareSummaries(withoutDecision.summary, withDecision.summary),
    tocViaToolsDelta: compareSummaries(withoutDecision.summary, withoutDecisionTocViaTools.summary),
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const report = await runComparison({
      model: getSearchModel(),
      selection: getDecisionSelection(),
      onResult(mode, { id, status, decisionError }, index, total) {
        console.error(`[${mode} ${index}/${total}] ${id}: ${status}${decisionError ? ' (fallback: errore decision model)' : ''}`);
      },
    });
    for (const mode of ['withoutDecision', 'withDecision', 'withoutDecisionTocViaTools']) {
      const { correct, questions: count, errors, decisionErrors, tokens } = report[mode].summary;
      console.error(`${mode}: ${correct}/${count} corrette · ${errors} errori di ricerca · ${decisionErrors} errori di selezione`);
      for (const [label, usage] of Object.entries({ totale: tokens, ricerca: tokens.search, decision: tokens.decision })) {
        if (usage.modelTurns) {
          console.error(`  Token ${label}: ${usage.total.observed ?? 'n/d'} (${usage.total.turnsWithUsage}/${usage.modelTurns} turni misurati)`);
        }
      }
      if (errors || decisionErrors) process.exitCode = 1;
    }
    console.log(JSON.stringify(report, null, 2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}