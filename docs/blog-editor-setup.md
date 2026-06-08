# DALE Blog Editor Setup

The blog editor uses the site's existing signed-cookie login and a Cloudflare D1 database.

## One-time Cloudflare setup

1. In the Cloudflare dashboard, open **Workers & Pages** and select the DALE website project.
2. Open **Settings > Bindings**.
3. Add a **D1 database binding** named `DALE_BLOG_DB`.
4. Create or select a database such as `dale-blog`.
5. Redeploy the site.

The application creates the `articles` table and indexes automatically on first use. It also
imports Structural Amnesia from the preserved canonical source into the database if that slug
does not already exist.

## Editor access

The existing environment variables continue to control login:

- `DALE_AUTH_SESSION_SECRET`
- `DALE_AUTH_ALLOWED_EMAILS`
- `DALE_AUTH_ROLES_JSON`
- `DALE_GOOGLE_CLIENT_ID`
- `DALE_GOOGLE_CLIENT_SECRET`

`DALE_AUTH_PASSWORD_SHA256` is optional and only enables the shared-password fallback.

Users with the `admin` or `team` role can open `/admin/blog/`. Other roles remain restricted.

## Routes

- `/admin/blog/` - article dashboard and editor
- `/admin/blog/preview/[id]` - protected draft preview
- `/blog/` - published article listing
- `/blog/[slug]` - public article route

## Storage model

Articles are stored as structured D1 rows with metadata, sanitized rich HTML, references,
publishing status, and timestamps. This keeps the content model portable to PostgreSQL,
Supabase, Directus, Sanity, or another CMS later.
