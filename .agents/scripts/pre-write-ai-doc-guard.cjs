#!/usr/bin/env node
/**
 * Pre-Write AI-Doc Guard (PreInvocation & PreToolUse Hook)
 *
 * Inspects Write/Edit payloads targeting docs files to remind
 * the agent to follow the 7 Pillars of AI-Friendly Documentation Standard
 * via Antigravity PreInvocation ephemeral messages.
 */

'use strict';

const path = require('path');

const MAX_STDIN = 1024 * 1024;

function isDocPath(filePath) {
  if (!filePath) return false;
  const normalized = String(filePath).replace(/\\/g, '/');
  return normalized.includes('docs/') && normalized.endsWith('.md');
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

function run(inputOrRaw, _options = {}) {
  let input;
  try {
    input = typeof inputOrRaw === 'string'
      ? (inputOrRaw.trim() ? JSON.parse(inputOrRaw) : {})
      : (inputOrRaw || {});
  } catch {
    return { exitCode: 0, decision: 'allow' };
  }

  const filePaths = extractFilePaths(input);
  const docFiles = filePaths.filter(isDocPath);

  if (docFiles.length > 0) {
    const messages = [
      '[AI Doc Guard] REMINDER: You are writing/editing documentation in `docs/`',
      `[AI Doc Guard] Target: ${docFiles.join(', ')}`,
      '[AI Doc Guard] MUST follow the 7 Pillars of AI-Friendly Documentation:',
      '  1. Machine-Readable YAML Frontmatter (id, title, version, status, graphify_community, authoritative_references)',
      '  2. OpenSpec Behavioral Contracts (### Requirement: & #### Scenario: GIVEN-WHEN-THEN)',
      '  3. RFC 2119 Normative Precision (SHALL, MUST, MUST NOT, SHOULD)',
      '  4. Declarative Machine Code & Schemas',
      '  5. Graphify Knowledge Graph Anchoring (doc:<path> & CLI query)',
      '  6. OpenSpec SDD Lifecycle Mapping (proposal -> specs -> design -> tasks)',
      '  7. Anchored file:/// URIs & Zero Redundancy Invariant',
    ];

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
