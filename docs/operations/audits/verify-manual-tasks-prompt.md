---
id: DOC-OPS-AUDIT-VERIFY-PROMPT
title: Manual Tasks Verification Prompt & Checkpoint Suite
version: 4.0.0
status: LOCKED_BASELINE
target_domain: dayaberkah.id
graphify_community: "community_audits"
authoritative_references:
  prd: "file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100"
  developer_fix_guide: "file:///d:/dev/arostech-hub/docs/operations/audits/developer-fix-guide.md#L1-L60"
---

# Manual Tasks Verification Prompt & Checkpoint Suite

> **TL;DR**: Authoritative specification and architectural reference for Manual Tasks Verification Prompt & Checkpoint Suite within the DBSN platform (docs/operations/audits/verify-manual-tasks-prompt.md).


> **Authoritative Baseline Reference**: Automated checkpoint verification prompt for developer manual task compliance, fully aligned with PRD v4.0.0 ([`prd.md`](file:///d:/dev/arostech-hub/docs/strategy/prd/00-overview-and-goals.md#L1-L100)).

---

## 1. Operating Instructions

Copy the prompt block below and paste it into an active execution agent session after completing the manual environment configuration tasks defined in [`developer-fix-guide.md`](file:///d:/dev/arostech-hub/docs/operations/audits/developer-fix-guide.md#L1-L60).

---

```markdown
I have completed all manual environment configuration tasks from file:///d:/dev/arostech-hub/docs/operations/audits/developer-fix-guide.md. Please verify each checkpoint below and report PASS or FAIL status. Do NOT modify any codebase files during this verification.

## Checkpoint Suite

1. `.env.local` Secrets Check: Verify DATABASE_URL, NEXTAUTH_SECRET, SANITY_API_READ_TOKEN, RESEND_API_KEY, and TELEGRAM_BOT_TOKEN are set with valid non-placeholder credentials.
2. Sanity Studio Authentication: Verify Sanity CLI authentication credentials via `pnpm exec sanity check`.
3. Cloudflare Pages Bindings: Verify Cloudflare environment bindings for dayaberkah.id production target.
```

---

## 2. OpenSpec Behavioral Requirements

### Requirement: REQ-OPS-VERIFY-001-PROMPT-VALIDATION
The manual tasks verification prompt SHALL validate environment secret variables without logging or exposing secret plaintext values.

#### Scenario: Verification Execution
- GIVEN an operator executing the manual task verification prompt
- WHEN verifying environment secret variables
- THEN the system MUST report PASS or FAIL status for each variable and truncate secret values in log output.

---

## 3. OpenSpec Delta

## ADDED Requirements
- REQ-OPS-VERIFY-001-PROMPT-VALIDATION: Non-leaking environment secret verification prompt specification.

## MODIFIED Requirements
- Aligned baseline environment secret checks with Ecosystem v4.0.0 standards.

## REMOVED Requirements
- Legacy Vercel secret checks.

---

## 4. Graphify Knowledge Graph Anchoring

- Knowledge Graph Node ID: `doc:docs/operations/audits/verify-manual-tasks-prompt.md`
- Graphify Community: `community_audits`
- Master Reference: [`developer-fix-guide.md`](file:///d:/dev/arostech-hub/docs/operations/audits/developer-fix-guide.md#L1-L60)
