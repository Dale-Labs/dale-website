import assert from "node:assert/strict";
import test from "node:test";

import {
  ADAPTER_STATUS,
  SIGNAL_SOURCE,
  assembleSignalObjects,
  createD1RegistryAdapter,
  createGitHubBuildAdapter,
  createGoogleDriveKnowledgeAdapter,
} from "../functions/_lib/internal-signal/index.js";
import { createSeededD1 } from "./helpers/d1-test-db.mjs";

function githubFetch(commits, detailsBySha) {
  return async url => {
    const parsed = new URL(url);
    const match = parsed.pathname.match(/\/commits\/([^/]+)$/);
    const body = match ? detailsBySha[match[1]] : commits;
    return Response.json(body, { status: body ? 200 : 404 });
  };
}

test("external source placeholders make no live calls", async () => {
  const github = await createGitHubBuildAdapter().read();
  const drive = await createGoogleDriveKnowledgeAdapter().read();

  assert.equal(github.source, SIGNAL_SOURCE.BUILD);
  assert.equal(github.status, ADAPTER_STATUS.NOT_CONFIGURED);
  assert.deepEqual(github.records, []);

  assert.equal(drive.source, SIGNAL_SOURCE.KNOWLEDGE);
  assert.equal(drive.status, ADAPTER_STATUS.NOT_CONFIGURED);
  assert.deepEqual(drive.records, []);
});

test("GitHub adapter matches registered artifacts and reports unmatched commits", async () => {
  const commits = [
    {
      sha: "id-match",
      html_url: "https://github.com/Dale-Labs/dale-website/commit/id-match",
      commit: {
        message: "Update artifact-internal-signal status",
        author: { name: "DALE", date: "2026-06-10T08:00:00Z" },
      },
    },
    {
      sha: "path-match",
      html_url: "https://github.com/Dale-Labs/dale-website/commit/path-match",
      commit: {
        message: "Revise research reading copy",
        author: { name: "DALE", date: "2026-06-10T09:00:00Z" },
      },
    },
    {
      sha: "unmatched",
      html_url: "https://github.com/Dale-Labs/dale-website/commit/unmatched",
      commit: {
        message: "Adjust unrelated public asset",
        author: { name: "DALE", date: "2026-06-10T10:00:00Z" },
      },
    },
  ];
  const fetchImpl = githubFetch(commits, {
    "id-match": { files: [{ filename: "README.md" }] },
    "path-match": { files: [{ filename: "internal/docs/dale_research_doc.html" }] },
    unmatched: { files: [{ filename: "assets/site.css" }] },
  });
  const registry = [
    {
      artifactId: "artifact-internal-signal",
      metadata: { repository_path: "internal/signal/index.html" },
      internalRoute: "/internal/signal/",
      sourceUrl: "repo://internal/signal/index.html",
    },
    {
      artifactId: "artifact-dale-research-doc",
      metadata: { repository_path: "internal/docs/dale_research_doc.html" },
      internalRoute: "/internal/docs/dale_research_doc.html",
    },
  ];

  const result = await createGitHubBuildAdapter({
    token: "secret-token",
    owner: "Dale-Labs",
    repo: "dale-website",
    branch: "feature/internal-ia",
    registry,
    fetchImpl,
  }).read();

  assert.equal(result.status, ADAPTER_STATUS.READY);
  assert.equal(result.records.length, 2);
  assert.deepEqual(
    result.records.map(record => [record.artifactId, record.matchReason]),
    [
      ["artifact-internal-signal", "artifact_id"],
      ["artifact-dale-research-doc", "repository_path"],
    ],
  );
  assert.equal(result.unmatchedRecords.length, 1);
  assert.equal(result.unmatchedRecords[0].activityId, "unmatched");
  assert.match(result.warnings[0], /Unregistered GitHub activity/);
});

test("GitHub commits cannot create build records without registered D1 artifacts", async () => {
  const commits = [{
    sha: "unregistered",
    commit: {
      message: "Update artifact-unknown",
      author: { name: "DALE", date: "2026-06-10T08:00:00Z" },
    },
  }];
  const result = await createGitHubBuildAdapter({
    token: "secret-token",
    owner: "Dale-Labs",
    repo: "dale-website",
    branch: "main",
    registry: [],
    fetchImpl: githubFetch(commits, {
      unregistered: { files: [{ filename: "internal/unknown/index.html" }] },
    }),
  }).read();

  assert.equal(result.status, ADAPTER_STATUS.READY);
  assert.deepEqual(result.records, []);
  assert.equal(result.unmatchedRecords.length, 1);
});

test("D1 adapter is inert until a registry binding is provided", async () => {
  const result = await createD1RegistryAdapter().read();

  assert.equal(result.source, SIGNAL_SOURCE.REGISTRY);
  assert.equal(result.status, ADAPTER_STATUS.NOT_CONFIGURED);
  assert.deepEqual(result.records, []);
});

test("D1 registry adapter reads the current migration and seed records", async () => {
  const result = await createD1RegistryAdapter({ db: createSeededD1() }).read();

  assert.equal(result.status, ADAPTER_STATUS.READY);
  assert.equal(result.records.length, 7);

  const signal = result.records.find(record => record.artifactId === "artifact-internal-signal");
  assert.equal(signal.title, "Internal Signal");
  assert.equal(signal.internalRoute, "/internal/signal/");
  assert.equal(signal.sourceProvider, "repository");
  assert.deepEqual(signal.environments, []);

  const tools = result.records.find(record => record.artifactId === "artifact-dale-tools-canons-v1");
  assert.deepEqual(
    tools.environments.map(environment => environment.name).sort(),
    ["AMMi / APE", "Foundation", "SVE"],
  );
});

test("Signal Objects use D1 identity and enrich it with Drive and GitHub records", () => {
  const objects = assembleSignalObjects({
    registry: [{
      artifactId: "artifact-internal-signal",
      title: "Internal Signal",
      artifactType: "application",
      canonTool: "Internal Signal",
      state: "in_progress",
      reviewStatus: "in_review",
      evidenceStatus: "pending",
      owner: "DALE Systems Lab",
      version: "0.1.0",
      internalRoute: "/internal/signal/",
      lastUpdated: "2026-06-09T09:00:00Z",
      environments: [],
    }],
    buildActivity: [{
      artifactId: "artifact-internal-signal",
      activityId: "abc123",
      occurredAt: "2026-06-09T11:00:00Z",
      summary: "Added adapter boundaries",
    }],
    knowledge: [{
      artifactId: "artifact-internal-signal",
      driveFileId: "drive-file",
      modifiedAt: "2026-06-09T10:00:00Z",
      name: "Internal Signal notes",
    }],
  });

  assert.equal(objects.length, 1);
  assert.equal(objects[0].id, "artifact-internal-signal");
  assert.equal(objects[0].state, "in_progress");
  assert.equal(objects[0].lastChange, "2026-06-09T11:00:00Z");
  assert.equal(objects[0].buildActivity.length, 1);
  assert.equal(objects[0].knowledge.length, 1);
  assert.deepEqual(objects[0].provenance, {
    registry: SIGNAL_SOURCE.REGISTRY,
    build: SIGNAL_SOURCE.BUILD,
    knowledge: SIGNAL_SOURCE.KNOWLEDGE,
  });
});

test("unregistered source observations do not create implicit Signal Objects", () => {
  const objects = assembleSignalObjects({
    registry: [],
    buildActivity: [{
      artifactId: "unknown-artifact",
      occurredAt: "2026-06-09T11:00:00Z",
    }],
    knowledge: [{
      artifactId: "unknown-artifact",
      modifiedAt: "2026-06-09T10:00:00Z",
    }],
  });

  assert.deepEqual(objects, []);
});
