---
trigger: model_decision
description: Testing requirements, 80% coverage threshold, TDD workflow, test structure AAA pattern, and test naming conventions
---

# Testing Requirements

## Minimum Test Coverage: 80%

Test Types (ALL required):
1. **Unit Tests** - Individual functions, utilities, components
2. **Integration Tests** - API endpoints, database operations
3. **E2E Tests** - Critical user flows (framework chosen per language)

## Test-Driven Development

> **Workflow context**: This rule enforces **Layer 5 (TDD Inner Loop)** of the 8-Layer Workflow.
> SDD Pre-Condition must pass before entering the TDD cycle.
> See [`common-extended-workflow.md`](./common-extended-workflow.md) for the full 8-layer sequence.

## Pre-Condition (SDD Spec Required)

Before entering the TDD cycle, the following MUST be verified:

1. An OpenSpec spec file EXISTS in `openspec/` with GIVEN-WHEN-THEN scenarios for this task
2. The task is listed in `tasks.md` and has passed atomicity gate (single responsibility)
3. Test cases are derived from the spec's WHEN/THEN clauses — not invented independently

**If no spec exists**: Run `/opsx-propose` (Layer 3 SDD) first. Do NOT enter TDD without a spec.
Entering TDD without an OpenSpec behavioral contract is a governance violation per AGENTS.md Section 4.



MANDATORY workflow:
1. Write test first (RED)
2. Run test - it should FAIL
3. Write minimal implementation (GREEN)
4. Run test - it should PASS
5. Refactor (IMPROVE)
6. Verify coverage (80%+)

## Troubleshooting Test Failures

1. Use **tdd-guide** agent
2. Check test isolation
3. Verify mocks are correct
4. Fix implementation, not tests (unless tests are wrong)

## Agent Support

- **tdd-guide** - Use PROACTIVELY for new features, enforces write-tests-first

## Test Structure (AAA Pattern)

Prefer Arrange-Act-Assert structure for tests:

```typescript
test('calculates similarity correctly', () => {
  // Arrange
  const vector1 = [1, 0, 0]
  const vector2 = [0, 1, 0]

  // Act
  const similarity = calculateCosineSimilarity(vector1, vector2)

  // Assert
  expect(similarity).toBe(0)
})
```

### Test Naming

Use descriptive names that explain the behavior under test:

```typescript
test('returns empty array when no markets match query', () => {})
test('throws error when API key is missing', () => {})
test('falls back to substring search when Redis is unavailable', () => {})
```
