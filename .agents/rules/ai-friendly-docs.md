---
trigger: model_decision
description: 7-Pillars AI-Friendly Documentation standard for all docs/ artifacts. Enforced at Layer 1 (HLA Alignment) and Layer 8 (Post-Archive Documentation Sync).
---

# AI-Friendly Documentation Rule (7 Pillars Standard)

> **Scope**: All documentation files under `docs/` in the `arostech-hub` repository.
> **Standard**: AI-Agent & LLM-Optimized Documentation Baseline v4.0.0
> **Workflow context**: This rule enforces **Layer 1 (HLA Alignment)** standards for `docs/`. Apply at Layer 8 post-archive when syncing updated documentation.

---

## Mandate

All Markdown documentation created or modified within `docs/` MUST conform to the **7 Pillars of AI-Friendly Documentation**. Documents failing these invariants impede agent parsing, cause context window bloat, or introduce behavioral ambiguity.

---

## The 7 Pillars Breakdown

### 1. Machine-Readable YAML Frontmatter
Every Markdown document in `docs/` MUST begin with a YAML Frontmatter block containing:
```yaml
---
id: DOC-ID-001
title: Descriptive Document Title
version: 1.0.0
status: DRAFT | REVIEW | LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_name"
authoritative_references:
  config_schema: "file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md"
  api_reference: "file:///d:/dev/arostech-hub/docs/system/api/reference.md"
---
```

### 2. OpenSpec Behavioral Contracts
Functional specifications MUST NOT be written as vague prose paragraphs. They MUST be formatted as testable contracts using OpenSpec BDD conventions:
```markdown
### Requirement: REQ-001-FEATURE-NAME
The system SHALL validate...

#### Scenario: Successful Flow
- GIVEN [initial condition]
- AND [additional context]
- WHEN [action/trigger occurs]
- THEN [expected behavior/response]
```

### 3. RFC 2119 Normative Precision
Technical constraints and specifications MUST use RFC 2119 keywords in uppercase:
- `SHALL` / `MUST`: Absolute requirement.
- `MUST NOT`: Absolute prohibition.
- `SHOULD` / `SHOULD NOT`: Strong recommendation.
- `MAY` / `OPTIONAL`: Optional choice.

### 4. Declarative Machine Code & Schemas
Include concrete TypeScript interfaces, Zod schemas, or Prisma definitions instead of describing data models narratively.

### 5. Graphify Knowledge Graph Anchoring
Link documentation sections directly to Graphify Node IDs (e.g. `doc:docs/strategy/prd.md`) and God Nodes. Agents SHOULD use GraphRAG tools (`graphify query`, `graphify path`) before raw file dumping.

After any `docs/` modification, run:
```bash
graphify update .  # sync AST — no API cost
```
Then verify node IDs are resolvable: `graphify explain "doc:<path>"`

### 6. OpenSpec SDD Lifecycle Mapping
Align document changes with OpenSpec lifecycle artifacts (`proposal.md` -> `specs/` -> `design.md` -> `tasks.md`). Use explicit Delta headers (`## ADDED Requirements`, `## MODIFIED Requirements`, `## REMOVED Requirements`).

### 7. Anchored URIs & Zero Redundancy Invariants
- All local file links MUST use valid `file:///` URIs with exact line anchors (e.g. `[config](file:///d:/dev/arostech-hub/docs/system/api/configuration-schema.md#L10-L40)`).
- Never duplicate baseline architectural explanations documented elsewhere; reference the Single Source of Truth instead.
