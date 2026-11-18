export const EXPERIENCE_DURATION_MS = 7 * 24 * 60 * 60 * 1000;

export function getExperienceExpiry(eventCreatedAt) {
  if (!Number.isSafeInteger(eventCreatedAt) || eventCreatedAt <= 0) {
    throw new Error("Data de criação do evento Stripe inválida.");
  }
  return eventCreatedAt * 1000 + EXPERIENCE_DURATION_MS;
}

export async function expireExperienceIfNeeded(env, email, now = Date.now()) {
  await env.DB.prepare(`
    UPDATE users
    SET subscription_status = 'free',
        subscription_plan = 'free',
        experience_expires_at = NULL
    WHERE email = ?
      AND subscription_status = 'active'
      AND subscription_plan = 'pro'
      AND experience_expires_at IS NOT NULL
      AND experience_expires_at <= ?
  `).bind(email, now).run();
}
