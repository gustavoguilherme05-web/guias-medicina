export async function stripeRequest(env, path, options = {}) {
  const secretKey = env?.STRIPE_SECRET_KEY;
  if (!secretKey) {
    throw new Error("STRIPE_SECRET_KEY não configurada.");
  }

  const response = await fetch(`https://api.stripe.com/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Stripe-Version": "2026-03-25.dahlia",
      ...(options.body ? { "Content-Type": "application/x-www-form-urlencoded" } : {})
    },
    body: options.body
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error(`Stripe retornou uma resposta inválida (${response.status}).`);
  }
  if (!response.ok) {
    throw new Error(`Stripe retornou um erro (${response.status}): ${data?.error?.code || "desconhecido"}.`);
  }
  return data;
}
