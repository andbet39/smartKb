import fs from "node:fs";
import { parseEnv } from "node:util";
import { AzureChatOpenAI } from "@langchain/openai";

// Resolve relative to the package, even when the CLI runs from its own directory.
const rootEnv = new URL("../.env", import.meta.url);
let documentModel: AzureChatOpenAI | undefined;

export function getDocumentModel(): AzureChatOpenAI {
  if (documentModel) return documentModel;

  let contents: string;
  try {
    contents = fs.readFileSync(rootEnv, "utf8");
  } catch (cause) {
    throw new Error("Impossibile leggere il file .env della root per configurare il modello documentale.", { cause });
  }

  // Read the root configuration without modifying the CLI's environment.
  const env = parseEnv(contents);
  const required = (name: string): string => {
    const value = env[name]?.trim();
    if (!value) throw new Error(`Variabile ${name} mancante nel file .env della root.`);
    return value;
  };
  const model = required("AZURE_OPENAI_MODEL");
  const endpoint = env.AZURE_OPENAI_ENDPOINT?.trim() ?? "";
  const basePath = env.AZURE_OPENAI_BASE_PATH?.trim() ?? "";

  documentModel = new AzureChatOpenAI({
    model,
    azureOpenAIApiKey: required("AZURE_OPENAI_API_KEY"),
    azureOpenAIApiDeploymentName: required("AZURE_OPENAI_API_DEPLOYMENT_NAME"),
    azureOpenAIApiVersion: required("AZURE_OPENAI_API_VERSION"),
    azureOpenAIApiInstanceName: endpoint || basePath ? "" : required("AZURE_OPENAI_API_INSTANCE_NAME"),
    azureOpenAIEndpoint: endpoint,
    azureOpenAIBasePath: basePath,
    modelKwargs: model === "gpt-6-luna" ? { reasoning_effort: "none" } : {},
    maxRetries: 0,
    timeout: 60000,
  });
  return documentModel;
}