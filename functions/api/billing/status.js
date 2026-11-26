import {
  getAuthenticatedUser,
  hasDatabase,
  jsonResponse
} from "../../_shared/auth.js";
import { expireExperienceIfNeeded } from "../../_shared/experience.js";

const RESTARTABLE_STATUSES = new Set(["free", "canceled", "incomplete_expired"]);
const CURRENT_PLANS = new Set(["free", "experience", "prescription_only", "pro"]);

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
      `SELECT subscription_status, subscription_plan, stripe_customer_id,
              stripe_subscription_id, cpf_hash, experience_expires_at
       FROM users WHERE email = ?`
    ).bind(user.email).first();
    const status = account?.subscription_status || "free";
    const requiresCpf = !account?.cpf_hash;
    const storedPlan = account?.subscription_plan;
    const isExperience = Boolean(account?.experience_expires_at) ||
      storedPlan === "experience";
    const currentPlan = isExperience
      ? "experience"
      : (CURRENT_PLANS.has(storedPlan) ? storedPlan : "free");
    const hasStripeSubscription = Boolean(account?.stripe_subscription_id);
    const isPaidStatus = ["active", "trialing"].includes(status);
    return jsonResponse({
      status,
      currentPlan,
      requiresCpf,
      canStartCheckout: !requiresCpf && (
        RESTARTABLE_STATUSES.has(status) ||
        (isExperience && !hasStripeSubscription)
      ),
      canUpgradeToPro: !requiresCpf &&
        isPaidStatus &&
        currentPlan === "prescription_only" &&
        hasStripeSubscription,
      canManageBilling: Boolean(account?.stripe_customer_id),
      experienceExpiresAt: account?.experience_expires_at || null
    });
  } catch (error) {
    console.error("Falha ao consultar assinatura:", error);
    return jsonResponse({ error: "Não foi possível consultar a assinatura agora." }, 500);
  }
}
