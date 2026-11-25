import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/osce-ai.js";

function createContext() {
  const token = "a".repeat(64);
  const env = {
    API_KEY: "test-api-key",
    DB: {
      prepare(query) {
        return {
          bind() {
            return {
              async first() {
                if (query.includes("FROM sessions")) {
                  return { email: "student@example.com", name: "Student", cpf_hash: "cpf-hash" };
                }
                return {
                  subscription_status: "pro",
                  subscription_plan: "pro",
                  osce_trial_used: 0,
                  osce_trial_session_hash: null,
                  osce_trial_session_expires_at: null
                };
              },
              async run() {
                return { meta: { changes: 0 } };
              }
            };
          }
        };
      }
    }
  };
  const request = new Request("https://example.com/api/osce-ai", {
    method: "POST",
    headers: {
      Cookie: `guiamed_session=${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      mode: "debrief",
      caseId: "icc-cronica-otimizacao",
      messages: [
        { role: "assistant", content: "Olá." },
        { role: "user", content: "O que aconteceu?" },
        { role: "assistant", content: "Estou com falta de ar." }
      ]
    })
  });

  return { request, env };
}

test("OSCE debrief retries after transient provider failure even if response cleanup fails", async () => {
  const originalFetch = globalThis.fetch;
  const { request, env } = createContext();
  let attempts = 0;
  let sentMessages;

  globalThis.fetch = async (_url, options) => {
    attempts += 1;
    sentMessages = JSON.parse(options.body).messages;
    if (attempts === 1) {
      return {
        status: 502,
        body: {
          async cancel() {
            throw new Error("stream cleanup failed");
          }
        }
      };
    }
    return new Response(JSON.stringify({
      choices: [{ message: { content: '{"finalScore":0}' } }]
    }), { headers: { "Content-Type": "application/json" } });
  };

  try {
    const response = await onRequestPost({ request, env });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(attempts, 2);
    assert.equal(data.content, '{"finalScore":0}');
    assert.deepEqual(sentMessages.map((message) => message.role), [
      "system",
      "assistant",
      "user",
      "assistant",
      "user"
    ]);
    assert.equal(sentMessages.at(-1).role, "user");
    assert.match(sentMessages.at(-1).content, /gere agora o relatório/i);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("OSCE reports the upstream status and message when the AI provider rejects a request", async () => {
  const originalFetch = globalThis.fetch;
  const { request, env } = createContext();
  let attempts = 0;

  globalThis.fetch = async () => {
    attempts += 1;
    return new Response(JSON.stringify({
      error: { message: "Invalid chat completion request." }
    }), {
      status: 400,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const response = await onRequestPost({ request, env });
    const data = await response.json();

    assert.equal(response.status, 502);
    assert.equal(attempts, 1);
    assert.equal(data.upstreamStatus, 400);
    assert.match(data.error, /Invalid chat completion request/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
