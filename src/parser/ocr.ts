import { createRequire } from "node:module";
import { dirname } from "node:path";
import { PDFiumLibrary } from "@hyzyla/pdfium";
import { PNG } from "pngjs";
import tesseract from "tesseract.js";

export async function renderPage(library: PDFiumLibrary, bytes: Uint8Array) {
  const doc = await library.loadDocument(bytes);
  try {
    const page = doc.getPage(0);
    const { originalWidth, originalHeight } = page.getOriginalSize();
    const scale = Math.min(300 / 72, 3600 / Math.max(originalWidth, originalHeight));
    const { data } = await page.render({
      scale,
      render: async ({ width, height, data }) => {
        const png = new PNG();
        png.width = width;
        png.height = height;
        png.data = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
        return PNG.sync.write(png);
      },
    });
    return Buffer.from(data);
  } finally {
    doc.destroy();
  }
}

export async function createLocalOcr(log?: (message: string) => void) {
  const require = createRequire(import.meta.url);
  const langPath = dirname(require.resolve("@tesseract.js-data/ita/4.0.0_best_int/ita.traineddata.gz"));
  const library = await PDFiumLibrary.init();
  try {
    let lastPercent = 0;
    const worker = await tesseract.createWorker("ita", tesseract.OEM.LSTM_ONLY, {
      langPath, cacheMethod: "none",
      logger: ({ status, progress }) => {
        const percent = Math.floor(progress * 100);
        if (status === "recognizing text" && (percent >= lastPercent + 10 || (percent === 100 && lastPercent < 100))) {
          lastPercent = percent;
          log?.(`OCR ${percent}%.`);
        }
      },
      // Jobs already reject their promises; avoid a second uncaught worker error.
      errorHandler: () => {},
    });
    return {
      async recognize(bytes: Uint8Array) {
        log?.("rendering PDFium.");
        const image = await renderPage(library, bytes);
        lastPercent = 0;
        log?.("OCR 0%.");
        const result = await worker.recognize(image);
        return result.data.text;
      },
      async close() {
        try { await worker.terminate(); } finally { library.destroy(); }
      },
    };
  } catch (error) {
    library.destroy();
    throw error;
  }
}
