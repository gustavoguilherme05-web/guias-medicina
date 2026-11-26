import test from "node:test";
import assert from "node:assert/strict";
import { onRequestGet } from "../functions/api/billing/status.js";

test("billing status exposes the current LITE plan without an upgrade action", async () => {
  const token = "a".repeat(64);
  const env = {
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
                  subscription_status: "active",
                  subscription_plan: "prescription_only",
                  stripe_customer_id: "cus_test",
                  stripe_subscription_id: "sub_test",
                  cpf_hash: "cpf-hash",
                  experience_expires_at: null
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
  const request = new Request("https://example.com/api/billing/status", {
    headers: { Cookie: `guiamed_session=${token}` }
  });

  const response = await onRequestGet({ request, env });
  const data = await response.json();

  assert.equal(response.status, 200);
  assert.equal(data.currentPlan, "prescription_only");
  assert.equal(data.canUpgradeToPro, undefined);
  assert.equal(data.canManageBilling, true);
});
