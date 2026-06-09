# DALE Artifact Lifecycle

## Purpose

This document defines how DALE artifacts move through the internal system and what evidence is
required at each stage.

The lifecycle applies to all artifact types defined in `docs/artifact-taxonomy.md`:

- Canon
- Research
- Validation
- Evidence
- Implementation
- Decision
- Publication

The lifecycle stages are:

```text
Draft -> Registered -> Active -> Validated -> Published -> Archived
```

This is a governance sequence, not a requirement that every artifact visit every stage. An
Implementation may become Validated without becoming Published. A Publication normally reaches
Published. A Decision may become Active and later Archived without a separate publication stage.

Internal Signal reads lifecycle state. It does not advance artifacts through the lifecycle.

## Source Responsibilities

```text
Google Drive / Workspace = knowledge assets and substantial source files
GitHub                  = build activity and implementation provenance
Cloudflare D1           = lifecycle registry and coordination state
Internal Signal         = lifecycle reader and gap detector
```

### D1 Registry

D1 records:

- stable artifact identity;
- taxonomy and representation metadata;
- current registry status;
- lifecycle stage when represented in registry metadata;
- owner, version, review state, and evidence state;
- source pointers;
- relationships;
- H2 environment links;
- registry timestamps.

D1 does not store document bodies, workbooks, images, evidence-pack binaries, full Git history, or
complete Drive files.

### GitHub activity

GitHub provides:

- commits and changed paths;
- status files and changelogs;
- pull requests and reviews;
- tests and build results;
- releases and deployment notes;
- implementation and remediation history.

GitHub activity can support a lifecycle transition, but a commit alone does not authorize one.

### Google Drive knowledge assets

Google Drive provides:

- authoritative human-readable canons;
- research and publication sources;
- validation protocols and reports;
- evidence packs;
- decision records;
- audit materials;
- revision and ownership history.

A Drive file's existence does not prove that the artifact is Registered, Active, Validated, or
Published. D1 records the governed lifecycle state.

## Lifecycle and Current D1 Fields

The current D1 schema has:

- `status`: `active`, `archived`, `draft`, `in_progress`, or `incomplete`;
- `review_status`: `approved`, `changes_requested`, `in_review`, or `unreviewed`;
- `evidence_status`: `available`, `partial`, `pending`, `none`, or `not_applicable`.

These fields contribute to lifecycle decisions but do not individually represent the six-stage
lifecycle.

This document does not change the schema. Until a dedicated lifecycle field exists, the lifecycle
stage may be recorded in `metadata_json`:

```json
{
  "taxonomy_type": "Implementation",
  "lifecycle_stage": "Validated",
  "lifecycle_changed_at": "2026-06-09T12:00:00Z",
  "lifecycle_authority": "DALE Systems Lab"
}
```

Recommended compatibility mapping:

| Lifecycle stage | Typical D1 `status` | Typical `review_status` | Typical `evidence_status` |
| --- | --- | --- | --- |
| Draft | `draft` or `in_progress` | `unreviewed` or `in_review` | `none` or `pending` |
| Registered | `draft`, `in_progress`, or `incomplete` | any | explicit value required |
| Active | `active` | normally `approved` or `in_review` | type-dependent |
| Validated | `active` | normally `approved` | `available` |
| Published | `active` | `approved` | `available` or justified `not_applicable` |
| Archived | `archived` | preserved from prior state | preserved from prior state |

The lifecycle stage must not be inferred from this table alone. It requires the transition evidence
defined below.

## General Transition Rules

1. Every transition is recorded against a stable artifact ID.
2. The source artifact remains in Google Drive or GitHub; D1 records lifecycle state and pointers.
3. A transition records date, owner or authority, reason, and supporting evidence.
4. Lifecycle stage, review status, evidence status, and implementation state remain distinct.
5. A file upload or commit does not automatically advance lifecycle.
6. Missing evidence blocks transitions that require evidence.
7. Contradictory evidence remains visible and may trigger regression or revalidation.
8. Archived artifacts are retained and linked to replacements; they are not deleted.
9. H2 environment linkage uses only AMMi / APE, SVE, and Foundation.
10. Signal labels source freshness and lifecycle uncertainty rather than inventing a state.

## Allowed Transitions

### Normal forward transitions

- Draft -> Registered
- Registered -> Active
- Active -> Validated
- Validated -> Published
- Draft -> Archived
- Registered -> Archived
- Active -> Archived
- Validated -> Archived
- Published -> Archived

### Type-dependent transitions

- Active -> Published, when formal validation is not applicable and the exception is documented.
- Validated -> Active, when an artifact remains operational but validation has expired or been
  withdrawn.
- Published -> Active, when publication is withdrawn but the underlying artifact remains active.
- Registered -> Draft, when registration review identifies that identity or provenance is not
  sufficient.
- Active -> Registered, when authority or required source provenance is withdrawn.
- Validated -> Registered, when validation is invalidated and the artifact is no longer approved
  for active use.

### Replacement transitions

A materially new version may be registered as a new artifact or version while the prior artifact
becomes Archived. The relationship must be `supersedes`; history must not be overwritten.

### Prohibited transitions

- Draft -> Validated without registration and active-use authority.
- Draft -> Published without registration, approval, and a documented exception or validation.
- Archived -> another stage by silently reopening the same historical record.
- Any transition based only on file presence, a commit, or an unreviewed Signal reading.
- Validation or Evidence transition linked to an environment outside the fixed H2 set.

If an archived artifact must return, create a new version or explicit reactivation record with
review authority and provenance.

## 1. Draft

### Purpose

Captures work that exists but is not yet accepted into the formal artifact registry as a usable
DALE artifact.

Drafts may be incomplete, exploratory, privately reviewed, or under active construction.

### Required metadata

- working title;
- proposed taxonomy type;
- draft owner;
- source provider and source pointer;
- creation or first-observed date;
- proposed canon/tool or component association;
- current version or draft identifier;
- `status` of `draft` or `in_progress`;
- `review_status` of `unreviewed` or `in_review`;
- explicit evidence status.

A permanent artifact ID is preferred but may be assigned at registration if the draft has not yet
entered D1.

### Required evidence

- source provenance sufficient to identify the draft;
- author or contributor identity;
- change history in Drive or GitHub;
- no proof of correctness or approval is required.

Draft evidence may be `none` or `pending`, but this must be explicit.

### Allowed transitions

- Draft -> Registered
- Draft -> Archived

### Signal representation

Signal shows Draft artifacts as work in progress, not current authority.

Recommended presentation:

- state: draft or in progress;
- evidence: none or pending;
- gap when owner, source, or intended classification is missing;
- movement based on Drive revisions or GitHub activity;
- excluded from counts of active or validated artifacts.

## 2. Registered

### Purpose

Establishes stable identity and discoverability in D1. Registered means DALE knows what the artifact
is, where it comes from, who owns it, and how it relates to the build.

Registered does not mean approved, active, validated, or published.

### Required metadata

- stable artifact ID;
- title;
- primary taxonomy type;
- representation/file type;
- owner;
- version;
- source provider and source pointer;
- internal route, when available;
- last-updated timestamp;
- review status;
- evidence status;
- canon, tool, component, or subject association;
- provenance statement;
- relationships required by the artifact taxonomy;
- applicable H2 environment links.

### Required evidence

- resolvable authoritative source reference;
- source owner or authorship;
- source creation or revision timestamp;
- enough metadata to distinguish the artifact from duplicates;
- registry action record or accountable registrar.

Content quality may remain unreviewed. Registration evidence proves identity and provenance, not
validity.

### Allowed transitions

- Registered -> Active
- Registered -> Draft
- Registered -> Archived

### Signal representation

Signal may show the artifact in inventory and gap views.

Recommended presentation:

- state: registered or incomplete;
- source provenance visible;
- review and evidence state shown separately;
- gap when required relationships, routes, or environment links are missing;
- not described as active unless the Active gate is satisfied.

## 3. Active

### Purpose

Marks an artifact as currently used, authoritative for its intended scope, or operational within
the DALE build.

Active does not necessarily mean validated. It means the artifact is the current working or
governing artifact.

### Required metadata

All Registered metadata, plus:

- effective date;
- authority that activated it;
- active scope;
- current version;
- current internal route;
- required relationships;
- known risks or limitations;
- review status appropriate to the artifact type;
- H2 environment applicability, when relevant.

### Required evidence

- activation approval, accepted review, or deployment record;
- current authoritative Drive revision or GitHub commit/release;
- type-specific minimum evidence:
  - Canon: representation completeness and authority;
  - Implementation: tests or deployment/build evidence;
  - Research: reviewed scope and provenance;
  - Decision: approval record;
  - Validation/Evidence: method and source integrity;
  - Publication: editorial approval if it becomes active before publication.

Evidence may be partial only when risks and missingness are visible.

### Allowed transitions

- Active -> Validated
- Active -> Published, with documented validation exception where applicable
- Active -> Registered
- Active -> Archived

### Signal representation

Signal treats Active as current state.

Recommended presentation:

- included in active counts;
- current owner, version, source, and environment links shown;
- evidence status visible;
- risks generated from missing validation, stale source revisions, or partial evidence;
- movement enriched from GitHub and Drive.

## 4. Validated

### Purpose

Marks an Active artifact as evaluated against explicit criteria with traceable evidence.

Validation is always scoped. It must state what was evaluated, by whom, under what method, and in
which environment or architecture-wide context.

### Required metadata

All Active metadata, plus:

- Validation artifact ID;
- validation method or protocol;
- subject and version validated;
- validation date;
- evaluator or review body;
- result and limitations;
- linked Evidence artifact IDs;
- validation scope;
- revalidation or expiry date when applicable;
- `review_status` normally `approved`;
- `evidence_status` of `available`.

### Required evidence

- completed validation report or review record;
- linked source evidence;
- version match between subject and validation;
- evaluator identity;
- acceptance criteria and result;
- H2 environment link when environment-based.

For implementations, tests alone may be necessary but are not always sufficient; the validation
scope determines the evidence gate.

### Allowed transitions

- Validated -> Published
- Validated -> Active
- Validated -> Registered
- Validated -> Archived

### Signal representation

Signal shows:

- validated badge or state;
- validation scope and date;
- applicable H2 environments;
- supporting evidence links;
- freshness or expiry warnings;
- contradiction warnings when newer source activity postdates validation.

Signal must not call an artifact Validated merely because its evidence status is `available`.

## 5. Published

### Purpose

Marks an approved artifact or representation as formally released to its intended audience.

Published may mean public release, controlled internal publication, or an issued canonical version.
Audience and route must be explicit.

### Required metadata

All applicable prior-stage metadata, plus:

- publication or release date;
- publishing authority;
- audience;
- published route or URL;
- released version;
- source artifact IDs;
- publication status;
- correction or withdrawal policy;
- approval record;
- validation reference or documented reason validation is not applicable.

### Required evidence

- published output or release record;
- editorial, governance, or release approval;
- immutable version, revision, release, or commit reference;
- source relationship to the underlying Canon, Research, Validation, Decision, or Implementation;
- validation evidence where required by type and claim.

### Allowed transitions

- Published -> Active
- Published -> Archived

Corrections should create a new version that supersedes the prior publication rather than silently
changing history.

### Signal representation

Signal shows:

- publication date and audience;
- published route;
- source artifact and version;
- validation/evidence basis;
- current or superseded status;
- movement event for release, correction, withdrawal, or replacement.

Published artifacts remain distinguishable from merely Active artifacts.

## 6. Archived

### Purpose

Preserves artifacts that are no longer current, active, valid, or published while retaining their
provenance and relationships.

Archive is retention, not deletion.

### Required metadata

- archive date;
- archive authority or owner;
- archive reason;
- final version;
- prior lifecycle stage;
- source pointers;
- replacement or superseding artifact ID, when applicable;
- retention or access note;
- preserved review and evidence state.

### Required evidence

- archive, withdrawal, or supersession decision;
- final source revision or commit;
- replacement link where one exists;
- record of why the artifact is no longer current.

### Allowed transitions

Archived is terminal for the historical record.

If work resumes, register a new version or artifact linked by `derived_from` or `supersedes`.

### Signal representation

Signal excludes Archived artifacts from current active counts but retains them in:

- history;
- version chains;
- audit views;
- movement timelines;
- source provenance;
- supersession relationships.

An archived artifact should not appear as a current gap unless its replacement is missing or the
archive relationship is incomplete.

## Evidence Gates by Transition

| Transition | Minimum evidence gate |
| --- | --- |
| Draft -> Registered | stable identity, source pointer, owner, timestamp, classification |
| Registered -> Active | activation/approval record and current authoritative source |
| Active -> Validated | method, evaluator, subject version, result, linked evidence |
| Validated -> Published | release approval, audience/route, released version, source links |
| Active -> Published | release approval plus documented validation exception |
| Any -> Archived | archive reason, authority, final source, replacement link if applicable |
| Validated -> Active | validation expiry, withdrawal, contradiction, or changed subject version |
| Active -> Registered | withdrawal of authority or material provenance/completeness failure |

## H2 Environment Interaction

The only validation environments are:

- AMMi / APE
- SVE
- Foundation

Environment linkage and lifecycle stage are different:

- `applies_to` says where an artifact is relevant;
- `produces_evidence` says where it is expected to create evidence;
- `validated_in` says where validation occurred;
- lifecycle says how governed and mature the artifact is.

Rules:

1. Draft and Registered artifacts may have proposed or confirmed `applies_to` links.
2. Active artifacts must have accurate environment links where their scope is environment-specific.
3. Validated artifacts must identify `validated_in` environments unless validation is explicitly
   architecture-wide.
4. Evidence must link to the environment where it was produced or observed.
5. Validation in one environment does not imply validation in another.
6. Publication does not expand environment scope.
7. Android, production, staging, web, and mobile are technical platforms, not H2 environments.
8. No additional environment value may be introduced.

Signal should show environment-specific validation accurately, for example:

```text
SEC Canon
Active globally
Validated in AMMi / APE and SVE
Foundation validation pending
```

## Source Freshness and Lifecycle

Lifecycle state can become stale when source systems move.

### GitHub activity after lifecycle approval

If commits, releases, schemas, or deployment changes postdate Active or Validated approval:

- keep the D1 lifecycle stage until reviewed;
- show a freshness warning;
- identify the unreviewed GitHub movement;
- require revalidation when the change affects validated scope.

### Drive revision after lifecycle approval

If the authoritative Drive revision postdates approval or validation:

- show the newer revision;
- retain the registered lifecycle stage;
- mark review freshness as uncertain;
- require comparison and possibly a new version or validation.

### D1 update without source evidence

A registry status change without supporting Drive or GitHub provenance is a coordination assertion,
not proof. Signal should flag the missing transition evidence.

## Worked Examples

## SEC Canon

**Type:** Canon

Suggested lifecycle:

```text
Draft
  -> Registered when Human, Developer, and Machine representations have stable identities
  -> Active when the current version is approved for DALE use
  -> Validated separately in AMMi / APE, SVE, and/or Foundation
  -> Published when an approved canonical version is formally issued
  -> Archived when superseded
```

Evidence gates:

- Registered: Human source, YAML specification, JSON schema, owner, version.
- Active: canon authority and representation alignment.
- Validated: validation protocol, subject version, environment, results, and evidence.
- Published: release/version record and canonical route.

Signal representation should distinguish global Active state from environment-specific validation.
A new schema commit after validation creates a revalidation warning.

## CBC Canon

**Type:** Canon

CBC may remain Draft or Registered while representations or evidence are incomplete.

Suggested lifecycle:

```text
Draft -> Registered -> Active -> Validated -> Published -> Archived
```

It must not advance to Active merely because toolkit, specification, and schema files exist.
Activation requires authority and a declared current version. Validation requires linked evidence
from the relevant H2 environment.

If the machine representation is draft or evidence is partial, Signal should show:

- Registered or Draft lifecycle;
- incomplete representation gap;
- partial or pending evidence;
- next required transition action.

## CTS Audit

**Type:** Validation

Suggested lifecycle:

```text
Draft
  -> Registered when subject, method, evaluator, and source report are identified
  -> Active while the audit is the current review
  -> Validated when the audit process and evidence set are approved
  -> Published when formally issued to reviewers
  -> Archived when replaced by a later audit
```

Required evidence includes the audit report, referenced schemas, evaluator, criteria, findings, and
affected artifact IDs.

Environment linkage may include AMMi / APE and Foundation where relevant. Architecture-wide
findings must be labelled as such; they do not imply SVE validation.

Signal should show findings as evidence and gaps against the subject canons, not treat the audit
document itself as a Canon.

## Internal Signal

**Type:** Implementation

Suggested lifecycle:

```text
Draft
  -> Registered when the application has a stable artifact ID and route
  -> Active when authenticated users rely on it as the internal home
  -> Validated when access, source assembly, fallback, and presentation behavior are tested
  -> Archived when replaced
```

Publication is normally not applicable because Internal Signal is a protected operational
application, not a publication.

Required evidence:

- GitHub commits and changed paths;
- route and deployment record;
- auth/access tests;
- source adapter and fallback tests when live data is connected;
- proof that Signal reads rather than owns source data.

H2 links are normally empty unless Signal is explicitly validated within one of the three
environments. Technical production or web deployment is not an H2 environment.

Signal may read its own registry state, but it must not self-approve a lifecycle transition.

## Android OAuth Fix

**Type:** Implementation activity or independently registered Implementation

If tracked as activity on the authentication component, it does not require a separate lifecycle.
If independently registered because it needs ownership, review, and evidence tracking:

```text
Draft
  -> Registered when the issue, component, owner, and commit are identified
  -> Active when deployed
  -> Validated when Android redirect and login behavior pass verification
  -> Archived when incorporated into the stable authentication version
```

Publication is not applicable.

Required evidence:

- issue or failure description;
- GitHub commit and changed paths;
- test result for Android OAuth redirect and callback behavior;
- deployment reference;
- reviewer or verification record.

Android is a platform, not an H2 validation environment. No AMMi / APE, SVE, or Foundation link is
required unless the fix is actually validated through one of those environments.

## Lifecycle Completeness Rules for Signal

Internal Signal can derive lifecycle gaps such as:

- Draft without an owner or source pointer;
- Registered without a stable artifact ID or authoritative source;
- Active without activation authority or current source version;
- Validated without method, evaluator, subject version, environment scope, or Evidence links;
- Published without release approval, source relationships, or published route;
- Archived without archive reason or superseding relationship;
- source activity newer than the latest lifecycle approval;
- environment claims outside the H2 set;
- lifecycle stage inconsistent with review or evidence status.

Signal should report these as gaps or risks. It must not automatically change lifecycle state.

## Transition Record Checklist

Every lifecycle transition should record:

1. Artifact ID.
2. Previous stage.
3. New stage.
4. Transition date.
5. Responsible owner or authority.
6. Reason for transition.
7. Source version or revision.
8. Evidence artifact IDs or source references.
9. Review status.
10. Evidence status.
11. Applicable H2 environment scope.
12. Replacement or supersession relationship, when relevant.

