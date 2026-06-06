const SCHEMA = `
  CREATE TABLE IF NOT EXISTS articles (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT NOT NULL DEFAULT '',
    slug TEXT NOT NULL UNIQUE,
    author TEXT NOT NULL DEFAULT 'DALE Systems Lab',
    article_date TEXT NOT NULL,
    category TEXT NOT NULL DEFAULT '',
    tags TEXT NOT NULL DEFAULT '[]',
    excerpt TEXT NOT NULL DEFAULT '',
    cover_image TEXT NOT NULL DEFAULT '',
    body_content TEXT NOT NULL DEFAULT '',
    reference_items TEXT NOT NULL DEFAULT '[]',
    status TEXT NOT NULL DEFAULT 'draft' CHECK(status IN ('draft', 'published')),
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    published_at TEXT
  );
  CREATE INDEX IF NOT EXISTS idx_articles_status_date
    ON articles(status, article_date DESC);
`;

const ALLOWED_TAGS = new Set([
  "p", "br", "h2", "h3", "h4", "strong", "b", "em", "i", "a",
  "blockquote", "ol", "ul", "li", "div", "span", "sup",
]);

function database(env) {
  if (!env.DALE_BLOG_DB) {
    throw new Error("DALE_BLOG_DB is not configured. Add a Cloudflare D1 binding with this name.");
  }
  return env.DALE_BLOG_DB;
}

function decodeEntities(value) {
  return value
    .replaceAll("&nbsp;", " ")
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&#39;", "'");
}

export function textFromHtml(value = "") {
  return decodeEntities(String(value).replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim());
}

export function slugify(value = "") {
  return String(value)
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

function cleanAttributes(tag, attributes) {
  const classMatch = attributes.match(/\bclass\s*=\s*["']([^"']*)["']/i);
  const hrefMatch = attributes.match(/\bhref\s*=\s*["']([^"']*)["']/i);
  const allowedClasses = ["pull-quote", "chain", "section-break", "term"]
    .filter((name) => classMatch?.[1].split(/\s+/).includes(name));
  let output = allowedClasses.length ? ` class="${allowedClasses.join(" ")}"` : "";

  if (tag === "a" && hrefMatch) {
    const href = hrefMatch[1].trim();
    if (/^(https?:|mailto:|\/|#)/i.test(href)) {
      output += ` href="${href.replaceAll('"', "&quot;")}"`;
      if (/^https?:/i.test(href)) output += ' target="_blank" rel="noopener noreferrer"';
    }
  }
  return output;
}

export function sanitizeArticleHtml(value = "") {
  return String(value)
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button)[^>]*>[\s\S]*?<\/\1>/gi, "")
    .replace(/<(script|style|iframe|object|embed|form|input|button)[^>]*\/?>/gi, "")
    .replace(/<\/?([a-z0-9]+)([^>]*)>/gi, (match, rawTag, attributes) => {
      const tag = rawTag.toLowerCase();
      if (!ALLOWED_TAGS.has(tag)) return "";
      if (match.startsWith("</")) return `</${tag}>`;
      return `<${tag}${cleanAttributes(tag, attributes)}>`;
    })
    .trim();
}

function normalizeReferences(value) {
  const items = Array.isArray(value) ? value : [];
  return items
    .map((item) => sanitizeArticleHtml(String(item)))
    .filter((item) => textFromHtml(item));
}

export function normalizeArticle(input, existing = {}) {
  const now = new Date().toISOString();
  const title = String(input.title || existing.title || "").trim();
  const requestedStatus = input.status || existing.status || "draft";
  const status = requestedStatus === "published" ? "published" : "draft";
  const tags = Array.isArray(input.tags)
    ? input.tags
    : String(input.tags || "").split(",");

  if (!title) throw new Error("Title is required.");

  return {
    id: existing.id || crypto.randomUUID(),
    title,
    subtitle: String(input.subtitle ?? existing.subtitle ?? "").trim(),
    slug: slugify(input.slug || existing.slug || title),
    author: String(input.author ?? existing.author ?? "DALE Systems Lab").trim(),
    date: String(input.date || existing.date || now.slice(0, 10)),
    category: String(input.category ?? existing.category ?? "").trim(),
    tags: tags.map((tag) => String(tag).trim()).filter(Boolean),
    excerpt: String(input.excerpt ?? existing.excerpt ?? "").trim(),
    coverImage: String(input.coverImage ?? existing.coverImage ?? "").trim(),
    bodyContent: sanitizeArticleHtml(input.bodyContent ?? existing.bodyContent ?? ""),
    references: normalizeReferences(input.references ?? existing.references ?? []),
    status,
    createdAt: existing.createdAt || now,
    updatedAt: now,
    publishedAt: status === "published"
      ? (existing.publishedAt || now)
      : null,
  };
}

function rowToArticle(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    slug: row.slug,
    author: row.author,
    date: row.article_date,
    category: row.category,
    tags: JSON.parse(row.tags || "[]"),
    excerpt: row.excerpt,
    coverImage: row.cover_image,
    bodyContent: row.body_content,
    references: JSON.parse(row.reference_items || "[]"),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    publishedAt: row.published_at,
  };
}

export async function loadStructuralAmnesia(env, request) {
  if (!env.ASSETS) return null;
  const sourceUrl = new URL("/assets/content/structural-amnesia-dale-article.html", request.url);
  const response = await env.ASSETS.fetch(new Request(sourceUrl));
  if (!response.ok) return null;
  const html = await response.text();
  const main = html.match(/<main class="article-container">([\s\S]*?)<\/main>/i)?.[1] || "";
  const subtitle = textFromHtml(main.match(/<p class="subtitle">([\s\S]*?)<\/p>/i)?.[1] || "");
  const referencesBlock = main.match(/<div class="references">[\s\S]*?<ol>([\s\S]*?)<\/ol>[\s\S]*?<\/div>/i)?.[1] || "";
  const references = [...referencesBlock.matchAll(/<li>([\s\S]*?)<\/li>/gi)].map((match) => match[1].trim());
  let body = main
    .replace(/^[\s\S]*?<div class="byline">[\s\S]*?<\/div>/i, "")
    .replace(/<section class="share-section"[\s\S]*?<\/section>/gi, "")
    .replace(/<div class="references">[\s\S]*$/i, "")
    .trim();

  return normalizeArticle({
    title: "Structural Amnesia: How Forgetting Was Built In",
    subtitle,
    slug: "structural-amnesia",
    author: "DALE Systems Lab",
    date: "2026-06-01",
    category: "Market Memory Series",
    tags: ["market memory", "provenance", "systems thinking"],
    excerpt: "A systems inquiry into what global markets remember, what communities know, and how economic memory becomes visible, portable, or lost.",
    bodyContent: body,
    references,
    status: "published",
  });
}

async function seedStructuralAmnesia(env, request) {
  const db = database(env);
  const exists = await db.prepare("SELECT id FROM articles WHERE slug = ?").bind("structural-amnesia").first();
  if (exists) return;
  const article = await loadStructuralAmnesia(env, request);
  if (!article) return;
  await saveArticle(env, article);
}

export async function ensureArticleStore(env, request) {
  const db = database(env);
  await db.exec(SCHEMA);
  await seedStructuralAmnesia(env, request);
}

export async function listArticles(env, { publishedOnly = false } = {}) {
  const db = database(env);
  const query = publishedOnly
    ? "SELECT * FROM articles WHERE status = 'published' ORDER BY article_date DESC, created_at DESC"
    : "SELECT * FROM articles ORDER BY updated_at DESC";
  const result = await db.prepare(query).all();
  return (result.results || []).map(rowToArticle);
}

export async function getArticleById(env, id) {
  return rowToArticle(await database(env).prepare("SELECT * FROM articles WHERE id = ?").bind(id).first());
}

export async function getArticleBySlug(env, slug, { includeDraft = false } = {}) {
  const query = includeDraft
    ? "SELECT * FROM articles WHERE slug = ?"
    : "SELECT * FROM articles WHERE slug = ? AND status = 'published'";
  return rowToArticle(await database(env).prepare(query).bind(slug).first());
}

export async function saveArticle(env, article) {
  await database(env).prepare(`
    INSERT INTO articles (
      id, title, subtitle, slug, author, article_date, category, tags, excerpt,
      cover_image, body_content, reference_items, status, created_at, updated_at, published_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(id) DO UPDATE SET
      title = excluded.title,
      subtitle = excluded.subtitle,
      slug = excluded.slug,
      author = excluded.author,
      article_date = excluded.article_date,
      category = excluded.category,
      tags = excluded.tags,
      excerpt = excluded.excerpt,
      cover_image = excluded.cover_image,
      body_content = excluded.body_content,
      reference_items = excluded.reference_items,
      status = excluded.status,
      updated_at = excluded.updated_at,
      published_at = excluded.published_at
  `).bind(
    article.id, article.title, article.subtitle, article.slug, article.author,
    article.date, article.category, JSON.stringify(article.tags), article.excerpt,
    article.coverImage, article.bodyContent, JSON.stringify(article.references),
    article.status, article.createdAt, article.updatedAt, article.publishedAt,
  ).run();
  return article;
}

export async function deleteArticle(env, id) {
  return database(env).prepare("DELETE FROM articles WHERE id = ?").bind(id).run();
}
