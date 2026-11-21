import { mkdir, readFile, rm } from "node:fs/promises";
import { basename, join } from "node:path";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser, persist } from "workspace-document-parser";

export async function importFile(file, folder, documentId, llm, onProgress) {
  onProgress("Lettura del file");
  const bytes = await readFile(file);
  const encoding = getEncoding("o200k_base");
  const parser = createDocumentParser({ llm, onProgress, countTokens: text => encoding.encode(text).length });
  const doc = await parser.parseDocument({ bytes, fileName: basename(file), documentId,
    sectionSize: { minChars: 1000, maxChars: 4000 } });
  onProgress("Salvataggio nella KB");
  const destination = join(folder, `doc-${documentId}`);
  await mkdir(destination); // Non sovrascrivere un'importazione esistente.
  try {
    await persist(doc, destination);
  } catch (error) {
    await rm(destination, { recursive: true });
    throw error;
  }
}
