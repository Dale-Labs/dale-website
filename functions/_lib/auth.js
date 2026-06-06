const SESSION_COOKIE = "dale_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;

const ROLE_ACCESS = {
  admin: ["docs", "canons", "tools", "developer", "validation"],
  team: ["docs", "canons", "tools", "developer", "validation"],
  validation_partner: ["docs", "canons", "tools", "validation"],
  viewer: ["docs"],
};

function getSecret(env) {
  return env.DALE_AUTH_SESSION_SECRET || "";
}

function getAllowedEmails(env) {
  return (env.DALE_AUTH_ALLOWED_EMAILS || "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
}

function getRoleMap(env) {
  try {
    return JSON.parse(env.DALE_AUTH_ROLES_JSON || "{}");
  } catch {
    return {};
  }
}

function base64UrlEncode(input) {
  const bytes = typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function base64UrlDecode(input) {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function sha256Hex(value) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function hmacKey(secret) {
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

async function signPayload(payload, secret) {
  const key = await hmacKey(secret);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return base64UrlEncode(new Uint8Array(signature));
}

function parseCookies(request) {
  return Object.fromEntries(
    (request.headers.get("Cookie") || "")
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([name, value]) => name && value),
  );
}

function getSection(pathname) {
  const [, root, section] = pathname.split("/");
  if (root !== "internal") return "";
  return section || "docs";
}

export async function verifyCredentials(email, password, env) {
  const normalizedEmail = email.trim().toLowerCase();
  const allowedEmails = getAllowedEmails(env);
  const configuredHash = (env.DALE_AUTH_PASSWORD_SHA256 || "").trim().toLowerCase();

  if (!getSecret(env) || !configuredHash || allowedEmails.length === 0) {
    return { ok: false, reason: "Auth is not configured." };
  }

  const passwordHash = await sha256Hex(password);
  if (!allowedEmails.includes(normalizedEmail) || passwordHash !== configuredHash) {
    return { ok: false, reason: "Invalid email or password." };
  }

  const roleMap = getRoleMap(env);
  return {
    ok: true,
    user: {
      email: normalizedEmail,
      role: roleMap[normalizedEmail] || "team",
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    },
  };
}

export async function createSessionCookie(user, env) {
  const payload = base64UrlEncode(JSON.stringify(user));
  const signature = await signPayload(payload, getSecret(env));
  return `${SESSION_COOKIE}=${payload}.${signature}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function getSession(request, env) {
  const token = parseCookies(request)[SESSION_COOKIE];
  if (!token || !getSecret(env)) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  const expected = await signPayload(payload, getSecret(env));
  if (expected !== signature) return null;

  try {
    const user = JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
    if (!user.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
    return user;
  } catch {
    return null;
  }
}

export function canAccess(user, pathname) {
  const section = getSection(pathname);
  const role = user?.role || "viewer";
  return ROLE_ACCESS[role]?.includes(section) || false;
}

export function canEditBlog(user) {
  return ["admin", "team"].includes(user?.role || "");
}
