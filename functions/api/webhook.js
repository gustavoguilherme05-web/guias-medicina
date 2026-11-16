import { jsonResponse } from "../_shared/auth.js";
import { stripeRequest } from "../_shared/stripe.js";

const SUBSCRIPTION_STATUSES = new Set([
  "incomplete",
  "incomplete_expired",
  "trialing",
  "active",
  "past_due",
  "canceled",
  "unpaid",
  "paused"
]);
const SIGNATURE_TOLERANCE_SECONDS = 300;

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

async function verifySignature(payload, header, secret) {
  const parts = header.split(",").map((part) => part.trim().split("=", 2));
  const timestamp = parts.find(([key]) => key === "t")?.[1];
  const signatures = parts.filter(([key]) => key === "v1").map(([, value]) => value);
  if (!timestamp || !/^\d+$/.test(timestamp) || signatures.length === 0) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > SIGNATURE_TOLERANCE_SECONDS) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`)
  );
  const expected = bytesToHex(new Uint8Array(digest));
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}

function stripeId(value) {
  const id = typeof value === "string" ? value : value?.id;
  return typeof id === "string" && /^[a-zA-Z0-9_]+$/.test(id) ? id : null;
}

async function syncSubscription(env, subscriptionId, customerId, email) {
  if (!subscriptionId || !customerId) return;

  const subscription = await stripeRequest(
    env,
    `subscriptions/${encodeURIComponent(subscriptionId)}`
  );
  if (!SUBSCRIPTION_STATUSES.has(subscription.status)) {
    throw new Error(`Status de assinatura Stripe não reconhecido: ${subscription.status}.`);
  }

  const actualCustomerId = stripeId(subscription.customer);
  if (actualCustomerId !== customerId) {
    throw new Error("A assinatura e o cliente do evento Stripe não correspondem.");
  }

  if (email) {
    await env.DB.prepare(`
      UPDATE users
      SET stripe_customer_id = ?, stripe_subscription_id = ?, subscription_status = ?
      WHERE email = ?
    `).bind(customerId, subscription.id, subscription.status, email).run();
    return;
  }

  await env.DB.prepare(`
    UPDATE users
    SET stripe_subscription_id = ?, subscription_status = ?
    WHERE stripe_customer_id = ?
  `).bind(subscription.id, subscription.status, customerId).run();
}

export async function onRequestPost({ request, env }) {
  if (!env?.DB) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }
  if (!env.STRIPE_SECRET_KEY || !env.STRIPE_WEBHOOK_SECRET) {
    return jsonResponse({ error: "Webhook Stripe não configurado." }, 503);
  }

  const signature = request.headers.get("Stripe-Signature") || "";
  const payload = await request.text();
  if (payload.length > 1024 * 1024) {
    return jsonResponse({ error: "Evento Stripe excede o tamanho permitido." }, 413);
  }

  try {
    if (!await verifySignature(payload, signature, env.STRIPE_WEBHOOK_SECRET)) {
      return jsonResponse({ error: "Assinatura do webhook inválida." }, 400);
    }

    const event = JSON.parse(payload);
    const object = event?.data?.object;
    if (event.type === "checkout.session.completed" ||
        event.type === "checkout.session.async_payment_succeeded") {
      if (object?.mode === "subscription") {
        const emailValue = object.metadata?.user_email || object.client_reference_id;
        const email = typeof emailValue === "string" ? emailValue.trim().toLowerCase() : "";
        await syncSubscription(
          env,
          stripeId(object.subscription),
          stripeId(object.customer),
          email || null
        );
      }
    } else if (event.type === "customer.subscription.created" ||
               event.type === "customer.subscription.updated" ||
               event.type === "customer.subscription.deleted") {
      await syncSubscription(
        env,
        stripeId(object?.id),
        stripeId(object?.customer),
        null
      );
    }

    return jsonResponse({ received: true });
  } catch (error) {
    console.error("Falha ao processar webhook Stripe:", error);
    return jsonResponse({ error: "Não foi possível processar o evento Stripe." }, 500);
  }
}
