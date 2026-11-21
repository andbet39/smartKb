import { AzureChatOpenAI } from "@langchain/openai";

// Use the real LangChain Azure client; replace only its HTTP transport.
export function offlineAzure(reply) {
  return new AzureChatOpenAI({
    model: "gpt-4o",
    azureOpenAIApiKey: "offline-test-only",
    azureOpenAIApiInstanceName: "offline",
    azureOpenAIApiDeploymentName: "test",
    azureOpenAIApiVersion: "2024-10-21",
    maxRetries: 0,
    configuration: {
      fetch: async (_url, init) => {
        const body = JSON.parse(init.body);
        const schema = body.response_format.json_schema;
        const value = reply(schema.name, body.messages);
        return Response.json({
          id: "local-test",
          object: "chat.completion",
          model: "gpt-4o",
          choices: [{ index: 0, finish_reason: "stop", message: { role: "assistant", content: JSON.stringify(value) } }],
        });
      },
    },
  });
}
