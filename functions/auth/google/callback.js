import {
  authorizeEmail,
  clearOAuthStateCookie,
  createSessionCookie,
  getOAuthState,
  isAllowedNext,
} from "../../_lib/auth.js";
import { exchangeGoogleCode, verifyGoogleIdToken } from "../../_lib/google-auth.js";

function loginError(request, reason) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: new URL(`/login/?error=${encodeURIComponent(reason)}`, request.url).toString(),
      "Set-Cookie": clearOAuthStateCookie(),
      "Cache-Control": "no-store",
    },
  });
}

export async function onRequestGet({ request, env }) {
  const url = new URL(request.url);
  const state = await getOAuthState(request, env);
  const returnedState = url.searchParams.get("state");
  const code = url.searchParams.get("code");

  if (!state || !returnedState || returnedState !== state.state || !code) {
    return loginError(request, "state");
  }

  try {
    const clientId = env.DALE_GOOGLE_CLIENT_ID || "";
    const idToken = await exchangeGoogleCode({
      code,
      clientId,
      clientSecret: env.DALE_GOOGLE_CLIENT_SECRET || "",
      redirectUri: `${url.origin}/auth/google/callback`,
    });
    const claims = await verifyGoogleIdToken(idToken, {
      clientId,
      nonce: state.nonce,
    });
    const user = authorizeEmail(claims.email, env);
    if (!user) return loginError(request, "unauthorized");

    const sessionCookie = await createSessionCookie(user, env);
    const next = isAllowedNext(state.next) ? state.next : "/internal/";
    const headers = new Headers({
      Location: next,
      "Cache-Control": "no-store",
    });
    headers.append("Set-Cookie", sessionCookie);
    headers.append("Set-Cookie", clearOAuthStateCookie());
    return new Response(null, { status: 302, headers });
  } catch {
    return loginError(request, "google");
  }
}
