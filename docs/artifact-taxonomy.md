# DALE Artifact Taxonomy

## Purpose

This taxonomy defines how DALE artifacts are classified for the Internal Signal registry. It is
intended for:

- auditors determining what an artifact is and what supports it;
- developers registering new or changed artifacts;
- source adapters joining Google Drive, GitHub, and D1 records;
- Internal Signal assembling consistent Signal Objects.

Internal Signal is a reader. It does not own artifacts or become a source of truth.

```text
Google Drive / Workspace = knowledge source
GitHub                  = build activity source
Cloudflare D1           = artifact registry and coordination state
Internal Signal         = reader across all three
```

D1 stores identity, classification, state, relationships, source pointers, and small coordination
metadata. It must not store document bodies, workbooks, images, evidence-pack binaries, full Git
diffs, or complete external API responses.

## Classification Model

Every registered artifact has one **primary artifact type**:

1. Canon
2. Research
3. Validation
4. Evidence
5. Implementation
6. Decision
7. Publication

An artifact may relate to artifacts of other types, but it must not be duplicated merely to give
it another classification. For example, a validation report may support a Canon without becoming
a second Canon record.

When an item appears to fit more than one type, classify it by its principal claim:

- defines what DALE is or how it must behave: **Canon**
- develops knowledge or analysis: **Research**
- evaluates something against a method or criterion: **Validation**
- proves or supports a claim: **Evidence**
- records something built or changed: **Implementation**
- records an authoritative choice: **Decision**
- communicates an approved work to an audience: **Publication**

## Registry Compatibility

The current D1 schema uses storage-oriented `artifact_type` values such as `schema`,
`specification`, `toolkit`, `research_document`, `evidence`, and `application`. This taxonomy does
not change that schema.

Until a future migration introduces a dedicated taxonomy field, the primary taxonomy type may be
recorded in `metadata_json`, for example:

```json
{
  "taxonomy_type": "Canon",
  "representation": "Machine"
}
```

The existing `artifact_type` continues to describe the registered representation or file class:

| Taxonomy type | Typical current `artifact_type` values |
| --- | --- |
| Canon | `canon_source`, `schema`, `specification`, `toolkit`, `spreadsheet` |
| Research | `research_document`, `document`, `spreadsheet` |
| Validation | `document`, `research_document`, `build_artifact` |
| Evidence | `evidence`, `document`, `image`, `spreadsheet` |
| Implementation | `application`, `build_artifact`, `schema`, `toolkit` |
| Decision | `document` |
| Publication | `document`, `image` |

This distinction lets D1 describe both the governance meaning and the concrete representation
without storing the representation's content.

## Common Required Metadata

All artifact types require:

- **Artifact ID**: stable D1 identifier that does not change with title, route, or version.
- **Title**: clear human-readable name.
- **Primary taxonomy type**: one of the seven types in this document.
- **Representation/file type**: the current D1 `artifact_type`.
- **Current state**: `active`, `draft`, `in_progress`, `incomplete`, or `archived`.
- **Owner**: accountable person, team, or institution.
- **Version**: explicit version or a controlled value such as `current`.
- **Last updated**: ISO-8601 source or registry timestamp.
- **Review status**: `approved`, `in_review`, `changes_requested`, or `unreviewed`.
- **Source provider**: normally `google_drive`, `repository`, `generated`, or `external`.
- **Source pointer**: Drive reference, repository reference, or other resolvable identifier.
- **Internal route**: authenticated route for reading or accessing the artifact.
- **Evidence status**: `available`, `partial`, `pending`, `none`, or `not_applicable`.
- **Provenance statement**: who created or changed it, when, and in which source system.

Optional common metadata includes:

- canon or tool association;
- description or abstract;
- tags and keywords;
- Drive file and revision IDs;
- repository, path, commit SHA, branch, release, or deployment reference;
- related artifact IDs;
- superseded and superseding artifact IDs;
- review date and reviewer;
- confidentiality or access note;
- publication date;
- checksum or immutable source fingerprint.

## Provenance Standard

Every artifact must be traceable to its authoritative source:

### Google Drive provenance

Use for knowledge-bearing and substantial source files. Record, when available:

- Drive file ID;
- revision or modified timestamp;
- source owner;
- view URL;
- MIME type;
- artifact ID used to join the file to D1.

### GitHub provenance

Use for implementation and build movement. Record, when available:

- repository and path;
- commit SHA or release/deployment ID;
- author;
- occurred-at timestamp;
- changed paths;
- artifact ID used to join activity to D1.

### D1 provenance

D1 records registry state, not authorship of source content. Registry provenance includes:

- stable artifact ID;
- registry creation and update timestamps;
- current classification and state;
- current source pointers;
- relationships and environment links.

If source systems disagree, preserve both observations and flag the discrepancy. Do not silently
overwrite source provenance with registry metadata.

## Relationship Rules

Relationships are directional and use stable artifact IDs.

Recommended relationship meanings:

- `defines`: a Canon defines an Implementation or another Canon representation.
- `implements`: an Implementation realizes a Canon or Decision.
- `supports`: Evidence supports a Canon, Research claim, Validation result, or Decision.
- `validates`: a Validation artifact evaluates another artifact.
- `informed_by`: Research or a Decision draws from another artifact.
- `decides`: a Decision authorizes or selects a direction for another artifact.
- `publishes`: a Publication communicates a Canon, Research result, Decision, or Validation result.
- `supersedes`: a newer artifact replaces an older artifact.
- `derived_from`: an artifact is transformed from a source artifact without replacing it.

Rules:

1. Relationships never replace provenance.
2. A relationship does not change an artifact's primary type.
3. Evidence must link to the claim or artifact it supports.
4. A Validation artifact must link to both its subject and resulting Evidence where available.
5. Implementations must link to the Canon or Decision they implement.
6. Publications must link to the underlying source artifact.
7. Superseded artifacts remain registered and become `archived`; they are not deleted.
8. Unlinked Drive files or GitHub activity remain unlinked observations until assigned an artifact
   ID. They must not create implicit Signal Objects.

## Environment Linkage

The fixed H2 validation environments are:

- `AMMi / APE`
- `SVE`
- `Foundation`

No other validation environment is permitted.

An artifact may link to zero, one, or multiple environments using:

- `applies_to`: relevant to work in that environment;
- `produces_evidence`: expected to generate evidence there;
- `validated_in`: has been evaluated there.

An artifact with no environment link is global, administrative, or not yet assigned. Do not invent
an environment to avoid an empty relationship.

Canon and Implementation artifacts may be global. Validation and Evidence artifacts normally
require at least one environment unless they are explicitly cross-environment or architecture-wide.

## 1. Canon

### Purpose

Defines authoritative meaning, rules, structures, interfaces, or expected behavior within DALE.
A Canon may have Human, Developer, and Machine representations.

### Required metadata

Common required metadata, plus:

- canon/tool name;
- canon scope;
- representation: `Human`, `Developer`, or `Machine`;
- canonical version;
- authority or approving owner;
- relationship to sibling representations.

### Optional metadata

- maturity level;
- normative sections;
- schema identifier;
- compatibility notes;
- superseded version;
- implementation references;
- status, evidence, and changelog source pointers.

### Provenance requirements

Human source documents normally point to Google Drive. Developer specifications and Machine
schemas may point to GitHub or Drive depending on their authoritative source. D1 joins all
representations under stable artifact IDs.

### Relationship rules

- Human, Developer, and Machine representations must identify the same canon.
- Canon representations may be separate registry records linked by `derived_from` or a shared
  canon identity.
- A Canon `defines` Implementations.
- Evidence `supports` a Canon's tested claims.
- A later Canon version `supersedes` an earlier one.

### Environment linkage

Link only when the Canon applies to, produces evidence in, or has been validated in an H2
environment. Architecture-wide canons may have no environment link.

### Evidence requirements

Draft canons may have `pending` evidence. Active canons should identify validation or evidence
artifacts, known gaps, and the environments in which claims have been tested.

## 2. Research

### Purpose

Develops knowledge, interpretation, analysis, hypotheses, frameworks, or background understanding.
Research informs DALE but is not automatically normative.

### Required metadata

Common required metadata, plus:

- research question or scope;
- author or research owner;
- research date or period;
- abstract or summary;
- source/citation pointer.

### Optional metadata

- methodology;
- participants or institutions;
- references;
- dataset pointer;
- geographic scope;
- findings;
- limitations;
- related Canon or Validation IDs.

### Provenance requirements

The authoritative document and supporting files belong in Google Drive. GitHub may record
transformations into web views or changes to research tooling, but it is not the knowledge source.

### Relationship rules

- Research may be `informed_by` Evidence.
- Research may inform a Canon, Decision, Validation design, or Publication.
- Research does not `validate` an artifact unless a distinct validation method and result are
  present.

### Environment linkage

Link when research concerns or draws evidence from AMMi / APE, SVE, or Foundation. General DALE
research may remain unlinked.

### Evidence requirements

Research should identify its sources, method, and limitations. Evidence status reflects whether
the claims have traceable supporting material, not whether the research is approved.

## 3. Validation

### Purpose

Records a structured evaluation of an artifact, claim, process, or implementation against explicit
criteria.

### Required metadata

Common required metadata, plus:

- subject artifact ID;
- validation method or protocol;
- validation environment;
- evaluator or review body;
- validation date;
- result or disposition;
- linked evidence IDs.

### Optional metadata

- sample or observation period;
- acceptance criteria;
- score or severity;
- limitations;
- remediation action;
- revalidation date;
- reviewer notes.

### Provenance requirements

Protocols, reports, and validation notes belong in Google Drive. Implementation changes responding
to validation belong in GitHub. D1 stores result state, links, and environment relationships.

### Relationship rules

- Validation `validates` at least one subject artifact.
- Validation links to supporting Evidence rather than embedding it.
- A failed or partial validation does not alter the subject artifact silently; it creates a gap,
  risk, or required action.

### Environment linkage

At least one of AMMi / APE, SVE, or Foundation is normally required. Cross-environment validation
may link to several. No other environment value is allowed.

### Evidence requirements

Validation requires traceable evidence or must explicitly state `pending`, `partial`, or `none`.
An approved validation result without linked evidence is incomplete.

## 4. Evidence

### Purpose

Supports, contradicts, or qualifies a claim about a Canon, Research finding, Validation result,
Implementation, or Decision.

### Required metadata

Common required metadata, plus:

- evidence form or type;
- subject/claim artifact ID;
- collection or creation date;
- collector or source;
- integrity/provenance reference;
- evidence disposition: supporting, contradicting, mixed, or pending review.

### Optional metadata

- observation method;
- checksum;
- witness or verifier;
- location;
- confidentiality note;
- chain-of-custody note;
- excerpt or summary;
- related Validation ID.

### Provenance requirements

Evidence packs, images, notes, spreadsheets, and audit files belong in Google Drive. Code-level
evidence such as commits, tests, or deployment records belongs in GitHub. D1 stores pointers and
the evidence relationship.

### Relationship rules

- Evidence must `support` or qualify a named artifact or claim.
- Evidence may support multiple artifacts but should not be duplicated.
- Evidence must not be treated as a Decision merely because it influenced one.
- Contradictory evidence remains visible and is not deleted when a claim is approved.

### Environment linkage

Link to the environment where evidence was produced or observed: AMMi / APE, SVE, or Foundation.
Architecture-wide documentary evidence may remain unlinked.

### Evidence requirements

The artifact itself is evidence, so source integrity and traceability are mandatory. Missing source
provenance makes the Evidence artifact incomplete.

## 5. Implementation

### Purpose

Records a built system, application, schema implementation, configuration, deployment, fix, or
other operational realization.

### Required metadata

Common required metadata, plus:

- implemented component;
- repository and canonical path;
- current implementation state;
- responsible developer or team;
- linked Canon or Decision;
- latest commit, release, or deployment reference.

### Optional metadata

- runtime environment;
- language or framework;
- deployment URL;
- test status;
- rollback reference;
- dependencies;
- issue or pull request;
- operational notes.

### Provenance requirements

GitHub is authoritative for code changes, commits, status files, changelogs, and deployment notes.
Drive may contain design or operational knowledge. D1 stores current registry state and pointers.

### Relationship rules

- Implementation `implements` a Canon or Decision.
- A fix is normally an Implementation artifact or activity linked to the affected component.
- Tests and deployment records are Evidence supporting the Implementation state.
- Replaced implementations are linked by `supersedes`.

### Environment linkage

Link when the implementation applies to or is validated in AMMi / APE, SVE, or Foundation.
Internal infrastructure such as authentication or CMS administration may have no H2 link.

### Evidence requirements

Active or shipped implementations should have GitHub activity provenance and, where relevant,
tests, deployment records, or validation evidence. `pending` is acceptable while work is in
progress.

## 6. Decision

### Purpose

Records an authoritative choice, approval, rejection, exception, or governance determination.

### Required metadata

Common required metadata, plus:

- decision statement;
- decision authority;
- decision date;
- affected artifact IDs;
- rationale;
- status: proposed, approved, rejected, superseded, or withdrawn.

### Optional metadata

- alternatives considered;
- constraints;
- dissent or unresolved questions;
- review date;
- expiry date;
- implementation owner;
- meeting or approval record.

### Provenance requirements

The signed or approved decision record belongs in Google Drive. GitHub may contain implementation
consequences. D1 stores decision state and relationships.

### Relationship rules

- A Decision `decides` or authorizes work on named artifacts.
- It should be `informed_by` Research, Validation, or Evidence.
- An Implementation may `implement` a Decision.
- A new Decision may `supersede` an earlier Decision without deleting it.

### Environment linkage

Link only when the decision is specific to AMMi / APE, SVE, or Foundation. Organization-wide
decisions remain unlinked.

### Evidence requirements

The rationale and authority record are required. Supporting Evidence or Research should be linked
when the decision depends on empirical claims.

## 7. Publication

### Purpose

Communicates an approved DALE work, finding, position, or explanation to an internal or public
audience.

### Required metadata

Common required metadata, plus:

- publication title;
- author or issuing body;
- publication date;
- audience;
- publication status;
- canonical source artifact IDs;
- published route or URL.

### Optional metadata

- subtitle;
- category;
- tags;
- editor;
- cover image;
- references;
- revision history;
- withdrawal or correction notice.

### Provenance requirements

The authoritative editorial source belongs in Google Drive or the CMS's approved content store.
Published code and rendering changes belong in GitHub. D1 stores identity, state, routes, and
source relationships, not article bodies.

### Relationship rules

- A Publication `publishes` one or more Canon, Research, Validation, Decision, or Evidence
  artifacts.
- Editorial adaptation should link with `derived_from`.
- Corrections and new editions should preserve prior versions and use `supersedes`.
- Publication does not make its underlying claim canonical.

### Environment linkage

Usually none. Link only when a publication specifically reports on AMMi / APE, SVE, or Foundation.

### Evidence requirements

Public claims must link to their underlying source artifacts. Evidence status may be
`not_applicable` for purely administrative notices, but substantive publications should have
traceable references.

## Worked Classifications

### SEC Canon

- **Primary type:** Canon
- **Representations:** Human PDF/source DOCX, Developer toolkit/YAML, Machine JSON schema
- **D1 role:** stable SEC identity, representation records, version, review state, routes
- **Drive role:** authoritative human/source canon documents
- **GitHub role:** toolkit, schema, and implementation changes
- **Relationships:** defines SEC implementations; sibling representations are derived from the
  same Canon
- **Environment links:** AMMi / APE, SVE, and Foundation where applicable
- **Evidence:** validation records, tests, observations, and change provenance

### CBC Canon

- **Primary type:** Canon
- **Representations:** readable toolkit, Developer YAML specification, Machine JSON schema
- **Current state:** may be `incomplete` or `draft` where machine or evidence maturity is not
  established
- **Relationships:** defines CBC implementations and is supported by linked Validation/Evidence
- **Environment links:** AMMi / APE when applicable; additional links only to SVE or Foundation if
  actually used there
- **Evidence:** explicitly `partial`, `pending`, or `available`; never inferred from file presence

### CoS Canon

- **Primary type:** Canon
- **Representations:** canonical DOCX, Developer mapping toolkit/YAML, Machine JSON schema
- **Drive role:** canonical source document
- **GitHub role:** toolkit, schema, and specification movement
- **Relationships:** informs or defines observation and mapping implementations
- **Environment links:** only the relevant fixed H2 environments
- **Evidence:** mapping outputs, validation records, and implementation tests

### Signal Canon

- **Primary type:** Canon
- **Purpose:** defines the meaning, structure, and reading rules of Signal rather than a specific
  Signal frontend
- **Representations:** Human explanation, Developer assembly contract, Machine Signal Object
  schema when created
- **Relationships:** defines Internal Signal and any public Signal Implementation
- **Environment links:** normally global; specific validation links may be added when tested
- **Evidence:** provenance and validation that readings are correctly assembled from source records

### CTS Audit

- **Primary type:** Validation
- **Secondary role:** produces Evidence
- **Subject:** CTS / URT and the canon set being evaluated
- **Method:** coherence audit against explicit traceability criteria
- **Drive role:** authoritative audit document
- **D1 role:** audit identity, result state, evidence status, subjects, and environments
- **Environment links:** AMMi / APE and Foundation where the audit applies
- **Evidence:** the audit report and referenced schemas; findings should link to affected artifacts

### DALE Research Documentation

- **Primary type:** Research
- **Purpose:** develops and organizes DALE knowledge, validation context, provenance concepts, and
  architecture understanding
- **Drive role:** authoritative research source
- **GitHub role:** deployed HTML reading copy and transformation history
- **D1 role:** identity, route, source pointer, owner, review state, and environment links
- **Environment links:** Foundation and any other fixed H2 environment explicitly covered
- **Evidence:** citations, referenced records, and clearly stated limitations

### Internal Signal

- **Primary type:** Implementation
- **Canon/tool association:** Signal
- **Purpose:** authenticated reader that presents Current, Evidence, Gaps, and Movement
- **GitHub role:** source code and build activity
- **D1 role:** application identity, state, route, owner, version, and registry relationships
- **Drive role:** design and explanatory knowledge only
- **Environment links:** normally none unless a deployment is validated in an H2 environment
- **Evidence:** commits, tests, deployment record, and proof of correct source assembly

### Blog CMS

- **Primary type:** Implementation
- **Purpose:** create, preview, publish, and update Publication artifacts
- **GitHub role:** CMS code, changes, and deployment activity
- **D1 role:** CMS application registry state; article registry remains a separate content concern
- **Relationships:** implements publishing decisions and produces Publications
- **Environment links:** none unless explicitly validated in AMMi / APE, SVE, or Foundation
- **Evidence:** tests, deployment records, and editorial workflow validation

### Android OAuth Fix

- **Primary type:** Implementation
- **Granularity:** a fix/build activity linked to the affected authentication component
- **GitHub role:** authoritative commit, changed paths, author, timestamp, and deployment note
- **D1 role:** register as a distinct artifact only if it requires independent status, ownership,
  review, or evidence tracking; otherwise attach it as build activity to the authentication
  Implementation
- **Relationships:** implements an approved correction and supports the current authentication
  state
- **Environment links:** none by default; do not use an H2 environment to represent Android
- **Evidence:** commit, test result, redirect-flow verification, and deployment record

## Signal Object Assembly

Internal Signal starts with registered D1 artifacts and enriches them from Drive and GitHub.

The taxonomy contributes:

- primary type for grouping and filtering;
- type-specific completeness checks;
- relationship expectations;
- evidence requirements;
- valid environment-link behavior;
- provenance warnings.

Example completeness rules:

- Canon without a Machine representation may appear as a gap.
- Validation without a subject, method, environment, or Evidence link is incomplete.
- Evidence without source provenance is incomplete.
- Implementation without a linked Canon/Decision or GitHub provenance is a risk.
- Decision without authority and rationale is incomplete.
- Publication without source artifact links has weak provenance.

Signal should preserve the distinction between:

- **registry state** from D1;
- **knowledge provenance** from Google Drive;
- **build movement** from GitHub.

It must not interpret the presence of a file as proof of approval, validation, evidence quality, or
currentness.

## Registration Checklist

Before registering or updating an artifact:

1. Select exactly one primary taxonomy type.
2. Assign or reuse a stable D1 artifact ID.
3. Record all common required metadata.
4. Point to the authoritative Drive or GitHub source.
5. Add only valid H2 environment links.
6. Link the artifact to the claims, canons, implementations, decisions, or evidence it affects.
7. Set evidence and review states explicitly.
8. Preserve superseded records rather than deleting them.
9. Keep large content and source history out of D1.
10. Confirm Internal Signal can identify provenance, current state, gaps, and latest movement.

