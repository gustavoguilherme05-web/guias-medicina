const COOKIE_NAME = "guiamed_session";
const SESSION_DURATION_SECONDS = 7 * 24 * 60 * 60;

export function jsonResponse(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers
    }
  });
}

export function hasDatabase(env) {
  return Boolean(env?.DB);
}

export function isSameOrigin(request) {
  return request.headers.get("Origin") === new URL(request.url).origin;
}

export async function readJson(request) {
  const contentLength = Number(request.headers.get("Content-Length") || 0);
  if (contentLength > 12000) {
    return { error: "A solicitação excede o tamanho permitido." };
  }

  try {
    const rawBody = await request.text();
    if (new TextEncoder().encode(rawBody).length > 12000) {
      return { error: "A solicitação excede o tamanho permitido." };
    }
    return JSON.parse(rawBody);
  } catch {
    return { error: "Corpo da requisição inválido." };
  }
}

function bytesToHex(bytes) {
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function hexToBytes(hex) {
  return Uint8Array.from(hex.match(/.{2}/g), (byte) => parseInt(byte, 16));
}

export function randomHex(byteLength) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

export async function hashText(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return bytesToHex(new Uint8Array(digest));
}

export async function hashPassword(password, salt) {
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const bits = await crypto.subtle.deriveBits({
    name: "PBKDF2",
    salt: hexToBytes(salt),
    iterations: 310000,
    hash: "SHA-256"
  }, key, 256);
  return bytesToHex(new Uint8Array(bits));
}

export function constantTimeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function getSessionToken(request) {
  const cookies = request.headers.get("Cookie") || "";
  const cookie = cookies.split(";").map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));
  const token = cookie?.slice(COOKIE_NAME.length + 1) || "";
  return /^[a-f0-9]{64}$/.test(token) ? token : null;
}

export async function getAuthenticatedUser(request, env) {
  const token = getSessionToken(request);
  if (!token) return null;

  const tokenHash = await hashText(token);
  const user = await env.DB.prepare(`
    SELECT users.email, users.name
    FROM sessions
    JOIN users ON users.email = sessions.email
    WHERE sessions.token_hash = ? AND sessions.expires_at > ?
  `).bind(tokenHash, Date.now()).first();

  return user || null;
}

export async function createSession(email, env) {
  const token = randomHex(32);
  const expiresAt = Date.now() + SESSION_DURATION_SECONDS * 1000;
  const tokenHash = await hashText(token);

  await env.DB.prepare("DELETE FROM sessions WHERE expires_at <= ?")
    .bind(Date.now())
    .run();
  await env.DB.prepare(
    "INSERT INTO sessions (token_hash, email, expires_at) VALUES (?, ?, ?)"
  ).bind(tokenHash, email, expiresAt).run();

  return `${COOKIE_NAME}=${token}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_DURATION_SECONDS}`;
}

export function expiredSessionCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}

export async function deleteSession(request, env) {
  const token = getSessionToken(request);
  if (!token) return;
  const tokenHash = await hashText(token);
  await env.DB.prepare("DELETE FROM sessions WHERE token_hash = ?").bind(tokenHash).run();
}
