import { mkdtemp, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { parseArgs } from 'node:util';
import { getEncoding } from 'js-tiktoken';
import { load, persist } from '../../dist/index.js';
import { KbSmartManager } from '../../dist/kb/index.js';
import { offlineAzureChat } from '../../test/azure-model.mjs';
import { kb2Path, sources } from './kb2-corpus.mjs';

const modes = ['withoutDecision', 'withDecision', 'withoutDecisionTocViaTools'];
const workloads = ['targeted', 'fullDocument'];
const question = 'What is the title of NIST Special Publication 330-2019?';
const titlePattern = /The International System of Units \(SI\)/i;
const encoding = getEncoding('o200k_base');

function measure(reply, totals) {
  return offlineAzureChat(request => {
    const { messages, tools, response_format } = request;
    const result = reply(messages);
    totals.turns++;
    totals.input += encoding.encode(JSON.stringify({ messages, tools, response_format })).length;
    totals.output += encoding.encode(result.content ?? JSON.stringify(result.tool_calls)).length;
    return result;
  });
}

function toolCall(name, args) {
  return { tool_calls: [{ id: name, type: 'function', function: { name, arguments: JSON.stringify(args) } }] };
}

async function runScenario(folder, target, mode, workload, rates) {
  const search = { turns: 0, input: 0, output: 0 };
  const decision = { turns: 0, input: 0, output: 0 };
  const { documentId, sections } = target.map;
  const lines = target.markdown.split('\n');
  const sectionId = sections.find(({ range }) => titlePattern.test(lines.slice(range[0] - 1, range[1]).join('\n')))?.id;
  if (sectionId === undefined) throw new Error('Lo scenario non include la pagina con il titolo di SP 330-2019.');
  const read = workload === 'fullDocument'
    ? toolCall('kbFileRead', { documentId })
    : toolCall('kbFileReadSection', { documentId, section: { sectionId } });
  const model = measure(messages => {
    const toolResults = messages.filter(({ role }) => role === 'tool');
    if (mode === 'withoutDecisionTocViaTools') {
      if (toolResults.length === 0) return toolCall('kbGetTableOfContents', {});
      if (toolResults.length === 1 && workload === 'targeted') return toolCall('kbFileGetTableOfContents', { documentId });
    }
    if (!toolResults.length || !('markdown' in JSON.parse(toolResults.at(-1).content))) return read;
    const title = JSON.parse(toolResults.at(-1).content).markdown.match(titlePattern)?.[0];
    if (!title) throw new Error('Il tool non ha restituito il titolo atteso.');
    return { content: title };
  }, search);
  const selection = mode === 'withDecision' ? {
    maxDocuments: 1,
    decisionModel: measure(messages => {
      const { documents } = JSON.parse(messages.find(({ role }) => role === 'user').content);
      return { content: JSON.stringify({ scores: documents.map(doc => ({
        documentId: doc.documentId, score: doc.documentId === documentId ? 1 : 0,
      })) }) };
    }, decision),
  } : undefined;
  const kb = await KbSmartManager.open(folder, model, selection, {
    tocMode: mode === 'withoutDecisionTocViaTools' ? 'tools' : 'prompt',
  });
  const { answer, references } = await kb.kbAgentSearch(question);
  if (!titlePattern.test(answer) || !references.some(({ source }) => source.documentId === documentId) ||
      (selection && !decision.turns)) throw new Error('Lo scenario simulato non ha completato il percorso atteso.');

  const cost = (usage, price) => (usage.input * price.input + usage.output * price.output) / 1_000_000;
  const price = rates ? cost(search, rates.search) + cost(decision, rates.decision) : null;
  return { search, decision, totalTokens: search.input + search.output + decision.input + decision.output,
    costPerQuestion: price, costPer1000Questions: price === null ? null : price * 1000 };
}

function firstPages(doc, count) {
  const pages = doc.pages.slice(0, count);
  const lineCount = pages.findLast(page => page.range)?.range[1] ?? 0;
  const markdown = doc.markdown.split('\n').slice(0, lineCount).join('\n');
  return { pages, markdown, map: {
    ...doc.map, lineCount, sections: doc.map.sections.filter(section => section.pageRange[1] <= count),
  } };
}

export async function simulateCost({ documents, counts = [1, 3, 6], sizes = [4, 12, 20], rates } = {}) {
  if ([counts, sizes].some(values => !values.length || values.some(n => !Number.isSafeInteger(n) || n < 1))) {
    throw new Error('Usa liste non vuote di interi positivi per --counts e --pages.');
  }
  return runScenarios([...new Set(counts)].flatMap(count => [...new Set(sizes)].map(size => [count, size])), documents, rates);
}

async function runScenarios(pairs, documents, rates) {
  const maxCount = Math.max(...pairs.map(([count]) => count));
  const available = documents?.length ?? sources.length;
  if (maxCount > available) throw new Error(`Disponibili solo ${available} documenti.`);
  const selected = documents ? documents.slice(0, maxCount) : await Promise.all(
    sources.slice(0, maxCount).map(({ documentId }) => load(join(kb2Path, `doc-${documentId}`)).catch(error => {
      if (error.code !== 'ENOENT') throw error;
      throw new Error('KB2 non pronta. Esegui prima npm run benchmark:kb2:prepare.');
    })),
  );
  for (const [count, size] of pairs) {
    const maxPages = Math.min(...selected.slice(0, count).map(doc => doc.pages.length));
    if (size > maxPages) throw new Error(`Scenario ${count}x${size}: con questi documenti sono disponibili al massimo ${maxPages} pagine per PDF.`);
  }
  const scenarios = [];
  const scratch = await mkdtemp(join(tmpdir(), 'smartkb-cost-'));
  try {
    for (const [documentCount, pagesPerDocument] of pairs) {
      const folder = join(scratch, `${documentCount}x${pagesPerDocument}`);
      const sample = selected.slice(0, documentCount).map(doc => firstPages(doc, pagesPerDocument));
      for (const doc of sample) await persist(doc, join(folder, `doc-${doc.map.documentId}`));
      const result = { documentCount, pagesPerDocument,
        corpusTextTokens: sample.reduce((sum, doc) => sum + encoding.encode(doc.markdown).length, 0),
        workloads: {},
      };
      for (const workload of workloads) {
        result.workloads[workload] = {};
        for (const mode of modes) result.workloads[workload][mode] = await runScenario(folder, sample[0], mode, workload, rates);
      }
      scenarios.push(result);
    }
  } finally {
    await rm(scratch, { recursive: true, force: true });
  }
  return { corpus: 'kb2', method: 'offline-scripted', tokenizer: 'o200k_base', question, rates: rates ?? null,
    documents: selected.map(doc => ({ documentId: doc.map.documentId, name: doc.map.originalFileName, pages: doc.pages.length })),
    scenarios };
}

const rateFlags = ['search-input', 'search-output', 'decision-input', 'decision-output'];
const help = `Uso: npm run benchmark:kb2 -- [opzioni]
  --counts 1,3,6 --pages 4,12,20   Incrocia le due liste (valori predefiniti)
  --scenario 1x4 --scenario 6x20  Esegue solo le coppie documenti×pagine indicate
  --output PERCORSO              Salva il JSON invece di stamparlo
  --search-input N --search-output N --decision-input N --decision-output N
                                 Tariffe per milione; omettile per contare solo i token
  --currency USD                 Valuta delle tariffe (predefinita: USD)
  --help                         Mostra queste opzioni`;

export async function benchmarkCli(args, { documents, print = console.log } = {}) {
  const { values } = parseArgs({ args, options: {
    ...Object.fromEntries(['counts', 'pages', ...rateFlags, 'currency', 'output'].map(name => [name, { type: 'string' }])),
    scenario: { type: 'string', multiple: true },
    help: { type: 'boolean', short: 'h' },
  } });
  if (values.help) return print(help);
  let pairs;
  if (values.scenario) {
    if (values.counts !== undefined || values.pages !== undefined) throw new Error('Usa --scenario oppure --counts/--pages, non entrambi.');
    pairs = [...new Set(values.scenario.map(value => value.toLowerCase()))].map(value => {
      const match = /^([1-9]\d*)x([1-9]\d*)$/.exec(value);
      const pair = match?.slice(1).map(Number);
      if (!pair || !pair.every(Number.isSafeInteger)) throw new Error(`Scenario non valido: ${value}. Usa il formato 3x12.`);
      return pair;
    });
  }
  let rates;
  if (rateFlags.some(name => values[name] !== undefined)) {
    if (rateFlags.some(name => !values[name]?.trim() || !Number.isFinite(Number(values[name])) || Number(values[name]) < 0)) {
      throw new Error('Specifica tutte e quattro le tariffe, non negative, per milione di token.');
    }
    rates = { currency: values.currency ?? 'USD', ...Object.fromEntries(['search', 'decision'].map(model => [model, {
      input: Number(values[`${model}-input`]), output: Number(values[`${model}-output`]),
    }])) };
  }
  const numbers = value => value?.split(',').map(Number);
  const report = pairs ? await runScenarios(pairs, documents, rates)
    : await simulateCost({ documents, counts: numbers(values.counts), sizes: numbers(values.pages), rates });
  const json = JSON.stringify(report, null, 2);
  if (values.output !== undefined) await writeFile(resolve(values.output), `${json}\n`);
  else print(json);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await benchmarkCli(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}