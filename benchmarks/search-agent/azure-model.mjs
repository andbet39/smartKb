import { AzureChatOpenAI } from '@langchain/openai';

const prefix = 'KB_SEARCH_AZURE_OPENAI_';

function createModel(env, { model, deployment }) {
  const read = name => env[name]?.trim() || undefined;
  const required = name => {
    const value = read(name);
    if (!value) throw new Error(`Variabile ${name} mancante nella configurazione del benchmark.`);
    return value;
  };
  const endpoint = read(`${prefix}ENDPOINT`) ?? '';
  const basePath = read(`${prefix}BASE_PATH`) ?? '';
  return new AzureChatOpenAI({
    model,
    azureOpenAIApiDeploymentName: deployment ?? required(`${prefix}API_DEPLOYMENT_NAME`),
    azureOpenAIApiKey: required(`${prefix}API_KEY`),
    azureOpenAIApiVersion: required(`${prefix}API_VERSION`),
    azureOpenAIApiInstanceName: endpoint || basePath ? '' : required(`${prefix}API_INSTANCE_NAME`),
    azureOpenAIEndpoint: endpoint,
    azureOpenAIBasePath: basePath,
    modelKwargs: model === 'gpt-6-luna' ? { reasoning_effort: 'none' } : {},
    maxRetries: 0,
    timeout: 60000,
  });
}

export function getSearchModel(env = process.env) {
  const model = env[`${prefix}MODEL`]?.trim();
  return model ? createModel(env, { model }) : undefined;
}

export function getDecisionSelection(env = process.env) {
  const key = 'KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME';
  const deployment = env[key]?.trim();
  if (!deployment) throw new Error(`Variabile ${key} mancante nella configurazione del benchmark.`);
  const numeric = name => env[name]?.trim() ? Number(env[name]) : undefined;
  return {
    decisionModel: createModel(env, { model: deployment, deployment }),
    threshold: numeric('KB_DECISION_THRESHOLD'),
    maxDocuments: numeric('KB_DECISION_MAX_DOCUMENTS'),
  };
}