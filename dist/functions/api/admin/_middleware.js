import { canEditBlog, getSession } from "../../_lib/auth.js";

export async function onRequest({ request, env, next }) {
  const user = await getSession(request, env);
  if (!user) return Response.json({ error: "Authentication required." }, { status: 401 });
  if (!canEditBlog(user)) return Response.json({ error: "Editor access required." }, { status: 403 });

  const response = await next();
  const headers = new Headers(response.headers);
  headers.set("Cache-Control", "private, no-store");
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}
