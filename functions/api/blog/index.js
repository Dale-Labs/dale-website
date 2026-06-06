import { ensureArticleStore, listArticles, loadStructuralAmnesia } from "../../_lib/articles.js";

export async function onRequestGet({ request, env }) {
  try {
    await ensureArticleStore(env, request);
    const articles = await listArticles(env, { publishedOnly: true });
    return Response.json(articles.map(({ bodyContent, references, ...article }) => article), {
      headers: { "Cache-Control": "public, max-age=60" },
    });
  } catch (error) {
    if (error.message.includes("DALE_BLOG_DB")) {
      const article = await loadStructuralAmnesia(env, request);
      if (article) {
        const { bodyContent, references, ...summary } = article;
        return Response.json([summary], { headers: { "Cache-Control": "public, max-age=60" } });
      }
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
}
