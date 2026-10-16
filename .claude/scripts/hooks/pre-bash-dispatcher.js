#!/usr/bin/env node
'use strict';

const { runPreBash } = require('./bash-hook-dispatcher');

let raw = '';
const MAX_STDIN = 1024 * 1024;

const PROTECTED_CONFIGS = [
  'eslint.config',
  '.eslintrc',
  'prettier.config',
  '.prettierrc',
  'biome.json',
  'wrangler.json',
  'next.config',
  'postcss.config',
  'tailwind.config',
  'sanity.config',
  'sanity.cli',
  'tsconfig.json',
  'prisma/schema.prisma'
];

function checkShellConfigTampering(rawInput) {
  let cmd = '';
  try {
    const parsed = JSON.parse(rawInput);
    cmd = parsed.tool_input?.command || parsed.command || '';
  } catch (_) {
    cmd = rawInput;
  }

  if (!cmd) return null;

  // Intercept write redirection and in-place stream edits
  const isWriteOp = /(?:>|>>|tee\s|sed\s+-i|rm\s|truncate\s|echo\s.*>|cat\s.*>)/.test(cmd);
  if (isWriteOp) {
    for (const cfg of PROTECTED_CONFIGS) {
      if (cmd.includes(cfg)) {
        return {
          exitCode: 2,
          stderr: `[BLOCKED by config-protection] Direct shell modification/overwrite of protected config file '${cfg}' is blocked. Modify project code instead.`
        };
      }
    }
  }
  return null;
}

process.stdin.setEncoding('utf8');
process.stdin.on('data', chunk => {
  if (raw.length < MAX_STDIN) {
    const remaining = MAX_STDIN - raw.length;
    raw += chunk.substring(0, remaining);
  }
});

process.stdin.on('end', () => {
  const tamperingCheck = checkShellConfigTampering(raw);
  if (tamperingCheck) {
    process.stderr.write(tamperingCheck.stderr + '\n');
    process.exit(tamperingCheck.exitCode);
    return;
  }

  const result = runPreBash(raw);
  if (result.stderr) {
    process.stderr.write(result.stderr);
  }
  process.stdout.write(result.output);
  process.exitCode = result.exitCode;
});
