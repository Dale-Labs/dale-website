# Internal Build Signal: Live Data Architecture

## Decision

Internal Signal is a read model across three authoritative sources. It does not become a fourth
source of truth, and no single source is expected to contain the whole Signal Object.

```text
Google Drive / Workspace       GitHub                    Cloudflare D1
Source of Knowledge            Source of Build Activity  Source of Registry State
          \                         |                         /
           \                        |                        /
            +------------ source adapters ----------------+
                                  |
                         Signal Object assembler
                                  |
                    Current / Evidence / Gaps / Movement
                                  |
                         Internal Build Signal
```

The current frontend at `/internal/signal/` continues to render static seed arrays. The adapter
files establish future boundaries only; they are not connected to the page and make no external
API calls.

## Source ownership

### Google Drive / Workspace: Source of Knowledge

Drive owns the substantial human and source materials:

- research documents and publications
- human-readable canons and source documents
- evidence packs and validation notes
- audit materials
- spreadsheets, images, and collaborative working files
- Drive-native revision and collaboration history

The Drive adapter will return knowledge references and selected metadata, not copy entire files
into D1. Expected normalized fields include:

- `artifactId`: stable D1 registry ID used for the join
- `driveFileId`
- `name`
- `mimeType`
- `webViewUrl`
- `modifiedAt`
- `revisionId` or equivalent revision marker
- `knowledgeType`
- `owners`

Drive content should be read only when a workflow genuinely needs it. The ordinary Signal page
should work from metadata and summaries rather than downloading large documents on every request.

### GitHub: Source of Build Activity

GitHub owns evidence of implementation movement:

- commits and changed paths
- developer `status.md` files
- changelogs and deployment notes
- code and schema changes
- implementation updates
- release, branch, and deployment references

The GitHub adapter will normalize activity records such as:

- `artifactId`: stable D1 registry ID
- `activityId`: commit SHA or stable repository event ID
- `activityType`
- `summary`
- `occurredAt`
- `author`
- `repository`
- `ref`
- `url`
- `changedPaths`
- `deploymentEnvironment`

GitHub determines what changed in the build. It does not determine the artifact's canonical
identity, review state, or validation-environment relationships.

### Cloudflare D1: Source of Registry State

D1 owns stable identity and coordination metadata:

- artifact ID, slug, title, and type
- canon or tool association
- current registry state and review status
- source provider and source pointer
- authenticated internal route
- evidence availability state
- owner and version
- fixed H2 environment relationships
- timestamps used to coordinate registry updates
- small metadata required to join registry rows to Drive and GitHub

D1 is the join spine. The stable `artifact_registry.id` is the preferred key carried by all
adapter records.

## What D1 must not store

D1 must not become a knowledge or build-content mirror. Do not store:

- document bodies or publication text
- workbook contents
- images, PDFs, DOCX files, or evidence-pack binaries
- full Drive revision histories
- full Git diffs, repository snapshots, or commit payloads
- secrets, OAuth tokens, Drive credentials, or GitHub credentials
- large API responses cached as opaque JSON

Small structured metadata in `metadata_json` is acceptable when it supports identity and joins,
for example `drive_file_id`, repository name, or canonical path. It is not an overflow document
column.

## Current registry review

The migration in `d1/migrations/0001_artifact_registry.sql` correctly establishes:

- stable artifact identity and constrained state fields
- source pointers without file bodies
- fixed validation environments
- many-to-many artifact/environment links
- D1/SQLite-compatible indexes and JSON validation

The initial schema does not yet model every future relationship named by the architecture:

- general artifact-to-artifact relationships
- multiple evidence links per artifact
- first-class Drive and GitHub source references
- synchronization cursors or adapter run history

Those are candidates for a later migration after ingestion workflows are designed. Until then,
small external identifiers can live in `metadata_json`, while `source_url` remains the primary
source pointer. The existing schema should not be stretched into storing source content.

The seed in `d1/seeds/artifact_registry_seed.sql` is suitable as bootstrap registry state. Its
`gdrive://pending/...` values explicitly represent unresolved Drive references, not working URLs.

## Adapter boundary

Placeholder modules live under `functions/_lib/internal-signal/`:

- `d1-registry-adapter.js`
- `github-build-adapter.js`
- `google-drive-knowledge-adapter.js`
- `assemble-signal-objects.js`
- `contracts.js`

Every adapter returns the same envelope:

```js
{
  source: "d1_registry | github_build | google_drive_knowledge",
  status: "ready | not_configured | unavailable",
  observedAt: "ISO-8601 timestamp",
  records: [],
  warnings: []
}
```

The D1 adapter contains a read-only query and can receive a D1 binding later. The GitHub and Drive
adapters deliberately return `not_configured`; they contain no network code, credentials, or API
assumptions.

Adapters should remain independently callable. One unavailable source must not erase the data
returned by the other sources.

## Signal Object assembly

Assembly starts with D1 registry rows. This is important: GitHub commits and Drive files that have
not been associated with a stable artifact ID remain unlinked observations, not implicit new
artifacts.

For each registry artifact:

1. Read canonical identity, state, owner, version, routes, evidence state, and environments from
   D1.
2. Join Drive knowledge references using `artifactId`.
3. Join GitHub activity using `artifactId`.
4. Compute the latest observed change from registry, Drive, and GitHub timestamps.
5. retain source provenance so the UI can show where each claim came from.
6. Derive display readings only after the source records have been assembled.

A normalized Signal Object has this shape:

```js
{
  id,
  name,
  artifactType,
  canonTool,
  state,
  status,
  evidence,
  owner,
  version,
  internalRoute,
  environments,
  lastChange,
  knowledge: [],
  buildActivity: [],
  provenance: {
    registry: "d1_registry",
    build: "github_build | null",
    knowledge: "google_drive_knowledge | null"
  }
}
```

### Field precedence

- Identity, state, owner, version, review status, environment links, and internal route: **D1**
- Document names, source revisions, knowledge type, and Drive viewing links: **Drive**
- Commit, deployment, changelog, code-change, and implementation movement: **GitHub**
- `lastChange`: newest valid timestamp observed across all three sources
- Evidence availability: D1 registry state, supported by linked Drive/GitHub evidence records

Drive and GitHub enrich registry artifacts. They do not silently overwrite D1 coordination state.
When sources disagree, the assembler should preserve both observations and emit a gap or warning
instead of choosing an undocumented winner.

## Derived Internal Signal views

The assembled objects feed four presentation projections:

### Current

Registry state grouped by canon/tool, environments, evidence status, owner, and review state.

### Evidence

Drive evidence references, audit materials, validation notes, and GitHub implementation evidence
joined to registry artifacts.

### Gaps

Derived conditions such as:

- registry artifact has no source reference
- evidence state is `none`, `partial`, or `pending`
- Drive source revision is newer than D1 `last_updated`
- GitHub activity exists after the registry review date
- build or knowledge activity cannot be joined to an artifact ID
- source adapter is unavailable or stale

### Movement

Time-ordered GitHub build activity, Drive source revisions, and registry state transitions. The
display should label the source of each movement item.

## Read path and resilience

The eventual authenticated read path should be:

```text
/internal/signal/
       |
       v
protected Internal Signal read endpoint
       |
       +-- D1 registry adapter
       +-- GitHub build adapter
       +-- Google Drive knowledge adapter
       |
       v
Signal Object assembler and derived views
```

The endpoint should use the existing internal authentication middleware and return no credentials.
Source failures should be visible as freshness/provenance warnings. A partial reading is preferable
to replacing known state with empty data.

## Static-to-live transition

The transition should be incremental:

1. Keep the current static arrays as the accepted fallback.
2. Connect and validate the D1 registry adapter behind the protected route.
3. Compare assembled D1 objects with static objects; do not remove static data yet.
4. Add GitHub ingestion and expose build activity with source timestamps.
5. Add Drive registry synchronization and knowledge references.
6. Remove static fallback only after all required artifacts have stable IDs, source joins, and
   freshness monitoring.

This avoids treating incomplete D1 rows as the entire DALE knowledge system.

