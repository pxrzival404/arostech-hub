# Testing Guide

**Purpose:** How to run tests, write new tests, and understand test conventions in the DBSN codebase  
**Framework:** Jest + `ts-jest` + `@testing-library/react`  
**Coverage target:** 80%+ overall (see per-feature targets below)

---

## Overview

Testing follows a TDD-first philosophy. All new features and bug fixes should have tests written before or alongside implementation. This guide covers how to run tests, the project's Jest configuration, file conventions, and patterns used in the existing test suite.

For **mocking patterns** (Prisma, Sanity, Resend, Telegram), see [Mocking Specs](../testing/mocking-specs.md).  
For **test strategy and coverage targets per feature**, see [TDD v1](../architecture/tdd-v1.md) §9.

---

## Running Tests

### Available Commands

| Command | Purpose |
|---|---|
| `pnpm test` | Run all tests once |
| `pnpm test:watch` | Run tests in watch mode (re-runs on file change) |
| `pnpm test:coverage` | Run tests with coverage report |

### Running a Subset

```bash
# Run a single test file
pnpm test -- src/lib/api/sanity/__tests__/queries.test.ts

# Run tests matching a pattern
pnpm test -- --testPathPattern="sanity|middleware"

# Run a single describe/it block
pnpm test -- --testNamePattern="getProductsBySpoke"

# Run with verbose output
pnpm test -- --verbose
```

### Coverage Report

```bash
pnpm test:coverage
```

Output is written to `coverage/lcov-report/index.html`. Open in a browser for a line-level breakdown.

---

## Jest Configuration

The full config lives in [`jest.config.js`](../../../jest.config.js):

```javascript
module.exports = {
  preset: 'ts-jest',                               // TypeScript support via ts-jest
  testEnvironment: '<rootDir>/jest-environment.js', // Custom jsdom environment (see below)
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],  // Runs after test framework is set up
  roots: ['<rootDir>/src'],                         // Only discover tests inside src/
  moduleDirectories: ['node_modules'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',                 // Maps @/ alias → src/
  },
  testMatch: ['<rootDir>/src/**/*.test.{js,jsx,ts,tsx}'],
  testPathIgnorePatterns: ['<rootDir>/.next/', '<rootDir>/node_modules/'],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/__tests__/**',                         // Exclude test files from coverage
  ],
}
```

### Custom Test Environment (`jest-environment.js`)

The project uses a custom jsdom environment instead of the default. This adds `window.location` mock support via `jest.setup-after-env.js`:

```javascript
// jest.setup-after-env.js — patches window.location for subdomain routing tests
Object.defineProperty(window, 'location', {
  get() { return global.__mockLocation },
  set(value) { Object.assign(global.__mockLocation, value) },
  configurable: true,
})
```

This is needed because `window.location` is not writable in plain jsdom, but subdomain routing tests need to set `hostname`.

### Setup File (`jest.setup.js`)

```javascript
require('@testing-library/jest-dom')
```

Adds matchers like `toBeInTheDocument()`, `toHaveTextContent()`, `toBeVisible()` to every test suite.

---

## File Conventions

### Test file location

Tests live in `__tests__/` directories co-located with the source they test:

```
src/
├── lib/
│   ├── api/
│   │   └── sanity/
│   │       ├── queries.ts              ← source
│   │       ├── client.ts
│   │       └── __tests__/
│   │           ├── queries.test.ts     ← unit tests
│   │           ├── client.test.ts
│   │           └── fixtures.ts         ← shared test data factories
│   └── __mocks__/
│       └── sanity.ts                   ← manual mock for @sanity/client
└── app/
    └── api/
        └── revalidate/
            ├── route.ts
            └── __tests__/
                └── route.test.ts
```

### Test file naming

| Pattern | Convention |
|---|---|
| Unit test | `{module}.test.ts` |
| Component test | `{Component}.test.tsx` |
| Fixture factory | `fixtures.ts` inside `__tests__/` |
| Manual mock | `src/lib/__mocks__/{package}.ts` |

### Import style

Tests use named imports from `@jest/globals` for explicit globals:

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals'
```

---

## Writing Tests

### Standard test structure

```typescript
import { describe, it, expect, beforeEach } from '@jest/globals'
import { myFunction } from '../myModule'

// Mock modules at top level — before describe blocks
jest.mock('../dependency', () => ({
  someExport: jest.fn(),
}))

describe('myFunction', () => {
  const mockDep = jest.requireMock('../dependency')

  beforeEach(() => {
    jest.clearAllMocks()   // Always reset mocks between tests
  })

  it('should return expected value on happy path', () => {
    mockDep.someExport.mockReturnValue('value')
    
    const result = myFunction('input')
    
    expect(result).toBe('expected')
    expect(mockDep.someExport).toHaveBeenCalledWith('input')
  })

  it('should return null on error', async () => {
    mockDep.someExport.mockRejectedValue(new Error('fail'))
    
    const result = await myFunction('input')
    
    expect(result).toBeNull()   // Convention: async query functions return null on error
  })
})
```

### Fixture factories

Use factory functions with overrides for test data (from `src/lib/api/sanity/__tests__/fixtures.ts`):

```typescript
// fixtures.ts
export const mockProduct = (overrides = {}) => ({
  _id: 'product-1',
  _type: 'product' as const,
  title: 'PJU Solar Cell',
  slug: 'pju-solar-cell',
  spoke: { _id: 'spoke-pju', subdomain: 'pju', name: 'PJU' },
  shortDescription: 'Test product',
  ...overrides,
})

// Usage in test
const product = mockProduct({ title: 'Custom Title', slug: 'custom-slug' })
```

### Mocking module dependencies

See the actual pattern used in `queries.test.ts`:

```typescript
// Mock next-sanity's groq and defineQuery (just return the string)
jest.mock('next-sanity', () => ({
  groq: (strings: TemplateStringsArray, ...keys: unknown[]) => {
    let result = ''
    strings.forEach((str, i) => { result += str + (keys[i] || '') })
    return result
  },
  defineQuery: (q: string) => q,
}))

// Mock the Sanity client directly
const mockFetch = jest.fn()
jest.mock('../client', () => ({
  client: { fetch: (q: unknown, p?: unknown, o?: unknown) => mockFetch(q, p, o) },
  CACHE_TAGS: {
    product: (id?: string) => id ? `sanity:product:${id}` : 'sanity:product',
    // ... other tags
  },
}))
```

### Dynamic import in tests

When mocking modules that affect module-level initialization, use dynamic imports **inside the test** to ensure the mock is applied first:

```typescript
it('fetches products by spoke', async () => {
  mockFetch.mockResolvedValueOnce([mockProduct()])

  // Dynamic import — ensures the jest.mock above runs before module initializes
  const { getProductsBySpoke } = await import('../queries')
  const result = await getProductsBySpoke('pju')

  expect(result).toHaveLength(1)
})
```

---

## Component Testing

Component tests use `@testing-library/react` and `.tsx` extensions.

```typescript
// src/components/MyComponent.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MyComponent } from '../MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent title="Hello" />)
    
    expect(screen.getByRole('heading', { name: 'Hello' })).toBeInTheDocument()
  })

  it('calls onClick when button is clicked', async () => {
    const user = userEvent.setup()
    const onClick = jest.fn()
    
    render(<MyComponent onClick={onClick} />)
    
    await user.click(screen.getByRole('button'))
    
    expect(onClick).toHaveBeenCalledTimes(1)
  })
})
```

### Queries to prefer (in order)

| Query | Use for |
|---|---|
| `getByRole` | Buttons, inputs, headings, links — accessible queries |
| `getByLabelText` | Form inputs with labels |
| `getByText` | Visible text content |
| `getByTestId` | Only as last resort (`data-testid`) |

---

## API Route Testing

Test Next.js Route Handlers by constructing `NextRequest` directly:

```typescript
import { NextRequest } from 'next/server'
import { POST, GET } from '../route'

describe('POST /api/revalidate', () => {
  it('returns 200 with revalidated tags', async () => {
    const body = JSON.stringify({
      _id: 'doc-abc123',
      _type: 'product',
      operation: 'update',
    })

    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      body,
      headers: { 'Content-Type': 'application/json' },
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.revalidated).toBe(true)
    expect(data.tags).toContain('sanity:product')
  })

  it('returns 400 for unknown document type', async () => {
    const request = new NextRequest('http://localhost/api/revalidate', {
      method: 'POST',
      body: JSON.stringify({ _id: 'x', _type: 'unknownType', operation: 'update' }),
    })

    const response = await POST(request)
    expect(response.status).toBe(400)
  })
})
```

---

## Testing RFQ Cart Features

The multi-product RFQ Cart system introduces schema validation, a Zustand persist store, complex form rendering (react-hook-form + useFieldArray), and composite API route handling. Testing guidelines for each layer are detailed below:

### 1. Zod Validation Schemas
Unit tests for `src/lib/schema/rfq-schemas.ts` are located in `__tests__/rfq-schemas.test.ts`. 
- **Validation limits**: Test happy path and error paths for text bounds (e.g. contact name limit of 255 chars, notes limit of 2000 chars).
- **Phone validation**: Test Indonesian phone format constraints (+62 prefix).
- **Cart constraints**: Test that cart items arrays block empty cart submissions (min 1) and restrict bulk submissions (max 50).
- **Clamping bounds**: Verify that quantities are integers clamped between 1 and 100,000.
- **Strict schemas**: Verify that additional/extraneous fields are rejected using strict validation (`.strict()`).

### 2. Zustand Store
Store tests for `src/lib/store/rfq-cart-store.ts` reside in `__tests__/rfq-cart-store.test.ts`.
- **Store Mutations**: Test that `addItem`, `removeItem`, `updateQuantity`, `updateItemNotes`, and `clearCart` mutate items array as expected.
- **Deduplication**: Assert that adding duplicate product+variant keys merges lines by incrementing quantity.
- **Clamping**: Assert that quantity mutators clamp values to `[1, 100000]`.
- **Boundary Validation**: Verify that `addItem` throws a Zod parsing error if given invalid item attributes.
- **Selectors**: Validate selector helper outputs (`selectItemCount`, `selectTotalQuantity`, `selectHasItem`, `selectCartItems`).

### 3. Dynamic React Forms (Zustand + Hydration Mocking)
Checkout form tests (`RfqB2BForm.test.tsx`, `RfqB2GForm.test.tsx` in `src/components/forms/__tests__/`) must mock store hydration states:
- **Mocking Hydration**: Use Jest mock definitions to mock hydration hook states:
  ```typescript
  jest.mock('@/hooks/use-rfq-cart', () => {
    const actual = jest.requireActual('@/hooks/use-rfq-cart')
    return {
      ...actual,
      useRfqCartHydrated: jest.fn(() => true),
      useRfqCartStore: jest.fn((selector) => {
        const mockState = { items: mockCartItems }
        return selector ? selector(mockState) : mockState
      }),
    }
  })
  ```
- **Loading Skeleton**: Set `useRfqCartHydrated` to return `false` to verify that the loading skeleton (`aria-label="loading rfq form"`) is rendered.
- **Empty Cart state**: Set store items to an empty array to verify that the Empty Cart view and "Browse Products" CTA is rendered.
- **In-Form Cart Actions**: Simulate user clicks on increment (`+`), decrement (`-`), and remove (trash icon) buttons, and check that the corresponding store action functions are called with correct params.
- **Validation Errors**: Trigger form submissions with invalid fields (e.g. empty contact name) and assert that validation error text appears in the UI.
- **Composite Submission**: Verify that a valid submission triggers `onSubmit` with a composite payload combining contact fields, metadata, source tracking, and the product `items[]` array.

### 4. API Route Handlers
API route tests (`route.test.ts` in `src/app/api/rfq/__tests__/`) test server-side request parsing:
- **JSON integrity**: Request POST `/api/rfq` with malformed JSON and assert a `400` status.
- **Segment guard**: Request POST `/api/rfq` with missing or invalid segment flag and assert a `400` status.
- **Validation envelop parsing**: Request POST `/api/rfq` with invalid fields and verify that it returns `422` status and standard envelope error codes (e.g. mapping Zod errors to `validation_error`, `required_field`, and `invalid_format`).
- **Success ingestion**: Request POST `/api/rfq` with complete, valid payloads (both B2B and B2G shapes) and verify that it returns `201` status, unique mock lead ID, and correct headers.

---

## Coverage Targets

**Minimum:** 80% overall (enforced by ECC rules).

**Per-feature targets** (from [TDD v1](../architecture/tdd-v1.md) §9):

| Feature | Coverage Target | Test Priority |
|---|---|---|
| RFQ System | 90% | Unit: validation + queue logic; Integration: API + DB; E2E: full submission flow |
| Authentication | 85% | Unit: token validation + session; Integration: login/logout; E2E: login across domains |
| Dashboard Access | 85% | Unit: authorization guards; Integration: tracking API; E2E: client login + data isolation |
| Middleware Routing | 90% | Unit: all `config.ts` functions for all domain classes |
| Sanity Queries | 80% | Unit: happy path + null-on-error for all 10 functions |

### Checking coverage

```bash
pnpm test:coverage

# Summary appears in terminal:
# Statements : 82.5%
# Branches   : 78.3%
# Functions  : 85.1%
# Lines      : 83.0%

# Detailed report:
open coverage/lcov-report/index.html
```

---

## Best Practices

1. **`jest.clearAllMocks()` in `beforeEach`** — prevents mock state leaking between tests
2. **One assertion per behavior** — test one thing per `it()` block
3. **Test error paths** — every async function that returns `null` on error needs a test for that
4. **Use fixture factories** — `mockProduct()` over inline objects; use `overrides` for variations
5. **Dynamic imports for mocked modules** — use `await import('../module')` inside the test body when the module uses mocked dependencies at init time
6. **Avoid `any` in test assertions** — use `expect.objectContaining()`, `expect.arrayContaining()`, `expect.stringContaining()` for partial matches

---

## Related Documentation

- [Mocking Specs](../testing/mocking-specs.md) — Complete mock patterns for Prisma, Sanity, Resend, Telegram
- [TDD v1](../architecture/tdd-v1.md) — Full test strategy, coverage requirements, E2E test examples
- [Local Setup](./local-setup.md) — Development environment setup

---

*Last modified: 2026-05-26*
