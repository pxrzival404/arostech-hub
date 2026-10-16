#!/usr/bin/env node
/**
 * PostToolUse Hook: Accumulate edited JS/TS file paths for batch processing
 *
 * Cross-platform (Windows, macOS, Linux)
 *
 * Records each edited JS/TS path to a session-scoped temp file (one path per
 * line). stop-format-typecheck.js reads this list at Stop time and runs format
 * + typecheck once across all edited files, eliminating per-edit latency.
 *
 * appendFileSync is used so concurrent hook processes write atomically
 * without overwriting each other. Deduplication is deferred to the Stop hook.
 */

'use strict';

const fs = require('fs');
const path = require('path');
let sessionIdentity;
try {
  sessionIdentity = require('../lib/session-identity');
} catch {
  sessionIdentity = require('./lib/session-identity');
}
const { getSessionTempPath } = sessionIdentity;

const MAX_STDIN = 1024 * 1024;
const JS_TS_EXT = /\.(ts|tsx|js|jsx)$/;

function appendPath(accumFile, filePath) {
  if (filePath && JS_TS_EXT.test(filePath)) {
    fs.appendFileSync(accumFile, filePath + '\n', 'utf8');
  }
}

/**
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} The original input (pass-through)
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const accumFile = getSessionTempPath('ecc-edited', input, '.txt');
    const toolInput = input.tool_input || input.toolInput || input.input || input.toolCall?.args || input.args || input;
    const target = toolInput.file_path || toolInput.TargetFile || toolInput.target_file || toolInput.filePath;

    // Single file edit / write
    if (target) {
      appendPath(accumFile, target);
    }

    // Multi-edit / batch edits
    const edits = toolInput.edits || toolInput.ReplacementChunks;
    if (Array.isArray(edits)) {
      for (const edit of edits) {
        const editTarget = edit?.file_path || edit?.TargetFile || edit?.target_file || edit?.filePath || target;
        if (editTarget) {
          appendPath(accumFile, editTarget);
        }
      }
    }
  } catch {
    // Invalid input — pass through
  }
  return rawInput;
}

if (require.main === module) {
  let data = '';
  process.stdin.setEncoding('utf8');
  process.stdin.on('data', chunk => {
    if (data.length < MAX_STDIN) data += chunk.substring(0, MAX_STDIN - data.length);
  });
  process.stdin.on('end', () => {
    run(data);
    process.stdout.write('{}\n');
    process.exit(0);
  });
}

module.exports = { run };
