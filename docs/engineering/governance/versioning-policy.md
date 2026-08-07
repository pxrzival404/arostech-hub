# Versioning Policy & Release Rules

> **Scope**: Semantic Versioning (SemVer) standards, release gate criteria, and changelog maintenance rules.

---

## 1. Semantic Versioning (SemVer 2.0.0)

Version numbers follow the format `MAJOR.MINOR.PATCH`:

| Increment | Trigger Conditions | Examples |
| :--- | :--- | :--- |
| **MAJOR** | Breaking API contract changes, domain topology redesign, database schema incompatibility | `1.0.0` ➔ `2.0.0` |
| **MINOR** | New product spoke added, new public API endpoint, non-breaking schema addition | `0.1.0` ➔ `0.2.0` |
| **PATCH** | Bug fixes, performance optimizations, documentation updates, security patches | `0.1.0` ➔ `0.1.1` |

---

## 2. Release Gate Criteria

Before a release candidate is tagged and deployed to Cloudflare Pages production:

1. **Lint Verification**: `pnpm lint` passes with 0 errors.
2. **Unit & Integration Tests**: `pnpm test` passes 100% of test suites.
3. **Edge Build Compilation**: `pnpm pages:build` completes without bundle or polyfill errors.
4. **Changelog Entry**: Root `CHANGELOG.md` is updated following [Keep a Changelog](https://keepachangelog.com/) format.
5. **PR Approval**: Code reviewed and approved via GitHub Pull Request against `main`.

---

## 3. Maintenance of `CHANGELOG.md`

- Root `CHANGELOG.md` remains canonical at repository root.
- Entries must be categorized under: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.
