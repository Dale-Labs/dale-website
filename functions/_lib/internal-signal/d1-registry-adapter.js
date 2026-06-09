import {
  SIGNAL_SOURCE,
  adapterResult,
  notConfiguredResult,
} from "./contracts.js";

const REGISTRY_QUERY = `
  SELECT
    artifact.id,
    artifact.slug,
    artifact.title,
    artifact.artifact_type,
    artifact.canon_tool,
    artifact.status,
    artifact.source_provider,
    artifact.source_url,
    artifact.internal_route,
    artifact.evidence_status,
    artifact.last_updated,
    artifact.owner,
    artifact.version,
    artifact.review_status,
    artifact.mime_type,
    artifact.notes,
    artifact.metadata_json,
    COALESCE(
      json_group_array(
        CASE
          WHEN environment.id IS NULL THEN NULL
          ELSE json_object(
            'id', environment.id,
            'name', environment.name,
            'relationship', link.relationship
          )
        END
      ),
      '[]'
    ) AS environments_json
  FROM artifact_registry AS artifact
  LEFT JOIN artifact_environments AS link
    ON link.artifact_id = artifact.id
  LEFT JOIN validation_environments AS environment
    ON environment.id = link.environment_id
  GROUP BY artifact.id
  ORDER BY artifact.last_updated DESC, artifact.id
`;

function parseJson(value, fallback) {
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function registryRecord(row) {
  return {
    artifactId: row.id,
    slug: row.slug,
    title: row.title,
    artifactType: row.artifact_type,
    canonTool: row.canon_tool,
    state: row.status,
    sourceProvider: row.source_provider,
    sourceUrl: row.source_url,
    internalRoute: row.internal_route,
    evidenceStatus: row.evidence_status,
    lastUpdated: row.last_updated,
    owner: row.owner,
    version: row.version,
    reviewStatus: row.review_status,
    mimeType: row.mime_type,
    notes: row.notes,
    metadata: parseJson(row.metadata_json, {}),
    environments: parseJson(row.environments_json, []).filter(Boolean),
  };
}

export function createD1RegistryAdapter({ db } = {}) {
  return {
    source: SIGNAL_SOURCE.REGISTRY,

    async read() {
      if (!db) {
        return notConfiguredResult(
          SIGNAL_SOURCE.REGISTRY,
          "Internal Signal D1 registry binding is not configured.",
        );
      }

      const result = await db.prepare(REGISTRY_QUERY).all();
      return adapterResult(SIGNAL_SOURCE.REGISTRY, {
        records: (result.results || []).map(registryRecord),
      });
    },
  };
}

