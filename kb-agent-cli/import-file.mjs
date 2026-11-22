import { getEncoding } from "js-tiktoken";
import { createDocumentParser } from "smartDocKb";

export async function importFile(file, folder, documentId, llm, onProgress) {
  const encoding = getEncoding("o200k_base");
  const parser = createDocumentParser({ llm, onProgress, countTokens: text => encoding.encode(text).length });
  await parser.importFile(file, { kbFolder: folder, documentId,
    sectionSize: { minChars: 1000, maxChars: 4000 } });
}
