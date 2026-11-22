import test from "node:test";
import assert from "node:assert/strict";
import { onRequestPost } from "../functions/api/billing/portal.js";

test("LITE upgrade opens a Stripe confirmation flow for the PRO price", async () => {
  const token = "a".repeat(64);
  let portalForm;
  const env = {
    STRIPE_SECRET_KEY: "sk_test_placeholder",
    STRIPE_PRICE_PRESCRICAO_MENSAL: "price_lite",
    STRIPE_PRICE_PRO_MENSAL: "price_pro",
    DB: {
      prepare(query) {
        return {
          bind() {
            return {
              async first() {
                if (query.includes("FROM sessions")) {
                  return { email: "checkout@example.com", name: "Test User", cpf_hash: "cpf-hash" };
                }
                return {
                  stripe_customer_id: "cus_test",
                  stripe_subscription_id: "sub_test",
                  subscription_status: "active",
                  subscription_plan: "prescription_only"
                };
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

  globalThis.fetch = async (url, options) => {
    if (String(url).endsWith("/subscriptions/sub_test")) {
      return new Response(JSON.stringify({
        id: "sub_test",
        customer: "cus_test",
        status: "active",
        items: { data: [{ id: "si_test", price: "price_lite", quantity: 1 }] }
      }), { headers: { "Content-Type": "application/json" } });
    }
    portalForm = new URLSearchParams(options.body);
    return new Response(JSON.stringify({ url: "https://billing.stripe.com/session/test" }), {
      headers: { "Content-Type": "application/json" }
    });
  };

  try {
    const response = await onRequestPost({ request, env });
    const data = await response.json();

    assert.equal(response.status, 200);
    assert.equal(data.url, "https://billing.stripe.com/session/test");
    assert.equal(portalForm.get("flow_data[type]"), "subscription_update_confirm");
    assert.equal(
      portalForm.get("flow_data[subscription_update_confirm][items][0][price]"),
      "price_pro"
    );
    assert.equal(
      portalForm.get("flow_data[after_completion][redirect][return_url]"),
      "https://example.com/assinatura.html?checkout=return&plan=pro_mensal"
    );
    assert.equal(portalForm.get("locale"), "pt-BR");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
