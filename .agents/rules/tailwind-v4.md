# Tailwind CSS v4 Styling & Token Governance Rule

> **Rule ID**: `RULE-STYLE-001`  
> **Project**: PT Daya Berkah Sentosa Nusantara (DBSN) — `arostech-hub`  
> **Framework**: Tailwind CSS v4 (CSS-first configuration)  
> **Owner Agent**: `react-reviewer` (styling & design system compliance)  
> **Primary Authority**: [Coding Standards](file:///d:/dev/arostech-hub/docs/engineering/governance/coding-standards.md)

---

## 1. File-Matcher Scopes

This rule MUST be enforced whenever an AI agent inspects or modifies files matching:

| Scope | Glob Pattern | Rationale |
|---|---|---|
| Global stylesheet | `src/app/globals.css` | Sole file for `@theme`, `@layer`, `@custom-variant`, `@apply` |
| PostCSS config | `postcss.config.mjs` | Must use `@tailwindcss/postcss` plugin |
| Legacy config (DEAD CODE) | `tailwind.config.ts` | Must NOT exist — scheduled for deletion |
| Component files | `src/**/*.{tsx,jsx}` | Must NOT contain `@apply` or raw hex colors |
| CSS modules | `src/**/*.module.css` | Rare; avoid — prefer Tailwind utilities |

---

## 2. Pre-Execution Architectural Vector Analysis

Before modifying stylesheets or UI component styles, agents MUST evaluate the following 3 vectors:

1. **Vector A — Trade-offs & Isolation Dynamics**:
   - Tailwind v4 uses a **CSS-first configuration model**. Theme tokens are defined directly inside CSS via `@theme` directives rather than JavaScript configuration files.
   - Deleting `tailwind.config.ts` eliminates JS runtime bundle overhead and simplifies PostCSS compilation.

2. **Vector B — System Invariants & Spec Compliance**:
   - `tailwind.config.ts` and `tailwind.config.js` MUST NOT exist in the codebase.
   - Color design tokens MUST be specified in **OKLCH** color space in `:root` and `.dark` for perceptual uniformity across hub and spoke subdomains.
   - PostCSS plugin MUST strictly use `@tailwindcss/postcss`.

3. **Vector C — Edge Cases & Verification Strategy**:
   - `@apply` directive is PROHIBITED in production React component `.tsx` files (permitted only inside `globals.css` under `@layer base` or `@layer utilities`).
   - Mobile-first responsive design MUST be enforced (`sm:`, `md:`, `lg:`, `xl:` prefixes).

---

## 3. Normative Enforcement Rules (RFC 2119)

1. Theme configuration **MUST** be defined using `@theme inline` blocks in `src/app/globals.css`. `tailwind.config.ts` **MUST NOT** be created or retained.
2. PostCSS configuration **MUST** use `@tailwindcss/postcss` as the PostCSS plugin.
3. Color tokens **MUST** be defined using OKLCH values (`oklch(L C H)`) inside `:root` and `.dark` selectors.
4. Inline `@apply` directives **MUST NOT** be placed inside `.tsx` component files or `<style>` blocks outside `globals.css`.
5. Dark mode **MUST** be declared using `@custom-variant dark (&:is(.dark *));` in `globals.css`.
6. Component files **MUST NOT** contain hardcoded hex color strings (`bg-[#3b82f6]`).
7. Legacy Tailwind v3 syntax (`@tailwind base;`, `bg-opacity-*`, `darkMode: 'class'`) **MUST NOT** be used.

---

## 4. PostCSS Configuration Reference

The PostCSS config MUST use `@tailwindcss/postcss`. This is the single source of truth:

```javascript
// postcss.config.mjs
const config = {
  plugins: {
    '@tailwindcss/postcss': {},
  },
}
export default config
```

---

## 5. `@theme inline` Directive & OKLCH Design Tokens

Tailwind v4 uses CSS-first theme configuration via the `@theme inline` directive inside `src/app/globals.css`.

### Canonical `@theme inline` Block (`src/app/globals.css`)
```css
@import "tailwindcss";

@custom-variant dark (&:is(.dark *));

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);

  --font-sans: var(--font-inter), system-ui, sans-serif;
  --font-mono: var(--font-jetbrains-mono), monospace;

  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
}

:root {
  --radius: 0.625rem;
  --background: oklch(0.99 0.002 155);
  --foreground: oklch(0.15 0.02 155);
  --primary: oklch(0.48 0.18 250.2);
  --primary-foreground: oklch(0.98 0.01 250.2);
  --secondary: oklch(0.95 0.03 250.2);
  --secondary-foreground: oklch(0.20 0.05 250.2);
  --muted: oklch(0.96 0.01 250.2);
  --muted-foreground: oklch(0.45 0.02 250.2);
  --accent: oklch(0.65 0.22 38.5);
  --accent-foreground: oklch(0.99 0.005 38.5);
  --destructive: oklch(0.577 0.245 27.325);
  --border: oklch(0.90 0.01 250.2);
  --input: oklch(0.90 0.01 250.2);
  --ring: oklch(0.48 0.18 250.2);
}

.dark {
  --background: oklch(0.14 0.02 155);
  --foreground: oklch(0.95 0.01 155);
  --primary: oklch(0.65 0.20 250.2);
  --primary-foreground: oklch(0.10 0.02 250.2);
  --border: oklch(0.25 0.02 250.2);
  --input: oklch(0.25 0.02 250.2);
}
```

---

## 6. `@layer` Usage & `@apply` Restrictions

### `@layer base` — Global Resets
Allowed strictly in `globals.css` for element-level resets:
```css
@layer base {
  * {
    @apply border-border;
  }
  *:focus-visible {
    outline: 2px solid var(--ring);
    outline-offset: 2px;
  }
  body {
    @apply bg-background text-foreground;
  }
}
```

### `@layer utilities` — Custom Utility Classes
All custom utility classes MUST be defined in `globals.css` inside `@layer utilities`:
```css
@layer utilities {
  .glass {
    background: rgba(255, 255, 255, 0.7);
    backdrop-filter: blur(10px);
  }
  .text-gradient {
    background-clip: text;
    -webkit-background-clip: text;
    color: transparent;
  }
}
```

### `@apply` Scope Restriction
`@apply` is permitted **ONLY** inside `globals.css` within `@layer base` or `@layer utilities`. It **MUST NOT** appear in any `.tsx` component file.

---

## 7. Explicit Forbidden Anti-Patterns

### AP-1: Retaining `tailwind.config.ts` (Dead Code)
```typescript
// ❌ FORBIDDEN: tailwind.config.ts MUST NOT exist in v4
export default { content: ['./src/**/*.tsx'] }
```
**Correct Pattern**: Delete file. Define `@theme inline` in `globals.css`.

---

### AP-2: `@apply` in Production `.tsx` Files
```tsx
// ❌ FORBIDDEN in src/components/Button.tsx
const styles = css`@apply bg-primary text-white;`
```
**Correct Pattern**: Use standard Tailwind utility classes in `className`:
```tsx
<button className="bg-primary text-primary-foreground px-4 py-2 rounded-md">Click</button>
```

---

### AP-3: Wrong PostCSS Plugin (`tailwindcss` vs `@tailwindcss/postcss`)
```javascript
// ❌ FORBIDDEN in postcss.config.js
module.exports = { plugins: { tailwindcss: {} } }
```
**Correct Pattern**: Use `@tailwindcss/postcss` in `postcss.config.mjs`.

---

### AP-4: Hardcoded Hex Colors in Component Files
```tsx
// ❌ FORBIDDEN
<div className="bg-[#3b82f6] text-[#ffffff] border-[#e2e8f0]" />
```
**Correct Pattern**: `<div className="bg-primary text-primary-foreground border-border" />`

---

### AP-5: v3 Import Syntax
```css
/* ❌ FORBIDDEN */
@tailwind base;
@tailwind components;
@tailwind utilities;
```
**Correct Pattern**: `@import "tailwindcss";`

---

### AP-6: `darkMode: 'class'` in Config File
```typescript
// ❌ FORBIDDEN
darkMode: 'class'
```
**Correct Pattern**: `@custom-variant dark (&:is(.dark *));` in `globals.css`.

---

### AP-7: Arbitrary Value Escape Hatch for Theme Tokens
```tsx
// ❌ FORBIDDEN
<div className="text-[var(--primary)] bg-[oklch(0.99_0.002_155)]" />
```
**Correct Pattern**: `<div className="text-primary bg-background" />`

---

## 8. Approved Canonical Code Patterns

### APPROVED-1: Mobile-First Responsive Component (`src/components/Card.tsx`)
```tsx
// src/components/Card.tsx — APPROVED
import type { ReactNode } from 'react'

interface CardProps {
  title: string
  children: ReactNode
}

export function Card({ title, children }: CardProps) {
  return (
    <div className="rounded-lg bg-background p-4 border border-border shadow-sm transition-all hover:shadow-md sm:p-6 md:p-8">
      <h3 className="text-lg font-bold text-primary sm:text-xl md:text-2xl">
        {title}
      </h3>
      <div className="mt-2 text-sm text-foreground/80 sm:text-base">
        {children}
      </div>
    </div>
  )
}
```

---

## 9. v3 to v4 Migration Reference Table

| Concern | v3 Pattern (FORBIDDEN) | v4 Pattern (REQUIRED) |
|---|---|---|
| Import syntax | `@tailwind base;` / `@tailwind components;` | `@import "tailwindcss";` |
| Theme config | `tailwind.config.ts` with `theme.extend` | `@theme inline { --color-*: var(--*); }` in `globals.css` |
| Dark mode | `darkMode: "class"` in JS config | `@custom-variant dark (&:is(.dark *));` in `globals.css` |
| PostCSS plugin | `tailwindcss` | `@tailwindcss/postcss` |
| Content paths | `content: ["./src/**/*.{tsx}"]` | Automatic file detection — no config needed |
| Custom utilities | `plugins: [plugin(...)]` | `@layer utilities { .my-class { ... } }` in `globals.css` |
| `@apply` location | Any `.css` or `<style>` block | `globals.css` only (`@layer base` or `@layer utilities`) |
| Color values | Hardcoded hex in JS config | OKLCH values in `:root` / `.dark`, mapped via `@theme inline` |
| Radius tokens | `borderRadius: { sm: "0.25rem" }` | `--radius-sm: calc(var(--radius) - 4px);` in `@theme inline` |
| Config file existence | `tailwind.config.ts` or `tailwind.config.js` | DELETE — no JS config file needed |

---

## 10. Non-Tailwind Styles in `globals.css`

The following style blocks in `globals.css` are NOT Tailwind utilities and MUST NOT be refactored into `@theme`:
- **Leaflet map styles** (`.custom-marker`, `.leaflet-*`) — third-party map library overrides.
- **Keyframe animations** (`@keyframes gradient-shift`, `float`, `shimmer`, `pulse-dot`) — declared at top level of `globals.css`.
- **Reduced motion media query** (`@media (prefers-reduced-motion: reduce)`) — accessibility override disabling animations.
