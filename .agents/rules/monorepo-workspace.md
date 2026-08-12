# Monorepo Workspace Guidelines

> **STATUS**: ⚠️ **DRAFT / STUB** — Detailed technical constraints planned for Fase 2 authoring.

<!-- DRAFT RULE FILE — ADVISORY ONLY UNTIL FULLY AUTHORED IN FASE 2 -->

## Core Invariants
- Enforce strict package boundary isolation, shared workspace dependencies, and pnpm/npm workspace resolution.
- Prevent cross-package internal leakage and enforce clean build DAG order.

