import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import anydoc from '@firecrawl/anydoc';
import { getEncoding } from 'js-tiktoken';
import { PDFDocument } from 'pdf-lib';
import { persist } from '../../dist/index.js';

export const kb2Path = fileURLToPath(new URL('../../kb2/', import.meta.url));
const pdfPath = fileURLToPath(new URL('../../documents/benchmark-kb2/', import.meta.url));
const publications = ['330-2019', '250-95', '250-96', '250-97', '250-98', '250-100'];
export const sources = publications.map((number, index) => {
  const fileName = `NIST.SP.${number}.pdf`;
  return {
    documentId: index + 1, fileName,
    url: `https://nvlpubs.nist.gov/nistpubs/SpecialPublications/${fileName}`,
  };
});

const description = text => ({ summary: text, short_description: text, keywords: [] });

async function download(source) {
  const file = join(pdfPath, source.fileName);
  try {
    return await readFile(file);
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
  const response = await fetch(source.url, { signal: AbortSignal.timeout(60_000) });
  if (!response.ok) throw new Error(`${source.url}: HTTP ${response.status}`);
  const bytes = Buffer.from(await response.arrayBuffer());
  await PDFDocument.load(bytes); // Validate before caching a download.
  await writeFile(file, bytes, { flag: 'wx' });
  return bytes;
}

export async function buildKb2() {
  await mkdir(pdfPath, { recursive: true });
  const encoding = getEncoding('o200k_base');
  for (const source of sources) {
    const bytes = await download(source);
    const pdf = await PDFDocument.load(bytes);
    const title = pdf.getTitle()?.trim() || source.fileName;
    const lines = [];
    const sections = [];
    const pages = [];
    for (const index of pdf.getPageIndices()) {
      const page = index + 1;
      const single = await PDFDocument.create();
      const [copy] = await single.copyPages(pdf, [index]);
      single.addPage(copy);
      let text;
      try {
        text = (await anydoc.toMarkdownBytes(await single.save(), 'pdf', { ocr: 'reject' })).trim();
      } catch (error) {
        if (error.code !== 'needsOcr' && !/^unsupported input: PDF has no extractable text/i.test(error.message)) throw error;
        text = '';
      }
      if (!text) {
        pages.push({ page, range: null });
        continue;
      }
      const start = lines.length + 1;
      lines.push(...text.replace(/\r\n?/g, '\n').split('\n'));
      const range = [start, lines.length];
      pages.push({ page, range });
      const tokens = encoding.encode(text).length;
      sections.push({
        id: page, order: page, title: `Page ${page}`, range, pageRange: [page, page], tokens, totalTokens: tokens,
        ...description(text.replace(/\s+/g, ' ').slice(0, 200)),
      });
    }
    if (!sections.length) throw new Error(`${source.fileName}: nessuna pagina con testo estraibile.`);
    await persist({ markdown: lines.join('\n'), pages, map: {
      documentId: source.documentId, originalFileName: source.fileName, title, fileType: 'pdf',
      lineCount: lines.length, sections, ...description(title),
    } }, join(kb2Path, `doc-${source.documentId}`));
    console.error(`${source.fileName}: ${pages.length} pagine, ${sections.length} con testo, ${bytes.length} byte · ${title}`);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    await buildKb2();
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}