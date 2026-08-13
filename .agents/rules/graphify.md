---
trigger: model_decision
description: Graphify knowledge graph — context boot, memory sync, navigation priority, and MCP integration across the 8-Layer Workflow.
---

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- For codebase or architecture questions, when `graphify-out/graph.json` exists, first run `graphify query "<question>"` (CLI) or `query_graph` (MCP). Use `graphify path "<A>" "<B>"` / `shortest_path` for relationships and `graphify explain "<concept>"` / `get_node` for focused concepts. These return a scoped subgraph, usually much smaller than `GRAPH_REPORT.md` or raw grep output.
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context
- After modifying code files in this session, run `graphify update .` to keep the graph current (AST-only, no API cost)
- Workspace-scoped MCP server configurations belong in `.agents/mcp.json` or `.agents/mcp_config.json`
- Serving graphify via MCP requires installing `graphifyy[mcp]` (`uv tool install --upgrade "graphifyy[mcp]"`)

## Workflow Integration Points

Graphify MUST be invoked at specific layers of the 8-Layer Development Workflow:

- **L0 (Session Boot)**: `graphify query "<task>"` BEFORE any work begins — establish context bubble
- **L3 (After SDD Spec)**: `graphify update .` after creating OpenSpec spec files in `openspec/`
- **L6 (After each task [x])**: `graphify update .` after every completed TDD inner loop task
- **L8 (Post-archive)**: `graphify update .` as the final sync after `/opsx-archive`

```bash
# L0 — Session Boot
graphify query "<task being worked on>"
graphify path "<module A>" "<module B>"   # if touching specific modules

# L3/L6/L8 — Incremental sync (AST-only, no API cost)
graphify update .
```

## Navigation Priority

When looking for context, always follow this priority order:

1. **Wiki first** (if `graphify-out/wiki/index.md` exists) → navigate wiki index, not raw files
2. **Targeted query** → `graphify query "<question>"` or `query_graph` MCP tool
3. **Relationship traversal** → `graphify path "<A>" "<B>"` or `shortest_path` MCP tool
4. **Concept focus** → `graphify explain "<concept>"` or `get_node` MCP tool
5. **Broad review only** → `GRAPH_REPORT.md` (last resort — much larger than query results)

## MCP Mode (Preferred for Multi-Agent Sessions)

When running in multi-agent context, use the MCP server for structured persistent access:

```bash
# Install
uv tool install --upgrade "graphifyy[mcp]"
# Register server in .agents/mcp.json
```

Available MCP tools:
| Tool | Purpose |
|------|---------|
| `query_graph` | BFS semantic search — primary context retrieval |
| `get_node` | Focused concept explanation |
| `get_neighbors` | Adjacent node discovery |
| `get_community` | Community/cluster membership |
| `god_nodes` | High-centrality architectural hubs |
| `graph_stats` | Graph health and coverage metrics |
| `shortest_path` | Dependency chain between two nodes |
| `list_prs` | List open pull requests |
| `get_pr_impact` | Impact radius of a PR |
| `triage_prs` | PR triage and priority scoring |

## Post-Commit Hook (Layer 6 Automation)

Install the graphify git hook to automatically sync the knowledge graph on every commit:

```bash
graphify hook install   # auto-rebuild AST after each git commit
```

This provides automatic Layer 6 (Memory Sync) for git-committed changes.
No API cost — AST extraction only.
