import {
  deleteArticle,
  ensureArticleStore,
  getArticleById,
  normalizeArticle,
  saveArticle,
} from "../../../_lib/articles.js";

export async function onRequestGet({ request, env, params }) {
  try {
    await ensureArticleStore(env, request);
    const article = await getArticleById(env, params.id);
    return article
      ? Response.json(article)
      : Response.json({ error: "Article not found." }, { status: 404 });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}

export async function onRequestPut({ request, env, params }) {
  try {
    await ensureArticleStore(env, request);
    const existing = await getArticleById(env, params.id);
    if (!existing) return Response.json({ error: "Article not found." }, { status: 404 });
    const article = normalizeArticle(await request.json(), existing);
    await saveArticle(env, article);
    return Response.json(article);
  } catch (error) {
    const status = /UNIQUE constraint failed.*slug/i.test(error.message) ? 409 : 400;
    return Response.json({ error: error.message }, { status });
  }
}

export async function onRequestDelete({ request, env, params }) {
  try {
    await ensureArticleStore(env, request);
    const existing = await getArticleById(env, params.id);
    if (!existing) return Response.json({ error: "Article not found." }, { status: 404 });
    await deleteArticle(env, params.id);
    return Response.json({ ok: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
}
