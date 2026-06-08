# DALE Internal Auth Setup

DALE internal access is enforced through Cloudflare Pages Functions. The protected routes are:

- `/internal/` and all internal subsections
- `/research/` and all research subsections
- `/admin/`, including `/admin/blog/`
- `/api/admin/`, used by the blog editor

Public pages such as `/`, `/blog/`, and published `/blog/[slug]` articles remain public.

## Admin access

`awora@dale.africa` is the initial admin account. It is intentionally stored as a non-secret
server-side allowlist entry and receives the `admin` role after successful Google verification.

Additional authorized users are configured with Cloudflare Pages environment variables:

- `DALE_AUTH_ALLOWED_EMAILS`: comma-separated list of additional approved Google account emails.
- `DALE_AUTH_ROLES_JSON`: optional JSON map of additional email addresses to roles.

Example values:

```text
DALE_AUTH_ALLOWED_EMAILS=person@dale.africa,partner@example.org
DALE_AUTH_ROLES_JSON={"person@dale.africa":"team","partner@example.org":"validation_partner"}
```

Prepared roles:

- `admin`: full internal, research, and blog editor access.
- `team`: full internal, research, and blog editor access.
- `validation_partner`: internal docs, canons, tools, validation, and research access.
- `viewer`: internal documentation and research access.

## Required Cloudflare Pages variables

In **Workers & Pages > DALE website > Settings > Variables and Secrets**, configure:

- `DALE_AUTH_SESSION_SECRET`: long random string used to sign session cookies.
- `DALE_GOOGLE_CLIENT_ID`: Google OAuth web application client ID.
- `DALE_GOOGLE_CLIENT_SECRET`: Google OAuth client secret. Store this as an encrypted secret.

Optional variables:

- `DALE_GOOGLE_HOSTED_DOMAIN`: Google Workspace domain hint. Defaults to `dale.africa`.
- `DALE_AUTH_ALLOWED_EMAILS`: additional approved email addresses.
- `DALE_AUTH_ROLES_JSON`: role assignments for additional users.
- `DALE_AUTH_PASSWORD_SHA256`: enables the existing shared-password form as a fallback.

Do not commit any secret values. Configure production and preview environments separately when
preview deployments also need login.

## Google OAuth setup

Create a Google OAuth 2.0 client with application type **Web application**. Add the production
callback as an authorized redirect URI:

```text
https://YOUR_DALE_DOMAIN/auth/google/callback
```

For the DALE custom domain this will normally be:

```text
https://dale.africa/auth/google/callback
```

The URI must exactly match the domain that serves the login page. Add a separate exact callback
for a preview or staging domain only when that environment is intentionally used.

## Testing login

1. Deploy after setting the required variables and Google callback URI.
2. Open `/internal/` in a private browser window. It should redirect to `/login/`.
3. Choose **Continue with Google** and sign in as `awora@dale.africa`.
4. Confirm `/internal/`, `/research/`, and `/admin/blog/` load successfully.
5. Log out, then try an email not present in the allowlist. It must return to the login page.
6. While logged out, confirm `/`, `/blog/`, and a published blog article remain accessible.

Google authentication verifies the ID token signature, issuer, audience, expiry, nonce, verified
email, and Workspace hosted-domain claim before creating the existing signed session cookie.
