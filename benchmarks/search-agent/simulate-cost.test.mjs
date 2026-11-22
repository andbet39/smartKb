import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { benchmarkCli, simulateCost } from './simulate-cost.mjs';

function fixture(documentId, lines) {
  const description = { shortDescription: 'Fixture', summary: 'Fixture', keywords: [] };
  const pages = lines.map((_, index) => ({ pageNumber: index + 1, fromLine: index + 1, toLine: index + 1 }));
  return { markdown: lines.join('\n'), pages, map: {
    ...description, documentId, originalFileName: `doc-${documentId}.pdf`, lineCount: lines.length,
    sections: pages.map(({ pageNumber, fromLine, toLine }, index) => ({
      ...description, shortDescription: lines[index], sectionId: pageNumber, order: pageNumber, title: `Page ${pageNumber}`,
      fromLine, toLine, fromPage: pageNumber, toPage: pageNumber, tokens: 1, totalTokens: 1,
    })),
  } };
}

const documents = [fixture(1, ['The International System of Units (SI)', 'Metrology. '.repeat(60)]),
  fixture(2, ['Second document', 'Another subject'])];

test('varia indipendentemente pagine e documenti e computa le tariffe', async () => {
  const rates = { currency: 'EUR', input: 2, output: 8 };
  const { scenarios } = await simulateCost({ documents, counts: [1, 2], sizes: [1, 2], rates });
  const [base, morePages, moreDocs, both] = scenarios;
  assert.deepEqual(scenarios.map(s => [s.documentCount, s.pagesPerDocument]), [[1, 1], [1, 2], [2, 1], [2, 2]]);
  assert.ok(moreDocs.corpusTextTokens > base.corpusTextTokens);
  assert.ok(morePages.corpusTextTokens > base.corpusTextTokens);
  const targeted = s => s.workloads.targeted.search.input;
  assert.ok(targeted(moreDocs) > targeted(base)); // a longer catalogue
  assert.ok(targeted(morePages) > targeted(base)); // a longer table of contents
  const { targeted: section, fullDocument } = both.workloads;
  assert.equal(section.search.turns, 4);
  assert.equal(fullDocument.search.turns, 3);
  const { search, totalTokens, costPerQuestion, costPer1000Questions } = section;
  assert.equal(totalTokens, search.input + search.output);
  assert.equal(costPerQuestion, (search.input * 2 + search.output * 8) / 1e6);
  assert.equal(costPer1000Questions, costPerQuestion * 1000);
});

test('senza tariffe riporta solo token e rifiuta dimensioni impossibili', async () => {
  const { scenarios } = await simulateCost({ documents, counts: [1], sizes: [1] });
  assert.equal(scenarios[0].workloads.targeted.costPerQuestion, null);
  await assert.rejects(simulateCost({ documents, counts: [3], sizes: [1] }), /solo 2 documenti/);
  await assert.rejects(simulateCost({ documents, counts: [1], sizes: [3] }), /al massimo 2 pagine/);
  await assert.rejects(simulateCost({ documents, counts: [0], sizes: [1] }), /interi positivi/);
});

test('il comando rilancia solo gli scenari richiesti e salva un report riproducibile', async t => {
  const dir = await mkdtemp(join(tmpdir(), 'smartkb-cli-test-'));
  t.after(() => rm(dir, { recursive: true, force: true }));
  const output = join(dir, 'report.json');
  const args = ['--scenario', '1x2', '--scenario', '2x1', '--scenario', '2X1'];
  let printed;
  await benchmarkCli(args, { documents, print: value => { printed = value; } });
  await benchmarkCli([...args, '--output', output], { documents, print: () => assert.fail('Il JSON va solo nel file') });
  assert.equal(await readFile(output, 'utf8'), `${printed}\n`);
  const { scenarios } = JSON.parse(printed);
  assert.deepEqual(scenarios.map(s => [s.documentCount, s.pagesPerDocument]), [[1, 2], [2, 1]]);
});

test('il comando mostra le opzioni e rifiuta scenari ambigui o malformati', async () => {
  await benchmarkCli(['--help'], { print: value => assert.match(value, /--scenario/) });
  await assert.rejects(benchmarkCli(['--scenario', '1x2', '--counts', '1'], { documents }), /non entrambi/);
  await assert.rejects(benchmarkCli(['--scenario', '1,2'], { documents }), /Scenario non valido/);
  await assert.rejects(benchmarkCli(['--search-input', '2'], { documents }), /entrambe le tariffe/);
});