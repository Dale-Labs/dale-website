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

test("D1 adapter is inert until a registry binding is provided", async () => {
  const result = await createD1RegistryAdapter().read();

  assert.equal(result.source, SIGNAL_SOURCE.REGISTRY);
  assert.equal(result.status, ADAPTER_STATUS.NOT_CONFIGURED);
  assert.deepEqual(result.records, []);
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

