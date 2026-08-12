# Prisma & Neon Edge Guidelines

> **STATUS**: ⚠️ **DRAFT / STUB** — Detailed technical constraints planned for Fase 2 authoring.

<!-- DRAFT RULE FILE — ADVISORY ONLY UNTIL FULLY AUTHORED IN FASE 2 -->

## Core Invariants
- Use `@neondatabase/serverless` driver adapter with Prisma client on edge runtimes.
- Enforce connection pooling boundaries and zero-downtime database migrations.

