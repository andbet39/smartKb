import { createHash } from "node:crypto";
import { AzureChatOpenAI, AzureOpenAIEmbeddings } from "@langchain/openai";

export function createCliModel(prefix, env = process.env, overrides = {}) {
  const read = key => env[`${prefix}${key}`]?.trim() ?? "";
  const required = key => {
    const value = read(key);
    if (!value) throw new Error(`Variabile ${prefix}${key} mancante nella configurazione della CLI.`);
    return value;
  };
  const model = overrides.model ?? required("MODEL");
  const endpoint = read("ENDPOINT");
  const basePath = read("BASE_PATH");

  // Explicit empty values prevent LangChain from inheriting the other model's Azure settings.
  return new AzureChatOpenAI({
    model,
    azureOpenAIApiKey: required("API_KEY"),
    azureOpenAIApiDeploymentName: overrides.deployment ?? required("API_DEPLOYMENT_NAME"),
    azureOpenAIApiVersion: required("API_VERSION"),
    azureOpenAIApiInstanceName: endpoint || basePath ? "" : required("API_INSTANCE_NAME"),
    azureOpenAIEndpoint: endpoint,
    azureOpenAIBasePath: basePath,
    modelKwargs: model === "gpt-6-luna" ? { reasoning_effort: "none" } : {},
  });
}

export function createCliEmbedder(env = process.env) {
  const prefix = "KB_SEARCH_AZURE_OPENAI_";
  const read = key => env[`${prefix}${key}`]?.trim() ?? "";
  const deployment = read("EMBEDDINGS_DEPLOYMENT_NAME");
  if (!deployment) return undefined;
  const required = key => {
    const value = read(key);
    if (!value) throw new Error(`Variabile ${prefix}${key} mancante nella configurazione della CLI.`);
    return value;
  };
  const endpoint = read("ENDPOINT").replace(/\/+$/, "");
  // AzureOpenAIEmbeddings ignores azureOpenAIEndpoint, so map it to the equivalent base path.
  const basePath = read("BASE_PATH") || (endpoint && `${endpoint}/openai/deployments`);
  const instanceName = basePath ? "" : required("API_INSTANCE_NAME");
  const model = "text-embedding-3-large";
  const dimensions = Number(read("EMBEDDINGS_DIMENSIONS") || "3072");
  if (!Number.isSafeInteger(dimensions) || dimensions < 1 || dimensions > 3072) {
    throw new Error(`Variabile ${prefix}EMBEDDINGS_DIMENSIONS non valida.`);
  }

  const embeddings = new AzureOpenAIEmbeddings({
    azureOpenAIApiKey: required("API_KEY"),
    // The chat deployment cannot serve embeddings, so this needs a deployment of its own.
    azureOpenAIApiDeploymentName: deployment,
    azureOpenAIApiVersion: required("API_VERSION"),
    azureOpenAIApiInstanceName: instanceName,
    azureOpenAIBasePath: basePath,
    model,
    dimensions,
  });
  const resourceId = createHash("sha256").update(basePath || instanceName).digest("hex");
  return {
    modelId: `${model}:${resourceId}:${deployment}`,
    dimensions,
    embedDocuments: texts => embeddings.embedDocuments(texts),
    embedQuery: text => embeddings.embedQuery(text),
  };
}
