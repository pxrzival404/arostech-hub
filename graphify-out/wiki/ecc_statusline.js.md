# ecc statusline.js

> 19 nodes

## Key Concepts

- **session-bridge.js** (14 connections) — `.agents/scripts/lib/session-bridge.js`
- **scripts/ecc-statusline.js** (12 connections) — `.agents/scripts/ecc-statusline.js`
- **sanitizeSessionId()** (10 connections) — `.agents/scripts/lib/session-bridge.js`
- **readBridge()** (8 connections) — `.agents/scripts/lib/session-bridge.js`
- **runStatusline()** (7 connections) — `.agents/scripts/ecc-statusline.js`
- **writeBridgeAtomic()** (7 connections) — `.agents/scripts/lib/session-bridge.js`
- **readCurrentTask()** (3 connections) — `.agents/scripts/ecc-statusline.js`
- **getBridgePath()** (3 connections) — `.agents/scripts/lib/session-bridge.js`
- **formatDuration()** (2 connections) — `.agents/scripts/ecc-statusline.js`
- **buildContextBar()** (2 connections) — `.agents/scripts/ecc-statusline.js`
- **resolveSessionId()** (2 connections) — `.agents/scripts/lib/session-bridge.js`
- **fs** (1 connections) — `.agents/scripts/ecc-statusline.js`
- **os** (1 connections) — `.agents/scripts/ecc-statusline.js`
- **path** (1 connections) — `.agents/scripts/ecc-statusline.js`
- **{ sanitizeSessionId, readBridge, writeBridgeAtomic }** (1 connections) — `.agents/scripts/ecc-statusline.js`
- **crypto** (1 connections) — `.agents/scripts/lib/session-bridge.js`
- **fs** (1 connections) — `.agents/scripts/lib/session-bridge.js`
- **os** (1 connections) — `.agents/scripts/lib/session-bridge.js`
- **path** (1 connections) — `.agents/scripts/lib/session-bridge.js`

## Relationships

- [ecc context monitor.js](ecc_context_monitor.js.md) (7 shared connections)
- [ecc metrics bridge.js](ecc_metrics_bridge.js.md) (7 shared connections)
- [cost tracker.js](cost_tracker.js.md) (2 shared connections)

## Source Files

- `.agents/scripts/ecc-statusline.js`
- `.agents/scripts/lib/session-bridge.js`

## Audit Trail

- EXTRACTED: 61 (78%)
- INFERRED: 17 (22%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*