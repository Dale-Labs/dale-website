import { createSessionCookie, isAllowedNext, verifyCredentials } from "./_lib/auth.js";

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
  return redirect(isAllowedNext(next) ? next : "/internal/", {
    "Set-Cookie": sessionCookie,
  });
}
