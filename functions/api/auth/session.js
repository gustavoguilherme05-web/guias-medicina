import {
  deleteSession,
  expiredSessionCookie,
  getAuthenticatedUser,
  hasDatabase,
  isSameOrigin,
  jsonResponse
} from "../../_shared/auth.js";

export async function onRequestGet({ request, env }) {
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  try {
    const user = await getAuthenticatedUser(request, env);
    return jsonResponse({ user: user ? { name: user.name, email: user.email } : null });
  } catch (error) {
    console.error("Falha ao consultar sessão:", error);
    return jsonResponse({ error: "Não foi possível consultar a sessão." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicitação não autorizada." }, 403);
  }
  if (!hasDatabase(env)) {
    return jsonResponse(
      { error: "Banco de dados D1 não configurado." },
      503,
      { "Set-Cookie": expiredSessionCookie() }
    );
  }

  try {
    await deleteSession(request, env);
    return jsonResponse({ ok: true }, 200, { "Set-Cookie": expiredSessionCookie() });
  } catch (error) {
    console.error("Falha ao encerrar sessão:", error);
    return jsonResponse({ error: "Não foi possível encerrar a sessão." }, 500);
  }
}
