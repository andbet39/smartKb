import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { load, persist } from '../../dist/index.js';
import { getDecisionSelection, getSearchModel } from './azure-model.mjs';
import { kb2Path, sources } from './kb2-corpus.mjs';
import { kb2Questions } from './kb2-questions.mjs';
import { runComparison } from './run.mjs';

const modes = ['withoutDecision', 'withDecision', 'withoutDecisionTocViaTools'];
const defaultCounts = [2, 4, 6];

export async function runKb2({ counts = defaultCounts, folder = kb2Path, model, selection, onResult = () => {} } = {}) {
  if (!counts.length || counts.some(count => !Number.isInteger(count) || count < 1 || count > sources.length)) {
    throw new Error(`--counts richiede una lista di interi da 1 a ${sources.length}, separati da virgole.`);
  }
  const uniqueCounts = [...new Set(counts)];
  const documents = await Promise.all(sources.slice(0, Math.max(...uniqueCounts)).map(async ({ documentId, fileName }) => {
    const path = join(folder, `doc-${documentId}`);
    const doc = await load(path).catch(error => {
      if (error.code !== 'ENOENT') throw error;
      throw new Error(`Corpus KB2 incompleto (${fileName}): esegui npm run benchmark:kb2:prepare.`);
    });
    if (doc.map.documentId !== documentId || doc.map.originalFileName !== fileName || !doc.pages?.length || !doc.markdown.trim()) {
      throw new Error(`Documento KB2 non valido: ${fileName}. Rigenera il corpus con npm run benchmark:kb2:prepare.`);
    }
    return doc;
  }));
  const scratch = await mkdtemp(join(tmpdir(), 'smartkb-live-'));
  const scenarios = [];
  try {
    for (const documentCount of uniqueCounts) {
      const kbPath = join(scratch, `docs-${documentCount}`);
      const sample = documents.slice(0, documentCount);
      for (const doc of sample) await persist(doc, join(kbPath, `doc-${doc.map.documentId}`));
      const comparison = await runComparison({
        model, selection, corpus: 'kb2', kbPath, questions: kb2Questions,
        onResult: (...args) => onResult(documentCount, ...args),
      });
      scenarios.push({ documentCount, pages: sample.reduce((sum, doc) => sum + doc.pages.length, 0), ...comparison });
    }
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  return { corpus: 'kb2', method: 'live', scenarios };
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    const { values } = parseArgs({ options: {
      counts: { type: 'string' }, output: { type: 'string' },
      'env-file': { type: 'string' }, help: { type: 'boolean', short: 'h' },
    } });
    if (values.help) {
      console.log(`Uso: npm run --silent benchmark:kb2:live -- [--counts ${defaultCounts.join(',')}] [--output PERCORSO] [--env-file PERCORSO]`);
    } else {
      const envFile = values['env-file'] ?? fileURLToPath(new URL('../../kb-agent-cli/.env', import.meta.url));
      try {
        process.loadEnvFile(envFile);
      } catch (error) {
        if (values['env-file'] !== undefined || error.code !== 'ENOENT') throw error;
      }
      const report = await runKb2({
        counts: values.counts?.split(',').map(Number),
        model: getSearchModel(), selection: getDecisionSelection(),
        onResult(count, mode, { id, status, decisionError }, index, total) {
          console.error(`[${count} doc · ${mode} ${index}/${total}] ${id}: ${status}${decisionError ? ' (fallback selezione)' : ''}`);
        },
      });
      for (const scenario of report.scenarios) {
        for (const mode of modes) {
          const { correct, questions, errors, decisionErrors, tokens } = scenario[mode].summary;
          const usage = tokens.total;
          console.error(`${scenario.documentCount} doc · ${mode}: ${correct}/${questions} corrette · ${errors} errori ricerca · ${decisionErrors} errori selezione · ${usage.observed ?? 'n/d'} token (${usage.turnsWithUsage}/${tokens.modelTurns} turni misurati)`);
          if (errors || decisionErrors) process.exitCode = 1;
        }
      }
      const json = JSON.stringify(report, null, 2);
      if (values.output !== undefined) await writeFile(resolve(values.output), `${json}\n`);
      else console.log(json);
    }
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}