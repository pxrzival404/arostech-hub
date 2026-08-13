#!/usr/bin/env node
/**
 * Pre-Edit Rule Gate (PreToolUse Hook)
 *
 * Enforces AGENTS.md §2.3 Rule File Gating. Inspects Write/Edit/MultiEdit
 * payloads and reminds agents of mandatory platform rule files and owner agents.
 */

'use strict';

const fs = require('fs');
const path = require('path');
let buildPreToolUseAdditionalContext;
try {
  buildPreToolUseAdditionalContext = require(path.join(__dirname, 'pretooluse-visible-output.js')).buildPreToolUseAdditionalContext;
} catch {
  buildPreToolUseAdditionalContext = (arr) => JSON.stringify({ additionalContext: Array.isArray(arr) ? arr.join('\n') : String(arr) });
}

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

function run(inputOrRaw) {
  let input;
  try {
    input = typeof inputOrRaw === 'string'
      ? (inputOrRaw.trim() ? JSON.parse(inputOrRaw) : {})
      : (inputOrRaw || {});
  } catch {
    return { exitCode: 0 };
  }

  const filePath = String(input?.tool_input?.file_path || input?.tool_input?.TargetFile || '');
  if (!filePath) return { exitCode: 0 };

  const gateMap = loadGateMap();
  const matchedGates = [];

  for (const gate of gateMap.gates || []) {
    for (const pattern of gate.patterns || []) {
      if (matchPattern(filePath, pattern)) {
        matchedGates.push(gate);
        break;
      }
    }
  }

  if (matchedGates.length > 0) {
    const context = matchedGates.map(g => 
      `[Platform Rule Gate §2.3] REMINDER: File '${filePath}' is governed by '${g.rule_file}' (Owner Agent: ${g.owner_agent}). MUST comply with all platform constraints.`
    );

    return {
      exitCode: 0,
      additionalContext: context,
    };
  }

  return { exitCode: 0 };
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
    if (Object.prototype.hasOwnProperty.call(result, 'additionalContext')) {
      process.stdout.write(buildPreToolUseAdditionalContext(result.additionalContext));
    } else {
      process.stdout.write(data);
    }
  });
}

module.exports = { run, main };

if (require.main === module) {
  main();
}
