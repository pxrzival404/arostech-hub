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

const crypto = require('crypto');
const fs = require('fs');
const os = require('os');
const path = require('path');

const MAX_STDIN = 1024 * 1024;

function getAccumFile() {
  const raw =
    process.env.CLAUDE_SESSION_ID ||
    crypto.createHash('sha1').update(process.cwd()).digest('hex').slice(0, 12);
  // Strip path separators and traversal sequences so the value is safe to embed
  // directly in a filename regardless of what CLAUDE_SESSION_ID contains.
  const sessionId = raw.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  return path.join(os.tmpdir(), `ecc-edited-${sessionId}.txt`);
}

/**
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} The original input (pass-through)
 */
const JS_TS_EXT = /\.(ts|tsx|js|jsx)$/;

function appendPath(filePath) {
  if (filePath && JS_TS_EXT.test(filePath)) {
    fs.appendFileSync(getAccumFile(), filePath + '\n', 'utf8');
  }
}

/**
 * @param {string} rawInput - Raw JSON string from stdin
 * @returns {string} The original input (pass-through)
 */
function run(rawInput) {
  try {
    const input = JSON.parse(rawInput);
    const toolInput = input.tool_input || input.toolInput || input.input || input.toolCall?.args || input.args || input;
    const target = toolInput.file_path || toolInput.TargetFile || toolInput.target_file || toolInput.filePath;
    
    // Single file edit / write
    if (target) {
      appendPath(target);
    }

    // Multi-edit / batch edits
    const edits = toolInput.edits || toolInput.ReplacementChunks;
    if (Array.isArray(edits)) {
      for (const edit of edits) {
        const editTarget = edit?.file_path || edit?.TargetFile || edit?.target_file || edit?.filePath || target;
        if (editTarget) {
          appendPath(editTarget);
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
    process.stdout.write(run(data));
    process.exit(0);
  });
}

module.exports = { run };
