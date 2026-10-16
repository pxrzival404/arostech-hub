---
trigger: manual
description: Isolated prompt-crafting, context-harvesting, and prompt-architecture rule for developer sessions using prompt-architect.
---

# Antigravity Prompt-Crafting Isolation & Context Governance Rule (`agy-prompt`)

> **Scope**: Isolated prompt engineering and prompt design sessions (Prompt Engineering Room) where the developer crafts structured prompts for execution by downstream agents (CLI workers, main agents, squad agents, or subagents).
> **Activation**: Manual (invoked when the developer designs prompts with the aid of the `prompt-architect` skill or prompt optimizers).

---

## 1. Isolated Read-Only Context Harvesting
- **Strict Read-Only External Referencing**: When the user references conversation brain paths (e.g., `C:/Users/.../brain/<conversation-id>/` or `antigravity-cli/brain/`) or target workspaces, the agent is **STRICTLY RESTRICTED** to read-only tool calls (`view_file`, `list_dir`, `grep_search`, `graphify` / MCP).
- **Zero External Mutation**: The agent SHALL NOT modify, delete, or execute mutating actions on referenced external conversation directories or target workspaces in this session.
- **Session-Local Deliverables**: All prompt drafts, analysis artifacts, and handoff plans MUST be stored exclusively in the active session's brain directory (`<appDataDir>/brain/<current-conversation-id>/`) or presented cleanly in the chat output.

---

## 2. Knowledge Graph-First Semantic Extraction
- **Graph-First Navigation**: Leverage `graphify-out/graph.json` or Graphify MCP tools (`query_graph`, `get_node`, `shortest_path`) to map architecture, module dependencies, and inter-specification relationships.
- **Anti-Context Bloat**: Do NOT dump raw codebase files into active prompt memory. Extract only relevant subgraphs or concise summaries necessary for the prompt objective.
- **Safe Token Footprint**: Ensure the token density of generated prompts stays strictly within the safe threshold of **85.0%–95.0%**.

---

## 3. Dynamic Prompt Structure & Component Formatting Conventions
The structure of generated prompts follows the dynamic frameworks of the `prompt-architect` skill (no rigid, one-size-fits-all template), enforcing the following syntax conventions:

1. **Combination with `agy-deepthinking`**:
   - If the user also activates `agy-deepthinking` in the prompt-crafting session, the resulting prompt draft **MUST** include an explicit directive/reference to [`.agents/rules/agy-deepthinking.md`](file:///d:/dev/arostech-hub/.agents/rules/agy-deepthinking.md) to force the target agent into deep-reasoning mode.
2. **Tool Invocations Format (MCP & Native Antigravity Tools)**:
   - Tool call instructions MUST be structured cleanly within the prompt draft (e.g., MCP `context7`, `graphify`, `sequentialthinking`, browser, or IDE native tools).
3. **Ecosystem Component Format (Skills, Workflows, Rules)**:
   - Component invocations MUST use slash notation (`/<component-name>`), placed either at the start of the prompt or inline within the prompt body.
4. **Main Agent & Subagent Delegation Format**:
   - For delegating tasks to subagents (registered under `.agents/agents/` or built-in such as `research`, `browser`, `self`) or the main agent, place the delegation directive directly preceding the target sub-prompt:
     - `invoke_subagent`: to dispatch to a subagent.
     - `invoke_mainagent`: to dispatch to the main agent.

---

## 4. Interactive Alignment via `/grill-me` (Scoring Trigger)
- **Automatic Strict Trigger (< 7.0)**: The `/grill-me` interactive design interview **MUST BE AUTOMATICALLY TRIGGERED** whenever the initial average assessment score from `prompt-architect` falls below **7** (< 7.0 / 10).
- **Ambiguity Resolution**: If the score is < 7, the agent SHALL NOT generate the final prompt immediately. It must conduct a targeted interview with the user until clarity and completeness meet the required standard.
- **User Boundary Invariants**: Always respect user-defined boundaries ("NOT APPROVED", "read-only target", "draft only") without unilateral assumptions.
