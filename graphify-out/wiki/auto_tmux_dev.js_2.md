# auto tmux dev.js

> 30 nodes

## Key Concepts

- **hooks/bash-hook-dispatcher.js** (43 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **runPostBash()** (5 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **hooks/auto-tmux-dev.js** (4 connections) — `.agents/scripts/hooks/auto-tmux-dev.js`
- **runPreBash()** (4 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **main()** (4 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **hooks/post-bash-dispatcher.js** (3 connections) — `.agents/scripts/hooks/post-bash-dispatcher.js`
- **hooks/pre-bash-dispatcher.js** (3 connections) — `.agents/scripts/hooks/pre-bash-dispatcher.js`
- **run()** (2 connections) — `.agents/scripts/hooks/auto-tmux-dev.js`
- **readStdinRaw()** (2 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **hooks/post-bash-build-complete.js** (2 connections) — `.agents/scripts/hooks/post-bash-build-complete.js`
- **run()** (2 connections) — `.agents/scripts/hooks/post-bash-build-complete.js`
- **hooks/post-bash-pr-created.js** (2 connections) — `.agents/scripts/hooks/post-bash-pr-created.js`
- **run()** (2 connections) — `.agents/scripts/hooks/post-bash-pr-created.js`
- **path** (1 connections) — `.agents/scripts/hooks/auto-tmux-dev.js`
- **{ spawnSync }** (1 connections) — `.agents/scripts/hooks/auto-tmux-dev.js`
- **{ isHookEnabled }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{
  buildPreToolUseAdditionalContext,
  combineAdditionalContext,
}** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runBlockNoVerify }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runAutoTmuxDev }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runTmuxReminder }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runGitPushReminder }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runCommitQuality }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runGateGuard }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runCommandLog }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- **{ run: runPrCreated }** (1 connections) — `.agents/scripts/hooks/bash-hook-dispatcher.js`
- *... and 5 more nodes in this community*

## Relationships

- [normalizeHookResult()](normalizeHookResult%28%29.md) (11 shared connections)
- [block no verify.js](block_no_verify.js.md) (2 shared connections)
- [gateguard fact force.js](gateguard_fact_force.js.md) (2 shared connections)
- [post bash command log.js](post_bash_command_log.js.md) (2 shared connections)
- [pre bash commit quality.js](pre_bash_commit_quality.js.md) (2 shared connections)
- [post edit console warn.js](post_edit_console_warn.js.md) (2 shared connections)

## Source Files

- `.agents/scripts/hooks/auto-tmux-dev.js`
- `.agents/scripts/hooks/bash-hook-dispatcher.js`
- `.agents/scripts/hooks/post-bash-build-complete.js`
- `.agents/scripts/hooks/post-bash-dispatcher.js`
- `.agents/scripts/hooks/post-bash-pr-created.js`
- `.agents/scripts/hooks/pre-bash-dispatcher.js`

## Audit Trail

- EXTRACTED: 85 (89%)
- INFERRED: 10 (11%)
- AMBIGUOUS: 0 (0%)

---

*Part of the graphify knowledge wiki. See [index](index.md) to navigate.*