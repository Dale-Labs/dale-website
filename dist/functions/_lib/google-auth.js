const GOOGLE_AUTH_URL = "https://accounts.google.com/o/oauth2/v2/auth";
const GOOGLE_TOKEN_URL = "https://oauth2.googleapis.com/token";
const GOOGLE_JWKS_URL = "https://www.googleapis.com/oauth2/v3/certs";
const GOOGLE_ISSUERS = new Set(["accounts.google.com", "https://accounts.google.com"]);

let jwksCache = null;
let jwksExpiresAt = 0;

function base64UrlDecode(input) {
  const padded = input.replaceAll("-", "+").replaceAll("_", "/").padEnd(Math.ceil(input.length / 4) * 4, "=");
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

function decodeJson(input) {
  return JSON.parse(new TextDecoder().decode(base64UrlDecode(input)));
}

function randomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function getMaxAge(headers) {
  const match = (headers.get("Cache-Control") || "").match(/max-age=(\d+)/i);
  return match ? Number(match[1]) : 3600;
}

async function getGoogleKeys() {
  if (jwksCache && Date.now() < jwksExpiresAt) return jwksCache;

  const response = await fetch(GOOGLE_JWKS_URL);
  if (!response.ok) throw new Error("Google signing keys are unavailable.");

  jwksCache = (await response.json()).keys || [];
  jwksExpiresAt = Date.now() + getMaxAge(response.headers) * 1000;
  return jwksCache;
}

function assertWorkspaceIdentity(claims) {
  const email = String(claims.email || "").toLowerCase();
  const domain = email.split("@")[1] || "";
  if (!email || !claims.email_verified) throw new Error("Google email is not verified.");
  if (domain !== "gmail.com" && claims.hd !== domain) {
    throw new Error("A managed Google Workspace account is required.");
  }
}

export function createGoogleAuthorization({ clientId, redirectUri, next, hostedDomain, loginHint }) {
  const state = randomToken();
  const nonce = randomToken();
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: "code",
    scope: "openid email",
    state,
    nonce,
  });
  if (hostedDomain) params.set("hd", hostedDomain);
  if (loginHint) params.set("login_hint", loginHint);

  return {
    state: { state, nonce, next },
    url: `${GOOGLE_AUTH_URL}?${params}`,
  };
}

export async function exchangeGoogleCode({ code, clientId, clientSecret, redirectUri }) {
  const response = await fetch(GOOGLE_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  });
  const tokens = await response.json();
  if (!response.ok || !tokens.id_token) throw new Error("Google did not complete sign-in.");
  return tokens.id_token;
}

export async function verifyGoogleIdToken(idToken, { clientId, nonce }) {
  const parts = idToken.split(".");
  if (parts.length !== 3) throw new Error("Google returned an invalid identity token.");

  const [encodedHeader, encodedClaims, encodedSignature] = parts;
  const header = decodeJson(encodedHeader);
  const claims = decodeJson(encodedClaims);
  if (header.alg !== "RS256" || !header.kid) throw new Error("Google returned an unsupported identity token.");

  const jwk = (await getGoogleKeys()).find((key) => key.kid === header.kid);
  if (!jwk) throw new Error("Google signing key was not found.");

  const key = await crypto.subtle.importKey(
    "jwk",
    jwk,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["verify"],
  );
  const validSignature = await crypto.subtle.verify(
    "RSASSA-PKCS1-v1_5",
    key,
    base64UrlDecode(encodedSignature),
    new TextEncoder().encode(`${encodedHeader}.${encodedClaims}`),
  );

  const now = Math.floor(Date.now() / 1000);
  if (!validSignature) throw new Error("Google identity token signature is invalid.");
  if (!GOOGLE_ISSUERS.has(claims.iss)) throw new Error("Google identity token issuer is invalid.");
  if (claims.aud !== clientId) throw new Error("Google identity token audience is invalid.");
  if (!claims.exp || claims.exp <= now) throw new Error("Google identity token has expired.");
  if (claims.nonce !== nonce) throw new Error("Google sign-in state is invalid.");

  assertWorkspaceIdentity(claims);
  return claims;
}
