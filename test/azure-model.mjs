import assert from "node:assert/strict";
import fs from "node:fs";
import { AzureChatOpenAI } from "@langchain/openai";

const rootEnv = new URL("../.env", import.meta.url);

export function mockRootEnv(t, contents) {
  const readFileSync = fs.readFileSync;
  t.mock.method(fs, "readFileSync", (path, options) => (
    path instanceof URL && path.href === rootEnv.href ? contents : readFileSync(path, options)
  ));
}

export function mockDocumentAzure(t, reply) {
  mockRootEnv(t, `AZURE_OPENAI_MODEL=gpt-4o
AZURE_OPENAI_API_KEY=root-test-key
AZURE_OPENAI_API_INSTANCE_NAME=root-test-instance
AZURE_OPENAI_API_DEPLOYMENT_NAME=root-test-deployment
AZURE_OPENAI_API_VERSION=2024-10-21
`);
  t.mock.method(globalThis, "fetch", async (url, init) => {
    const endpoint = new URL(url);
    assert.equal(endpoint.hostname, "root-test-instance.openai.azure.com");
    assert.match(endpoint.pathname, /\/deployments\/root-test-deployment\//);
    assert.equal(endpoint.searchParams.get("api-version"), "2024-10-21");
    assert.equal(new Headers(init.headers).get("api-key"), "root-test-key");
    const body = JSON.parse(init.body);
    assert.equal(body.model, "gpt-4o");
    return completion(reply(body));
  });
}

let completionId = 0;

function completion({ usage, ...message }) {
  return Response.json({
    id: `local-test-${++completionId}`,
    object: "chat.completion",
    model: "gpt-4o",
    ...(usage && { usage }),
    choices: [{
      index: 0,
      finish_reason: message.tool_calls ? "tool_calls" : "stop",
      message: { role: "assistant", ...message },
    }],
  });
}

// Use the real LangChain Azure client; replace only its HTTP transport.
export function offlineAzure(reply) {
  return offlineAzureChat(body => {
    const schema = body.response_format.json_schema;
    return { content: JSON.stringify(reply(schema.name, body.messages)) };
  });
}

export function offlineAzureChat(reply) {
  return new AzureChatOpenAI({
    model: "gpt-4o",
    azureOpenAIApiKey: "offline-test-only",
    azureOpenAIApiInstanceName: "offline",
    azureOpenAIApiDeploymentName: "test",
    azureOpenAIApiVersion: "2024-10-21",
    maxRetries: 0,
    configuration: {
      fetch: async (_url, init) => completion(reply(JSON.parse(init.body))),
    },
  });
}
