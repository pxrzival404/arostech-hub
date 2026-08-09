# openStore()

> 21 nodes

## Key Concepts

- **state-store/index.js** (25 connections) — `.agents/scripts/lib/state-store/index.js`
- **createStateStore()** (16 connections) — `.agents/scripts/lib/state-store/index.js`
- **migrations.js** (5 connections) — `.agents/scripts/lib/state-store/migrations.js`
- **applyMigrations()** (5 connections) — `.agents/scripts/lib/state-store/migrations.js`
- **getAppliedMigrations()** (4 connections) — `.agents/scripts/lib/state-store/migrations.js`
- **createQueryApi()** (4 connections) — `.agents/scripts/lib/state-store/queries.js`
- **openDatabase()** (3 connections) — `.agents/scripts/lib/state-store/index.js`
- **ensureMigrationTable()** (3 connections) — `.agents/scripts/lib/state-store/migrations.js`
- **openStore()** (2 connections) — `.agents/scripts/lib/github-coordination/store.js`
- **initSqlJs** (2 connections) — `.agents/scripts/lib/state-store/index.js`
- **resolveStateStorePath()** (2 connections) — `.agents/scripts/lib/state-store/index.js`
- **wrapSqlJsDatabase()** (2 connections) — `.agents/scripts/lib/state-store/index.js`
- **fs** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **os** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **path** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **{ applyMigrations, getAppliedMigrations }** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **{ createQueryApi }** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **{ assertValidEntity, validateEntity }** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **DEFAULT_STATE_STORE_RELATIVE_PATH** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **IMPORTANT: sql.js db.export() implicitly ends any active transaction, so** (1 connections) — `.agents/scripts/lib/state-store/index.js`
- **MIGRATIONS** (1 connections) — `.agents/scripts/lib/state-store/migrations.js`

## Relationships

- [schema.js](schema.js.md) (5 shared connections)
- [github coordination.js](github_coordination.js.md) (3 shared connections)
- [sessions cli.js](sessions_cli.js.md) (3 shared connections)
- [status.js](status.js.md) (3 shared connections)
- [work items.js](work_items.js.md) (3 shared connections)
- [queries.js](queries.js.md) (2 shared connections)
- [hydrateSessionFromPath()](hydrateSessionFromPath%28%29.md) (1 shared connections)

## Source Files

- `.agents/scripts/lib/github-coordination/store.js`
- `.agents/scripts/lib/state-store/index.js`
- `.agents/scripts/lib/state-store/migrations.js`
- `.agents/scripts/lib/state-store/queries.js`

## Audit Trail

- EXTRACTED: 69 (84%)
- INFERRED: 13 (16%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*