# install plan.js

> 24 nodes

## Key Concepts

- **install-plan.js** (20 connections) — `.agents/scripts/install-plan.js`
- **main()** (14 connections) — `.agents/scripts/install-plan.js`
- **config.js** (12 connections) — `.agents/scripts/lib/install/config.js`
- **loadInstallConfig()** (8 connections) — `.agents/scripts/lib/install/config.js`
- **listInstallModules()** (4 connections) — `.agents/scripts/lib/install-manifests.js`
- **parseArgs()** (3 connections) — `.agents/scripts/install-plan.js`
- **readJson()** (3 connections) — `.agents/scripts/lib/install/config.js`
- **getValidator()** (3 connections) — `.agents/scripts/lib/install/config.js`
- **findDefaultInstallConfigPath()** (3 connections) — `.agents/scripts/lib/install/config.js`
- **showHelp()** (2 connections) — `.agents/scripts/install-plan.js`
- **printProfiles()** (2 connections) — `.agents/scripts/install-plan.js`
- **printModules()** (2 connections) — `.agents/scripts/install-plan.js`
- **printComponents()** (2 connections) — `.agents/scripts/install-plan.js`
- **printPlan()** (2 connections) — `.agents/scripts/install-plan.js`
- **dedupeStrings()** (2 connections) — `.agents/scripts/lib/install/config.js`
- **formatValidationErrors()** (2 connections) — `.agents/scripts/lib/install/config.js`
- **resolveInstallConfigPath()** (2 connections) — `.agents/scripts/lib/install/config.js`
- **{
  listInstallComponents,
  listInstallModules,
  listInstallProfiles,
  resolveInstallPlan,
}** (1 connections) — `.agents/scripts/install-plan.js`
- **{
  findDefaultInstallConfigPath,
  loadInstallConfig,
}** (1 connections) — `.agents/scripts/install-plan.js`
- **{ normalizeInstallRequest }** (1 connections) — `.agents/scripts/install-plan.js`
- **fs** (1 connections) — `.agents/scripts/lib/install/config.js`
- **path** (1 connections) — `.agents/scripts/lib/install/config.js`
- **Ajv** (1 connections) — `.agents/scripts/lib/install/config.js`
- **CONFIG_SCHEMA_PATH** (1 connections) — `.agents/scripts/lib/install/config.js`

## Relationships

- [getOpencodeBuildValidationIssues()](getOpencodeBuildValidationIssues%28%29.md) (5 shared connections)
- [catalog.js](catalog.js.md) (4 shared connections)
- [install apply.js](install_apply.js.md) (4 shared connections)

## Source Files

- `.agents/scripts/install-plan.js`
- `.agents/scripts/lib/install-manifests.js`
- `.agents/scripts/lib/install/config.js`

## Audit Trail

- EXTRACTED: 86 (92%)
- INFERRED: 7 (8%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*