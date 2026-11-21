import { AzureChatOpenAI } from "@langchain/openai";

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

export function createCliDocumentSelection(env = process.env) {
  const deployment = env.KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME?.trim();
  if (!deployment) return undefined;
  const numberOption = key => {
    const value = env[key]?.trim();
    return value ? Number(value) : undefined;
  };
  return {
    decisionModel: createCliModel("KB_SEARCH_AZURE_OPENAI_", env, { model: deployment, deployment }),
    threshold: numberOption("KB_DECISION_THRESHOLD"),
    maxDocuments: numberOption("KB_DECISION_MAX_DOCUMENTS"),
  };
}