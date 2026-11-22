import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser, createPosixStore } from "smartDocKb";
import { getDocumentModel } from "../scripts/shared/document-model.mjs";
import { createProgressLogger } from "./cli-progress.mjs";

async function main(args, log) {
  const usage = 'Uso: npm run prova -- "percorso del documento"';
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage);
    return;
  }
  if (args.length !== 1) throw new Error(usage);

  const file = args[0];
  log("Lettura del documento.");
  const bytes = await readFile(file);
  log("Preparazione tokenizer e modello Azure.");
  const encoding = getEncoding("o200k_base");
  const parser = createDocumentParser({
    onProgress: log,
    llm: getDocumentModel(),
    countTokens: text => encoding.encode(text).length,
    targetChars: { documentSummary: 800, sectionSummary: 300, shortDescription: 80 },
  });
  const result = await parser.parseDocument({
    documentId: 1,
    fileName: basename(file),
    bytes,
    sectionSize: { minChars: 1000, maxChars: 4000 },
  });
  log("Scrittura JSON su stdout.");
  console.log(JSON.stringify(result, null, 2));
  log("Salvataggio knowledge base in kb1.");
  const store = await createPosixStore({ root: "./kb1" });
  try {
    await store.add(result);
  } finally {
    await store.close();
  }
  log("Salvataggio completato.");
}

const progress = createProgressLogger();
main(process.argv.slice(2), progress.log).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
}).finally(progress.close);
