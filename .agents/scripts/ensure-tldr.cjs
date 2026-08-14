#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const rootDocs = path.join(process.cwd(), 'docs');

function checkAndAddTLDR(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('> **TL;DR**:')) {
    return;
  }

  // Find where frontmatter ends or first heading
  const lines = content.split('\n');
  let insertIdx = -1;
  let title = '';

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].startsWith('# ')) {
      title = lines[i].substring(2).trim();
      insertIdx = i + 1;
      break;
    }
  }

  if (insertIdx !== -1) {
    const rel = path.relative(process.cwd(), filePath).replace(/\\/g, '/');
    const tldrLine = `\n> **TL;DR**: Authoritative specification and architectural reference for ${title} within the DBSN platform (${rel}).\n`;
    lines.splice(insertIdx, 0, tldrLine);
    fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    console.log(`Added TL;DR to: ${rel}`);
  }
}

function walk(dir) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const full = path.join(dir, item);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      walk(full);
    } else if (item.endsWith('.md')) {
      checkAndAddTLDR(full);
    }
  }
}

walk(rootDocs);
console.log('TL;DR check completed.');
