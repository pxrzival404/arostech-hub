#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();

const replacements = [
  // Audit folder migrations
  {
    from: /docs\/audit\/fase-1-report\.md/g,
    to: 'docs/operations/audits/phase-1-findings/phase-1-summary-report.md'
  },
  {
    from: /docs\/audit\//g,
    to: 'docs/operations/audits/phase-1-findings/'
  },
  // Superseded ADRs
  {
    from: /docs\/system\/adr\/0001-migrate-fully-to-cloudflare-pages\.md/g,
    to: 'docs/system/adr/superseded/0001-migrate-fully-to-cloudflare-pages.md'
  },
  {
    from: /docs\/system\/adr\/0002-explicit-cloudflare-pages-deploy-command\.md/g,
    to: 'docs/system/adr/superseded/0002-explicit-cloudflare-pages-deploy-command.md'
  },
  // Archived audits
  {
    from: /docs\/operations\/audits\/integration-health-audit-2026-07-14\.md/g,
    to: 'docs/operations/audits/archive/integration-health-audit-2026-07-14.md'
  },
  {
    from: /docs\/operations\/audits\/landing-page-ux-audit-2026-07-09\.md/g,
    to: 'docs/operations/audits/archive/landing-page-ux-audit-2026-07-09.md'
  },
  {
    from: /docs\/operations\/audits\/lighthouse\/recomendation\/dayaberkah\.id-20260723T014653\.md/g,
    to: 'docs/operations/audits/archive/lighthouse-20260723-recommendation.md'
  },
  // Data model split
  {
    from: /docs\/system\/data-model\.md/g,
    to: 'docs/system/data-model/00-overview.md'
  },
  // PRD split
  {
    from: /docs\/strategy\/prd\.md/g,
    to: 'docs/strategy/prd/00-overview-and-goals.md'
  }
];

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next' && file !== '.open-next') {
        walkDir(fullPath, callback);
      }
    } else if (file.endsWith('.md')) {
      callback(fullPath);
    }
  }
}

let modifiedCount = 0;

walkDir(rootDir, (filePath) => {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  for (const r of replacements) {
    content = content.replace(r.from, r.to);
  }

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    const rel = path.relative(rootDir, filePath).replace(/\\/g, '/');
    console.log(`Reconciled links in: ${rel}`);
    modifiedCount++;
  }
});

console.log(`Link reconciliation complete. Modified ${modifiedCount} files.`);
