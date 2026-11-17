import {
  getAuthenticatedUser,
  hasDatabase,
  isSameOrigin,
  jsonResponse
} from "../../_shared/auth.js";
import { stripeRequest } from "../../_shared/stripe.js";

const ACTIVE_SUBSCRIPTION_STATUSES = new Set([
  "active",
  "trialing",
  "past_due",
  "incomplete",
  "paused",
  "unpaid"
]);

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicitação não autorizada." }, 403);
  }
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  try {
    const user = await getAuthenticatedUser(request, env);
    if (!user) {
      return jsonResponse({ error: "Entre na sua conta para continuar." }, 401);
    }

    const requiredStripeSettings = [
      "STRIPE_SECRET_KEY",
      "STRIPE_PUBLISHABLE_KEY",
      "STRIPE_PRICE_ID",
      "STRIPE_WEBHOOK_SECRET"
    ];
    const missingStripeSettings = requiredStripeSettings.filter(
      (setting) => typeof env[setting] !== "string" || !env[setting].trim()
    );
    if (missingStripeSettings.length) {
      console.error("Configuração Stripe ausente:", missingStripeSettings.join(", "));
      return jsonResponse({
        error: `Configuração de pagamento incompleta. Configure: ${missingStripeSettings.join(", ")}.`
      }, 503);
    }

    const account = await env.DB.prepare(
      "SELECT stripe_customer_id, subscription_status FROM users WHERE email = ?"
    ).bind(user.email).first();
    if (ACTIVE_SUBSCRIPTION_STATUSES.has(account?.subscription_status)) {
      return jsonResponse({ error: "Sua conta já possui uma assinatura em andamento." }, 409);
    }

    const form = new URLSearchParams();
    form.set("mode", "subscription");
    form.set("ui_mode", "form");
    form.set("line_items[0][price]", env.STRIPE_PRICE_ID);
    form.set("line_items[0][quantity]", "1");
    form.set("billing_address_collection", "auto");
    form.set("phone_number_collection[enabled]", "false");
    form.set("automatic_tax[enabled]", "false");
    form.set("name_collection[individual][enabled]", "true");
    form.set("name_collection[individual][optional]", "true");
    form.set("payment_method_collection", "always");
    form.set("submit_type", "auto");
    form.set("integration_identifier", "custom_embedded_web_0001");
    form.set("saved_payment_method_options[payment_method_save]", "enabled");

    const session = await stripeRequest(env, "checkout/sessions", {
      method: "POST",
      body: form
    });
    if (typeof session.client_secret !== "string" || !session.client_secret) {
      console.error("Stripe não retornou o client_secret da Checkout Session.");
      return jsonResponse({ error: "Não foi possível iniciar o checkout." }, 502);
    }

    return jsonResponse({
      client_secret: session.client_secret,
      publishable_key: env.STRIPE_PUBLISHABLE_KEY
    });
  } catch (error) {
    console.error("Falha ao criar Checkout Session:", error);
    return jsonResponse({ error: "Não foi possível iniciar o checkout agora." }, 502);
  }
}
