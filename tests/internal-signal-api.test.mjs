import assert from "node:assert/strict";
import fs from "node:fs";
import test from "node:test";

import {
  authorizeEmail,
  createSessionCookie,
} from "../functions/_lib/auth.js";
import { onRequest as protectInternalApi } from "../functions/api/internal/_middleware.js";
import { onRequestGet as getInternalSignal } from "../functions/api/internal/signal.js";
import { createSeededD1 } from "./helpers/d1-test-db.mjs";

const authEnv = {
  DALE_AUTH_SESSION_SECRET: "test-session-secret",
};

function githubFetch(commits, detailsBySha) {
  return async url => {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/commits\/([^/]+)$/);
    const body = match ? detailsBySha[match[1]] : commits;
    return Response.json(body, { status: body ? 200 : 404 });
  };
}

test("Internal Signal API rejects unauthenticated requests", async () => {
  const response = await protectInternalApi({
    request: new Request("https://dale.africa/api/internal/signal"),
    env: authEnv,
    next: () => getInternalSignal({ env: authEnv }),
  });

  assert.equal(response.status, 401);
  assert.deepEqual(await response.json(), { error: "Authentication required." });
});

test("Internal Signal API returns assembled D1 Signal Objects to an authenticated admin", async () => {
  const env = {
    ...authEnv,
    DALE_ARTIFACT_DB: createSeededD1(),
  };
  const user = authorizeEmail("awora@dale.africa", env);
  const cookie = await createSessionCookie(user, env);
  const response = await protectInternalApi({
    request: new Request("https://dale.africa/api/internal/signal", {
      headers: { Cookie: cookie.split(";")[0] },
    }),
    env,
    next: () => getInternalSignal({ env }),
  });
  const body = await response.json();

  assert.equal(response.status, 200);
  assert.equal(response.headers.get("Cache-Control"), "private, no-store");
  assert.equal(body.ready, true);
  assert.equal(body.signalObjects.length, 7);
  assert.equal(body.adapters.registry.status, "ready");
  assert.equal(body.adapters.build.status, "not_configured");
  assert.equal(body.adapters.knowledge.status, "not_configured");

  const signal = body.signalObjects.find(object => object.id === "artifact-internal-signal");
  assert.equal(signal.internalRoute, "/internal/signal/");
  assert.equal(signal.reviewStatus, "in_review");
  assert.equal(signal.provenance.registry, "d1_registry");
  assert.equal(signal.provenance.build, null);
  assert.equal(signal.provenance.knowledge, null);
});

test("Internal Signal reports unavailable live data when D1 is not configured", async () => {
  const response = await getInternalSignal({ env: authEnv });
  const body = await response.json();

  assert.equal(response.status, 503);
  assert.equal(body.ready, false);
  assert.deepEqual(body.signalObjects, []);
  assert.equal(body.adapters.registry.status, "not_configured");
  assert.equal(body.adapters.build.status, "not_configured");
  assert.equal(body.adapters.knowledge.status, "not_configured");
});

test("Internal Signal API reports matched and unmatched GitHub build activity", async () => {
  const token = "github-token-must-not-leak";
  const commits = [
    {
      sha: "matched-sha",
      html_url: "https://github.com/Dale-Labs/dale-website/commit/matched-sha",
      commit: {
        message: "Update artifact-internal-signal",
        author: { name: "DALE", date: "2026-06-10T08:00:00Z" },
      },
    },
    {
      sha: "unmatched-sha",
      html_url: "https://github.com/Dale-Labs/dale-website/commit/unmatched-sha",
      commit: {
        message: "Update unrelated asset",
        author: { name: "DALE", date: "2026-06-10T09:00:00Z" },
      },
    },
  ];
  const env = {
    ...authEnv,
    DALE_ARTIFACT_DB: createSeededD1(),
    DALE_GITHUB_TOKEN: token,
    DALE_GITHUB_OWNER: "Dale-Labs",
    DALE_GITHUB_REPO: "dale-website",
    DALE_GITHUB_BRANCH: "feature/internal-ia",
    DALE_GITHUB_FETCH: githubFetch(commits, {
      "matched-sha": { files: [{ filename: "internal/signal/index.html" }] },
      "unmatched-sha": { files: [{ filename: "assets/site.css" }] },
    }),
  };

  const response = await getInternalSignal({ env });
  const body = await response.json();
  const signal = body.signalObjects.find(object => object.id === "artifact-internal-signal");

  assert.equal(response.status, 200);
  assert.equal(body.adapters.build.source, "github_build");
  assert.equal(body.adapters.build.status, "ready");
  assert.equal(body.adapters.build.recordCount, 1);
  assert.equal(body.adapters.build.unmatchedCount, 1);
  assert.equal(body.adapters.build.observations[0].activityId, "unmatched-sha");
  assert.match(body.adapters.build.warnings[0], /Unregistered GitHub activity/);
  assert.equal(signal.buildActivity.length, 1);
  assert.equal(signal.buildActivity[0].activityId, "matched-sha");
  assert.equal(JSON.stringify(body).includes(token), false);
});

test("Internal Signal frontend retains static seed data when its API request fails", () => {
  const html = fs.readFileSync(
    new URL("../internal/signal/index.html", import.meta.url),
    "utf8",
  );

  assert.match(html, /const SIGNAL_OBJECTS = \[/);
  assert.match(html, /fetch\("\/api\/internal\/signal"/);
  assert.match(html, /console\.warn\("Internal Signal is using static seed data\."/);
  assert.match(html, /id="signalDataStatus">FALLBACK DATA</);
  assert.match(html, /recordCount > 0 \? "LIVE REGISTRY" : "EMPTY REGISTRY"/);
  assert.match(html, /setSignalDataStatus\("API ERROR"\)/);
  assert.match(html, /renderAll\(\);\s*loadLiveSignal\(\);/);
});
