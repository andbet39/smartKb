import { AzureChatOpenAI } from "@langchain/openai";

export function createCliModel(prefix, env = process.env) {
  const read = key => env[`${prefix}${key}`]?.trim() ?? "";
  const required = key => {
    const value = read(key);
    if (!value) throw new Error(`Variabile ${prefix}${key} mancante nella configurazione della CLI.`);
    return value;
  };
  const model = required("MODEL");
  const endpoint = read("ENDPOINT");
  const basePath = read("BASE_PATH");

  // Explicit empty values prevent LangChain from inheriting the other model's Azure settings.
  return new AzureChatOpenAI({
    model,
    azureOpenAIApiKey: required("API_KEY"),
    azureOpenAIApiDeploymentName: required("API_DEPLOYMENT_NAME"),
    azureOpenAIApiVersion: required("API_VERSION"),
    azureOpenAIApiInstanceName: endpoint || basePath ? "" : required("API_INSTANCE_NAME"),
    azureOpenAIEndpoint: endpoint,
    azureOpenAIBasePath: basePath,
    modelKwargs: model === "gpt-6-luna" ? { reasoning_effort: "none" } : {},
  });
}