# DALE Internal Information Architecture

## Purpose

The internal site is organized around one question:

> What is the current state of the DALE build, and what evidence supports that state?

Internal Signal is the home experience and the reader across internal sources. It does not own
knowledge, documents, evidence files, build history, or registry records.

## Target IA

```text
/internal/
  signal/
  canons/
  research/
  validation/
  developer/
  audit/
```

The target IA separates:

- **Signal**: current build reading
- **Canons**: authoritative representations and completeness
- **Research**: knowledge and analysis
- **Validation**: evidence organized by H2 environment
- **Developer**: implementation and runtime material
- **Audit**: reviewer-facing registers and review pathways

## Current compatibility routes

Routes are not renamed in this phase.

| IA section | Current route | Migration note |
| --- | --- | --- |
| Signal | `/internal/signal/` | Final route |
| Canons | `/internal/canons/` | Final route; now includes architectural, tool, and master canons |
| Research | `/internal/docs/` | Retained until migration to `/internal/research/` |
| Validation | `/internal/validation/` | Final route |
| Developer | `/internal/developer/` | Final route |
| Audit | `/internal/docs/audit/` | Retained under Research until migration to `/internal/audit/` |
| Tool files | `/internal/tools/` | Compatibility index; content is represented through Canons |

`/internal/` immediately enters `/internal/signal/`, making Internal Signal the authenticated home
without changing its visual design.

The later route migration must preserve redirects from `/internal/docs/` and
`/internal/docs/audit/`. It is intentionally outside this phase because auth and routes are not
being changed here.

## Inventory

The inventory contains 36 internal files after adding the audit index and developer status
template.

### Home and Signal

- `internal/index.html`
- `internal/signal/index.html`

### Architectural Canons

- ARA toolkit, YAML specification, and JSON schema
- ECOA toolkit, YAML specification, and JSON schema
- CTS / URT JSON schema
- Runner JSON schema

### Tool Canons

- consolidated `DALE_Tools_Canons_V1.xlsx`
- CoS toolkit, YAML specification, JSON schema, and canonical DOCX
- SEC toolkit, YAML specification, JSON schema, canonical DOCX, and Human Canon PDF
- CBC toolkit, YAML specification, and JSON schema

### Master Canon Output

- toolkit HTML
- YAML specification
- JSON schema

### Research

- DALE Research Documentation
- CTS Coherence Audit
- Research index
- Audit workspace index

### Validation

- validation index organized by AMMi / APE, SVE, and Foundation

### Developer

- developer index
- authentication/runtime setup notes
- standard status update template

### Path Inventory

```text
internal/index.html
internal/signal/index.html

internal/canons/index.html
internal/canons/Architectural Canons/ARA/ara_toolkit.html
internal/canons/Architectural Canons/ARA/ara_spec.yaml
internal/canons/Architectural Canons/ARA/ara_schema.json
internal/canons/Architectural Canons/CTS/cts_urt_schema.json
internal/canons/Architectural Canons/ECOA/ecoa_toolkit.html
internal/canons/Architectural Canons/ECOA/ecoa_spec.yaml
internal/canons/Architectural Canons/ECOA/ecoa_schema.json
internal/canons/Architectural Canons/Runner/runner_schema.json

internal/tools/index.html
internal/tools/Tools Canon/DALE_Tools_Canons_V1.xlsx
internal/tools/Tools Canon/CBC/cbc_toolkit.html
internal/tools/Tools Canon/CBC/cbc_spec.yaml
internal/tools/Tools Canon/CBC/cbc_schema.json
internal/tools/Tools Canon/Cos/cos_mapping_toolkit.html
internal/tools/Tools Canon/Cos/cos_mapping_spec.yaml
internal/tools/Tools Canon/Cos/cos_mapping_schema.json
internal/tools/Tools Canon/Cos/CoS_Mapping_Tool_Canonical_Spec .docx
internal/tools/Tools Canon/SEC/sec_toolkit.html
internal/tools/Tools Canon/SEC/sec_spec.yaml
internal/tools/Tools Canon/SEC/sec_schema.json
internal/tools/Tools Canon/SEC/SEC_Canonical_Spec.docx
internal/tools/Tools Canon/SEC/SEC HCanon PDF.pdf

internal/developer/index.html
internal/developer/auth-setup.md
internal/developer/status-update-template.md
internal/developer/Master Canon Output/master_canon_output_toolkit.html
internal/developer/Master Canon Output/master_canon_output_spec.yaml
internal/developer/Master Canon Output/master_canon_output_schema.json

internal/docs/index.html
internal/docs/dale_research_doc.html
internal/docs/CTS_Coherence_Audit.md
internal/docs/audit/index.html

internal/validation/index.html
```

## Orphan analysis

No existing internal file is deleted or moved. All current assets are reachable through at least
one navigation surface:

- architectural canon files are linked from the Canon Register;
- tool canon files remain linked from `/internal/tools/`, with their principal Human, Developer,
  and Machine representations also linked from the Canon Register;
- Master Canon Output files are linked from both Canons and Developer;
- research files are linked from Research, Validation, and Audit;
- authentication notes and the status template are linked from Developer;
- Signal is reachable from `/internal/` and every main section.

The incomplete items shown in the Canon Register are representation gaps, not orphaned files.
Examples include missing status files, evidence links, change logs, and human/developer
representations for CTS and Runner.

## Canon IA

The Canon Register combines:

- Architectural Canons: ARA, CTS / URT, ECOA, Runner
- Tool Canons: CoS, SEC, CBC
- Master Canon Output

Each canon is evaluated against:

```text
Canon
├── Human
├── Developer
├── Machine
├── Status
├── Evidence
└── Change Log
```

Existing artifacts are linked in place. Missing representations are visibly marked as pending
rather than hidden or inferred.

Human means a readable canon, source document, PDF, or toolkit. Developer means an implementation
toolkit or formal specification. Machine means a schema or other machine-readable contract.

## Research IA

Research is knowledge. Its current compatibility route exposes:

- DALE Research Documentation
- CTS Coherence Audit
- Validation Research
- a placeholder for future publications
- the auditor workspace

Future Drive integration should attach source and publication references through stable artifact
IDs. Research pages should not become a second document database.

## Validation IA

Validation is evidence. The H2 environments are fixed:

- AMMi / APE
- SVE
- Foundation

No fourth environment or free-text environment category is introduced. Future evidence packs,
notes, and observations should be registered against one or more of these three D1 environment
records.

## Developer IA

Developer contains:

- Architecture
- Status Updates
- Implementation Notes
- Runtime Notes

The standard status template is:

```markdown
# Status Update

## Component
## Date
## Owner
## Current State
## What Changed
## Evidence
## Risks
## Next Action
```

These status files are future inputs to the GitHub build adapter. They remain build activity, not
D1 document content.

## Audit IA

The auditor pathway answers:

- What exists?
- What is active?
- What is incomplete?
- What evidence exists?
- What changed?

The initial workspace exposes:

- Evidence Register
- Review Log placeholder
- Version Register
- Artifact Registry / Signal reading

The recommended review sequence is Canons, Validation, Signal, then Developer. The formal Review
Log and Version Register will later read registry and source metadata rather than duplicate it in
HTML.

## How sections contribute Signal Objects

### Canons

Contributes artifact identity, representation completeness, canon/tool association, version,
machine-contract presence, and gaps.

### Research

Contributes knowledge references, audit interpretation, publications, and research provenance.
Google Drive is the future source adapter.

### Validation

Contributes evidence links and environment relationships for AMMi / APE, SVE, and Foundation.

### Developer

Contributes commits, status updates, implementation notes, deployment notes, and runtime movement.
GitHub is the future source adapter.

### Audit

Contributes reviews, findings, evidence disposition, and version observations. These should link
to existing artifact IDs rather than create parallel identities.

### D1 Registry

Contributes stable artifact IDs, current state, status, environment links, evidence state,
relationships, routes, and registry metadata.

### Internal Signal

Reads assembled Signal Objects and derives Current, Evidence, Gaps, and Movement. It does not own
or edit source knowledge.

## Future integration points

The adapter boundaries live under `functions/_lib/internal-signal/`:

- D1 registry adapter
- Google Drive knowledge adapter
- GitHub build adapter
- Signal Object assembler

Future source links should join through `artifact_registry.id`. Drive and GitHub outages should be
shown as provenance or freshness gaps without erasing D1 registry state or the static fallback.
