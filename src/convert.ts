import anydoc from "@firecrawl/anydoc";
import { PDFDocument } from "pdf-lib";
import type { DocumentInput, DocumentPage } from "./types.js";

function normalize(text: string) {
  return text.replace(/\r\n?/g, "\n").replace(/\n+$/, "");
}

export async function convert(input: DocumentInput): Promise<{ markdown: string; pages?: DocumentPage[] }> {
  const format = anydoc.formatFromBytes(input.bytes) ?? anydoc.formatFromPath(input.fileName ?? "");
  if (!format) throw new Error("Unsupported or unrecognized format");
  if (format !== "pdf") {
    return { markdown: normalize(await anydoc.toMarkdownBytes(input.bytes, format)) };
  }

  const pdf = await PDFDocument.load(input.bytes);
  const pages: DocumentPage[] = [];
  const parts: string[] = [];
  let nextLine = 1;
  for (const index of pdf.getPageIndices()) {
    const page = index + 1;
    const source = pdf.getPage(index);
    if (!source.node.Contents() && !source.node.Annots()?.size()) {
      pages.push({ page, range: null });
      continue;
    }
    try {
      const single = await PDFDocument.create();
      const [copy] = await single.copyPages(pdf, [index]);
      single.addPage(copy);
      const bytes = await single.save();
      const text = normalize(await anydoc.toMarkdownBytes(bytes, format, { ocr: "reject" }));
      if (!text.trim()) throw new Error("Page has no extractable text");
      const lastLine = nextLine + text.split("\n").length - 1;
      pages.push({ page, range: [nextLine, lastLine] });
      parts.push(text);
      nextLine = lastLine + 1;
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : String(cause);
      throw new Error(`PDF page ${page}: ${message}`, { cause });
    }
  }
  return { markdown: parts.join("\n"), pages };
}
