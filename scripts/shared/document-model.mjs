import fs from "node:fs";
import { parseEnv } from "node:util";
import { AzureChatOpenAI } from "@langchain/openai";

// Azure chat model configured from the repository .env. Used by examples and benchmarks, not by the library.
// Resolve relative to the repository, even when a script runs from another directory.
const ROOT_ENV_URL = new URL("../../.env", import.meta.url);
const REQUEST_TIMEOUT_MS = 60_000;

let documentModel;

export function getDocumentModel() {
  if (documentModel) return documentModel;

  const config = loadAzureModelConfig();
  documentModel = new AzureChatOpenAI({
    model: config.model,
    azureOpenAIApiKey: config.apiKey,
    azureOpenAIApiDeploymentName: config.deploymentName,
    azureOpenAIApiVersion: config.apiVersion,
    azureOpenAIApiInstanceName: config.instanceName,
    azureOpenAIEndpoint: config.endpoint,
    azureOpenAIBasePath: config.basePath,
    modelKwargs: config.model === "gpt-6-luna" ? { reasoning_effort: "none" } : {},
    maxRetries: 0,
    timeout: REQUEST_TIMEOUT_MS,
  });
  return documentModel;
}

function loadAzureModelConfig() {
  const contents = readRootEnvFile();
  // Read the root configuration without modifying the CLI's environment.
  const env = parseEnv(contents);
  const model = requireEnvVar(env, "AZURE_OPENAI_MODEL");
  const endpoint = env.AZURE_OPENAI_ENDPOINT?.trim() ?? "";
  const basePath = env.AZURE_OPENAI_BASE_PATH?.trim() ?? "";

  return {
    model,
    apiKey: requireEnvVar(env, "AZURE_OPENAI_API_KEY"),
    deploymentName: requireEnvVar(env, "AZURE_OPENAI_API_DEPLOYMENT_NAME"),
    apiVersion: requireEnvVar(env, "AZURE_OPENAI_API_VERSION"),
    instanceName: endpoint || basePath ? "" : requireEnvVar(env, "AZURE_OPENAI_API_INSTANCE_NAME"),
    endpoint,
    basePath,
  };
}

function readRootEnvFile() {
  try {
    return fs.readFileSync(ROOT_ENV_URL, "utf8");
  } catch (cause) {
    throw new Error("Impossibile leggere il file .env della root per configurare il modello documentale.", { cause });
  }
}

function requireEnvVar(env, name) {
  const value = env[name]?.trim();
  if (!value) {
    throw new Error(`Variabile ${name} mancante nel file .env della root.`);
  }
  return value;
}