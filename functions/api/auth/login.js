import {
  createSession,
  constantTimeEqual,
  hasDatabase,
  hashPassword,
  isSameOrigin,
  jsonResponse,
  readJson
} from "../../_shared/auth.js";

const DUMMY_SALT = "00112233445566778899aabbccddeeff";

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicitação não autorizada." }, 403);
  }
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  const body = await readJson(request);
  if (body?.error) return jsonResponse({ error: body.error }, 400);

  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.senha === "string" ? body.senha : "";
  if (!email || email.length > 254 || !password || password.length > 128) {
    return jsonResponse({ error: "E-mail ou senha incorretos." }, 401);
  }

  try {
    const user = await env.DB.prepare(
      "SELECT email, name, password_salt, password_hash FROM users WHERE email = ?"
    ).bind(email).first();
    const salt = user?.password_salt || DUMMY_SALT;
    const passwordHash = await hashPassword(password, salt);
    if (!user || !constantTimeEqual(passwordHash, user.password_hash)) {
      return jsonResponse({ error: "E-mail ou senha incorretos." }, 401);
    }

    const cookie = await createSession(user.email, env);
    return jsonResponse(
      { user: { name: user.name, email: user.email } },
      200,
      { "Set-Cookie": cookie }
    );
  } catch (error) {
    console.error("Falha ao autenticar usuário:", error);
    return jsonResponse({ error: "Não foi possível realizar o login agora." }, 500);
  }
}
