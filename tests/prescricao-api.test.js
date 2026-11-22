import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/prescricao.js";

test("prescription analysis sends the case and student response as a user message", async () => {
  const token = "a".repeat(64);
  let aiRequest;
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
                  prescriptions_today_count: 0,
                  last_prescription_date: null
                };
              },
              async run() {
                return { meta: { changes: 1 } };
              }
            };
          }
        };
      }
    }
  };
  const request = new Request("https://example.com/api/prescricao", {
    method: "POST",
    headers: {
      Cookie: `guiamed_session=${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      casoId: "sincope",
      prescricaoAluno: "Monitorização cardíaca e avaliação urgente."
    })
  });
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (_url, options) => {
    aiRequest = JSON.parse(options.body);
    return new Response(JSON.stringify({
      choices: [{ message: { content: "Análise educacional." } }]
    }), { headers: { "Content-Type": "application/json" } });
  };

  try {
    const response = await onRequestPost({ request, env });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.analise, "Análise educacional.");
    assert.deepEqual(aiRequest.messages.map(message => message.role), ["system", "user"]);
    assert.match(aiRequest.messages[1].content, /Monitorização cardíaca/);
    assert.match(aiRequest.messages[1].content, /Síncope/);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
