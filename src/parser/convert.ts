import anydoc from "@firecrawl/anydoc";
import { PDFDocument } from "pdf-lib";
import type { DocumentInput, DocumentPage, ParserOptions } from "./types.js";

function normalize(text: string) {
  return text.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
}

function needsLocalOcr(error: unknown) {
  return error instanceof Error && (
    ("code" in error && error.code === "needsOcr") ||
    /^unsupported input: PDF has no extractable text \(ImageBased,\s*\d+\s*pages?\)$/i.test(error.message)
  );
}

export async function convert(input: DocumentInput, log?: ParserOptions["onProgress"]): Promise<{ markdown: string; pages?: DocumentPage[] }> {
  const format = anydoc.formatFromBytes(input.bytes) ?? anydoc.formatFromPath(input.fileName ?? "");
  if (!format) throw new Error("Unsupported or unrecognized format");
  log?.(`Conversione locale ${format.toUpperCase()} (${input.bytes.length} byte).`);
  if (format !== "pdf") {
    return { markdown: normalize(await anydoc.toMarkdownBytes(input.bytes, format)) };
  }

  const pdf = await PDFDocument.load(input.bytes);
  const total = pdf.getPageCount();
  let currentPage = 0;
  let ocr: Awaited<ReturnType<typeof import("./ocr.js").createLocalOcr>> | undefined;
  try {
    return await convertPages(pdf, async (bytes, page) => {
      currentPage = page;
      if (!ocr) {
        log?.(`Pagina ${page}/${total}: inizializzazione OCR locale (ita).`);
        ocr = await (await import("./ocr.js")).createLocalOcr(
          log && (message => log(`Pagina ${currentPage}/${total}: ${message}`)),
        );
      }
      return ocr.recognize(bytes);
    }, log);
  } finally {
    await ocr?.close();
  }
}

async function convertPages(pdf: PDFDocument, recognize: (bytes: Uint8Array, page: number) => Promise<string>, log?: ParserOptions["onProgress"]) {
  const pages: DocumentPage[] = [];
  const parts: string[] = [];
  let nextLine = 1;
  for (const index of pdf.getPageIndices()) {
    const page = index + 1;
    const label = `Pagina ${page}/${pdf.getPageCount()}`;
    const source = pdf.getPage(index);
    if (!source.node.Contents() && !source.node.Annots()?.size()) {
      pages.push({ page, range: null });
      log?.(`${label}: vuota.`);
      continue;
    }
    try {
      log?.(`${label}: estrazione del testo con AnyDoc.`);
      const single = await PDFDocument.create();
      const [copy] = await single.copyPages(pdf, [index]);
      single.addPage(copy);
      const bytes = await single.save();
      let nativeText: string;
      try {
        nativeText = await anydoc.toMarkdownBytes(bytes, undefined, { ocr: "reject" });
      } catch (error) {
        if (!needsLocalOcr(error)) throw error;
        nativeText = "";
      }
      const native = Boolean(nativeText.trim());
      if (!native) log?.(`${label}: nessun testo nativo estraibile, avvio OCR locale.`);
      const text = normalize(native ? nativeText : await recognize(bytes, page));
      if (!text.trim()) throw new Error("Local OCR found no readable text");
      const lastLine = nextLine + text.split("\n").length - 1;
      pages.push({ page, range: [nextLine, lastLine] });
      parts.push(text);
      nextLine = lastLine + 1;
      log?.(`${label}: completata (${native ? "testo nativo" : "OCR"}, ${text.length} caratteri).`);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      throw new Error(`PDF page ${page}: ${message}`, { cause });
    }
  }
  return { markdown: parts.join("\n"), pages };
}
