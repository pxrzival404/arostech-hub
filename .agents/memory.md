# Project Memory Standard: Graphify Knowledge Graph

**Authoritative Memory Standard**: Graphify Knowledge Graph (`graphify-out/`)

- **Layer 0 (Session Context Boot)**: `graphify query "<task>"`
- **Layer 6 (Post-Task Memory Sync)**: `graphify update .`
- **Specification-to-Code Mapping**: `docs/**/*.md` and `openspec/**/*.md` indexed alongside code AST nodes.

File-based ECC persistent memory wrappers (`memory.js`, `memory-mcp.mjs`, transient KI persistence) are disabled in favor of Graphify Knowledge Graph as the sole standard memory system.
