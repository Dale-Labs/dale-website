# DALE Internal Auth Setup

DALE internal access is enforced through Cloudflare Pages Functions.

Required environment variables:

- `DALE_AUTH_ALLOWED_EMAILS`: comma-separated list of approved login emails.
- `DALE_AUTH_PASSWORD_SHA256`: SHA-256 hex digest of the shared internal password.
- `DALE_AUTH_SESSION_SECRET`: long random string used to sign session cookies.

Optional environment variable:

- `DALE_AUTH_ROLES_JSON`: JSON map of email addresses to roles.

Prepared roles:

- `admin`: full access.
- `team`: docs, canons, tools, developer resources, and validation.
- `validation_partner`: docs, canons, tools, and validation.
- `viewer`: documentation only.

No production password should be stored in frontend HTML or client-side JavaScript.
