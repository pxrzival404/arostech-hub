/**
 * AGY Guardrail Hook: PreToolUse Validation
 * Enforces:
 * 1. Target repository (d:/CLAUDE-PROJECT/website) READ-ONLY invariant per AGENTS.md Section 1.
 * 2. Strict forward-slash file path format per AGENTS.md Section 0.
 * 3. Command string inspection for destructive shell operations.
 */

const fs = require('fs');
const { hasWindowsBackslash, isReadonlyViolation } = require('./lib/path-validator-agy.js');
const { isDestructiveCommand } = require('./lib/command-inspector-agy.js');

function readStdinSync() {
  try {
    return fs.readFileSync(0, 'utf8');
  } catch (err) {
    return '';
  }
}

function extractPathsAndCommands(toolName, toolInput) {
  const paths = [];
  const commands = [];

  if (!toolInput || typeof toolInput !== 'object') {
    return { paths, commands };
  }

  // Extract explicit command string fields
  if (toolInput.CommandLine && typeof toolInput.CommandLine === 'string') {
    commands.push(toolInput.CommandLine);
  }
  if (toolInput.command && typeof toolInput.command === 'string') {
    commands.push(toolInput.command);
  }
  if (toolInput.cmd && typeof toolInput.cmd === 'string') {
    commands.push(toolInput.cmd);
  }

  // Helper recursive path extractor
  function scanObj(obj) {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string') {
        const lKey = key.toLowerCase();
        if (
          lKey.includes('path') ||
          lKey.includes('file') ||
          lKey === 'target' ||
          lKey === 'targetfile' ||
          lKey === 'target_file' ||
          lKey === 'cwd'
        ) {
          paths.push(val);
        }
      } else if (typeof val === 'object' && val !== null) {
        scanObj(val);
      }
    }
  }

  scanObj(toolInput);
  return { paths, commands };
}

function main() {
  const inputRaw = readStdinSync();
  if (!inputRaw || !inputRaw.trim()) {
    process.exit(0);
  }

  let payload;
  try {
    payload = JSON.parse(inputRaw);
  } catch (err) {
    process.exit(0);
  }

  const toolName = payload.tool_name || payload.toolName || payload.name || '';
  const toolInput = payload.tool_input || payload.toolInput || payload.input || {};

  const { paths, commands } = extractPathsAndCommands(toolName, toolInput);

  // Check 1: Windows backslash ('\') warning / strict enforcement
  const strictSlash = process.env.AGY_ENFORCE_FORWARD_SLASH_STRICT === '1';
  for (const p of paths) {
    if (hasWindowsBackslash(p) && strictSlash) {
      process.stderr.write(
        "AGY Guardrail Violation: Windows backslashes ('\\') are prohibited when AGY_ENFORCE_FORWARD_SLASH_STRICT=1. Path: '" + p + "'.\n"
      );
      process.exit(2);
    }
  }

  // Check 2: Destructive operations in command strings
  for (const cmd of commands) {
    if (hasWindowsBackslash(cmd) && strictSlash) {
      process.stderr.write(
        "AGY Guardrail Violation: Windows backslashes ('\\') are prohibited in shell execution strings when AGY_ENFORCE_FORWARD_SLASH_STRICT=1.\n"
      );
      process.exit(2);
    }
    if (isDestructiveCommand(cmd)) {
      process.stderr.write(
        "AGY Guardrail Violation: Destructive command targeting READ-ONLY target repository is prohibited. All modifications must be produced as patch files saved in harness/patches/.\n"
      );
      process.exit(2);
    }
  }

  // Check 3: READ-ONLY target repository write/edit tool inspection
  const modifyingTools = [
    'write_to_file',
    'replace_file_content',
    'multi_replace_file_content',
    'edit_file',
    'create_file',
    'write_file'
  ];

  const isModifyingTool = modifyingTools.includes(toolName.toLowerCase());

  for (const p of paths) {
    if (isReadonlyViolation(p)) {
      if (isModifyingTool || isReadonlyViolation(p)) {
        const readonlyTarget = process.env.AGY_READONLY_REPO || 'workspace';
        process.stderr.write(
          "AGY Guardrail Violation: Target repository ('" + readonlyTarget + "') is READ-ONLY per AGENTS.md Section 1. Path: '" + p + "'. All modifications must be produced as patch files saved in harness/patches/.\n"
        );
        process.exit(2);
      }
    }
  }

  process.exit(0);
}

main();
