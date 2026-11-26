import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/billing/portal.js";

test("billing portal no longer accepts upgrade requests", async () => {
  const token = "a".repeat(64);
  const env = {
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    DB: {
      prepare(query) {
        return {
          bind() {
            return {
              async first() {
                if (query.includes("FROM sessions")) {
                  return { email: "checkout@example.com", name: "Test User", cpf_hash: "cpf-hash" };
                }
                return { stripe_customer_id: "cus_test" };
              }
            };
          }
        };
      }
    }
  };
  const request = new Request("https://example.com/api/billing/portal", {
    method: "POST",
    headers: {
      Origin: "https://example.com",
      Cookie: `guiamed_session=${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ plan: "pro_mensal" })
  });
  const originalFetch = globalThis.fetch;
  let stripeRequested = false;
  globalThis.fetch = async () => {
    stripeRequested = true;
    return new Response(JSON.stringify({ url: "https://billing.stripe.com/session/test" }));
  };

  try {
    const response = await onRequestPost({ request, env });

    assert.equal(response.status, 400);
    assert.equal(stripeRequested, false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("billing portal still opens management without an upgrade request", async () => {
  const token = "a".repeat(64);
  let portalForm;
  const env = {
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    DB: {
      prepare(query) {
        return {
          bind() {
            return {
              async first() {
                if (query.includes("FROM sessions")) {
                  return { email: "checkout@example.com", name: "Test User", cpf_hash: "cpf-hash" };
                }
                return { stripe_customer_id: "cus_test" };
              }
            };
          }
        };
      }
    }
  };
  const request = new Request("https://example.com/api/billing/portal", {
    method: "POST",
    headers: {
      Origin: "https://example.com",
      Cookie: `guiamed_session=${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({})
  });
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async (_url, options) => {
    portalForm = new URLSearchParams(options.body);
    return new Response(JSON.stringify({ url: "https://billing.stripe.com/session/test" }));
  };

  try {
    const response = await onRequestPost({ request, env });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.url, "https://billing.stripe.com/session/test");
    assert.equal(portalForm.get("customer"), "cus_test");
    assert.equal(portalForm.has("flow_data[type]"), false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
