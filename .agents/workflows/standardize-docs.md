---
description: Standardize documentation in docs/ according to the 7 Pillars of AI-Friendly Documentation.
---

# Standardize Documentation (7 Pillars Standard)

Convert narrative, ad-hoc, or non-standard documentation under `docs/` into AI-friendly documentation compliant with the **7 Pillars Standard** ([ai-friendly-docs.md](file:///d:/dev/arostech-hub/.agents/rules/ai-friendly-docs.md)) derived from [AI-Friendly Documentation Framework Guide](file:///C:/Users/Windows%2010/.gemini/antigravity-ide/brain/db88ba16-1830-4dc5-b51d-f5ddef2d7aa0/ai_friendly_doc_framework_guide.md).

---

## 🏛️ Mapping of the 7 Pillars

| Pillar | Focus | Step in Workflow |
|---|---|---|
| **Pillar 1** | Machine-Readable YAML Frontmatter | Step 2 |
| **Pillar 2** | OpenSpec Behavioral Contracts (`Requirement:` & `Scenario:`) | Step 3 |
| **Pillar 3** | RFC 2119 Normative Precision (`SHALL`, `MUST`, `SHOULD`) | Step 3 |
| **Pillar 4** | Declarative Code & Zod/Prisma Schemas | Step 4 |
| **Pillar 5** | Graphify Knowledge Graph Anchoring & Community Directives | Step 1 & Step 4 |
| **Pillar 6** | OpenSpec SDD Lifecycle & Spec Deltas (`ADDED`/`MODIFIED`/`REMOVED`) | Step 5 |
| **Pillar 7** | Anchored `file:///` URIs & Zero Redundancy Invariants | Step 6 |

---

## Step 1: Scan & Audit Document (Pillar 5 - Graph Exploration)

1. Identify the target document path under `docs/` (e.g. `docs/strategy/prd/00-overview-and-goals.md`).
2. Run the validator script to identify existing gaps against the 7 Pillars:
   ```bash
   node .agents/scripts/validate-ai-docs.cjs <target-doc-path>
   ```
3. Kueri sub-graf pengetahuan via Graphify CLI to identify God Nodes and community boundaries:
   ```bash
   graphify query "<doc-topic>"
   ```

---

## Step 2: Inject Machine-Readable YAML Frontmatter (Pillar 1)

Add or update the YAML Frontmatter at the very top of the file (lines 1-15):
```yaml
---
id: DOC-ID-001
title: Document Title
version: 1.0.0
status: LOCKED_BASELINE
architecture: Hub-and-Spoke Greenfield
target_domain: dayaberkah.id
openspec_change_id: "2026-08-12-universal-rfq-greenfield"
graphify_community: "community_prd"
authoritative_references:
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md"
  routing_lifecycle: "file:///d:/dev/arostech-hub/docs/system/architecture/execution-lifecycle.md"
---
```

---

## Step 3: Refactor Requirements & Normative Precision (Pillar 2 & 3)

1. Convert vague narrative paragraphs into `### Requirement:` sections.
2. Enforce RFC 2119 normative precision keywords (`SHALL`, `MUST`, `MUST NOT`, `SHOULD`, `MAY`).
3. Write testable BDD scenarios for each requirement:
   ```markdown
   ### Requirement: REQ-001-FEATURE-NAME
   The system SHALL validate...

   #### Scenario: Valid Submission Flow
   - GIVEN user has provided valid contact details
   - AND cart contains at least 1 item with required unitOfMeasure
   - WHEN request hits POST /api/rfq
   - THEN API SHALL respond with HTTP 201 Created
   ```

---

## Step 4: Add Declarative Schemas & Graphify Anchors (Pillar 4 & 5)

1. Replace loose text descriptions of data schemas with explicit TypeScript interfaces, Zod schemas, or Prisma SQL definitions.
2. Link section to Graphify Node ID (`doc:docs/path/to/file.md`) and reference God Nodes (`RfqB2BForm.tsx`, `execution-lifecycle.md`).

---

## Step 5: Map OpenSpec SDD Spec Deltas (Pillar 6)

Align documentation lifecycle with OpenSpec change lifecycle (`proposal.md` -> `specs/` -> `design.md` -> `tasks.md`). When documenting changes, use explicit Delta headers:
```markdown
## ADDED Requirements
- Description of new features introduced.

## MODIFIED Requirements
- Description of changed behaviors with complete new scenario.

## REMOVED Requirements
- Description of deprecated features with explicit Reason & Migration path.
```

---

## Step 6: Anchor URIs & Enforce Zero Redundancy (Pillar 7)

1. Convert all local file links to valid `file:///` URIs with exact line anchors:
   - `[Config Schema](file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md#L10-L45)`
2. Eliminate redundant explanations that duplicate baseline specifications already documented in authoritative reference files.

---

## Step 7: Automated Verification & Graph Sync

1. Run the validator script to confirm zero issues:
   ```bash
   node .agents/scripts/validate-ai-docs.cjs <target-doc-path>
   ```
2. Update the Graphify knowledge graph AST:
   ```bash
   graphify update .
   ```
