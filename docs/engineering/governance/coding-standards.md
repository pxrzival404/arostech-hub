---
id: DOC-ENG-GOV-CODING
title: Engineering Coding Standards & Style Guide
version: 4.0.0
status: LOCKED_BASELINE
graphify_community: "community_governance"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  ai_rules: "file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60"
---

# Engineering Coding Standards & Style Guide

> **TL;DR**: Authoritative specification and architectural reference for Engineering Coding Standards & Style Guide within the DBSN platform (docs/engineering/governance/coding-standards.md).


> **Authoritative Baseline Reference**: Coding standards, style guidelines, and design token conventions for developers and AI agents working on the **DBSN Centralized Digital Ecosystem**, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)).

---

## 1. TypeScript Standards (v5.7+)

1. **Strict Typing Mandate**: Developers and AI agents MUST NOT use `any` types. Explicit TypeScript `interface` or `type` definitions SHALL be provided for all component props, data models, and API responses.
2. **Immutability Invariant**: State modifications MUST favor immutable patterns (`readonly` arrays, object spread) over in-place mutations.
3. **Naming Conventions**:
   - `PascalCase` for React components, type interfaces, and Zod schemas.
   - `camelCase` for functions, custom hooks, and variable identifiers.
   - `kebab-case` for file names and route directories.

```typescript
// Declarative TypeScript contract sample
export interface ProductSpec {
  readonly id: string;
  readonly title: string;
  readonly spokeSegment: 'pju' | 'solarcell' | 'alatpetir' | 'baterai';
  readonly isIndexable: boolean;
}
```

---

## 2. React 19 & Next.js 16 Patterns

1. **Server Components First**: React Server Components (RSC) SHALL be the default for data fetching and static page rendering. Interactive client-side components MUST explicitly declare `'use client'`.
2. **Custom Hooks Isolation**: Stateful UI logic MUST be extracted into reusable custom hooks inside `src/hooks/`.
3. **Error Boundaries**: Data fetching routines MUST handle errors gracefully via `try/catch` blocks and expose standard error envelopes.

---

## 3. Styling & Design Tokens (Tailwind CSS v4)

1. **Color Spaces**: UI styling SHALL use Tailwind v4 design tokens and OKLCH color palettes. Developers MUST NOT use raw hex values (`#ff0000`) inline.
2. **Responsive Breakpoints**: Layouts MUST be designed mobile-first using Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
3. **Accessibility (a11y)**: Components SHALL use Radix UI primitives with full `aria-*` semantics.

---

## 4. OpenSpec Behavioral Requirements

### Requirement: REQ-ENG-CODING-001-STRICT-TYPING
All production code in `src/` SHALL strictly avoid `any` types and validate input parameters at system boundaries using Zod.

#### Scenario: Type Safety & Validation Verification
- GIVEN a new or modified TypeScript function or API route handler
- WHEN compiled with `pnpm lint` or `npx tsc --noEmit`
- THEN the system SHALL yield zero type errors and zero `any` type warnings.

---

## 5. OpenSpec Delta

## ADDED Requirements
- REQ-ENG-CODING-001-STRICT-TYPING: Strict typing and Zod boundary validation.

## MODIFIED Requirements
- Upgraded coding standards baseline to TypeScript 5.7+, React 19, and Tailwind v4.

## REMOVED Requirements
- Legacy optional typing guidelines.

---

## 6. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/engineering/governance/coding-standards.md`
- Graphify Community: `community_governance`
- Master Governance: [`ai-agent-rules.md`](file:///d:/dev/arostech-hub/docs/engineering/governance/ai-agent-rules.md#L1-L60)
