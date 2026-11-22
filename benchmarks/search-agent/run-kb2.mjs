import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { getSearchModel } from './azure-model.mjs';
import { kb2Path, loadKb2, sources, writeKb } from './kb2-corpus.mjs';
import { kb2Questions } from './kb2-questions.mjs';
import { runBenchmark } from './run.mjs';

const defaultCounts = [2, 4, 6];

export async function runKb2({ counts = defaultCounts, folder = kb2Path, model, onResult = () => {} } = {}) {
  if (!counts.length || counts.some(count => !Number.isInteger(count) || count < 1 || count > sources.length)) {
    throw new Error(`--counts richiede una lista di interi da 1 a ${sources.length}, separati da virgole.`);
  }
  const uniqueCounts = [...new Set(counts)];
  const documents = await loadKb2(Math.max(...uniqueCounts), folder);
  const scratch = await mkdtemp(join(tmpdir(), 'smartkb-live-'));
  const scenarios = [];
  try {
    for (const documentCount of uniqueCounts) {
      const kbPath = join(scratch, `docs-${documentCount}`);
      const sample = documents.slice(0, documentCount);
      await writeKb(kbPath, sample);
      const run = await runBenchmark({
        model, corpus: 'kb2', kbPath, questions: kb2Questions,
        onResult: (...args) => onResult(documentCount, ...args),
      });
      scenarios.push({ documentCount, pages: sample.reduce((sum, doc) => sum + doc.pages.length, 0), ...run });
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
        model: getSearchModel(),
        onResult(count, { id, status }, index, total) {
          console.error(`[${count} doc ${index}/${total}] ${id}: ${status}`);
        },
      });
      for (const { documentCount, summary: { correct, questions, errors, tokens } } of report.scenarios) {
        const usage = tokens.total;
        console.error(`${documentCount} doc: ${correct}/${questions} corrette · ${errors} errori ricerca · ${usage.observed ?? 'n/d'} token (${usage.turnsWithUsage}/${tokens.modelTurns} turni misurati)`);
        if (errors) process.exitCode = 1;
      }
      const json = JSON.stringify(report, null, 2);
      if (values.output !== undefined) await writeFile(resolve(values.output), `${json}\n`);
      else console.log(json);
    }
  } catch (error) {
    console.error(error instanceof AggregateError ? error : error.message);
    process.exitCode = 1;
  }
}