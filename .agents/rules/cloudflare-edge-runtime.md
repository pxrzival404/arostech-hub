# Cloudflare Edge Runtime Guidelines

> **STATUS**: ⚠️ **DRAFT / STUB** — Detailed technical constraints planned for Fase 2 authoring.

<!-- DRAFT RULE FILE — ADVISORY ONLY UNTIL FULLY AUTHORED IN FASE 2 -->

## Core Invariants
- Enforce V8 isolate limits, streaming responses, and Web API compatibility for Cloudflare Workers.
- Prefer KV, D1, and R2 bindings for edge state management.

