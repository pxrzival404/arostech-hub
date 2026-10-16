#!/usr/bin/env node
/**
 * AI-Friendly Documentation Validator (7 Pillars Standard)
 *
 * Validates Markdown documentation files (especially under docs/) against:
 * 1. Machine-readable YAML Frontmatter (id, title, version, status, graphify_community, authoritative_references)
 * 2. RFC 2119 Normative Precision (SHALL, MUST, MUST NOT, SHOULD, MAY)
 * 3. OpenSpec Behavioral Contracts (### Requirement: & #### Scenario:)
 * 4. Graphify Knowledge Graph Anchoring
 * 5. Anchored URI Links (file:///)
 *
 * Can be run via CLI or invoked as a Stop hook.
 */

'use strict';

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const REQUIRED_FRONTMATTER_KEYS = [
  'id',
  'title',
  'version',
  'status',
  'graphify_community',
  'authoritative_references',
];

const RFC_2119_KEYWORDS = /\b(SHALL|MUST|MUST NOT|SHOULD|MAY)\b/;
const OPENSPEC_CONTRACT_PATTERN = /###\s+Requirement:|####\s+Scenario:|GIVEN|WHEN|THEN/i;
const UNANCHORED_LOCAL_LINK = /\[([^\]]+)\]\((?!(file:\/\/\/|https?:\/\/|mailto:|\#))([^)]+)\)/g;

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return null;
  const endIdx = content.indexOf('\n---', 3);
  if (endIdx === -1) return null;

  const rawYaml = content.substring(3, endIdx).trim();
  const keys = [];
  for (const line of rawYaml.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const colonIdx = trimmed.indexOf(':');
      if (colonIdx > 0) {
        keys.push(trimmed.substring(0, colonIdx).trim());
      }
    }
  }
  return { rawYaml, keys };
}

function validateDocFile(filePath) {
  const normalizedPath = filePath.replace(/\\/g, '/');
  const issues = [];

  if (!fs.existsSync(filePath)) {
    return { filePath: normalizedPath, valid: true, issues: [] };
  }

  let content = '';
  try {
    content = fs.readFileSync(filePath, 'utf8');
  } catch (err) {
    return { filePath: normalizedPath, valid: false, issues: [`Failed to read file: ${err.message}`] };
  }

  // 1. YAML Frontmatter Check
  const fm = parseFrontmatter(content);
  if (!fm) {
    issues.push('Missing YAML Frontmatter (file must begin with --- block)');
  } else {
    for (const reqKey of REQUIRED_FRONTMATTER_KEYS) {
      if (!fm.keys.includes(reqKey)) {
        issues.push(`Frontmatter missing required key: '${reqKey}'`);
      }
    }
  }

  // 2. RFC 2119 Normative Precision Check (Warning if architecture/system doc lacks normative precision)
  if (normalizedPath.includes('docs/system/') || normalizedPath.includes('docs/engineering/')) {
    if (!RFC_2119_KEYWORDS.test(content)) {
      issues.push('System/Engineering doc should use RFC 2119 normative keywords (SHALL, MUST, SHOULD)');
    }
  }

  // 3. OpenSpec Behavioral Contract Check (Warning if functional/strategy doc lacks requirements/scenarios)
  if (normalizedPath.includes('docs/strategy/')) {
    if (!OPENSPEC_CONTRACT_PATTERN.test(content)) {
      issues.push('Strategy/PRD doc should include OpenSpec Behavioral Contracts (### Requirement: / #### Scenario:)');
    }
  }

  // 4. Anchored URI Check (Warning for relative/ad-hoc markdown links)
  let match;
  UNANCHORED_LOCAL_LINK.lastIndex = 0;
  while ((match = UNANCHORED_LOCAL_LINK.exec(content)) !== null) {
    const targetLink = match[3];
    if (targetLink && !targetLink.startsWith('#')) {
      issues.push(`Unanchored local link detected: '${match[0]}' -> Prefer file:/// URI format`);
    }
  }

  // 5. Graphify Anchoring Check
  if (!content.includes('graphify') && (!fm || !fm.keys.includes('graphify_community'))) {
    issues.push('Missing Graphify Knowledge Graph anchoring reference');
  }

  return {
    filePath: normalizedPath,
    valid: issues.length === 0,
    issues,
  };
}

function getModifiedDocFiles() {
  try {
    const output = execSync('git diff --name-only HEAD', { encoding: 'utf8' });
    const untracked = execSync('git ls-files --others --exclude-standard', { encoding: 'utf8' });
    const allFiles = [...output.split('\n'), ...untracked.split('\n')]
      .map(f => f.trim())
      .filter(f => f.startsWith('docs/') && f.endsWith('.md'));
    return [...new Set(allFiles)];
  } catch {
    return [];
  }
}

/**
 * Exported run() for in-process execution via run-with-flags.js / Stop hook
 */
function run(inputOrRaw, options = {}) {
  const isModifiedOnly = process.argv.includes('--modified-only');
  let filesToValidate = [];

  if (isModifiedOnly) {
    filesToValidate = getModifiedDocFiles();
  } else {
    let inputObj;
    try {
      inputObj = typeof inputOrRaw === 'string' ? JSON.parse(inputOrRaw) : (inputOrRaw || {});
    } catch {
      inputObj = {};
    }
    const targetFile = inputObj?.tool_input?.file_path || process.argv[2];
    if (targetFile && targetFile.endsWith('.md')) {
      filesToValidate = [targetFile];
    } else {
      filesToValidate = getModifiedDocFiles();
    }
  }

  if (filesToValidate.length === 0) {
    return { exitCode: 0 };
  }

  const results = filesToValidate.map(validateDocFile);
  const invalidResults = results.filter(r => !r.valid);

  if (invalidResults.length === 0) {
    return { exitCode: 0 };
  }

  const contextLines = ['[AI Doc Validator] WARNING: Documentation standardization issues detected (7 Pillars):'];
  for (const res of invalidResults) {
    contextLines.push(`  - File: ${res.filePath}`);
    for (const issue of res.issues) {
      contextLines.push(`    * ${issue}`);
    }
  }
  contextLines.push('Refer to 7 Pillars guide: .agents/rules/ai-friendly-docs.md');

  return {
    exitCode: 0,
    additionalContext: contextLines,
  };
}

function main() {
  const targetPath = process.argv[2];
  if (!targetPath || targetPath === '--modified-only') {
    const files = getModifiedDocFiles();
    if (files.length === 0) {
      console.log('No modified documentation files under docs/ to validate.');
      process.exit(0);
    }
    let totalIssues = 0;
    for (const file of files) {
      const res = validateDocFile(file);
      console.log(`\nValidating: ${res.filePath}`);
      if (res.valid) {
        console.log('  ✓ Complies with AI-Friendly Documentation Standard');
      } else {
        console.log('  ⚠️ Issues found:');
        res.issues.forEach(i => console.log(`    - ${i}`));
        totalIssues += res.issues.length;
      }
    }
    process.exit(0);
  }

  const res = validateDocFile(targetPath);
  console.log(`\nValidating: ${res.filePath}`);
  if (res.valid) {
    console.log('  ✓ Complies with AI-Friendly Documentation Standard');
  } else {
    console.log('  ⚠️ Issues found:');
    res.issues.forEach(i => console.log(`    - ${i}`));
  }
}

module.exports = { run, validateDocFile, main };

if (require.main === module) {
  main();
}
