# Contributing Guidelines

Thank you for contributing to the **DBSN Centralized Digital Ecosystem** (`arostech-hub`). Please follow these guidelines to ensure code quality, repository integrity, and seamless deployment.

---

## 1. Development & Branching Strategy

We follow a structured Git Flow:

- `main` — Production branch (deployed to Cloudflare Pages `dayaberkah.id`).
- `feature/<short-description>` — New feature implementation (e.g. `feature/add-battery-spoke`).
- `fix/<short-description>` — Bug fixes and patch releases.
- `docs/<short-description>` — Documentation refactoring and updates.

### Workflow Steps

1. Branch off `main`: `git checkout -b feature/my-new-spoke`
2. Implement your changes following TDD patterns.
3. Run local quality checks: `pnpm lint`, `pnpm test`, `pnpm pages:build`.
4. Push to remote and open a Pull Request (PR) against `main`.

---

## 2. Commit Message Standards

We enforce [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <short description>
```

### Supported Types

- `feat`: A new feature or spoke capability.
- `fix`: A bug fix or patch.
- `docs`: Documentation updates only.
- `refactor`: Code restructuring without functional changes.
- `test`: Adding or updating Jest / Playwright tests.
- `chore`: Dependency updates or build script changes.

---

## 3. Pull Request Checklist

Before submitting a PR, verify:

- [ ] All new code is written in TypeScript 5.7+ with explicit typing.
- [ ] Code passes static analysis: `pnpm lint`.
- [ ] Unit and integration tests pass: `pnpm test`.
- [ ] Edge bundle compiles cleanly: `pnpm pages:build`.
- [ ] Documentation updated if features or APIs were modified.

---

## 4. AI Agent Coordination

When operating via AI assistants (Antigravity CLI / OpenSpec Extended Workflow):
- Respect `AGENTS.md` system identity rules.
- Follow `[DOCS_MODE]` restrictions when modifying documentation.
- Maintain OpenSpec change proposals under `openspec/changes/`.
