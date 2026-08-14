#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.join(process.cwd(), 'docs');

function parseFrontmatter(content) {
  if (!content.startsWith('---')) return {};
  const endIdx = content.indexOf('\n---', 3);
  if (endIdx === -1) return {};
  const lines = content.substring(3, endIdx).split('\n');
  const fm = {};
  for (const line of lines) {
    const colon = line.indexOf(':');
    if (colon > 0) {
      const k = line.substring(0, colon).trim();
      let v = line.substring(colon + 1).trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.substring(1, v.length - 1);
      }
      fm[k] = v;
    }
  }
  return fm;
}

const folderDescriptions = {
  'docs': 'DBSN Central Documentation Hub Master Index and Root Manifest',
  'docs/strategy': 'Strategic business context, vision, customer segments, roadmap, compatibility, and product requirements',
  'docs/strategy/prd': 'Canonical Product Requirements Document (PRD v4.0.0) modular specifications',
  'docs/system': 'System Architecture, Data Model, API specifications, and Architecture Decision Records',
  'docs/system/architecture': 'Execution topology, routing lifecycle, system overview, codemaps, and information architecture',
  'docs/system/architecture/codemaps': 'Concise codebase architecture maps across frontend, backend, data, security, and dependencies',
  'docs/system/architecture/information-architecture': 'Navigation strategy, sitemaps, and user flow architectures',
  'docs/system/data-model': 'Canonical declarative Zod schemas, TypeScript interfaces, and Neon Prisma data models',
  'docs/system/api': 'Public API contracts, response envelopes, environment configuration schemas, and extensibility guides',
  'docs/system/api/mwe': 'Minimal Working Examples for adding API endpoints, client portal routes, and new spoke subdomains',
  'docs/system/adr': 'Architecture Decision Records for DBSN platform infrastructure and design standards',
  'docs/system/adr/superseded': 'Physical archive of superseded architecture decisions',
  'docs/engineering': 'Engineering governance policies, development playbooks, testing strategies, and AI agent operating rules',
  'docs/engineering/governance': 'AI agent rules, coding standards, contributing workflows, and versioning policies',
  'docs/engineering/playbooks': 'Developer onboarding, Sanity CMS integration, Google Search Console, and test engineering playbooks',
  'docs/engineering/playbooks/testing': 'Testing strategy, unit testing guides, Playwright E2E playbooks, and mock service specs',
  'docs/operations': 'Operational runbooks, incident response procedures, security policies, and historical audit findings',
  'docs/operations/security': 'Vulnerability disclosure SLAs, security policies, and edge runtime protections',
  'docs/operations/runbooks': 'Deployment, DNS cutover, release process, incident response, and client onboarding runbooks',
  'docs/operations/audits': 'Operational audits, developer fix guides, verification prompts, and audit archives',
  'docs/operations/audits/phase-1-findings': 'Card 1.1 through 1.8 Phase 1 deep-dive codebase audit findings and summary report',
  'docs/operations/audits/archive': 'Historical integration, UX, and Lighthouse audit reports'
};

function generateManifestForDir(dirPath) {
  const relPath = path.relative(process.cwd(), dirPath).replace(/\\/g, '/');
  const items = fs.readdirSync(dirPath);
  const documents = [];
  const subfolders = [];

  for (const item of items) {
    const fullPath = path.join(dirPath, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      subfolders.push(item);
    } else if (item.endsWith('.md')) {
      const content = fs.readFileSync(fullPath, 'utf8');
      const fm = parseFrontmatter(content);
      
      let summary = fm.title || item;
      const tldrMatch = content.match(/>\s*\*\*TL;DR\*\*:\s*([^\n]+)/i);
      if (tldrMatch) {
        summary = tldrMatch[1].trim();
      } else {
        const descMatch = content.match(/>\s*\*\*Authoritative Baseline Reference\*\*:\s*([^\n]+)/i);
        if (descMatch) summary = descMatch[1].trim();
      }

      documents.push({
        id: fm.id || ('doc:' + relPath + '/' + item),
        file: item,
        title: fm.title || item.replace('.md', ''),
        status: fm.status || 'LOCKED_BASELINE',
        summary: summary
      });
    }
  }

  const manifest = {
    folder: relPath,
    description: folderDescriptions[relPath] || (relPath + ' manifest'),
    layer: 'high-level-architecture',
    documents: documents,
    subfolders: subfolders
  };

  fs.writeFileSync(path.join(dirPath, 'index.json'), JSON.stringify(manifest, null, 2) + '\n');
  console.log(`Generated manifest for: ${relPath} (${documents.length} docs, ${subfolders.length} subfolders)`);

  for (const sub of subfolders) {
    generateManifestForDir(path.join(dirPath, sub));
  }
}

generateManifestForDir(root);
console.log('All index.json manifests generated successfully.');
