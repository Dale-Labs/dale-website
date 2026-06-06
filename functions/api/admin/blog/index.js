import {
  ensureArticleStore,
  listArticles,
  normalizeArticle,
  saveArticle,
} from "../../../_lib/articles.js";

export async function onRequestGet({ request, env }) {
  try {
    await ensureArticleStore(env, request);
    return Response.json(await listArticles(env));
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function onRequestPost({ request, env }) {
  try {
    await ensureArticleStore(env, request);
    const article = normalizeArticle(await request.json());
    await saveArticle(env, article);
    return Response.json(article, { status: 201 });
  } catch (error) {
    const status = /UNIQUE constraint failed.*slug/i.test(error.message) ? 409 : 400;
    return Response.json({ error: error.message }, { status });
  }
}
