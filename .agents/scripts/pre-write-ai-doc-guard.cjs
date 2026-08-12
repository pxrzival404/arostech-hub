#!/usr/bin/env node
/**
 * Pre-Write AI-Doc Guard (PreToolUse Hook)
 *
 * Inspects Write/Edit payloads targeting `docs/**/*.md` files to remind
 * the agent to follow the 7 Pillars of AI-Friendly Documentation Standard.
 */

'use strict';

const path = require('path');
const { buildPreToolUseAdditionalContext } = require('./pretooluse-visible-output');

const MAX_STDIN = 1024 * 1024;

function isDocPath(filePath) {
  if (!filePath) return false;
  const normalized = String(filePath).replace(/\\/g, '/');
  return normalized.includes('docs/') && normalized.endsWith('.md');
}

function run(inputOrRaw, _options = {}) {
  let input;
  try {
    input = typeof inputOrRaw === 'string'
      ? (inputOrRaw.trim() ? JSON.parse(inputOrRaw) : {})
      : (inputOrRaw || {});
  } catch {
    return { exitCode: 0 };
  }

  const filePath = String(input?.tool_input?.file_path || input?.tool_input?.TargetFile || '');

  if (filePath && isDocPath(filePath)) {
    return {
      exitCode: 0,
      additionalContext: [
        '[AI Doc Guard] REMINDER: You are writing/editing a documentation file in `docs/`',
        `[AI Doc Guard] File: ${filePath}`,
        '[AI Doc Guard] MUST follow the 7 Pillars of AI-Friendly Documentation:',
        '  1. Machine-Readable YAML Frontmatter (id, title, version, status, graphify_community, authoritative_references)',
        '  2. OpenSpec Behavioral Contracts (### Requirement: & #### Scenario: GIVEN-WHEN-THEN)',
        '  3. RFC 2119 Normative Precision (SHALL, MUST, MUST NOT, SHOULD)',
        '  4. Declarative Machine Code & Schemas',
        '  5. Graphify Knowledge Graph Anchoring (doc:<path> & CLI query)',
        '  6. OpenSpec SDD Lifecycle Mapping (proposal -> specs -> design -> tasks)',
        '  7. Anchored file:/// URIs & Zero Redundancy Invariant',
      ],
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
