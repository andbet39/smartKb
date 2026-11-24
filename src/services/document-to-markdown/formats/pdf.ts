import anydoc from '@firecrawl/anydoc';
import { PDFiumLibrary } from '@hyzyla/pdfium';
import { PDFDocument } from 'pdf-lib';
import { createWorker, recognizePage } from './ocr.js';
import { normalize } from './text.js';
import type { ConversionOptions } from '../index.js';

export async function pdfToMarkdown(bytes: Uint8Array, onProgress: ConversionOptions['onProgress'],
  onPages: ConversionOptions['onPages']): Promise<string> {
  const source = await PDFDocument.load(bytes);
  const library = await PDFiumLibrary.init();
  let document;
  let worker;
  try {
    document = await library.loadDocument(bytes);
    const lines = [];
    const pages = [];
    let pageNumber = 0;
    for (const page of document.pages()) {
      if (pageNumber) onProgress?.({ percent: Math.floor(100 * pageNumber / source.getPageCount()),
        message: `Processed ${pageNumber} PDF pages` });
      pageNumber++;
      const index = pageNumber - 1;
      const node = source.getPage(index).node;
      if (!node.Contents() && !node.Annots()?.size()) continue;
      const single = await PDFDocument.create();
      const [copy] = await single.copyPages(source, [index]);
      single.addPage(copy);
      let text = await nativeMarkdown(await single.save());
      if (!text.trim()) {
        worker ??= await createWorker();
        text = await recognizePage(worker, page);
      }
      if (!text.trim()) throw new Error(`PDF page ${pageNumber}: local OCR found no readable text`);
      const lineStart = lines.length + 1;
      lines.push(...text.split('\n'));
      pages.push({ page: pageNumber, lineStart, lineEnd: lines.length });
    }
    onPages?.(pages);
    return lines.join('\n');
  } finally {
    try { await worker?.terminate(); } finally {
      try { document?.destroy(); } finally { library.destroy(); }
    }
  }
}

async function nativeMarkdown(bytes: Uint8Array) {
  try {
    return normalize(await anydoc.toMarkdownBytes(bytes, undefined, { ocr: 'reject' }));
  } catch (error) {
    if (error instanceof Error && (('code' in error && error.code === 'needsOcr') ||
      /^unsupported input: PDF has no extractable text \(ImageBased,\s*\d+\s*pages?\)$/i.test(error.message))) return '';
    throw error;
  }
}
