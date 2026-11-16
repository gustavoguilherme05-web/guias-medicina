import {
  getAuthenticatedUser,
  hasDatabase,
  jsonResponse
} from "../../_shared/auth.js";

const RESTARTABLE_STATUSES = new Set(["free", "canceled", "incomplete_expired"]);

export async function onRequestGet({ request, env }) {
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  try {
    const user = await getAuthenticatedUser(request, env);
    if (!user) {
      return jsonResponse({ error: "Entre na sua conta para consultar a assinatura." }, 401);
    }

    const account = await env.DB.prepare(
      "SELECT subscription_status FROM users WHERE email = ?"
    ).bind(user.email).first();
    const status = account?.subscription_status || "free";
    return jsonResponse({
      status,
      canStartCheckout: RESTARTABLE_STATUSES.has(status)
    });
  } catch (error) {
    console.error("Falha ao consultar assinatura:", error);
    return jsonResponse({ error: "Não foi possível consultar a assinatura agora." }, 500);
  }
}
