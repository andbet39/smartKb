import anydoc from "@firecrawl/anydoc";
import { PDFDocument } from "pdf-lib";
import { normalizeMarkdown } from "../document/lines.ts";
import type { DocumentPage } from "../document/types.ts";
import type { OcrProgressEvent } from "./ocr.ts";
import type { ConversionProgress, DocumentInput } from "./types.ts";
import { ParserUtils } from "./utils.ts";

type ConversionInput = Pick<DocumentInput, "bytes" | "fileName">;
export type LocalConversionProgress = Omit<ConversionProgress, "documentId" | "batch">;
type ConversionLogger = (progress: LocalConversionProgress) => void;
type PageRecognizer = (bytes: Uint8Array, page: number) => Promise<string>;

/** Markdown plus the line range of each PDF page. Internal: the public API returns Markdown only. */
export interface ConvertedDocument {
  markdown: string;
  pages?: DocumentPage[];
}

/** Converts a file to clean Markdown locally (PDF text extraction or OCR), without any LLM. */
export async function convertDocument(input: ConversionInput, log?: ConversionLogger): Promise<string> {
  return (await convertToMarkdown(input, log)).markdown;
}

export async function convertToMarkdown(input: ConversionInput, log?: ConversionLogger): Promise<ConvertedDocument> {
  const format = anydoc.formatFromBytes(input.bytes) ?? anydoc.formatFromPath(input.fileName ?? "");
  if (!format) {
    throw new Error("Unsupported or unrecognized format");
  }

  const fileName = ParserUtils.extractOriginalFileName(input.fileName);
  const base = {
    ...(fileName && { fileName }),
    phase: "conversion" as const,
    format,
    bytes: input.bytes.length,
  };

  if (format !== "pdf") {
    const label = format.toUpperCase();
    log?.({
      ...base,
      step: "start",
      current: 0,
      total: 1,
      unit: "documents",
      phasePercent: 0,
      percent: 0,
      message: `Conversione locale ${label} (${input.bytes.length} byte).`,
    });
    const markdown = normalizeMarkdown(await anydoc.toMarkdownBytes(input.bytes, format));
    log?.({
      ...base,
      step: "done",
      current: 1,
      total: 1,
      unit: "documents",
      phasePercent: 100,
      percent: 100,
      message: `Conversione locale ${label} completata.`,
    });
    return { markdown };
  }

  return convertPdf(input.bytes, base, log);
}

async function convertPdf(
  bytes: Uint8Array,
  base: Omit<LocalConversionProgress, "step" | "current" | "total" | "unit" | "phasePercent" | "percent" | "message">,
  log?: ConversionLogger,
): Promise<ConvertedDocument> {
  const pdf = await PDFDocument.load(bytes);
  const totalPages = pdf.getPageCount();
  let currentPage = 0;
  let ocr: Awaited<ReturnType<typeof import("./ocr.ts").createLocalOcr>> | undefined;

  const emitPage = (
    page: number,
    completedPages: number,
    phasePercent: number,
    fields: Pick<ConversionProgress, "step" | "message" | "pageSource" | "ocrPercent">,
  ) => {
    log?.({
      ...base,
      ...fields,
      page,
      totalPages,
      current: completedPages,
      total: totalPages,
      unit: "pages",
      phasePercent,
      percent: phasePercent,
    });
  };

  log?.({
    ...base,
    step: "start",
    totalPages,
    current: 0,
    total: totalPages,
    unit: "pages",
    phasePercent: 0,
    percent: 0,
    message: `Conversione locale PDF (${totalPages} pagine, ${bytes.length} byte).`,
  });

  try {
    const converted = await convertPdfPages(pdf, async (pageBytes, page) => {
      currentPage = page;
      const completedPages = page - 1;
      const basePercent = pagePercent(completedPages, totalPages);
      if (!ocr) {
        emitPage(page, completedPages, basePercent, {
          step: "ocr-init",
          message: `Pagina ${page}/${totalPages}: inizializzazione OCR locale (ita).`,
        });
        const { createLocalOcr } = await import("./ocr.ts");
        ocr = await createLocalOcr(log && ((event: OcrProgressEvent) => {
          const activeCompleted = currentPage - 1;
          if (event.step === "ocr-render") {
            emitPage(currentPage, activeCompleted, pagePercent(activeCompleted, totalPages), {
              step: "ocr-render",
              message: `Pagina ${currentPage}/${totalPages}: rendering PDFium.`,
            });
            return;
          }
          const inPagePercent = Math.min(
            99,
            Math.floor((100 * (activeCompleted + (event.ocrPercent / 100) * 0.99)) / totalPages),
          );
          emitPage(currentPage, activeCompleted, inPagePercent, {
            step: "ocr-progress",
            ocrPercent: event.ocrPercent,
            message: `Pagina ${currentPage}/${totalPages}: OCR ${event.ocrPercent}%.`,
          });
        }));
      }
      return ocr.recognize(pageBytes);
    }, emitPage);

    log?.({
      ...base,
      step: "done",
      totalPages,
      current: totalPages,
      total: totalPages,
      unit: "pages",
      phasePercent: 100,
      percent: 100,
      message: `Conversione locale PDF completata (${totalPages} pagine).`,
    });
    return converted;
  } finally {
    await ocr?.close();
  }
}

async function convertPdfPages(
  pdf: PDFDocument,
  recognize: PageRecognizer,
  emitPage: (
    page: number,
    completedPages: number,
    phasePercent: number,
    fields: Pick<ConversionProgress, "step" | "message" | "pageSource" | "ocrPercent">,
  ) => void,
): Promise<ConvertedDocument> {
  const totalPages = pdf.getPageCount();
  const pages: DocumentPage[] = [];
  const parts: string[] = [];
  let nextLine = 1;

  for (const index of pdf.getPageIndices()) {
    const page = index + 1;
    const label = `Pagina ${page}/${totalPages}`;

    if (isBlankPdfPage(pdf, index)) {
      pages.push({ pageNumber: page });
      emitPage(page, page, pagePercent(page, totalPages), {
        step: "page-done",
        pageSource: "blank",
        message: `${label}: vuota.`,
      });
      continue;
    }

    const text = await convertSinglePdfPage(pdf, index, page, totalPages, label, recognize, emitPage);
    const lastLine = nextLine + text.split("\n").length - 1;
    pages.push({ pageNumber: page, fromLine: nextLine, toLine: lastLine });
    parts.push(text);
    nextLine = lastLine + 1;
  }

  return { markdown: parts.join("\n"), pages };
}

async function convertSinglePdfPage(
  pdf: PDFDocument,
  index: number,
  page: number,
  totalPages: number,
  label: string,
  recognize: PageRecognizer,
  emitPage: (
    page: number,
    completedPages: number,
    phasePercent: number,
    fields: Pick<ConversionProgress, "step" | "message" | "pageSource" | "ocrPercent">,
  ) => void,
): Promise<string> {
  try {
    const completedPages = page - 1;
    const basePercent = pagePercent(completedPages, totalPages);
    emitPage(page, completedPages, basePercent, {
      step: "page-extract",
      message: `${label}: estrazione del testo con AnyDoc.`,
    });
    const bytes = await extractSinglePageBytes(pdf, index);
    const nativeText = await extractNativeMarkdown(bytes);
    const hasNativeText = Boolean(nativeText.trim());

    if (!hasNativeText) {
      emitPage(page, completedPages, basePercent, {
        step: "page-ocr-fallback",
        message: `${label}: nessun testo nativo estraibile, avvio OCR locale.`,
      });
    }
    const text = normalizeMarkdown(hasNativeText ? nativeText : await recognize(bytes, page));
    if (!text.trim()) {
      throw new Error("Local OCR found no readable text");
    }

    emitPage(page, page, pagePercent(page, totalPages), {
      step: "page-done",
      pageSource: hasNativeText ? "native" : "ocr",
      message: `${label}: completata (${hasNativeText ? "testo nativo" : "OCR"}, ${text.length} caratteri).`,
    });
    return text;
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : String(cause);
    throw new Error(`PDF page ${page}: ${message}`, { cause });
  }
}

async function extractSinglePageBytes(pdf: PDFDocument, index: number): Promise<Uint8Array> {
  const single = await PDFDocument.create();
  const [copy] = await single.copyPages(pdf, [index]);
  single.addPage(copy);
  return single.save();
}

async function extractNativeMarkdown(bytes: Uint8Array): Promise<string> {
  try {
    return await anydoc.toMarkdownBytes(bytes, undefined, { ocr: "reject" });
  } catch (error) {
    if (!needsLocalOcr(error)) throw error;
    return "";
  }
}

function isBlankPdfPage(pdf: PDFDocument, index: number): boolean {
  const source = pdf.getPage(index);
  return !source.node.Contents() && !source.node.Annots()?.size();
}

function needsLocalOcr(error: unknown): boolean {
  return error instanceof Error && (
    ("code" in error && error.code === "needsOcr") ||
    /^unsupported input: PDF has no extractable text \(ImageBased,\s*\d+\s*pages?\)$/i.test(error.message)
  );
}

function pagePercent(completedPages: number, totalPages: number): number {
  return totalPages > 0 ? Math.floor((100 * completedPages) / totalPages) : 100;
}
