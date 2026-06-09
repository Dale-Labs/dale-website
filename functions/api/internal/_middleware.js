import { canAccess, getSession } from "../../_lib/auth.js";

export async function onRequest({ request, env, next }) {
  const user = await getSession(request, env);
  if (!user) {
    return Response.json({ error: "Authentication required." }, {
      status: 401,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  if (!canAccess(user, "/internal/signal/")) {
    return Response.json({ error: "Restricted access." }, {
      status: 403,
      headers: { "Cache-Control": "private, no-store" },
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  headers.set("X-Robots-Tag", "noindex, nofollow");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

