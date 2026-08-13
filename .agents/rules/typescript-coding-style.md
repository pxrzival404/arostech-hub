---
trigger: glob
globs: "**/*.{ts,js}"
---

# TypeScript/JavaScript Coding Style Standard

This document defines the canonical coding style standard for TypeScript and JavaScript code in `arostech-hub`.

## Core Invariants

### 1. Immutability (CRITICAL)
- **ALWAYS** return new object/array copies, **NEVER** mutate existing state.
- Use object/array spread syntax (`...`) or `Readonly<T>` types.

```typescript
// WRONG: In-place mutation
function updateUser(user: User, name: string): User {
  user.name = name; // MUTATION!
  return user;
}

// CORRECT: Immutable update
function updateUser(user: Readonly<User>, name: string): User {
  return { ...user, name };
}
```

### 2. Core Principles: KISS, DRY, YAGNI
- **KISS**: Reach for the simplest standard library or language feature first.
- **DRY**: Extract repeated logic into focused helpers once repetition occurs in >2 places.
- **YAGNI**: No speculative abstractions, premature generalizations, or unused parameter flags.

### 3. Module & File Boundaries
- **Function Limit**: Keep functions under 50 lines.
- **Module Limit**: Module files target 200–400 lines, maximum 800 lines absolute limit.
- **Organization**: Group by feature or domain, not by generic technical type.

---

## Types and Interfaces

### Public APIs
- Add explicit parameter and return types to all exported functions, utilities, and API methods.
- Let TypeScript infer obvious local variable initializations.
- Extract repeated object shapes into named interfaces or type aliases.

```typescript
interface User {
  id: string;
  email: string;
}

export function formatUser(user: User): string {
  return `${user.email} (${user.id})`;
}
```

### Interfaces vs. Type Aliases
- Use `interface` for object contracts that are extensible.
- Use `type` for unions, intersections, primitives, and utility transformations.
- Prefer string literal unions over enums.

```typescript
type UserRole = 'admin' | 'member';
type UserWithRole = User & { role: UserRole };
```

### Type Safety & `unknown`
- Avoid `any` in application code.
- Use `unknown` for untrusted inputs (API responses, event data) and narrow safely using type guards or Zod.

```typescript
function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return 'Unexpected error';
}
```

---

## Input Validation & Error Handling

- **Zod Boundary Validation**: Validate external data (HTTP body, query params, CMS payload) at system boundaries using Zod schemas.
- **Fail Fast & Explicit**: Handle errors explicitly; log server context, present friendly errors on UI.
- **Zero Swallowed Exceptions**: Never silently swallow exceptions without handling or rethrowing.

```typescript
import { z } from 'zod';

const userSchema = z.object({
  email: z.string().email(),
  age: z.number().int().min(0)
});

type UserInput = z.infer<typeof userSchema>;
```
