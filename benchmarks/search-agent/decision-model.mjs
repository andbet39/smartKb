import { AzureChatOpenAI } from '@langchain/openai';

export function getDecisionSelection(env = process.env) {
  const read = name => env[name]?.trim() || undefined;
  const required = name => {
    const value = read(name);
    if (!value) throw new Error(`Variabile ${name} mancante nella configurazione del benchmark.`);
    return value;
  };
  const numeric = name => read(name) === undefined ? undefined : Number(read(name));
  const deployment = required('KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME');
  const prefix = 'KB_SEARCH_AZURE_OPENAI_';
  const endpoint = read(`${prefix}ENDPOINT`) ?? '';
  const basePath = read(`${prefix}BASE_PATH`) ?? '';
  return {
    decisionModel: new AzureChatOpenAI({
      model: deployment,
      azureOpenAIApiDeploymentName: deployment,
      azureOpenAIApiKey: required(`${prefix}API_KEY`),
      azureOpenAIApiVersion: required(`${prefix}API_VERSION`),
      azureOpenAIApiInstanceName: endpoint || basePath ? '' : required(`${prefix}API_INSTANCE_NAME`),
      azureOpenAIEndpoint: endpoint,
      azureOpenAIBasePath: basePath,
      maxRetries: 0,
      timeout: 60000,
    }),
    threshold: numeric('KB_DECISION_THRESHOLD'),
    maxDocuments: numeric('KB_DECISION_MAX_DOCUMENTS'),
  };
}