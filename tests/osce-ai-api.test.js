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
      messages: [{ role: "user", content: "Avalie a consulta." }]
    })
  });

  return { request, env };
}

test("OSCE debrief retries once after a transient AI provider failure", async () => {
  const originalFetch = globalThis.fetch;
  const { request, env } = createContext();
  let attempts = 0;

  globalThis.fetch = async () => {
    attempts += 1;
    if (attempts === 1) {
      return new Response("temporarily unavailable", { status: 502 });
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
      error: { message: "Invalid provider configuration." }
    }), {
      status: 401,
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const response = await onRequestPost({ request, env });
    const data = await response.json();

    assert.equal(response.status, 502);
    assert.equal(attempts, 1);
    assert.equal(data.upstreamStatus, 401);
    assert.match(data.error, /Invalid provider configuration/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
