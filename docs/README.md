# DBSN Documentation Hub — Master Index

Welcome to the PT. Daya Berkah Sentosa Nusantara (DBSN) central documentation hub. This repository documentation is structured into **4 top-level domains**, keeping implementation deep while exposing shallow, predictable interfaces for human engineers and AI agent harnesses.

---

## 🚦 Audience Routing

| Role / Intent | Primary Entry Point | Content Summary |
| :--- | :--- | :--- |
| **AI Agent / Harness** | [`/AGENTS.md`](../AGENTS.md) ➔ [`docs/engineering/governance/ai-agent-rules.md`](engineering/governance/ai-agent-rules.md) | Operating rules, stack topology, rule priority, & MCP tools |
| **New Human Contributor** | [`docs/engineering/playbooks/quickstart.md`](engineering/playbooks/quickstart.md) | Day-1 checklist, prerequisites, local setup (`lvh.me`), & commands |
| **Code Contributor** | [`/CONTRIBUTING.md`](../CONTRIBUTING.md) ➔ [`docs/engineering/governance/contributing.md`](engineering/governance/contributing.md) | Git Flow, conventional commit standards, & PR checklist |
| **Security Scanner / Auditor** | [`/SECURITY.md`](../SECURITY.md) ➔ [`docs/operations/security/security-policy.md`](operations/security/security-policy.md) | Vulnerability disclosure SLA, secrets handling, & WAF policy |
| **System Architect / Engineer** | [`docs/system/README.md`](system/README.md) | Component topology, execution lifecycle, ADRs, & API reference |

---

## 📂 The 4 Top-Level Domains

### 1. Strategy & Scope (`docs/strategy/`)
*What is this system, why does it exist, and what are its product & platform boundaries?*
- 📄 [`vision.md`](strategy/vision.md) — System identity, core value, design philosophy, & strategic business context report.
- 📄 [`roadmap.md`](strategy/roadmap.md) — Launch gates, phase milestones, and feature delivery schedule.
- 📄 [`prd.md`](strategy/prd.md) — Canonical Technical Product Requirements Document (PRD v3.1).
- 📄 [`segments.md`](strategy/segments.md) — Executive companion PRD focusing on B2G Government and B2B Private sector strategies.
- 📊 [`compatibility-matrix.md`](strategy/compatibility-matrix.md) — Supported runtimes, frameworks, and deployment target versions.

### 2. System Architecture & API (`docs/system/`)
*How does the system work, and what are its internal & external contracts?*
- 📐 [`architecture/README.md`](system/architecture/README.md) — System overview, execution lifecycle, code terrain maps, & information architecture.
- 📜 [`adr/README.md`](system/adr/README.md) — Architecture Decision Records index (ADR-0001, ADR-0002).
- 🔌 [`api/README.md`](system/api/README.md) — Public API contracts, environment schema, extensibility model, and MWE guides.

### 3. Engineering & Governance (`docs/engineering/`)
*How do I build, test, and contribute to this repository correctly?*
- ⚖️ [`governance/README.md`](engineering/README.md) — Contributing rules, AI agent rules, coding standards, versioning policy, & OpenSpec workflow.
- 📖 [`playbooks/README.md`](engineering/README.md) — Quickstart onboarding, Sanity CMS integration guide, GSC setup, & testing strategy/guide.

### 4. Operations & Audits (`docs/operations/`)
*How do I run, ship, monitor, and secure the system in production?*
- 🚀 [`runbooks/README.md`](operations/README.md) — Cloudflare Pages deployment, DNS cutover mapping, & release process.
- 🛡️ [`security/security-policy.md`](operations/security/security-policy.md) — Canonical vulnerability disclosure SLA & secrets handling policy.
- 🔍 [`audits/README.md`](operations/audits/README.md) — Audit log index (Integration health, landing page UX, & Lighthouse reports).
