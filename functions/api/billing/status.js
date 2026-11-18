import {
  getAuthenticatedUser,
  hasDatabase,
  jsonResponse
} from "../../_shared/auth.js";
import { expireExperienceIfNeeded } from "../../_shared/experience.js";

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

    await expireExperienceIfNeeded(env, user.email);
    const account = await env.DB.prepare(
      "SELECT subscription_status, cpf_hash, experience_expires_at FROM users WHERE email = ?"
    ).bind(user.email).first();
    const status = account?.subscription_status || "free";
    const requiresCpf = !account?.cpf_hash;
    return jsonResponse({
      status,
      requiresCpf,
      canStartCheckout: !requiresCpf && RESTARTABLE_STATUSES.has(status),
      experienceExpiresAt: account?.experience_expires_at || null
    });
  } catch (error) {
    console.error("Falha ao consultar assinatura:", error);
    return jsonResponse({ error: "Não foi possível consultar a assinatura agora." }, 500);
  }
}
