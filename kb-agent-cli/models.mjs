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

export function createCliEmbeddings(prefix, env = process.env) {
  const read = key => env[`${prefix}${key}`]?.trim() ?? "";
  const required = key => {
    const value = read(key);
    if (!value) throw new Error(`Variabile ${prefix}${key} mancante nella configurazione della CLI.`);
    return value;
  };
  const endpoint = read("ENDPOINT").replace(/\/+$/, "");
  // AzureOpenAIEmbeddings ignores azureOpenAIEndpoint, so map it to the equivalent base path.
  const basePath = read("BASE_PATH") || (endpoint && `${endpoint}/openai/deployments`);
  const instanceName = basePath ? undefined : required("API_INSTANCE_NAME");
  const model = "text-embedding-3-large";

  return new AzureOpenAIEmbeddings({
    azureOpenAIApiKey: required("API_KEY"),
    // The chat deployment cannot serve embeddings, so this needs a deployment of its own.
    azureOpenAIApiDeploymentName: read("EMBEDDINGS_DEPLOYMENT_NAME") || model,
    azureOpenAIApiVersion: required("API_VERSION"),
    ...(instanceName && { azureOpenAIApiInstanceName: instanceName }),
    ...(basePath && { azureOpenAIBasePath: basePath }),
    model,
  });
}
