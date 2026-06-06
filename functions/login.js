import { createSessionCookie, verifyCredentials } from "./_lib/auth.js";

function redirect(location, headers = {}) {
  return new Response(null, {
    status: 302,
    headers: {
      Location: location,
      ...headers,
    },
  });
}

export async function onRequestPost({ request, env }) {
  const form = await request.formData();
  const email = String(form.get("email") || "");
  const password = String(form.get("password") || "");
  const next = String(form.get("next") || "/internal/");

  const result = await verifyCredentials(email, password, env);
  if (!result.ok) {
    return redirect(`/login/?error=1&next=${encodeURIComponent(next)}`);
  }

  const sessionCookie = await createSessionCookie(result.user, env);
  const allowedNext = next.startsWith("/internal") || next.startsWith("/admin/blog");
  return redirect(allowedNext ? next : "/internal/", {
    "Set-Cookie": sessionCookie,
  });
}
