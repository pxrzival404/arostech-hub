---
description: "Generate a lean, problem-first PRD and hand off to /plan for implementation planning."
argument-hint: "[product/feature idea] (blank = start with questions)"
---

# PRD Command

Produces a **Product Requirements Document** — the requirements-phase artifact of the SDLC. Captures *what* must be true for success and *why*, and stops before *how*. Implementation decomposition is delegated to `/plan`.

**Input**: `$ARGUMENTS`

## Scope of this command

| This command does | This command does NOT do |
|---|---|
| Frame the problem and users | Design the architecture |
| Capture success criteria and scope | Pick files or write patterns |
| List open questions and risks | Enumerate implementation tasks |
| Write Antigravity PRD artifact (`prd.md`) | Produce an implementation plan — that's `/plan` |

If you find yourself writing implementation detail, stop and cut it. It belongs in `/plan`.

**Anti-fluff rule**: When information is missing, write `TBD — needs validation via {method}`. Never invent plausible-sounding requirements.

## Workflow

Four phases. Each phase is a single gate — ask the questions, wait for the user, then move on. No nested loops, no parallel research ceremony.

### Phase 1 — FRAME

If `$ARGUMENTS` is empty, ask:

> What do you want to build? One or two sentences.

If provided, restate in one sentence and ask:

> I understand: *{restated}*. Correct, or should I adjust?

Then ask the framing questions in a single set:

> 1. **Who** has this problem? (specific role or segment)
> 2. **What** is the observable pain? (describe behavior, not assumed needs)
> 3. **Why** can't they solve it with what exists today?
> 4. **Why now?** — what changed that makes this worth doing?

Wait for the user. Do not proceed without answers (or explicit "skip").

### Phase 2 — GROUND

Ask for evidence. This is the shortest phase and the most load-bearing:

> What evidence do you have that this problem is real and worth solving? (user quotes, support tickets, metrics, observed behavior, failed workarounds — anything concrete)

If the user has none, record the PRD's Evidence section as `Assumption — needs validation via {user research | analytics | prototype}`. This keeps the PRD honest.

### Phase 3 — DECIDE

Scope and hypothesis in a single set:

> 1. **Hypothesis** — Complete: *We believe **{capability}** will **{solve problem}** for **{users}**. We'll know we're right when **{measurable outcome}**.*
> 2. **MVP** — The minimum needed to test the hypothesis?
> 3. **Out of scope** — What are you explicitly **not** building (even if users ask)?
> 4. **Open questions** — Uncertainties that could change the approach?

Wait for responses.

### Phase 4 — GENERATE & HAND OFF

Generate the PRD as an Antigravity markdown artifact (`<appDataDir>/brain/<conversation-id>/prd.md` or `{name}_prd.md`):

#### PRD Template

```markdown
# {Product / Feature Name}

## Problem
{2–3 sentences: who has what problem, and what's the cost of leaving it unsolved?}

## Evidence
- {User quote, data point, or observation}
- {OR: "Assumption — needs validation via {method}"}

## Target Users
- **Primary**: {Specific role/persona, context, and what triggers the pain}
- **Not for**: {Who this explicitly excludes}

## Hypothesis & Measurable Outcome
{We believe <capability> will <solve problem> for <users>. Measured by <outcome>.}

## Scope
### In Scope (MVP)
- {item 1}
- {item 2}

### Out of Scope (Explicitly Excluded)
- {item 1}
- {item 2}

## Open Questions & Risks
- [ ] {Question / risk 1}
- [ ] {Question / risk 2}

---
*Status: DRAFT — requirements only. Implementation planning pending via /plan or /opsx-propose.*
```

#### Report to user

```
PRD artifact created: <appDataDir>/brain/<conversation-id>/prd.md

Problem:    {one line}
Hypothesis: {one line}
MVP:        {one line}

Validation status:
  Problem  {validated | assumption}
  Users    {concrete | generic — refine}
  Metrics  {defined | TBD}

Open questions: {count}

Next step: /plan (or /opsx-propose for Layer 3 SDD)
  → /plan will consume the PRD artifact and produce an implementation_plan.md artifact.
```

## Integration

- `/plan <prd-path>` — consume the PRD and produce an implementation plan for the next pending milestone.
- `tdd-workflow` skill — implement the plan test-first.
- `/pr` — open a PR that references the PRD and plan.

## Success criteria

- **PROBLEM_CLEAR**: problem is specific and evidenced (or flagged as assumption).
- **USER_CONCRETE**: primary user is a specific role, not "users".
- **HYPOTHESIS_TESTABLE**: measurable outcome included.
- **SCOPE_BOUNDED**: explicit MVP and explicit out-of-scope.
- **NO_IMPLEMENTATION_DETAIL**: file paths, libraries, or task breakdowns are absent — if they appeared, move them to the `/plan` step.
