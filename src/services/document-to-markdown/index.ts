import { MIMEType } from 'node:util';
import anydoc from '@firecrawl/anydoc';
import type { MarkdownPage, ProgressReporter } from '../../contracts/types.js';
import { normalize } from './formats/text.js';
import { pdfToMarkdown } from './formats/pdf.js';

export interface ConversionOptions {
  contentType?: string;
  onProgress?: ProgressReporter;
  /** Called once for PDFs; line coordinates are one-based and inclusive. */
  onPages?: (pages: MarkdownPage[]) => void;
}

export async function toMarkdown(document: Uint8Array,
  { contentType, onProgress, onPages }: ConversionOptions = {}): Promise<string> {
  onProgress?.({ percent: 0, message: 'Converting document to Markdown' });
  const mime = contentType === undefined ? undefined : new MIMEType(contentType).essence;
  let markdown;
  if (mime === 'text/plain' || mime === 'text/markdown') {
    markdown = normalize(new TextDecoder('utf-8', { fatal: true }).decode(document));
  } else {
    const format = anydoc.formatFromBytes(document) ?? formatFromMime(mime);
    if (!format) throw new TypeError('Unsupported or unrecognized document format');
    markdown = format === 'pdf'
      ? await pdfToMarkdown(document, onProgress, onPages)
      : normalize(await anydoc.toMarkdownBytes(document, format));
  }
  onProgress?.({ percent: 100, message: 'Markdown conversion complete' });
  return markdown;
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
