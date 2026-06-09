# DALE Internal Artifact Registry

## Purpose

The artifact registry is the metadata weave between source files, restricted internal routes,
and Internal Signal. It answers what an artifact is, where its source lives, where the team can
open it, which canon and validation environments it affects, and whether its evidence and review
state are current.

The first schema is in `d1/migrations/0001_artifact_registry.sql`. Current known artifacts are in
`d1/seeds/artifact_registry_seed.sql`.

## Storage responsibilities

### Google Drive: source and large-file storage

Google Drive will hold source documents and files that should not be stored as D1 rows:

- documents and research source files
- spreadsheets
- images and other large media
- canon source documents
- working files that retain Drive collaboration and revision history

The registry stores only a `source_url` pointer. The initial seed uses non-resolving
`gdrive://pending/...` placeholders until Drive file IDs are registered. No Drive API connection
is part of this phase.

### Cloudflare D1: registry and state metadata

D1 holds small, queryable metadata:

- title and artifact type
- canon or tool
- fixed H2 validation environment relationships
- build status
- source pointer
- restricted internal route
- evidence status
- last-updated timestamp
- owner and version
- review status

D1 must not hold workbook contents, document bodies, images, or other large source files.

### Internal site: authenticated reading and access routes

The internal site exposes authenticated routes such as `/internal/docs/` and
`/internal/developer/`. An artifact row points to the most useful restricted route through
`internal_route`. Existing route middleware remains responsible for access control.

The internal route may be a rendered reading copy, a restricted download, or a toolkit. It does
not make the internal site the canonical source store.

### Internal Signal: registry consumer

Internal Signal will eventually query registry records rather than maintaining duplicated static
arrays. It can derive:

- current artifacts grouped by canon, tool, type, or environment
- missing or partial evidence
- drafts, incomplete artifacts, and review queues
- recently updated artifacts
- links to authenticated internal routes

Internal Signal should read registry state. It should not fetch and parse large Drive files during
normal page loads.

## Data flow

```text
Google Drive or repository source
              |
              | source_url + source metadata
              v
Cloudflare D1 artifact registry
              |
              | internal_route + state + environment links
              v
Authenticated internal site route
              |
              | registry query and aggregation
              v
Internal Signal reading
```

1. A source file is created or updated in Google Drive. Application/build artifacts may remain
   repository-owned.
2. A registry row is inserted or updated with stable identity, source pointer, state, review,
   evidence, ownership, and version metadata.
3. The row points to an existing authenticated route where the team can read or download the
   artifact.
4. Internal Signal queries D1 and turns registry rows into its Current, Evidence, Gaps, and
   Movement readings.

## Environment rule

The H2 validation environments are fixed:

- `AMMi / APE`
- `SVE`
- `Foundation`

They are seeded into `validation_environments`. Artifacts connect to zero or more environments
through `artifact_environments`; no free-text environment values are stored on artifact rows.

An artifact with no environment relationship is global or not yet assigned. This avoids inventing
a fourth environment value.

## Schema notes

`artifact_registry` is the canonical metadata record. Its stable text `id` should not change when
a title, version, route, or Drive URL changes.

`validation_environments` is a controlled lookup implementing the H2 rule.

`artifact_environments` supports many-to-many relationships and records whether an artifact
applies to, produces evidence for, or was validated in an environment.

`metadata_json` is an escape hatch for small structured metadata. It must remain valid JSON and
must not become a place to store document bodies.

## Cloudflare deployment

This phase does not add or change a D1 binding. When a registry database or binding is approved,
the SQL remains compatible with Wrangler:

```powershell
npx wrangler d1 execute <DATABASE_NAME> --file d1/migrations/0001_artifact_registry.sql
npx wrangler d1 execute <DATABASE_NAME> --file d1/seeds/artifact_registry_seed.sql
```

Use `--local` during local validation. Production database naming and whether this shares or
separates from the blog D1 binding are deployment decisions; the registry tables do not depend on
the blog schema.

## Future integration boundary

The next application phase can add a protected read-only registry endpoint for Internal Signal.
That endpoint should:

1. use the existing authenticated `/internal/` access model;
2. query D1 for registry metadata and environment relationships;
3. return only fields needed by Internal Signal;
4. never expose Drive credentials or private source tokens;
5. keep Drive synchronization as a separate ingestion process.

Google Drive synchronization can later replace placeholder `source_url` values and update
metadata, but Drive remains file storage and D1 remains the live registry/state layer.

