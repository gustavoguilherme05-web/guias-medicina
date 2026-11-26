import {
  getAuthenticatedUser,
  hasDatabase,
  isSameOrigin,
  jsonResponse
} from "../../_shared/auth.js";
import { stripeRequest } from "../../_shared/stripe.js";

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

    if (body?.plan !== undefined) {
      return jsonResponse({ error: "A opção de upgrade não está disponível." }, 400);
    }

    const user = await getAuthenticatedUser(request, env);
    if (!user) {
      return jsonResponse({ error: "Entre na sua conta para gerenciar a assinatura." }, 401);
    }

    const account = await env.DB.prepare(`
      SELECT stripe_customer_id
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
