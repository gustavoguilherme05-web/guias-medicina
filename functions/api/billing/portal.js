import {
  getAuthenticatedUser,
  hasDatabase,
  isSameOrigin,
  jsonResponse
} from "../../_shared/auth.js";
import { stripeRequest } from "../../_shared/stripe.js";

const PRO_PRICE_SETTING = "STRIPE_PRICE_PRO_MENSAL";
const LITE_PRICE_SETTING = "STRIPE_PRICE_PRESCRICAO_MENSAL";

function stripeId(value) {
  const id = typeof value === "string" ? value : value?.id;
  return typeof id === "string" && /^[a-zA-Z0-9_]+$/.test(id) ? id : null;
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicitação não autorizada." }, 403);
  }
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }
  if (typeof env.STRIPE_SECRET_KEY !== "string" || !env.STRIPE_SECRET_KEY.trim()) {
    console.error("Configuração Stripe ausente: STRIPE_SECRET_KEY");
    return jsonResponse({ error: "O gerenciamento de cobrança não está configurado." }, 503);
  }

  try {
    let body;
    try {
      body = await request.json();
    } catch {
      return jsonResponse({ error: "Solicitação de gerenciamento inválida." }, 400);
    }

    if (body?.plan !== undefined && body.plan !== "pro_mensal") {
      return jsonResponse({ error: "Plano de upgrade inválido." }, 400);
    }

    const user = await getAuthenticatedUser(request, env);
    if (!user) {
      return jsonResponse({ error: "Entre na sua conta para gerenciar a assinatura." }, 401);
    }

    const account = await env.DB.prepare(`
      SELECT stripe_customer_id, stripe_subscription_id, subscription_status,
             subscription_plan
      FROM users
      WHERE email = ?
    `).bind(user.email).first();
    if (!account?.stripe_customer_id) {
      return jsonResponse({ error: "Não há uma assinatura Stripe para gerenciar nesta conta." }, 409);
    }

    const form = new URLSearchParams();
    form.set("customer", account.stripe_customer_id);
    const returnUrl = new URL("/assinatura.html?checkout=return", request.url).toString();
    form.set("return_url", returnUrl);
    form.set("locale", "pt-BR");

    if (body.plan === "pro_mensal") {
      if (!["active", "trialing"].includes(account.subscription_status) ||
          account.subscription_plan !== "prescription_only" ||
          !account.stripe_subscription_id) {
        return jsonResponse({ error: "Sua assinatura atual não permite este upgrade." }, 409);
      }

      const proPrice = env[PRO_PRICE_SETTING];
      if (typeof proPrice !== "string" || !proPrice.trim()) {
        console.error(`Configuração Stripe ausente: ${PRO_PRICE_SETTING}`);
        return jsonResponse({ error: "O preço do plano PRO ainda não está configurado." }, 503);
      }
      const litePrice = env[LITE_PRICE_SETTING];
      if (typeof litePrice !== "string" || !litePrice.trim()) {
        console.error(`Configuração Stripe ausente: ${LITE_PRICE_SETTING}`);
        return jsonResponse({ error: "O preço do plano LITE ainda não está configurado." }, 503);
      }

      const subscription = await stripeRequest(
        env,
        `subscriptions/${encodeURIComponent(account.stripe_subscription_id)}`
      );
      if (stripeId(subscription.customer) !== account.stripe_customer_id) {
        throw new Error("A assinatura Stripe não pertence ao cliente autenticado.");
      }

      const items = subscription.items?.data;
      if (!["active", "trialing"].includes(subscription.status) ||
          !Array.isArray(items) ||
          items.length !== 1 ||
          !stripeId(items[0].id) ||
          stripeId(items[0].price) !== litePrice) {
        return jsonResponse({ error: "Não foi possível validar a assinatura para o upgrade." }, 409);
      }

      form.set("flow_data[type]", "subscription_update_confirm");
      form.set(
        "flow_data[subscription_update_confirm][subscription]",
        account.stripe_subscription_id
      );
      form.set("flow_data[subscription_update_confirm][items][0][id]", items[0].id);
      form.set("flow_data[subscription_update_confirm][items][0][price]", proPrice);
      form.set(
        "flow_data[subscription_update_confirm][items][0][quantity]",
        String(items[0].quantity || 1)
      );
      form.set("flow_data[after_completion][type]", "redirect");
      const upgradeReturnUrl = new URL(returnUrl);
      upgradeReturnUrl.searchParams.set("plan", "pro_mensal");
      form.set(
        "flow_data[after_completion][redirect][return_url]",
        upgradeReturnUrl.toString()
      );
    }

    const session = await stripeRequest(env, "billing_portal/sessions", {
      method: "POST",
      body: form
    });
    if (typeof session.url !== "string" || !session.url) {
      console.error("Stripe não retornou a URL da sessão do portal de cobrança.");
      return jsonResponse({ error: "Não foi possível abrir o gerenciamento da assinatura." }, 502);
    }

    return jsonResponse({ url: session.url });
  } catch (error) {
    console.error("Falha ao criar sessão do portal de cobrança:", error);
    return jsonResponse({
      error: "Não foi possível abrir o gerenciamento. Confira a configuração do Customer Portal na Stripe."
    }, 502);
  }
}
