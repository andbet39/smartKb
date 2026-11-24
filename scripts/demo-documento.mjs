import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { basename, extname, join } from 'node:path';
import { createLlmIngestionEngine, openLocalKnowledgeBase } from '../dist/index.js';
import { createCliModel } from '../kb-agent-cli/models.mjs';

const mimeTypes = new Map([
  ['.md', 'text/markdown'],
  ['.markdown', 'text/markdown'],
  ['.txt', 'text/plain'],
  ['.csv', 'text/csv'],
  ['.pdf', 'application/pdf'],
  ['.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
  ['.pptx', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'],
]);

async function main([file, query, documentId, ...extra]) {
  if (file === '--help' || (file && !query?.trim()) || extra.length) {
    console.log('Uso: npm run demo:documento -- [percorso "parole chiave" [documentId]]');
    if (file !== '--help') process.exitCode = 1;
    return;
  }

  const bytes = file ? await readFile(file) : Buffer.from(
    '# Manuale della caldaia\nControllare la pressione prima dell’avvio.\n\n' +
    '## Pressione nominale\nLa pressione nominale è di 3 bar.\n',
  );
  const originalFileName = file ? basename(file) : undefined;
  const contentType = file ? mimeTypes.get(extname(file).toLowerCase()) : 'text/markdown';
  const directory = await mkdtemp(join(tmpdir(), 'smartkb-demo-'));

  try {
    const ingestionEngine = createLlmIngestionEngine(createCliModel('AZURE_OPENAI_'));
    const local = openLocalKnowledgeBase({ id: 'demo-documento', name: 'Demo documento', directory, ingestionEngine });
    try {
      const { kb } = local;
      const info = await kb.write(bytes, { originalFileName, contentType }, documentId);
      console.log(`Salvato: ${info.documentId}\nSHA-256: ${info.sha}`);
      console.log(`Documenti nello store: ${(await kb.list()).items.join(', ')}`);

      await local.reconcile();
      const status = await local.indexStatus(info.documentId);
      console.log(`Stato dell’indice: ${status}`);
      if (status !== 'indexed') throw new Error('Il documento non è stato indicizzato.');

      const text = query ?? 'pressione';
      const { hits } = await kb.searchKeyword(text);
      console.log(`Ricerca «${text}»: ${hits.length} documenti trovati`);
      if (hits.length === 0) return;

      const hit = hits[0];
      const passage = hit.passages[0];
      if (!passage) return;
      const { lineStart, lineEnd } = passage;
      if (lineStart === undefined || lineEnd === undefined) {
        console.log(passage.text);
        return;
      }
      const excerpt = await kb.read(hit.documentId, { start: lineStart, end: lineEnd });
      if (excerpt.sha !== hit.sha) throw new Error('Il documento è cambiato dopo la ricerca.');
      console.log(`\nRilettura di ${hit.documentId}, righe ${lineStart}–${lineEnd}:\n${excerpt.text}`);
    } finally {
      await local.close();
    }
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

main(process.argv.slice(2)).catch(error => {
  console.error(`Demo non riuscita: ${error.message}`);
  process.exitCode = 1;
});