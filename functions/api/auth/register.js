import {
  createSession,
  hasDatabase,
  isSameOrigin,
  jsonResponse,
  hashPassword,
  randomHex,
  readJson
} from "../../_shared/auth.js";

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicitação não autorizada." }, 403);
  }
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  const body = await readJson(request);
  if (body?.error) return jsonResponse({ error: body.error }, 400);

  const name = typeof body?.nome === "string" ? body.nome.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.senha === "string" ? body.senha : "";

  if (name.length < 2 || name.length > 80) {
    return jsonResponse({ error: "O nome deve ter entre 2 e 80 caracteres." }, 400);
  }
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return jsonResponse({ error: "Informe um e-mail válido." }, 400);
  }
  if (password.length < 8 || password.length > 128) {
    return jsonResponse({ error: "A senha precisa ter entre 8 e 128 caracteres." }, 400);
  }

  try {
    const salt = randomHex(16);
    const passwordHash = await hashPassword(password, salt);
    await env.DB.prepare(
      "INSERT INTO users (email, name, password_salt, password_hash) VALUES (?, ?, ?, ?)"
    ).bind(email, name, salt, passwordHash).run();

    const cookie = await createSession(email, env);
    return jsonResponse({ user: { name, email } }, 201, { "Set-Cookie": cookie });
  } catch (error) {
    if (String(error?.message || "").includes("UNIQUE constraint failed")) {
      return jsonResponse({ error: "Já existe uma conta com esse e-mail." }, 409);
    }
    console.error("Falha ao criar conta:", error);
    return jsonResponse({ error: "Não foi possível criar a conta agora." }, 500);
  }
}
