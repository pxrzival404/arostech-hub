# Coding Standards & Style Guide

This document outlines the coding standards, style guidelines, and design token conventions for developers working on the **DBSN Centralized Digital Ecosystem**.

---

## 1. TypeScript Standards (v5.7+)

- **Strict Typing**: Never use `any`. Define explicit TypeScript `interface` or `type` definitions for component props, data models, and API responses.
- **Immutability**: Prefer `readonly` arrays and immutable state updates over in-place mutations.
- **Naming Conventions**:
  - `PascalCase` for React components, type names, and interfaces.
  - `camelCase` for functions, custom hooks, and variable names.
  - `kebab-case` for file names and route directories.

---

## 2. React 19 & Next.js 16 Patterns

- **Server Components First**: Use React Server Components (RSC) by default for data fetching and static rendering. Mark client-side interactive components explicitly with `'use client'`.
- **Custom Hooks**: Extract stateful UI logic into reusable custom hooks inside `src/hooks/`.
- **Error Handling**: Use `try/catch` in data fetching routines and API handlers; wrap component hierarchies in custom Error Boundaries.

---

## 3. Styling & Design Tokens (Tailwind CSS v4)

- **Color Palettes**: Use Tailwind v4 design tokens and OKLCH color spaces. Avoid raw hex values (`#ff0000`) inline.
- **Responsive Layouts**: Design mobile-first using Tailwind responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`).
- **Accessibility**: Use accessible Radix UI primitives / shadcn components with proper `aria-*` attributes.
