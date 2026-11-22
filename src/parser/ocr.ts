import { createRequire } from "node:module";
import { dirname } from "node:path";
import { PDFiumLibrary } from "@hyzyla/pdfium";
import { PNG } from "pngjs";
import tesseract from "tesseract.js";

const TARGET_DPI = 300;
const PDF_DPI = 72;
const MAX_IMAGE_DIMENSION_PX = 3600;
const ITALIAN_TRAINEDDATA_ASSET = "@tesseract.js-data/ita/4.0.0_best_int/ita.traineddata.gz";

export type OcrProgressEvent =
  | { step: "ocr-render" }
  | { step: "ocr-progress"; ocrPercent: number };

type OcrLogger = (event: OcrProgressEvent) => void;

export interface LocalOcr {
  recognize(bytes: Uint8Array): Promise<string>;
  close(): Promise<void>;
}

class LocalPdfOcr implements LocalOcr {
  constructor(
    private readonly library: PDFiumLibrary,
    private readonly worker: tesseract.Worker,
    private readonly resetProgress: () => void,
    private readonly log?: OcrLogger,
  ) {}

  async recognize(bytes: Uint8Array): Promise<string> {
    this.log?.({ step: "ocr-render" });
    const image = await renderPage(this.library, bytes);
    this.resetProgress();
    this.log?.({ step: "ocr-progress", ocrPercent: 0 });
    const result = await this.worker.recognize(image);
    return result.data.text;
  }

  async close(): Promise<void> {
    try {
      await this.worker.terminate();
    } finally {
      this.library.destroy();
    }
  }
}

export async function createLocalOcr(log?: OcrLogger): Promise<LocalOcr> {
  const langPath = resolveItalianLangPath();
  const library = await PDFiumLibrary.init();

  try {
    const tracker = createProgressTracker(log);
    const worker = await tesseract.createWorker("ita", tesseract.OEM.LSTM_ONLY, {
      langPath,
      cacheMethod: "none",
      logger: tracker.onStatus,
      // Jobs already reject their promises; avoid a second uncaught worker error.
      errorHandler: () => {},
    });
    return new LocalPdfOcr(library, worker, tracker.reset, log);
  } catch (error) {
    library.destroy();
    throw error;
  }
}

export async function renderPage(library: PDFiumLibrary, bytes: Uint8Array): Promise<Buffer> {
  const doc = await library.loadDocument(bytes);
  try {
    const page = doc.getPage(0);
    const { originalWidth, originalHeight } = page.getOriginalSize();
    const scale = computeRenderScale(originalWidth, originalHeight);
    const { data } = await page.render({ scale, render: encodeRgbaAsPng });
    return Buffer.from(data);
  } finally {
    doc.destroy();
  }
}

function resolveItalianLangPath(): string {
  const require = createRequire(import.meta.url);
  return dirname(require.resolve(ITALIAN_TRAINEDDATA_ASSET));
}

function createProgressTracker(log?: OcrLogger) {
  let lastPercent = 0;
  return {
    reset() {
      lastPercent = 0;
    },
    onStatus({ status, progress }: { status: string; progress: number }) {
      const percent = Math.max(0, Math.min(100, Math.floor(progress * 100)));
      const shouldReport = percent >= lastPercent + 10 || (percent === 100 && lastPercent < 100);
      if (status === "recognizing text" && shouldReport) {
        lastPercent = percent;
        log?.({ step: "ocr-progress", ocrPercent: percent });
      }
    },
  };
}

function computeRenderScale(width: number, height: number): number {
  return Math.min(TARGET_DPI / PDF_DPI, MAX_IMAGE_DIMENSION_PX / Math.max(width, height));
}

async function encodeRgbaAsPng({ width, height, data }: { width: number; height: number; data: Uint8Array }): Promise<Buffer> {
  const png = new PNG();
  png.width = width;
  png.height = height;
  png.data = Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  return PNG.sync.write(png);
}
