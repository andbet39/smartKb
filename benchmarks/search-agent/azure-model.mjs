import { AzureChatOpenAI } from '@langchain/openai';

export { getDecisionSelection } from './decision-model.mjs';

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
