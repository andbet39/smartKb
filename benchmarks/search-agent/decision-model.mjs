import { createSystemOneSelection } from '../../systemone-model.mjs';

export function getDecisionSelection(env = process.env) {
  const selection = createSystemOneSelection(env);
  if (!selection) throw new Error('Variabile KB_DECISION_AZURE_OPENAI_API_DEPLOYMENT_NAME mancante nella configurazione del benchmark.');
  return selection;
}