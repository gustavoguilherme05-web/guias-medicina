import {
  getAuthenticatedUser,
  hasDatabase,
  isSameOrigin,
  jsonResponse,
  readJson
} from "../_shared/auth.js";

function getGuideId(value) {
  const guideId = typeof value === "string" ? value : "";
  return /^[1-9]\d{0,8}$/.test(guideId) ? guideId : null;
}

export async function onRequestGet({ request, env }) {
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  const guideId = getGuideId(new URL(request.url).searchParams.get("guideId"));
  if (!guideId) return jsonResponse({ error: "Identificador de diretriz inválido." }, 400);

  try {
    const { results } = await env.DB.prepare(`
      SELECT id, user_name AS name, body, created_at AS createdAt
      FROM comments
      WHERE guide_id = ?
      ORDER BY id DESC
      LIMIT 100
    `).bind(guideId).all();
    return jsonResponse({ comments: results });
  } catch (error) {
    console.error("Falha ao carregar comentários:", error);
    return jsonResponse({ error: "Não foi possível carregar a discussão." }, 500);
  }
}

export async function onRequestPost({ request, env }) {
  if (!isSameOrigin(request)) {
    return jsonResponse({ error: "Origem da solicitação não autorizada." }, 403);
  }
  if (!hasDatabase(env)) {
    return jsonResponse({ error: "Banco de dados D1 não configurado." }, 503);
  }

  let user;
  try {
    user = await getAuthenticatedUser(request, env);
  } catch (error) {
    console.error("Falha ao validar sessão para comentário:", error);
    return jsonResponse({ error: "Não foi possível validar sua sessão." }, 500);
  }
  if (!user) return jsonResponse({ error: "Faça login para enviar uma mensagem." }, 401);

  const body = await readJson(request);
  if (body?.error) return jsonResponse({ error: body.error }, 400);

  const guideId = getGuideId(body?.guideId);
  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!guideId) return jsonResponse({ error: "Identificador de diretriz inválido." }, 400);
  if (!message || message.length > 2000) {
    return jsonResponse({ error: "A mensagem deve ter entre 1 e 2000 caracteres." }, 400);
  }

  try {
    await env.DB.prepare(
      "INSERT INTO comments (guide_id, user_email, user_name, body) VALUES (?, ?, ?, ?)"
    ).bind(guideId, user.email, user.name, message).run();
    return jsonResponse({ ok: true }, 201);
  } catch (error) {
    console.error("Falha ao publicar comentário:", error);
    return jsonResponse({ error: "Não foi possível publicar sua mensagem." }, 500);
  }
}
