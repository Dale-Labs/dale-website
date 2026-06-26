import { clearSessionCookie } from "./_lib/auth.js";

export function onRequest() {
  return new Response(null, {
    status: 302,
    headers: {
      Location: "/",
      "Set-Cookie": clearSessionCookie(),
    },
  });
}
