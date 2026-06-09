-- DALE artifact registry
-- Cloudflare D1 uses SQLite semantics. This registry stores metadata and
-- pointers only; large/source file contents remain in Google Drive or the repo.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS validation_environments (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artifact_registry (
  id TEXT PRIMARY KEY,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  artifact_type TEXT NOT NULL CHECK (
    artifact_type IN (
      'application',
      'build_artifact',
      'canon_source',
      'document',
      'evidence',
      'image',
      'research_document',
      'schema',
      'specification',
      'spreadsheet',
      'toolkit'
    )
  ),
  canon_tool TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL CHECK (
    status IN ('active', 'archived', 'draft', 'in_progress', 'incomplete')
  ),
  source_provider TEXT NOT NULL CHECK (
    source_provider IN ('external', 'generated', 'google_drive', 'repository')
  ),
  source_url TEXT NOT NULL,
  internal_route TEXT NOT NULL,
  evidence_status TEXT NOT NULL CHECK (
    evidence_status IN ('available', 'none', 'not_applicable', 'partial', 'pending')
  ),
  last_updated TEXT NOT NULL,
  owner TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT '',
  review_status TEXT NOT NULL CHECK (
    review_status IN ('approved', 'changes_requested', 'in_review', 'unreviewed')
  ),
  mime_type TEXT NOT NULL DEFAULT '',
  notes TEXT NOT NULL DEFAULT '',
  metadata_json TEXT NOT NULL DEFAULT '{}'
    CHECK (json_valid(metadata_json)),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  registry_updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS artifact_environments (
  artifact_id TEXT NOT NULL,
  environment_id TEXT NOT NULL,
  relationship TEXT NOT NULL DEFAULT 'applies_to' CHECK (
    relationship IN ('applies_to', 'produces_evidence', 'validated_in')
  ),
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (artifact_id, environment_id, relationship),
  FOREIGN KEY (artifact_id) REFERENCES artifact_registry(id) ON DELETE CASCADE,
  FOREIGN KEY (environment_id) REFERENCES validation_environments(id)
    ON DELETE RESTRICT
);

CREATE INDEX IF NOT EXISTS idx_artifact_registry_type_status
  ON artifact_registry(artifact_type, status);

CREATE INDEX IF NOT EXISTS idx_artifact_registry_canon_tool
  ON artifact_registry(canon_tool);

CREATE INDEX IF NOT EXISTS idx_artifact_registry_review
  ON artifact_registry(review_status, last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_artifact_registry_evidence
  ON artifact_registry(evidence_status, last_updated DESC);

CREATE INDEX IF NOT EXISTS idx_artifact_environments_environment
  ON artifact_environments(environment_id, artifact_id);

