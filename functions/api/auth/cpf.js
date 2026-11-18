import {
  getAuthenticatedUser,
  hasDatabase,
  isSameOrigin,
  jsonResponse,
  readJson
} from "../../_shared/auth.js";
import { hashCpf, normalizeCpf } from "../../_shared/cpf.js";

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicitação não autorizada." }, 403);
  }
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  try {
    const user = await getAuthenticatedUser(request, env);
    if (!user) {
      return jsonResponse({ error: "Entre na sua conta para informar o CPF." }, 401);
    }

    const body = await readJson(request);
    if (body?.error) return jsonResponse({ error: body.error }, 400);
    const cpf = normalizeCpf(body?.cpf);
    if (!cpf) return jsonResponse({ error: "Informe um CPF válido." }, 400);

    if (typeof env.CPF_HASH_SECRET !== "string" || env.CPF_HASH_SECRET.trim().length < 32) {
      console.error("CPF_HASH_SECRET ausente ou inválido.");
      return jsonResponse({ error: "Não foi possível salvar seu CPF agora." }, 503);
    }
    const cpfHash = await hashCpf(cpf, env.CPF_HASH_SECRET);
    const result = await env.DB.prepare(
      "UPDATE users SET cpf_hash = ? WHERE email = ? AND cpf_hash IS NULL"
    ).bind(cpfHash, user.email).run();

    if (!result.meta?.changes) {
      const account = await env.DB.prepare(
        "SELECT cpf_hash FROM users WHERE email = ?"
      ).bind(user.email).first();
      if (account?.cpf_hash) {
        return jsonResponse({ error: "Esta conta já possui um CPF cadastrado." }, 409);
      }
      return jsonResponse({ error: "Não foi possível salvar o CPF nesta conta." }, 500);
    }

    return jsonResponse({ ok: true });
  } catch (error) {
    if (String(error?.message || "").includes("UNIQUE constraint failed")) {
      return jsonResponse({ error: "Este CPF já está associado a outra conta." }, 409);
    }
    console.error("Falha ao salvar CPF da conta:", error);
    return jsonResponse({ error: "Não foi possível salvar seu CPF agora." }, 500);
  }
}
