# SUPPORTED INSTALL TARGETS

> 17 nodes

## Key Concepts

- **list-installed.js** (11 connections) — `.agents/scripts/list-installed.js`
- **repair.js** (11 connections) — `.agents/scripts/repair.js`
- **SUPPORTED_INSTALL_TARGETS** (9 connections) — `.agents/scripts/lib/install-manifests.js`
- **main()** (5 connections) — `.agents/scripts/list-installed.js`
- **main()** (5 connections) — `.agents/scripts/repair.js`
- **showHelp()** (2 connections) — `.agents/scripts/list-installed.js`
- **parseArgs()** (2 connections) — `.agents/scripts/list-installed.js`
- **printHuman()** (2 connections) — `.agents/scripts/list-installed.js`
- **showHelp()** (2 connections) — `.agents/scripts/repair.js`
- **parseArgs()** (2 connections) — `.agents/scripts/repair.js`
- **printHuman()** (2 connections) — `.agents/scripts/repair.js`
- **os** (1 connections) — `.agents/scripts/list-installed.js`
- **{ discoverInstalledStates }** (1 connections) — `.agents/scripts/list-installed.js`
- **{ SUPPORTED_INSTALL_TARGETS }** (1 connections) — `.agents/scripts/list-installed.js`
- **os** (1 connections) — `.agents/scripts/repair.js`
- **{ repairInstalledStates }** (1 connections) — `.agents/scripts/repair.js`
- **{ SUPPORTED_INSTALL_TARGETS }** (1 connections) — `.agents/scripts/repair.js`

## Relationships

- [install lifecycle.js](install_lifecycle.js.md) (6 shared connections)
- [getOpencodeBuildValidationIssues()](getOpencodeBuildValidationIssues%28%29.md) (3 shared connections)
- [auto update.js](auto_update.js.md) (1 shared connections)
- [consult.js](consult.js.md) (1 shared connections)
- [doctor.js](doctor.js.md) (1 shared connections)
- [install apply.js](install_apply.js.md) (1 shared connections)
- [cursor agent names.js](cursor_agent_names.js.md) (1 shared connections)
- [cleanupEmptyParentDirs()](cleanupEmptyParentDirs%28%29.md) (1 shared connections)

## Source Files

- `.agents/scripts/lib/install-manifests.js`
- `.agents/scripts/list-installed.js`
- `.agents/scripts/repair.js`

## Audit Trail

- EXTRACTED: 59 (100%)
- INFERRED: 0 (0%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*