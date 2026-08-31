import { getSession } from "../../../_lib/auth.js";
import { ensureArticleStore, getArticleById } from "../../../_lib/articles.js";
import { renderArticle } from "../../../_lib/article-renderer.js";

export async function onRequestGet({ request, env, params }) {
  const user = await getSession(request, env);
  if (!user) return new Response("Authentication required.", { status: 401 });
  try {
    await ensureArticleStore(env, request);
    const article = await getArticleById(env, params.id);
    if (!article) return new Response("Article not found.", { status: 404 });
    return new Response(renderArticle(article, { preview: true }), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    });
  } catch (error) {
    return new Response(error.message, { status: 500 });
  }
}
