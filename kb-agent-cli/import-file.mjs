import { readFile } from "node:fs/promises";
import { basename, extname } from "node:path";

const contentTypes = new Map([
  [".txt", "text/plain"],
  [".md", "text/markdown"],
  [".markdown", "text/markdown"],
  [".csv", "text/csv"],
  [".pdf", "application/pdf"],
  [".docx", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
  [".pptx", "application/vnd.openxmlformats-officedocument.presentationml.presentation"],
]);

export async function importFile(file, kb, documentId, onProgress) {
  const contentType = contentTypes.get(extname(file).toLowerCase());
  const originalFileName = basename(file);
  return kb.write(await readFile(file), { originalFileName, contentType }, documentId, onProgress);
}
