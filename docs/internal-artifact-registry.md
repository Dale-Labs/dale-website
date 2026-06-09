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

### Internal Signal: multi-source reader

Internal Signal will eventually combine D1 registry records with Google Drive knowledge metadata
and GitHub build activity rather than maintaining duplicated static arrays. D1 remains the join
spine and coordination layer; it is not the whole reading. Internal Signal can derive:

- current artifacts grouped by canon, tool, type, or environment
- missing or partial evidence
- drafts, incomplete artifacts, and review queues
- recently updated artifacts
- links to authenticated internal routes

Internal Signal should read registry state, Drive knowledge references, and GitHub activity through
separate adapters. It should not fetch and parse large Drive files during normal page loads.

The full adapter and assembly design is documented in
`docs/internal-signal-data-architecture.md`.

## Data flow

```text
Google Drive knowledge ----+
                           |
GitHub build activity -----+--> Signal Object assembly --> Internal Signal
                           |
D1 registry state ---------+
       |
       +--> authenticated internal_route
```

1. A source file is created or updated in Google Drive, or build activity occurs in GitHub.
2. A D1 registry row provides stable identity, source pointers, state, review, evidence,
   ownership, version, and environment metadata.
3. The row points to an authenticated route where the team can read or download the artifact.
4. Internal Signal joins the registry row with Drive knowledge references and GitHub activity,
   then derives its Current, Evidence, Gaps, and Movement readings.

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

The next application phase can add a protected read-only Signal endpoint.
That endpoint should:

1. use the existing authenticated `/internal/` access model;
2. query D1 for registry metadata and environment relationships;
3. call Drive and GitHub through separate adapters;
4. assemble records by stable artifact ID;
5. return only fields needed by Internal Signal;
6. never expose Drive or GitHub credentials;
7. keep source synchronization separate from page rendering.

Google Drive synchronization can later replace placeholder `source_url` values and update
metadata, but Drive remains file storage and D1 remains the live registry/state layer.
