import { readFile } from "node:fs/promises";
import { convertDocument } from "smartDocKb";
import { createProgressLogger } from "./cli-progress.mjs";

const progress = createProgressLogger();
try {
  const [path, ...rest] = process.argv.slice(2);
  if (!path || rest.length) throw new Error('Uso: npm run prova:ocr -- "percorso del PDF"');
  progress.log("Lettura del documento.");
  const { markdown } = await convertDocument({ fileName: path, bytes: await readFile(path) }, progress.log);
  console.log(markdown);
  progress.log("Conversione completata. Markdown scritto su stdout.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  progress.close();
}
