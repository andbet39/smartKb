import { access, mkdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import anydoc from '@firecrawl/anydoc';
import { getEncoding } from 'js-tiktoken';
import { PDFDocument } from 'pdf-lib';
import { createPosixStore, KbStoreError } from 'smartDocKb';

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

const description = text => ({ summary: text, shortDescription: text, keywords: [] });

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

export async function buildKb2({ folder = kb2Path } = {}) {
  await mkdir(pdfPath, { recursive: true });
  const encoding = getEncoding('o200k_base');
  const store = await createPosixStore({ root: folder });
  try {
    for (const source of sources) await addSource(store, source, encoding);
  } finally {
    await store.close();
  }
}

async function addSource(store, source, encoding) {
  if (await hasDocument(store, source.documentId)) {
    console.error(`${source.fileName}: già presente, non rigenerato`);
    return;
  }
  const bytes = await download(source);
  const pdf = await PDFDocument.load(bytes);
  const title = pdf.getTitle()?.trim() || source.fileName;
  const lines = [];
  const sections = [];
  const pages = [];
  for (const index of pdf.getPageIndices()) {
    const pageNumber = index + 1;
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
      pages.push({ pageNumber });
      continue;
    }
    const fromLine = lines.length + 1;
    lines.push(...text.replace(/\r\n?/g, '\n').split('\n'));
    const toLine = lines.length;
    pages.push({ pageNumber, fromLine, toLine });
    const tokens = encoding.encode(text).length;
    sections.push({
      sectionId: pageNumber, order: pageNumber, title: `Page ${pageNumber}`, fromLine, toLine,
      fromPage: pageNumber, toPage: pageNumber, tokens, totalTokens: tokens,
      ...description(text.replace(/\s+/g, ' ').slice(0, 200)),
    });
  }
  if (!sections.length) throw new Error(`${source.fileName}: nessuna pagina con testo estraibile.`);
  await store.add({ markdown: lines.join('\n'), pages, map: {
    documentId: source.documentId, originalFileName: source.fileName, title, fileType: 'pdf',
    lineCount: lines.length, sections, ...description(title),
  } });
  console.error(`${source.fileName}: ${pages.length} pagine, ${sections.length} con testo, ${bytes.length} byte · ${title}`);
}

async function hasDocument(store, documentId) {
  try {
    await store.get(documentId);
    return true;
  } catch (error) {
    if (error instanceof KbStoreError && error.code === 'NOT_FOUND') return false;
    throw error;
  }
}

/** Reads the first `count` KB2 documents back as ParsedDocuments, to copy them into other stores. */
export async function loadKb2(count = sources.length, folder = kb2Path) {
  const prepare = 'esegui npm run benchmark:kb2:prepare';
  // createPosixStore would create a missing root: check first, so a typo does not leave an empty KB behind.
  await access(folder).catch(() => { throw new Error(`KB2 non pronta: ${prepare}.`); });
  const store = await createPosixStore({ root: folder });
  try {
    return await Promise.all(sources.slice(0, count).map(async ({ documentId, fileName }) => {
      let doc;
      try {
        doc = { ...await store.get(documentId), markdown: await store.read(documentId) };
      } catch (error) {
        if (!(error instanceof KbStoreError) || error.code !== 'NOT_FOUND') throw error;
        throw new Error(`Corpus KB2 incompleto (${fileName}): ${prepare}.`);
      }
      if (doc.map.originalFileName !== fileName || !doc.pages?.length || !doc.markdown.trim()) {
        throw new Error(`Documento KB2 non valido: ${fileName}. Rigenera il corpus: ${prepare}.`);
      }
      return doc;
    }));
  } finally {
    await store.close();
  }
}

/** Copies `documents` into a new store under `root`. */
export async function writeKb(root, documents) {
  const store = await createPosixStore({ root });
  try {
    for (const doc of documents) await store.add(doc);
  } finally {
    await store.close();
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