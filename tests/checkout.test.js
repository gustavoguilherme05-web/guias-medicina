import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/billing/checkout.js";

async function createCheckoutRequest(plan, accountOverrides = {}) {
  const token = "a".repeat(64);
  const email = "checkout@example.com";
  let stripeForm;
  const env = {
    DB: {
      prepare(query) {
        return {
          bind() {
            return {
              async first() {
                if (query.includes("FROM sessions")) {
                  return { email, name: "Test User", cpf_hash: "cpf-hash" };
                }
                return {
                  stripe_customer_id: accountOverrides.stripe_customer_id || null,
                  stripe_subscription_id: accountOverrides.stripe_subscription_id || null,
                  subscription_status: accountOverrides.subscription_status || "free",
                  experience_expires_at: accountOverrides.experience_expires_at || null,
                  cpf_hash: "cpf-hash"
                };
              },
              async run() {
                return { success: true };
              }
            };
          }
        };
      }
    },
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    STRIPE_PUBLISHABLE_KEY: "pk_test_placeholder",
    STRIPE_PRICE_EXPERIENCIA: "price_experience",
    STRIPE_PRICE_PRO_MENSAL: "price_pro_monthly"
  };
  const request = new Request("https://example.com/api/billing/checkout", {
    method: "POST",
    headers: {
      Origin: "https://example.com",
      Cookie: `guiamed_session=${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ plan })
  });
  const originalFetch = globalThis.fetch;

  globalThis.fetch = async (_url, options) => {
    stripeForm = new URLSearchParams(options.body);
    return new Response(JSON.stringify({ client_secret: "cs_test_placeholder" }), {
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const response = await onRequestPost({ request, env });
    return { response, stripeForm };
  } finally {
    globalThis.fetch = originalFetch;
  }
}

test("one-time experience checkout omits payment_method_collection", async () => {
  const { response, stripeForm } = await createCheckoutRequest("experience");

  assert.equal(response.status, 200);
  assert.equal(stripeForm.get("mode"), "payment");
  assert.equal(stripeForm.get("line_items[0][price]"), "price_experience");
  assert.equal(stripeForm.get("return_url"), "https://example.com/assinatura.html?checkout=return");
  assert.equal(stripeForm.has("payment_method_collection"), false);
  assert.equal(stripeForm.get("payment_intent_data[metadata][plan]"), "experience");
});

test("monthly checkout keeps payment_method_collection", async () => {
  const { response, stripeForm } = await createCheckoutRequest("pro_mensal");

  assert.equal(response.status, 200);
  assert.equal(stripeForm.get("mode"), "subscription");
  assert.equal(stripeForm.get("payment_method_collection"), "always");
  assert.equal(stripeForm.get("subscription_data[metadata][plan]"), "pro_mensal");
});

test("experience access can start a monthly checkout", async () => {
  const { response, stripeForm } = await createCheckoutRequest("pro_mensal", {
    subscription_status: "active",
    experience_expires_at: Date.now() + 60_000
  });

  assert.equal(response.status, 200);
  assert.equal(stripeForm.get("mode"), "subscription");
  assert.equal(stripeForm.get("line_items[0][price]"), "price_pro_monthly");
});
