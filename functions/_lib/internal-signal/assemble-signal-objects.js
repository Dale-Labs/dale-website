import { SIGNAL_SOURCE } from "./contracts.js";

function groupByArtifactId(records = []) {
  const grouped = new Map();
  for (const record of records) {
    if (!record?.artifactId) continue;
    const current = grouped.get(record.artifactId) || [];
    current.push(record);
    grouped.set(record.artifactId, current);
  }
  return grouped;
}

function latestTimestamp(values) {
  return values
    .filter(Boolean)
    .sort((left, right) => Date.parse(right) - Date.parse(left))[0] || null;
}

export function assembleSignalObjects({
  registry = [],
  buildActivity = [],
  knowledge = [],
} = {}) {
  const buildByArtifact = groupByArtifactId(buildActivity);
  const knowledgeByArtifact = groupByArtifactId(knowledge);

  return registry.map((artifact) => {
    const buildRecords = buildByArtifact.get(artifact.artifactId) || [];
    const knowledgeRecords = knowledgeByArtifact.get(artifact.artifactId) || [];

    return {
      id: artifact.artifactId,
      name: artifact.title,
      artifactType: artifact.artifactType,
      canonTool: artifact.canonTool,
      state: artifact.state,
      status: artifact.reviewStatus,
      reviewStatus: artifact.reviewStatus,
      evidence: artifact.evidenceStatus,
      owner: artifact.owner,
      version: artifact.version,
      internalRoute: artifact.internalRoute,
      sourceProvider: artifact.sourceProvider,
      sourceUrl: artifact.sourceUrl,
      mimeType: artifact.mimeType,
      notes: artifact.notes,
      metadata: artifact.metadata || {},
      environments: artifact.environments || [],
      lastChange: latestTimestamp([
        artifact.lastUpdated,
        ...buildRecords.map((record) => record.occurredAt),
        ...knowledgeRecords.map((record) => record.modifiedAt),
      ]),
      knowledge: knowledgeRecords,
      buildActivity: buildRecords,
      provenance: {
        registry: SIGNAL_SOURCE.REGISTRY,
        build: buildRecords.length ? SIGNAL_SOURCE.BUILD : null,
        knowledge: knowledgeRecords.length ? SIGNAL_SOURCE.KNOWLEDGE : null,
      },
    };
  });
}
