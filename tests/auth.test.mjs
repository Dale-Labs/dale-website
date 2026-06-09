import assert from "node:assert/strict";
import test from "node:test";

import {
  authorizeEmail,
  canAccess,
  canAccessResearch,
  canEditBlog,
  createSessionCookie,
  getSession,
  isAllowedNext,
} from "../functions/_lib/auth.js";
import { createGoogleAuthorization } from "../functions/_lib/google-auth.js";
import { onRequest as protectResearch } from "../functions/research/_middleware.js";

const env = {
  DALE_AUTH_SESSION_SECRET: "test-session-secret",
  DALE_AUTH_ALLOWED_EMAILS: "team@dale.africa, partner@example.org",
  DALE_AUTH_ROLES_JSON: JSON.stringify({
    "team@dale.africa": "team",
    "partner@example.org": "validation_partner",
  }),
};

test("initial owner is always an authorized admin", () => {
  assert.deepEqual(authorizeEmail("AWORA@DALE.AFRICA", env).role, "admin");
  assert.equal(canEditBlog(authorizeEmail("awora@dale.africa", env)), true);
});

test("additional users receive configured roles and unknown users are rejected", () => {
  assert.equal(authorizeEmail("partner@example.org", env).role, "validation_partner");
  assert.equal(authorizeEmail("unknown@dale.africa", env), null);
});

test("protected return paths do not allow open redirects", () => {
  assert.equal(isAllowedNext("/internal/docs/"), true);
  assert.equal(isAllowedNext("/research/publications/"), true);
  assert.equal(isAllowedNext("/admin/blog/"), true);
  assert.equal(isAllowedNext("//evil.example"), false);
  assert.equal(isAllowedNext("/blog/"), false);
  assert.equal(isAllowedNext("/administrator/"), false);
});

test("signed sessions preserve access rules", async () => {
  const user = authorizeEmail("awora@dale.africa", env);
  const cookie = await createSessionCookie(user, env);
  const request = new Request("https://dale.africa/internal/", {
    headers: { Cookie: cookie.split(";")[0] },
  });
  const session = await getSession(request, env);

  assert.equal(session.email, "awora@dale.africa");
  assert.equal(canAccess(session, "/internal/developer/"), true);
  assert.equal(canAccessResearch(session), true);
  assert.equal(canEditBlog(session), true);
});

test("Google authorization requests only identity scopes and preserves a safe destination", () => {
  const authorization = createGoogleAuthorization({
    clientId: "client-id",
    redirectUri: "https://dale.africa/auth/google/callback",
    next: "/research/",
    hostedDomain: "dale.africa",
    loginHint: "awora@dale.africa",
  });
  const url = new URL(authorization.url);

  assert.equal(url.origin, "https://accounts.google.com");
  assert.equal(url.searchParams.get("scope"), "openid email");
  assert.equal(url.searchParams.get("hd"), "dale.africa");
  assert.equal(url.searchParams.get("login_hint"), "awora@dale.africa");
  assert.equal(url.searchParams.has("prompt"), false);
  assert.equal(authorization.state.next, "/research/");
  assert.ok(authorization.state.state);
  assert.ok(authorization.state.nonce);
});

test("Google authorization omits login_hint when it is not configured", () => {
  const authorization = createGoogleAuthorization({
    clientId: "client-id",
    redirectUri: "https://dale.africa/auth/google/callback",
    next: "/internal/",
    hostedDomain: "dale.africa",
  });
  const url = new URL(authorization.url);

  assert.equal(url.searchParams.has("login_hint"), false);
  assert.equal(url.searchParams.has("prompt"), false);
  assert.equal(url.searchParams.get("hd"), "dale.africa");
});

test("research routes redirect anonymous users and allow signed-in users", async () => {
  const anonymous = await protectResearch({
    request: new Request("https://dale.africa/research/"),
    env,
    next: () => new Response("research"),
  });
  assert.equal(anonymous.status, 302);
  assert.match(anonymous.headers.get("Location"), /\/login\/\?next=/);

  const user = authorizeEmail("awora@dale.africa", env);
  const cookie = await createSessionCookie(user, env);
  const authorized = await protectResearch({
    request: new Request("https://dale.africa/research/", {
      headers: { Cookie: cookie.split(";")[0] },
    }),
    env,
    next: () => new Response("research"),
  });
  assert.equal(authorized.status, 200);
  assert.equal(await authorized.text(), "research");
  assert.equal(authorized.headers.get("Cache-Control"), "private, no-store");
});
