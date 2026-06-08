import { canAccessResearch, getSession } from "../_lib/auth.js";

export async function onRequest({ request, env, next }) {
  const url = new URL(request.url);
  const user = await getSession(request, env);

  if (!user) {
    return Response.redirect(`${url.origin}/login/?next=${encodeURIComponent(url.pathname)}`, 302);
  }

  if (!canAccessResearch(user)) {
    return new Response("Restricted access", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("X-Robots-Tag", "noindex, nofollow");
  headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
