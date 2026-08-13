---
trigger: glob
globs: "**/*.{tsx,jsx}"
---

# React & UI Coding Style Standard

This document defines the canonical coding style standard for React components and UI code in `arostech-hub`.

## Core Invariants

### 1. Component Boundaries & Sizing
- **Component Limit**: Keep component files under 200 lines. Split complex visual sections into sub-components.
- **RSC Boundaries**: Default to Server Components. Add `"use client"` on line 1 ONLY when requiring hooks (`useState`, `useEffect`), browser APIs, or event handlers (`onClick`).
- **Zero Inline `@apply`**: Do not use inline `@apply` in JSX; use Tailwind CSS v4 OKLCH token utilities or CSS custom properties in `globals.css`.

### 2. Immutability & State Discipline
- **Local State First**: Keep state local (`useState`), lift only when shared.
- **Derived State**: Never duplicate state that can be computed during render.
- **Immutable State Updates**: Always pass new object/array copies to state setters.

---

## Component Structure & Types

```tsx
type Props = {
  user: { id: string; name: string };
  onSelect: (id: string) => void;
};

export function UserCard({ user, onSelect }: Props) {
  return (
    <button type="button" onClick={() => onSelect(user.id)} className="p-4 rounded-lg bg-surface">
      {user.name}
    </button>
  );
}
```

- Always destructure props in the parameter list.
- Use boolean prefixes (`isLoading`, `hasError`, `canSubmit`).
- Use self-closing tags (`<img />`, `<UserCard />`) and fragments (`<>...</>`) over unnecessary wrapper `div`s.

---

## Semantic HTML & CSS Architecture

- **Semantic HTML**: Use `<header>`, `<main>`, `<nav>`, `<section>`, `<footer>` instead of generic `div` soup.
- **CSS Custom Properties**: Define OKLCH design tokens in `src/app/globals.css`.
- **Compositor Motion**: Animate `transform`, `opacity`, `clip-path`; avoid animating layout properties (`width`, `height`, `margin`, `padding`).

---

## Data Fetching & Null-on-Error Pattern

- Wrap Server Component data fetching in null-on-error helpers to avoid breaking render boundaries on transient downstream errors.

```tsx
async function getUserData(id: string) {
  try {
    return await db.user.findUnique({ where: { id } });
  } catch (error) {
    console.error('Failed to fetch user:', error);
    return null;
  }
}
```
