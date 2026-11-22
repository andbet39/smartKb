import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser } from "smartDocKb";

/** Parses and saves a file, returning its ID. Pass undefined to let the parser assign it. */
export async function importFile(file, store, documentId, llm, onProgress) {
  const encoding = getEncoding("o200k_base");
  const parser = createDocumentParser({ llm, onProgress, countTokens: text => encoding.encode(text).length });
  const doc = await parser.parseDocument({
    ...(documentId === undefined ? {} : { documentId }),
    fileName: basename(file), bytes: await readFile(file),
    sectionSize: { minChars: 1000, maxChars: 4000 },
  });
  await store.add(doc);
  return doc.map.documentId;
}
