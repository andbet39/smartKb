import { createRequire } from 'node:module';
import { dirname } from 'node:path';
import { PNG } from 'pngjs';
import type { PDFiumPage } from '@hyzyla/pdfium';
import tesseract from 'tesseract.js';
import { normalize } from './text.js';

export function createWorker() {
  const require = createRequire(import.meta.url);
  const langPath = dirname(require.resolve('@tesseract.js-data/ita/4.0.0_best_int/ita.traineddata.gz'));
  return tesseract.createWorker('ita', tesseract.OEM.LSTM_ONLY, {
    langPath, cacheMethod: 'none', errorHandler: () => {},
  });
}

export async function recognizePage(worker: tesseract.Worker, page: PDFiumPage) {
  const { originalWidth, originalHeight } = page.getOriginalSize();
  const scale = Math.min(300 / 72, 3600 / Math.max(originalWidth, originalHeight));
  const image = await page.render({ scale, render: async ({ data, width, height }) => {
    const png = new PNG({ width, height });
    png.data = Buffer.from(data);
    return PNG.sync.write(png);
  } });
  return normalize((await worker.recognize(Buffer.from(image.data))).data.text);
}
