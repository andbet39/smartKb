import { MIMEType } from 'node:util';
import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import anydoc from '@firecrawl/anydoc';
import { PDFiumLibrary } from '@hyzyla/pdfium';
import { PDFDocument } from 'pdf-lib';
import { PNG } from 'pngjs';
import tesseract from 'tesseract.js';
import type { MarkdownConverter } from '../contracts/interfaces.js';
import type { ExtractedText } from './types.js';

export const documentMarkdownConverter: MarkdownConverter = {
  async convert(body, contentType) {
    const { text, pages } = await extractText(body, contentType);
    return { markdown: text, pages };
  },
};

export async function extractText(bytes: Uint8Array, contentType?: string): Promise<ExtractedText> {
  const mime = contentType === undefined ? undefined : new MIMEType(contentType).essence;
  if (mime === 'text/plain' || mime === 'text/markdown') {
    return { text: normalize(new TextDecoder('utf-8', { fatal: true }).decode(bytes)) };
  }
  const format = anydoc.formatFromBytes(bytes) ?? formatFromMime(mime);
  if (format === 'pdf') return extractPdf(bytes);
  if (!format) throw new TypeError('Unsupported or unrecognized document format');
  return { text: normalize(await anydoc.toMarkdownBytes(bytes, format)) };
}

function formatFromMime(mime?: string) {
  switch (mime) {
    case 'application/pdf': return anydoc.formatFromPath('document.pdf');
    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': return anydoc.formatFromPath('document.docx');
    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': return anydoc.formatFromPath('document.pptx');
    case 'text/csv': return anydoc.formatFromPath('document.csv');
    default: return undefined;
  }
}

async function extractPdf(bytes: Uint8Array): Promise<ExtractedText> {
  const source = await PDFDocument.load(bytes);
  const library = await PDFiumLibrary.init();
  let document: Awaited<ReturnType<PDFiumLibrary['loadDocument']>> | undefined;
  let worker: tesseract.Worker | undefined;
  try {
    document = await library.loadDocument(bytes);
    const lines: string[] = [];
    const pages: NonNullable<ExtractedText['pages']> = [];
    let pageNumber = 0;
    for (const page of document.pages()) {
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
        const { originalWidth, originalHeight } = page.getOriginalSize();
        const scale = Math.min(300 / 72, 3600 / Math.max(originalWidth, originalHeight));
        const image = await page.render({ scale, render: async ({ data, width, height }) => {
          const png = new PNG({ width, height });
          png.data = Buffer.from(data);
          return PNG.sync.write(png);
        } });
        text = normalize((await worker.recognize(Buffer.from(image.data))).data.text);
      }
      if (!text.trim()) throw new Error(`PDF page ${pageNumber}: local OCR found no readable text`);
      const lineStart = lines.length + 1;
      lines.push(...text.split('\n'));
      pages.push({ page: pageNumber, lineStart, lineEnd: lines.length });
    }
    return { text: lines.join('\n'), pages };
  } finally {
    try { await worker?.terminate(); } finally {
      try { document?.destroy(); } finally { library.destroy(); }
    }
  }
}

async function nativeMarkdown(bytes: Uint8Array): Promise<string> {
  try {
    return normalize(await anydoc.toMarkdownBytes(bytes, undefined, { ocr: 'reject' }));
  } catch (error) {
    if (error instanceof Error && (('code' in error && error.code === 'needsOcr') ||
      /^unsupported input: PDF has no extractable text \(ImageBased,\s*\d+\s*pages?\)$/i.test(error.message))) return '';
    throw error;
  }
}

function createWorker() {
  const require = createRequire(import.meta.url);
  const langPath = dirname(require.resolve('@tesseract.js-data/ita/4.0.0_best_int/ita.traineddata.gz'));
  return tesseract.createWorker('ita', tesseract.OEM.LSTM_ONLY, {
    langPath, cacheMethod: 'none', errorHandler: () => {},
  });
}

function normalize(text: string): string {
  return text.replace(/\r\n?/g, '\n').replace(/\n+$/, '');
}