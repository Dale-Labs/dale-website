import { createOAuthStateCookie, isAllowedNext } from "../../_lib/auth.js";
import { createGoogleAuthorization } from "../../_lib/google-auth.js";

export async function onRequestGet({ request, env }) {
  if (!env.DALE_AUTH_SESSION_SECRET || !env.DALE_GOOGLE_CLIENT_ID || !env.DALE_GOOGLE_CLIENT_SECRET) {
    return Response.redirect(new URL("/login/?error=config", request.url), 302);
  }

  const url = new URL(request.url);
  const requestedNext = url.searchParams.get("next") || "/internal/";
  const next = isAllowedNext(requestedNext) ? requestedNext : "/internal/";
  const redirectUri = `${url.origin}/auth/google/callback`;
  const authorization = createGoogleAuthorization({
    clientId: env.DALE_GOOGLE_CLIENT_ID,
    redirectUri,
    next,
    hostedDomain: env.DALE_GOOGLE_HOSTED_DOMAIN || "dale.africa",
    loginHint: env.DALE_GOOGLE_LOGIN_HINT || "",
  });
  const stateCookie = await createOAuthStateCookie(authorization.state, env);

  return new Response(null, {
    status: 302,
    headers: {
      Location: authorization.url,
      "Set-Cookie": stateCookie,
      "Cache-Control": "no-store",
    },
  });
}
