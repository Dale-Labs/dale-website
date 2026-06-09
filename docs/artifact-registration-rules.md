# DALE Artifact Registration Rules

## Purpose

This document governs how items enter, change within, and leave active use in the DALE Artifact
Registry.

It operationalizes:

- `docs/artifact-taxonomy.md`
- `docs/artifact-lifecycle.md`
- `docs/internal-signal-data-architecture.md`
- `docs/internal-information-architecture.md`

The controlling principle is:

> An artifact exists for Internal Signal only after it has a stable record in the D1 Artifact
> Registry.

Google Drive and GitHub can expose source files, revisions, commits, releases, and other candidate
observations. They cannot create DALE artifacts by themselves.

```text
Google Drive knowledge ----+
                           |
GitHub build activity -----+--> registration review --> D1 Artifact Registry
                                                          |
                                                          v
                                                registered Signal Object
```

## Authority Model

### D1 is the registry authority

D1 determines:

- whether an artifact is registered;
- its stable artifact ID;
- its primary taxonomy classification;
- its current registry and lifecycle state;
- its owner and version;
- its source pointers;
- its relationships;
- its review and evidence status;
- its H2 environment links;
- whether it is current, superseded, or archived.

D1 does not determine the contents of a Drive document or the facts of a GitHub commit. It records
the governed identity and coordination state that joins those sources.

### Google Drive is the knowledge authority

Drive is authoritative for substantial knowledge assets such as:

- human-readable canons;
- research documents;
- validation protocols and reports;
- evidence packs;
- audit materials;
- decision records;
- publication sources;
- spreadsheets, images, PDFs, and collaborative documents.

A Drive file is a candidate source. It is not a registered artifact until D1 assigns or associates
a stable artifact ID.

### GitHub is the build activity authority

GitHub is authoritative for:

- commits and changed paths;
- status files and changelogs;
- implementation changes;
- tests and build results;
- releases and deployment notes;
- runtime and remediation activity.

A commit, pull request, status file, or deployment is build activity. It does not become an
independent artifact unless registration rules justify a separately governed identity.

### Internal Signal is a reader

Internal Signal:

- reads registered artifacts;
- enriches them with Drive and GitHub observations;
- reports current state, evidence, gaps, and movement;
- does not register artifacts;
- does not approve lifecycle transitions;
- does not create identity from unlinked source observations.

## 1. What Qualifies as an Artifact?

An item qualifies for registration when it has a durable role in understanding, governing,
validating, implementing, evidencing, deciding, or communicating the DALE build.

It must satisfy all of the following:

1. **Distinct identity**: it can be named and distinguished from other items.
2. **Durable relevance**: it matters beyond a transient editing or operational moment.
3. **Accountability**: an owner or responsible authority can be named.
4. **Provenance**: it has a traceable Drive, GitHub, generated, or approved external source.
5. **Classification**: it has one primary taxonomy type:
   - Canon
   - Research
   - Validation
   - Evidence
   - Implementation
   - Decision
   - Publication
6. **State**: its lifecycle or registry state needs to be known.
7. **Relationships**: it defines, implements, supports, validates, informs, decides, publishes,
   supersedes, or derives from another part of the build, or is a recognized root artifact.
8. **Signal value**: its state, evidence, absence, or movement is meaningful to Internal Signal,
   auditors, developers, or DALE governance.

Typical qualifying items:

- a Canon and its governed Human, Developer, or Machine representations;
- a research document with durable findings or architecture relevance;
- a formal validation report;
- an evidence pack with traceable source and subject;
- an application or operational component;
- an implementation change requiring independent ownership, review, or validation;
- an approved decision record;
- a publication with a canonical source and audience.

## 2. What Does Not Qualify as an Artifact?

The following do not normally receive independent artifact IDs:

- temporary drafts with no durable ownership or intended registry role;
- duplicate exports of the same source document;
- local working copies;
- formatting-only file variants;
- individual comments, messages, or meeting reminders;
- generated caches and build output;
- raw API responses;
- secrets, credentials, tokens, or environment variables;
- routine commits that merely update an existing Implementation;
- every issue, pull request, deployment, or test run;
- every Drive revision;
- navigation pages that only point to artifacts and have no independent governance state;
- technical platforms such as Android, web, production, or staging;
- H2 environment labels themselves;
- evidence fragments with no identifiable subject or provenance;
- files whose only significance is that they happen to exist.

These may still be source observations, activity, evidence references, or metadata attached to an
existing artifact.

### Promotion from activity to artifact

A GitHub or Drive item should be promoted to an independent artifact only when it needs one or more
of:

- separate ownership;
- separate lifecycle state;
- independent review or approval;
- independent evidence status;
- version or supersession history;
- relationships to multiple artifacts;
- an auditor-facing identity;
- a stable route or source reference used outside the parent artifact.

For example, an Android OAuth fix is normally build activity on the authentication Implementation.
It becomes an independent Implementation artifact only if DALE needs to track its owner, state,
review, validation, or evidence separately.

## 3. Who Can Register an Artifact?

Registration is a governed write to D1. The ability to edit a Drive file or push to GitHub does not
grant registration authority.

### Artifact proposer

Any authorized DALE contributor may propose an artifact by supplying the required metadata and
source provenance.

The proposer may be:

- an artifact owner;
- a developer;
- a researcher;
- a validator;
- a reviewer;
- a DALE team member responsible for a source asset.

The proposer cannot self-establish registry authority merely by submitting a file or commit.

### Artifact owner

The owner:

- confirms title, purpose, classification, scope, and source;
- accepts ongoing responsibility;
- proposes relationships and environment links;
- supplies or identifies required evidence;
- requests updates and lifecycle transitions.

### Registry steward

Only an authorized registry steward or approved registry process may create or materially alter the
D1 identity record.

The steward:

- checks for duplicate artifacts;
- assigns or confirms the stable artifact ID;
- verifies minimum metadata and provenance;
- confirms taxonomy classification;
- verifies H2 environment values;
- records the initial lifecycle and review state;
- preserves existing history and relationships;
- rejects incomplete or misleading registrations.

### Reviewer or authority

Registration proves identity, not approval. A reviewer or designated authority handles:

- review status;
- activation;
- validation;
- publication;
- archival or supersession;
- exceptions to ordinary evidence gates.

One person may hold several responsibilities, but the registration record should identify which
capacity authorized each action.

## 4. Minimum Metadata Required

No artifact may be registered without:

- **Artifact ID**: stable D1 identifier.
- **Slug**: stable, unique registry label.
- **Title**: clear human-readable name.
- **Primary taxonomy type**: one of the seven governed types.
- **Representation/file type**: compatible current D1 `artifact_type`.
- **Purpose or scope**: concise statement of what the artifact does or claims.
- **Owner**: accountable person, team, or institution.
- **Version**: explicit version or controlled `current` value.
- **Registry status**: current D1-compatible state.
- **Lifecycle stage**: normally `Registered` at first accepted registration.
- **Review status**: explicit value.
- **Evidence status**: explicit value.
- **Source provider**: Drive, repository/GitHub, generated, or approved external source.
- **Source pointer**: resolvable or intentionally pending reference.
- **Last updated**: source timestamp in ISO-8601 form.
- **Internal route**: authenticated reading/access route when one exists.
- **Provenance statement**: creator/change source, date, and source system.
- **Required relationships**: subject, canon, component, decision, source, or parent links required
  by the taxonomy.
- **Environment links**: only valid H2 relationships, or an explicit statement that the artifact
  is global/unassigned.

### Type-specific minimums

The registration must also satisfy `artifact-taxonomy.md`, for example:

- Canon: canon identity, scope, representation, version, and authority;
- Research: question/scope, author, date/period, and source;
- Validation: subject, method, evaluator, date, result state, and environment scope;
- Evidence: subject/claim, form, collector/source, date, and integrity reference;
- Implementation: component, repository/path, owner, state, and Canon/Decision relationship;
- Decision: statement, authority, date, affected artifacts, and rationale;
- Publication: audience, publication state, source artifacts, and route.

### Pending source references

A placeholder such as `gdrive://pending/...` may be accepted only when:

- the artifact identity and owner are known;
- the missing source is recorded as a gap;
- evidence status reflects the missingness;
- the artifact is not represented as Validated or Published;
- an owner and next action are assigned.

## 5. Provenance Requirements

Every artifact must answer:

- Where is the authoritative source?
- Who created or changed it?
- When was it created or last changed?
- Which source system observed the change?
- Which version, revision, commit, or release is being registered?
- How does the source join to the D1 artifact ID?

### Drive-backed artifacts

Record, when available:

- Drive file ID;
- view URL;
- MIME type;
- owner;
- modified timestamp;
- revision marker;
- D1 artifact ID.

The source document remains in Drive. D1 stores pointers and coordination metadata.

### GitHub-backed artifacts

Record, when available:

- repository;
- canonical path;
- commit SHA, release, or deployment ID;
- author;
- occurred-at timestamp;
- changed paths;
- D1 artifact ID.

GitHub remains the build log. D1 must not store full diffs or repository snapshots.

### Mixed-source artifacts

Some artifacts have Drive knowledge and GitHub implementations. Register one stable identity or
explicitly related representation records, then attach both provenance streams.

Examples:

- a Canon may have a Human source in Drive and Machine schema in GitHub;
- Research may have a Drive source and a generated HTML view in GitHub;
- a Publication may have a Drive editorial source and GitHub/CMS publication activity.

### Provenance conflicts

If Drive, GitHub, and D1 disagree:

- do not silently choose one source;
- preserve each observation;
- retain the current D1 registry state until reviewed;
- flag source freshness or contradiction in Signal;
- require a steward or owner to reconcile the record.

## 6. Update Existing or Create New?

Use the existing artifact ID when the artifact retains the same governed identity.

### Update the existing artifact when:

- the title or description is clarified without changing purpose;
- the owner changes;
- the internal route changes;
- source URLs or repository paths change;
- metadata is completed or corrected;
- evidence status or review status changes;
- lifecycle advances or regresses;
- a new Drive revision or GitHub commit updates the same artifact;
- a compatible minor version preserves the same authority and scope;
- relationships or H2 environment links are corrected;
- a representation is revised without becoming an independently governed representation.

### Create a new artifact when:

- the purpose, scope, or principal claim materially changes;
- the primary taxonomy type changes because the new item is substantively different;
- a new Canon version replaces prior normative meaning;
- a fork must remain independently governed;
- a new publication edition must preserve the prior issued version;
- a validation has a distinct subject, method, date, or result;
- evidence has independent provenance and must support multiple subjects;
- implementation has separate ownership, lifecycle, validation, or deployment identity;
- an archived artifact is resumed as a new governed version;
- audit history requires both old and new records to remain independently reviewable.

### Version and representation rule

A new file does not necessarily mean a new artifact. A new artifact does not necessarily require a
new file.

Human, Developer, and Machine Canon representations may be:

- separate artifact records when each has independent version, owner, review, or lifecycle; or
- one artifact with representation metadata when they are governed together.

Whichever model is used, the representation relationships must remain explicit and stable.

### Supersession

When a new artifact replaces an older artifact:

1. register the new artifact;
2. link it with `supersedes`;
3. archive the prior artifact;
4. preserve prior provenance and evidence;
5. review evidence inheritance explicitly;
6. update current routes without erasing historical routes or references.

## 7. Evidence Inheritance

Evidence does not automatically inherit merely because:

- a new version has a similar title;
- a source file was copied;
- an artifact supersedes another;
- the same implementation is deployed elsewhere;
- one H2 environment validated the artifact;
- the new artifact is derived from a validated artifact.

### Evidence may carry forward only when:

- the evidence subject remains materially unchanged;
- the relevant claims remain unchanged;
- the evidence method is still applicable;
- the source and integrity provenance remain valid;
- the artifact version difference is reviewed;
- environment scope remains the same;
- a reviewer records the inheritance decision;
- the relationship points to the original Evidence artifact rather than duplicating it.

### Evidence must not inherit when:

- normative Canon meaning changes;
- implementation behavior affecting the tested scope changes;
- the validation method no longer applies;
- the source version cannot be matched;
- evidence provenance is missing;
- evidence is environment-specific and the target environment differs;
- contradictory or newer evidence invalidates the earlier result;
- the earlier evidence was partial, pending, or explicitly limited.

### Environment inheritance

Validation in:

- AMMi / APE does not imply SVE or Foundation validation;
- SVE does not imply AMMi / APE or Foundation validation;
- Foundation does not imply AMMi / APE or SVE validation.

Evidence may relate to several environments only when it was actually produced, observed, or
reviewed across those environments.

### Inherited evidence representation

D1 should preserve:

- the original Evidence artifact ID;
- the new subject relationship;
- inheritance reviewer;
- inheritance date;
- scope/limitations note;
- environment scope;
- whether revalidation is required.

Signal should label inherited evidence and distinguish it from evidence produced directly for the
current version.

## 8. Signal Object Generation

Signal Objects are generated only for D1-registered artifacts.

### Assembly rule

For each registered artifact:

1. D1 provides stable identity, taxonomy, state, lifecycle, owner, version, routes, relationships,
   evidence status, and H2 environment links.
2. The Drive adapter joins knowledge references by artifact ID.
3. The GitHub adapter joins build activity by artifact ID.
4. The assembler preserves source provenance.
5. Internal Signal derives Current, Evidence, Gaps, and Movement.

### Unregistered observations

Unlinked Drive files and GitHub activity:

- remain candidate or orphan observations;
- may appear in an ingestion review queue;
- do not create Signal Objects;
- do not affect active artifact counts;
- do not silently update a registered artifact;
- require an owner or steward to associate or register them.

### Signal completeness checks

Registration rules allow Signal to identify:

- registered artifacts with unresolved source pointers;
- duplicate or ambiguous identities;
- missing owners or versions;
- invalid taxonomy classification;
- missing required relationships;
- evidence that cannot be inherited;
- environment values outside the H2 set;
- source activity newer than registry review;
- archived artifacts without replacements;
- implementations without Canon/Decision links;
- Validation artifacts without subjects, methods, environments, or Evidence.

Signal reports these conditions. It does not correct the registry.

## 9. Source Interaction During Registration

### Drive-first registration

Used for Canons, Research, Validation, Evidence, Decisions, and publication sources.

```text
Drive source created
  -> owner proposes registration
  -> steward checks identity and provenance
  -> D1 artifact ID assigned
  -> Drive reference linked to artifact ID
  -> Signal Object becomes eligible for assembly
```

### GitHub-first registration

Used for Implementations requiring independent governance.

```text
GitHub component/activity exists
  -> owner determines whether it is activity or an artifact
  -> steward checks identity, scope, and Canon/Decision relationship
  -> D1 artifact ID assigned
  -> repository/path/commit linked
  -> Signal Object becomes eligible for assembly
```

### Mixed-source registration

Used when knowledge and implementation are both material.

```text
Drive source + GitHub implementation
  -> identify one governed artifact or related representation artifacts
  -> assign D1 identity
  -> link both provenance streams
  -> record relationship and precedence
  -> assemble one coherent Signal reading
```

### Source adapters

Future adapters may:

- discover candidate files or activity;
- normalize source metadata;
- suggest matches to existing artifact IDs;
- report changed or unlinked observations;
- enrich registered Signal Objects.

Adapters must not:

- assign final artifact IDs;
- create D1 artifacts without a governed registration action;
- advance lifecycle automatically;
- approve validation or publication;
- create new H2 environments;
- infer evidence inheritance.

## Fixed H2 Environment Rules

The only validation environments are:

- AMMi / APE
- SVE
- Foundation

Allowed registry relationship meanings:

- `applies_to`
- `produces_evidence`
- `validated_in`

Rules:

1. No other environment may be registered.
2. Technical contexts such as Android, web, production, staging, or mobile are not H2 environments.
3. Empty environment linkage is valid for global or administrative artifacts.
4. Validation and Evidence normally require at least one H2 link unless explicitly
   architecture-wide.
5. Environment links must reflect actual scope, not intended future use.
6. Evidence and validation do not inherit across environments.

## Registration Workflow

### Step 1: Propose

The proposer supplies:

- proposed title and taxonomy type;
- purpose/scope;
- owner;
- source pointer;
- version;
- provenance;
- relationships;
- H2 environment scope;
- evidence and review status.

### Step 2: Search

The registry steward searches D1 for:

- same title or slug;
- same source pointer;
- same canon/tool/component;
- same Drive file ID;
- same repository/path;
- prior or archived versions;
- possible representation siblings.

If identity already exists, use the Update Workflow.

### Step 3: Classify

Confirm:

- one primary taxonomy type;
- concrete representation/file type;
- whether the item is an artifact or source activity;
- required type-specific metadata;
- initial lifecycle stage.

### Step 4: Verify provenance

Confirm authoritative source, owner/author, timestamp, version/revision, and source-system
identifier.

### Step 5: Define relationships

Link required subjects, canons, decisions, implementations, evidence, source artifacts, and
supersession chains.

### Step 6: Validate environment scope

Use only AMMi / APE, SVE, and Foundation. Record no environment when the artifact is global.

### Step 7: Register in D1

The authorized steward:

- assigns the stable artifact ID;
- writes the registry record;
- records initial lifecycle, review, and evidence state;
- records source pointers and relationships;
- records the registrar and timestamp.

### Step 8: Confirm assembly

Confirm the registered artifact:

- can be read from D1;
- joins to intended Drive/GitHub observations;
- produces one Signal Object;
- exposes unresolved gaps honestly;
- does not duplicate another artifact.

## Update Workflow

1. Identify the stable artifact ID.
2. Confirm the change belongs to the same governed identity.
3. Read the latest Drive and GitHub source observations.
4. Record changed fields, source version, author, and timestamp.
5. Reassess taxonomy only if purpose changed.
6. Reassess relationships and H2 environment scope.
7. Reassess evidence inheritance and validation freshness.
8. Update D1 without replacing source history.
9. Preserve prior review, evidence, and lifecycle facts.
10. Let Signal report the new movement and any revalidation gaps.

If the change materially alters identity or normative meaning, stop and use new registration plus
supersession.

## Validation Workflow

1. Confirm the subject is already registered.
2. Register the Validation artifact if it has independent identity.
3. Identify method, evaluator, date, criteria, and subject version.
4. Link supporting Evidence artifact IDs.
5. Link only the actual H2 `validated_in` environments.
6. Record result, limitations, expiry, and remediation.
7. Review whether prior evidence may carry forward.
8. Update D1 review/evidence/lifecycle coordination state.
9. Preserve newer GitHub or Drive activity as freshness warnings.
10. Signal displays validation scope and gaps but does not approve the result.

An unregistered subject cannot become Validated through Signal.

## Deprecation Workflow

Deprecation means an artifact remains available but should no longer be selected for new use.
Archival is the terminal lifecycle state.

1. Identify artifact ID and current dependents.
2. Record deprecation reason, authority, and effective date.
3. Identify replacement or planned replacement.
4. Add `supersedes`/replacement relationships where applicable.
5. Notify owners of dependent artifacts.
6. Retain Drive and GitHub source history.
7. Prevent new evidence from being interpreted as approval for continued use.
8. Archive when the artifact is no longer current.
9. Preserve internal routes or redirects needed for audit history.
10. Signal shows deprecated/archived state, replacement, and unresolved dependency risks.

Never delete a registered artifact merely because it is deprecated or superseded.

## Examples

## SEC Canon

Qualifies as a Canon because it defines authoritative meaning and behavior.

Registration approach:

- register stable SEC Canon identity;
- register or relate Human PDF/source DOCX, Developer toolkit/YAML, and Machine schema;
- link Drive provenance for human sources;
- link GitHub provenance for toolkit/schema changes;
- record version, authority, evidence state, and applicable H2 environments.

Update existing SEC records for compatible revisions. Create a new version/artifact and supersede
the old one when normative meaning or compatibility changes materially.

Validation evidence from SVE does not automatically apply to AMMi / APE or Foundation.

## CBC Canon

CBC qualifies as a Canon even when incomplete.

Registration must not claim Active or Validated merely because files exist. Register explicit
representation gaps, evidence state, owner, and next action.

Update the existing CBC identity as missing metadata or compatible representations are completed.
Create a new artifact only for materially changed normative scope or an independently governed
version.

## CTS Audit

CTS Audit qualifies primarily as Validation.

Required registration data:

- subject canon/artifact IDs;
- audit method and criteria;
- evaluator;
- audit date;
- findings/result;
- linked evidence;
- relevant AMMi / APE and Foundation scope, where applicable.

A later audit with a new date, evidence set, and result should normally be a new Validation
artifact linked to the prior audit, not an overwrite.

## DALE Research Documentation

Qualifies as Research.

The Drive document is the knowledge source. The HTML reading copy and GitHub change history are
representations/activity, not separate research identities unless governed independently.

Update the existing artifact for ordinary revisions. Create a new artifact for a separately titled
research work, materially distinct research scope, or formally issued edition that must preserve
the prior version.

## Internal Signal

Qualifies as an Implementation because it is an operational authenticated reader.

Registration is anchored in D1. GitHub provides source and build movement. Drive may provide design
or explanatory knowledge.

Routine commits update Internal Signal activity. They do not create new artifacts. A replacement
application with independent ownership, route, or lifecycle would be newly registered and linked by
`supersedes`.

Internal Signal can assemble its own Signal Object only because its D1 record already exists. It
cannot register or approve itself.

## Android OAuth Fix

Normally does not qualify as an independent artifact. It is GitHub build activity and Evidence for
the authentication Implementation.

Register it independently only if it requires:

- distinct ownership;
- separate lifecycle;
- review and validation status;
- auditor-facing evidence tracking;
- independent deployment or rollback identity.

Android is not an H2 environment. Evidence may include commit, tests, callback verification, and
deployment reference without any AMMi / APE, SVE, or Foundation link.

## Blog CMS

Qualifies as an Implementation with a stable operational identity.

GitHub changes update the existing CMS artifact. Individual articles are Publication artifacts,
not new CMS Implementations. The CMS D1 application record must remain distinct from article
content storage.

Routine editor changes, deployment notes, and tests are activity/evidence unless independently
governed.

## Registration Decision Checklist

Before creating a D1 artifact record, answer:

1. Is this durable and independently governable?
2. Does it have one primary taxonomy type?
3. Does an artifact with the same identity already exist?
4. Is this a source observation or activity that belongs to an existing artifact?
5. Is an owner accountable?
6. Is authoritative provenance traceable?
7. Is a new ID necessary for audit, lifecycle, version, or relationship reasons?
8. Are required relationships known?
9. Are environment links limited to AMMi / APE, SVE, and Foundation?
10. Is evidence status explicit?
11. Can D1 represent the identity without storing source content?
12. Will registration create exactly one coherent Signal Object?

If these questions cannot be answered, retain the item as a candidate observation and do not
register it yet.

