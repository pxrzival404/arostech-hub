#!/usr/bin/env node
/**
 * Pre-Edit Rule Gate (PreInvocation & PreToolUse Hook)
 *
 * Enforces AGENTS.md §2.3 Rule File Gating. Inspects tool calls or invocation context
 * and provides reminders of mandatory platform rule files and owner agents
 * via Antigravity PreInvocation ephemeral messages.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const MAX_STDIN = 1024 * 1024;
const MAP_PATH = path.join(__dirname, '..', 'rule-gate-map.json');

function loadGateMap() {
  try {
    if (fs.existsSync(MAP_PATH)) {
      return JSON.parse(fs.readFileSync(MAP_PATH, 'utf8'));
    }
  } catch {
    // Return empty if parsing fails
  }
  return { gates: [] };
}

function matchPattern(filePath, pattern) {
  const normPath = String(filePath).replace(/\\/g, '/');
  const normPattern = String(pattern).replace(/\\/g, '/');

  if (normPattern.endsWith('**')) {
    const prefix = normPattern.slice(0, -2);
    return normPath.startsWith(prefix) || normPath.includes(prefix);
  }
  if (normPattern.includes('*')) {
    const regex = new RegExp('^' + normPattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$');
    return regex.test(normPath) || normPath.endsWith(normPattern.replace(/\*/g, ''));
  }
  return normPath.endsWith(normPattern) || normPath.includes(normPattern);
}

function extractFilePaths(input) {
  const paths = new Set();
  if (!input || typeof input !== 'object') return [];

  const toolInput = input?.tool_input || input?.toolInput || input?.input || input?.toolCall?.args || input?.args;
  if (toolInput && typeof toolInput === 'object') {
    const target = toolInput.file_path || toolInput.TargetFile || toolInput.target_file || toolInput.filePath;
    if (target) paths.add(target);

    const edits = toolInput.edits || toolInput.ReplacementChunks;
    if (Array.isArray(edits)) {
      for (const e of edits) {
        const eTarget = e?.file_path || e?.TargetFile || e?.target_file || e?.filePath || target;
        if (eTarget) paths.add(eTarget);
      }
    }
  }

  return Array.from(paths);
}

function run(inputOrRaw) {
  let input;
  try {
    input = typeof inputOrRaw === 'string'
      ? (inputOrRaw.trim() ? JSON.parse(inputOrRaw) : {})
      : (inputOrRaw || {});
  } catch {
    return { exitCode: 0, decision: 'allow' };
  }

  const filePaths = extractFilePaths(input);
  if (filePaths.length === 0) {
    return {
      exitCode: 0,
      decision: 'allow',
      injectSteps: [],
    };
  }

  const gateMap = loadGateMap();
  const matchedGates = [];

  for (const filePath of filePaths) {
    for (const gate of gateMap.gates || []) {
      for (const pattern of gate.patterns || []) {
        if (matchPattern(filePath, pattern)) {
          matchedGates.push({ filePath, ...gate });
          break;
        }
      }
    }
  }

  if (matchedGates.length > 0) {
    const messages = matchedGates.map(g =>
      `[Platform Rule Gate §2.3] ENFORCED: File '${g.filePath}' is governed by '${g.rule_file}' (Owner Agent: ${g.owner_agent}). MUST comply with all platform constraints defined in the rule file.`
    );

    return {
      exitCode: 0,
      decision: 'allow',
      injectSteps: messages.map(msg => ({ ephemeralMessage: msg })),
      additionalContext: messages,
    };
  }

  return {
    exitCode: 0,
    decision: 'allow',
    injectSteps: [],
  };
}

function main() {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', c => {
    if (data.length < MAX_STDIN) {
      data += c.substring(0, MAX_STDIN - data.length);
    }
  });

  process.stdin.on('end', () => {
    const result = run(data);
    if (result.injectSteps && result.injectSteps.length > 0) {
      process.stdout.write(JSON.stringify({ injectSteps: result.injectSteps }) + '\n');
    } else {
      process.stdout.write(JSON.stringify({ decision: 'allow' }) + '\n');
    }
    process.exit(0);
  });
}

module.exports = { run, main };

if (require.main === module) {
  main();
}
