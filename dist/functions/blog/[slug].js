import { ensureArticleStore, getArticleBySlug, loadStructuralAmnesia } from "../_lib/articles.js";
import { renderArticle } from "../_lib/article-renderer.js";

export async function onRequestGet({ request, env, params }) {
  try {
    await ensureArticleStore(env, request);
    const article = await getArticleBySlug(env, params.slug);
    if (!article) return new Response("Article not found.", { status: 404 });
    return new Response(renderArticle(article), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch (error) {
    if (error.message.includes("DALE_BLOG_DB") && params.slug === "structural-amnesia") {
      const article = await loadStructuralAmnesia(env, request);
      if (article) {
        return new Response(renderArticle(article), {
          headers: {
            "Content-Type": "text/html; charset=utf-8",
            "Cache-Control": "public, max-age=60",
          },
        });
      }
    }
    return new Response(error.message, { status: 500 });
  }
}
