import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import { AzureChatOpenAI } from "@langchain/openai";
import { getEncoding } from "js-tiktoken";
import { createDocumentParser, saveDocumentMarkdown } from "workspace-document-parser";
import { getDocumentTableOfContents } from "workspace-document-parser";

// Le variabili d'ambiente hanno precedenza sui valori a destra di ||.
const azureConfig = {
  azureOpenAIApiKey: process.env.AZURE_OPENAI_API_KEY || "91589eab63ad4ef28082f4c78014d825",
  azureOpenAIApiInstanceName: process.env.AZURE_OPENAI_API_INSTANCE_NAME || "openai-chatgpt-bizdev",
  azureOpenAIApiDeploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME || "gpt-6-luna-dev",
  azureOpenAIApiVersion: process.env.AZURE_OPENAI_API_VERSION || "2025-04-01-preview",
  model: process.env.AZURE_OPENAI_MODEL || "gpt-6-luna",
};

async function main(args) {
  const usage = 'Uso: npm run prova -- "percorso del documento"';
  if (args.length === 1 && args[0] === "--help") {
    console.log(usage);
    return;
  }
  if (args.length !== 1) throw new Error(usage);

  for (const [name, value] of Object.entries(azureConfig)) {
    if (!value.trim()) throw new Error(`Configurazione Azure mancante: ${name}`);
  }
  const file = args[0];
  const bytes = await readFile(file);
  const encoding = getEncoding("o200k_base");
  const parser = createDocumentParser({
    llm: new AzureChatOpenAI({ ...azureConfig, maxRetries: 0, timeout: 60000 }),
    countTokens: text => encoding.encode(text).length,
    targetChars: { documentSummary: 800, sectionSummary: 300, shortDescription: 80 },
  });
  const result = await parser.parseDocument({
    documentId: 1,
    fileName: basename(file),
    bytes,
    sectionSize: { minChars: 500, maxChars: 2500 },
  });
  console.log(JSON.stringify(result, null, 2));

  await saveDocumentMarkdown(result, `${basename(file)}.md`, { sectionMarkers: true });
  const toc = getDocumentTableOfContents(result);
  console.log("Table of Contents:")
  console.log(JSON.stringify(toc));
  
}

main(process.argv.slice(2)).catch(error => {
  console.error(error.message);
  process.exitCode = 1;
});
