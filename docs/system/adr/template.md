---
id: ADR-TEMPLATE-001
title: Architecture Decision Record Template
version: 4.0.0
status: TEMPLATE
target_domain: dayaberkah.id
graphify_community: "community_adr"
authoritative_references:
  adr_index: "file:///d:/dev/arostech-hub/docs/system/adr/README.md#L1-L20"
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd.md#L1-L100"
---

# Architecture Decision Record Template

> **OpenSpec SDD Lifecycle Mapping**: `MODIFIED: 2026-08-12 PRD v4.0.0 Baseline Sync`  
> **Authoritative Baseline Reference**: Canonical template for authoring Architecture Decision Records (ADRs) within the **DBSN Centralized Digital Ecosystem**, complying with PRD v4.0.0 ([`README.md`](file:///d:/dev/arostech-hub/docs/system/adr/README.md#L1-L20)).
> **Graphify Knowledge Graph Anchoring**: Graphify Node ID: `doc:docs/system/adr/template.md`

---

## OpenSpec Delta

- `MODIFIED`: Standardized ADR template with 7-Pillars AI-Friendly Documentation Frontmatter, OpenSpec BDD Requirements, and RFC 2119 precision.

---

## 1. Behavioral Contracts & Requirements

### Requirement: REQ-ADR-TEMPLATE-001 Structural Invariants for Architecture Decision Records
All new ADR documents created under `docs/system/adr/` MUST originate from this template. Each ADR SHALL include valid YAML frontmatter, OpenSpec Delta headers, BDD requirements, RFC 2119 precision, declarative schemas, and anchored `file:///` URIs.

#### Scenario: Authoring New Architecture Decision Record
- GIVEN an architect or engineer proposing a major system architectural decision
- WHEN creating `docs/system/adr/000X-title.md`
- THEN the author MUST populate all sections defined in `AdrRecordSchema`
- AND the document SHALL pass validation via `node .agents/scripts/validate-ai-docs.cjs`.

---

## 2. Declarative ADR Metadata Schema

```typescript
import { z } from "zod";

export const AdrStatusEnum = z.enum([
  "PROPOSED",
  "ACCEPTED",
  "DEPRECATED",
  "SUPERSEDED",
]);

export const AdrRecordSchema = z.object({
  id: z.string().regex(/^ADR-\d{4}$/),
  title: z.string().min(5),
  version: z.string().default("4.0.0"),
  status: AdrStatusEnum,
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deciders: z.array(z.string()).min(1),
  context: z.string().min(20),
  decision: z.string().min(20),
  alternativesConsidered: z.array(
    z.object({
      name: z.string(),
      pros: z.string(),
      cons: z.string(),
      whyNot: z.string(),
    })
  ),
  consequences: z.object({
    positive: z.array(z.string()).min(1),
    negative: z.array(z.string()).min(1),
    risks: z.array(z.string()).min(1),
  }),
});

export type AdrRecord = z.infer<typeof AdrRecordSchema>;
```

---

## 3. ADR Document Content Template

```markdown
# ADR-NNNN: [Decision Title]

**Date**: YYYY-MM-DD
**Status**: PROPOSED | ACCEPTED | DEPRECATED | SUPERSEDED
**Deciders**: [Architect / Tech Lead / Product Owner]

## Context

[2-5 sentences describing the business context, technical constraints, and forces driving this decision]

## Decision

[1-3 sentences stating the decision clearly using RFC 2119 keywords: SHALL, MUST, SHOULD]

## Alternatives Considered

### Alternative 1: [Name]
- **Pros**: [benefits]
- **Cons**: [drawbacks]
- **Why not**: [specific reason rejected]

### Alternative 2: [Name]
- **Pros**: [benefits]
- **Cons**: [drawbacks]
- **Why not**: [specific reason rejected]

## Consequences

### Positive
- [benefit 1]
- [benefit 2]

### Negative & Trade-offs
- [trade-off 1]
- [trade-off 2]

### Risks & Mitigations
- [risk and mitigation strategy]
```
