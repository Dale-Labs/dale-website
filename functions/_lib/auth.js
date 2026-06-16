const SESSION_COOKIE = "dale_session";
const SESSION_TTL_SECONDS = 60 * 60 * 8;
const OAUTH_STATE_COOKIE = "dale_oauth_state";
const OAUTH_STATE_TTL_SECONDS = 60 * 10;

const INITIAL_ADMIN_EMAILS = ["awora@dale.africa"];
const WORKSPACE_USERS = {
  "ekim@dale.africa": "product_manager",
  "nshakya@dale.africa": "infrastructure_engineer",
};

const ROLE_ACCESS = {
  admin: ["docs", "signal", "canons", "tools", "developer", "validation"],
  team: ["docs", "signal", "canons", "tools", "developer", "validation"],
  product_manager: ["docs", "signal"],
  infrastructure_engineer: ["docs", "signal"],
  validation_partner: ["docs", "signal", "canons", "tools", "validation"],
  viewer: ["docs", "signal"],
};

function getSecret(env) {
  return env.DALE_AUTH_SESSION_SECRET || "";
}

function getAllowedEmails(env) {
  return [
    ...new Set([
      ...INITIAL_ADMIN_EMAILS,
      ...Object.keys(WORKSPACE_USERS),
      ...(env.DALE_AUTH_ALLOWED_EMAILS || "")
        .split(",")
        .map((email) => email.trim().toLowerCase())
        .filter(Boolean),
    ]),
  ];
}

function getRoleMap(env) {
  try {
    return Object.fromEntries(
      Object.entries(JSON.parse(env.DALE_AUTH_ROLES_JSON || "{}")).map(([email, role]) => [
        email.trim().toLowerCase(),
        role,
      ]),
    );
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

async function verifyPayload(payload, signature, secret) {
  try {
    const key = await hmacKey(secret);
    return crypto.subtle.verify(
      "HMAC",
      key,
      base64UrlDecode(signature),
      new TextEncoder().encode(payload),
    );
  } catch {
    return false;
  }
}

function parseCookies(request) {
  return Object.fromEntries(
    (request.headers.get("Cookie") || "")
      .split(";")
      .map((cookie) => cookie.trim().split("="))
      .filter(([name, value]) => name && value),
  );
}

function roleForEmail(email, env) {
  if (INITIAL_ADMIN_EMAILS.includes(email)) return "admin";
  if (WORKSPACE_USERS[email]) return WORKSPACE_USERS[email];
  const roleMap = getRoleMap(env);
  if (roleMap[email]) return roleMap[email];
  return "team";
}

function createUser(email, env) {
  return {
    email,
    role: roleForEmail(email, env),
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
}

async function createSignedToken(value, env) {
  const payload = base64UrlEncode(JSON.stringify(value));
  const signature = await signPayload(payload, getSecret(env));
  return `${payload}.${signature}`;
}

async function readSignedToken(token, env) {
  if (!token || !getSecret(env)) return null;

  const [payload, signature] = token.split(".");
  if (!payload || !signature) return null;

  if (!(await verifyPayload(payload, signature, getSecret(env)))) return null;

  try {
    return JSON.parse(new TextDecoder().decode(base64UrlDecode(payload)));
  } catch {
    return null;
  }
}

function getSection(pathname) {
  const [, root, section] = pathname.split("/");
  if (root !== "internal") return "";
  return section || "docs";
}

export function isAllowedNext(next) {
  if (!next.startsWith("/") || next.startsWith("//")) return false;
  return ["/internal", "/research", "/admin"].some(
    (root) => next === root || next === `${root}/` || next.startsWith(`${root}/`),
  );
}

export function authorizeEmail(email, env) {
  const normalizedEmail = String(email || "").trim().toLowerCase();
  if (!getAllowedEmails(env).includes(normalizedEmail)) return null;
  return createUser(normalizedEmail, env);
}

export async function verifyCredentials(email, password, env) {
  const normalizedEmail = email.trim().toLowerCase();
  const configuredHash = (env.DALE_AUTH_PASSWORD_SHA256 || "").trim().toLowerCase();

  if (!getSecret(env) || !configuredHash) {
    return { ok: false, reason: "Auth is not configured." };
  }

  const passwordHash = await sha256Hex(password);
  const user = authorizeEmail(normalizedEmail, env);
  if (!user || passwordHash !== configuredHash) {
    return { ok: false, reason: "Invalid email or password." };
  }

  return { ok: true, user };
}

export async function createSessionCookie(user, env) {
  const token = await createSignedToken(user, env);
  return `${SESSION_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=${SESSION_TTL_SECONDS}`;
}

export function clearSessionCookie() {
  return `${SESSION_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}

export async function getSession(request, env) {
  const token = parseCookies(request)[SESSION_COOKIE];
  const user = await readSignedToken(token, env);
  if (!user?.exp || user.exp < Math.floor(Date.now() / 1000)) return null;
  const authorizedUser = authorizeEmail(user.email, env);
  if (!authorizedUser) return null;
  return { ...authorizedUser, exp: user.exp };
}

export async function createOAuthStateCookie(state, env) {
  const token = await createSignedToken(
    {
      ...state,
      exp: Math.floor(Date.now() / 1000) + OAUTH_STATE_TTL_SECONDS,
    },
    env,
  );
  return `${OAUTH_STATE_COOKIE}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/auth/google; Max-Age=${OAUTH_STATE_TTL_SECONDS}`;
}

export function clearOAuthStateCookie() {
  return `${OAUTH_STATE_COOKIE}=; HttpOnly; Secure; SameSite=Lax; Path=/auth/google; Max-Age=0`;
}

export async function getOAuthState(request, env) {
  const state = await readSignedToken(parseCookies(request)[OAUTH_STATE_COOKIE], env);
  if (!state?.exp || state.exp < Math.floor(Date.now() / 1000)) return null;
  return state;
}

export function canAccess(user, pathname) {
  const section = getSection(pathname);
  const role = user?.role || "viewer";
  return ROLE_ACCESS[role]?.includes(section) || false;
}

export function canEditBlog(user) {
  return ["admin", "team"].includes(user?.role || "");
}

export function canAccessResearch(user) {
  return ["admin", "team", "validation_partner", "viewer"].includes(user?.role || "");
}
