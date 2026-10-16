#!/usr/bin/env node
/**
 * @file scripts/help.js
 * @description Hardened, deterministic tool catalog, capability discovery engine,
 * parameter inspector, prompt recipe generator, health doctor, and markdown cheatsheet exporter.
 *
 * Requirements: Strictly ZERO external dependencies (Node.js core modules only).
 * Standard: agentskills.io/v1.0 & 7-Pillars AI-Friendly Docs Standard.
 *
 * Usage:
 *   node scripts/help.js [--all]
 *   node scripts/help.js --category <native|mcp|cli|repo>
 *   node scripts/help.js --search <query>
 *   node scripts/help.js --inspect <tool_name> [--json]
 *   node scripts/help.js --recipe <intent> | --prompt <tool_name> [--json]
 *   node scripts/help.js --doctor | --health [--json]
 *   node scripts/help.js --export-md [targetFilePath] [--json]
 *   node scripts/help.js --json
 *   node scripts/help.js --help
 */

import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import childProcess from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// 1. ANSI STYLING & TERMINAL CAPABILITIES
// ============================================================================
const isColorSupported = (() => {
  if (process.argv.includes('--no-color') || process.env.NO_COLOR !== undefined) return false;
  if (process.env.TERM === 'dumb') return false;
  if (process.argv.includes('--json') || process.argv.includes('-j')) return false;
  return Boolean(process.stdout.isTTY || process.env.FORCE_COLOR);
})();

const c = {
  reset: isColorSupported ? '\x1b[0m' : '',
  bold: isColorSupported ? '\x1b[1m' : '',
  dim: isColorSupported ? '\x1b[2m' : '',
  underline: isColorSupported ? '\x1b[4m' : '',
  red: isColorSupported ? '\x1b[31m' : '',
  green: isColorSupported ? '\x1b[32m' : '',
  yellow: isColorSupported ? '\x1b[33m' : '',
  blue: isColorSupported ? '\x1b[34m' : '',
  magenta: isColorSupported ? '\x1b[35m' : '',
  cyan: isColorSupported ? '\x1b[36m' : '',
  white: isColorSupported ? '\x1b[37m' : '',
  gray: isColorSupported ? '\x1b[90m' : '',
  brightRed: isColorSupported ? '\x1b[91m' : '',
  brightGreen: isColorSupported ? '\x1b[92m' : '',
  brightYellow: isColorSupported ? '\x1b[93m' : '',
  brightCyan: isColorSupported ? '\x1b[96m' : '',
  brightWhite: isColorSupported ? '\x1b[97m' : '',
  bgCyan: isColorSupported ? '\x1b[46m\x1b[30m' : '',
  bgMagenta: isColorSupported ? '\x1b[45m\x1b[37m' : '',
  bgYellow: isColorSupported ? '\x1b[43m\x1b[30m' : '',
  bgGreen: isColorSupported ? '\x1b[42m\x1b[30m' : ''
};

const BADGES = {
  ready: `${c.green}${c.bold}[+] READY${c.reset}`,
  warning: `${c.yellow}${c.bold}[!] WARNING${c.reset}`,
  error: `${c.red}${c.bold}[-] ERROR${c.reset}`,
  info: `${c.cyan}${c.bold}[i] INFO${c.reset}`
};

// ============================================================================
// 2. CATEGORY DEFINITIONS & METADATA
// ============================================================================
const CATEGORY_MAP = Object.freeze({
  native: 'native',
  default_api: 'native',
  builtin: 'native',
  mcp: 'mcp',
  mcp_servers: 'mcp',
  cli: 'cli',
  agy: 'cli',
  tui: 'cli',
  repo: 'repo',
  workflow: 'repo',
  workflows: 'repo',
  opsx: 'repo',
  scripts: 'repo'
});

const CATEGORY_METADATA = Object.freeze({
  native: {
    id: 'native',
    badge: '📦 NATIVE CORE',
    title: 'Native Agent Tools (default_api)',
    color: c.cyan,
    badgeBg: c.bgCyan,
    desc: 'Core low-level harness APIs executed directly inside agent session.'
  },
  mcp: {
    id: 'mcp',
    badge: '🔌 MCP SERVERS',
    title: 'Model Context Protocol (MCP) Tools',
    color: c.magenta,
    badgeBg: c.bgMagenta,
    desc: 'Federated tools exposed by local and global MCP servers.'
  },
  cli: {
    id: 'cli',
    badge: '⚡ CLI & TUI',
    title: 'Antigravity CLI Commands & TUI Controls (agy)',
    color: c.yellow,
    badgeBg: c.bgYellow,
    desc: 'CLI invocation flags, TUI slash commands, and hotkeys.'
  },
  repo: {
    id: 'repo',
    badge: '🛠️ REPO WORKFLOWS',
    title: 'Repository Tools & OpenSpec Workflows (arostech-hub)',
    color: c.green,
    badgeBg: c.bgGreen,
    desc: 'OpenSpec SDD pipelines, verification gates, and maintenance scripts.'
  }
});

const SAFETY_METADATA = Object.freeze({
  read_only: { label: '🛡️  Read-Only', description: 'Safe, non-destructive inspection query', color: c.brightGreen },
  mutating: { label: '⚠️  Mutating', description: 'Modifies files, databases, repository, or cloud state', color: c.brightYellow },
  standard: { label: '⚙️  Standard', description: 'Agent orchestration, scheduling, or process execution', color: c.brightCyan }
});

// ============================================================================
// 3. HARDENED PATH, FS & SECURITY UTILITIES
// ============================================================================
function toPosixPath(filePath) {
  return filePath ? filePath.replace(/\\/g, '/') : '';
}

function maskSecret(val) {
  if (!val || typeof val !== 'string') return '(not set)';
  const trimmed = val.trim();
  if (trimmed.length === 0) return '(not set)';
  if (trimmed.length <= 8) return '********';
  return `${trimmed.slice(0, 4)}...${trimmed.slice(-4)}`;
}

/**
 * ReDoS-safe non-regex query highlighter using substring matching.
 */
function safeHighlightQuery(text, query) {
  if (!isColorSupported || !query || !text || typeof text !== 'string') return text || '';
  const q = String(query).trim();
  if (q.length === 0 || q.length > 128) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = q.toLowerCase();
  let startIndex = 0;
  let matchIndex = lowerText.indexOf(lowerQuery, startIndex);
  if (matchIndex === -1) return text;

  let result = '';
  while (matchIndex !== -1) {
    result += text.slice(startIndex, matchIndex);
    const matchedOriginal = text.slice(matchIndex, matchIndex + q.length);
    result += `${c.underline}${c.yellow}${matchedOriginal}${c.reset}`;
    startIndex = matchIndex + q.length;
    matchIndex = lowerText.indexOf(lowerQuery, startIndex);
  }
  result += text.slice(startIndex);
  return result;
}

/**
 * Resolves a safe export path, checking for forbidden Windows characters.
 */
function resolveSafeExportPath(userPath, defaultFilename = 'docs/CHEATSHEET_TOOLS.md') {
  let targetPath = userPath ? String(userPath).trim() : defaultFilename;
  const invalidWinChars = /["*?<>|]/;
  if (invalidWinChars.test(targetPath)) {
    throw new Error(`Export path contains invalid filename characters: "${targetPath}"`);
  }
  const absolutePath = path.isAbsolute(targetPath) ? targetPath : path.resolve(process.cwd(), targetPath);
  const parentDir = path.dirname(absolutePath);
  if (!fs.existsSync(parentDir)) {
    fs.mkdirSync(parentDir, { recursive: true });
  }
  return absolutePath;
}

function resolveToolsPath() {
  if (process.env.AGY_TOOLS_JSON_PATH && fs.existsSync(process.env.AGY_TOOLS_JSON_PATH)) {
    return process.env.AGY_TOOLS_JSON_PATH;
  }
  const candidates = [
    path.resolve(__dirname, '../resources/tools.json'),
    path.resolve(__dirname, 'resources/tools.json'),
    path.resolve(process.cwd(), '.agents/skills/agy-tool/resources/tools.json'),
    path.resolve(process.cwd(), 'resources/tools.json'),
    path.resolve(process.cwd(), 'tools.json')
  ];
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  throw new Error(`Unable to locate tools.json registry in candidate paths:\n${candidates.join('\n')}`);
}

function readLocalEnvFiles() {
  const envMap = {};
  const candidates = [
    path.resolve(process.cwd(), '.env'),
    path.resolve(process.cwd(), '.env.local')
  ];
  for (const f of candidates) {
    if (fs.existsSync(f)) {
      try {
        const content = fs.readFileSync(f, 'utf8');
        for (const line of content.split(/\r?\n/)) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith('#')) continue;
          const eqIdx = trimmed.indexOf('=');
          if (eqIdx > 0) {
            const key = trimmed.slice(0, eqIdx).trim();
            let val = trimmed.slice(eqIdx + 1).trim();
            if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
              val = val.slice(1, -1);
            }
            envMap[key] = val;
          }
        }
      } catch {}
    }
  }
  return envMap;
}

// ============================================================================
// 4. HARDENED ARGUMENT PARSER
// ============================================================================
function validateCategory(raw) {
  if (!raw) throw new Error('Flag --category requires a value: <native|mcp|cli|repo>');
  const key = raw.trim().toLowerCase();
  const resolved = CATEGORY_MAP[key];
  if (!resolved) throw new Error(`Invalid category "${raw}". Must be one of: native, mcp, cli, repo`);
  return resolved;
}

function parseArgs(argv = process.argv) {
  const args = argv.slice(2);
  const options = {
    all: false,
    category: null,
    search: null,
    inspect: null,
    recipe: null,
    doctor: false,
    exportMd: false,
    exportPath: null,
    json: false,
    help: false
  };

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      options.help = true;
    } else if (arg === '--all' || arg === '-a') {
      options.all = true;
    } else if (arg === '--doctor' || arg === '--health' || arg === '-d') {
      options.doctor = true;
    } else if (arg === '--json' || arg === '-j') {
      options.json = true;
    } else if (arg === '--no-color') {
      // Handled globally
    } else if (arg === '--inspect' || arg === '-i') {
      const next = args[i + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('Flag --inspect requires a tool name (e.g. `--inspect replace_file_content`)');
      }
      options.inspect = next.trim();
      i++;
    } else if (arg.startsWith('--inspect=') || arg.startsWith('-i=')) {
      const val = arg.split('=')[1].trim();
      if (!val) throw new Error('Flag --inspect requires a non-empty tool name');
      options.inspect = val;
    } else if (arg === '--recipe' || arg === '-r' || arg === '--prompt' || arg === '-p') {
      const next = args[i + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('Flag --recipe requires an intent or tool name (e.g. `--recipe refactor` or `--prompt invoke_subagent`)');
      }
      options.recipe = next.trim();
      i++;
    } else if (arg.startsWith('--recipe=') || arg.startsWith('--prompt=') || arg.startsWith('-r=') || arg.startsWith('-p=')) {
      const val = arg.split('=')[1].trim();
      if (!val) throw new Error('Flag --recipe requires a non-empty intent or tool name');
      options.recipe = val;
    } else if (arg === '--export-md' || arg === '-e') {
      options.exportMd = true;
      const next = args[i + 1];
      if (next && !next.startsWith('-')) {
        options.exportPath = next.trim();
        i++;
      } else {
        options.exportPath = 'docs/CHEATSHEET_TOOLS.md';
      }
    } else if (arg.startsWith('--export-md=') || arg.startsWith('-e=')) {
      options.exportMd = true;
      const val = arg.split('=')[1].trim();
      options.exportPath = val || 'docs/CHEATSHEET_TOOLS.md';
    } else if (arg === '--category' || arg === '-c') {
      const next = args[i + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('Flag --category requires a value: <native|mcp|cli|repo>');
      }
      options.category = validateCategory(next);
      i++;
    } else if (arg.startsWith('--category=')) {
      options.category = validateCategory(arg.substring('--category='.length));
    } else if (arg === '--search' || arg === '-s' || arg === '--query' || arg === '-q') {
      const next = args[i + 1];
      if (!next || next.startsWith('-')) {
        throw new Error('Flag --search requires a search query string');
      }
      options.search = next.trim();
      i++;
    } else if (arg.startsWith('--search=') || arg.startsWith('-s=')) {
      options.search = arg.split('=')[1].trim();
    } else if (!arg.startsWith('-') && !options.search && !options.inspect && !options.recipe && !options.doctor && !options.exportMd) {
      options.search = arg.trim();
    } else {
      throw new Error(`Unknown or misplaced argument: "${arg}". Run with --help to see valid options.`);
    }
  }

  if (!options.category && !options.search && !options.inspect && !options.recipe && !options.doctor && !options.exportMd) {
    options.all = true;
  }
  return options;
}

// ============================================================================
// 5. FUZZY MATCHING & TOOL LOOKUP ENGINE
// ============================================================================
function levenshteinDistance(a, b) {
  const s1 = String(a || '').toLowerCase();
  const s2 = String(b || '').toLowerCase();
  const m = s1.length;
  const n = s2.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const row = new Array(n + 1);
  for (let j = 0; j <= n; j++) row[j] = j;

  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    row[0] = i;
    const c1 = s1.charCodeAt(i - 1);
    for (let j = 1; j <= n; j++) {
      const c2 = s2.charCodeAt(j - 1);
      const temp = row[j];
      row[j] = Math.min(row[j] + 1, row[j - 1] + 1, prev + (c1 === c2 ? 0 : 1));
      prev = temp;
    }
  }
  return row[n];
}

function calculateToolNameSimilarity(toolName, query) {
  const s1 = String(toolName || '').toLowerCase().trim();
  const s2 = String(query || '').toLowerCase().trim();
  if (!s1 || !s2) return 0;
  if (s1 === s2) return 1.0;

  const dist = levenshteinDistance(s1, s2);
  const maxLen = Math.max(s1.length, s2.length);
  let score = maxLen === 0 ? 1.0 : 1.0 - (dist / maxLen);

  if (s1.includes(s2)) {
    score = Math.max(score, 0.80 + (s2.length / s1.length) * 0.18);
  }

  const toolTokens = s1.split(/[-_:]/).filter(Boolean);
  const queryTokens = s2.split(/[-_:]/).filter(Boolean);

  if (toolTokens.length > 0 && queryTokens.length > 0) {
    let matchedQueryTokens = 0;
    for (const qToken of queryTokens) {
      for (const tToken of toolTokens) {
        if (tToken === qToken || (qToken.length >= 3 && tToken.startsWith(qToken)) || (tToken.length >= 3 && qToken.startsWith(tToken))) {
          matchedQueryTokens++;
          break;
        }
      }
    }
    const queryCoverage = matchedQueryTokens / queryTokens.length;
    if (queryCoverage >= 0.5) {
      score = Math.max(score, 0.70 + queryCoverage * 0.25);
    }
  }

  return Number(score.toFixed(3));
}

function findTool(tools, query) {
  if (!query || typeof query !== 'string') {
    return { tool: null, matchType: 'none', similarity: 0, suggestions: [] };
  }
  const q = query.trim();
  const qLower = q.toLowerCase();
  const qNorm = qLower.replace(/[^a-z0-9]/g, '');

  for (const tool of tools) {
    if (tool.name.toLowerCase() === qLower) {
      return { tool, matchType: 'exact', similarity: 1.0, suggestions: [] };
    }
  }

  for (const tool of tools) {
    const qualified = `${tool.server}:${tool.name}`.toLowerCase();
    if (qualified === qLower || qualified.endsWith(`:${qLower}`)) {
      return { tool, matchType: 'server_qualified', similarity: 1.0, suggestions: [] };
    }
  }

  for (const tool of tools) {
    const tNorm = tool.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (tNorm === qNorm && tNorm.length > 0) {
      return { tool, matchType: 'normalized', similarity: 0.95, suggestions: [] };
    }
  }

  const scored = tools.map(tool => {
    const nameScore = calculateToolNameSimilarity(tool.name, q);
    const serverScore = calculateToolNameSimilarity(`${tool.server}:${tool.name}`, q);
    let tagScore = 0;
    if (Array.isArray(tool.tags)) {
      for (const tag of tool.tags) {
        tagScore = Math.max(tagScore, calculateToolNameSimilarity(tag, q));
      }
    }
    const similarity = Math.max(nameScore, serverScore, tagScore * 0.50);
    return { tool, similarity };
  });

  scored.sort((a, b) => b.similarity - a.similarity);
  const topMatch = scored[0];
  const suggestions = scored.slice(0, 4).filter(s => s.similarity >= 0.30);

  if (topMatch && topMatch.similarity >= 0.65) {
    return { tool: topMatch.tool, matchType: 'fuzzy', similarity: topMatch.similarity, suggestions: suggestions.slice(1) };
  }

  return { tool: null, matchType: 'none', similarity: topMatch ? topMatch.similarity : 0, suggestions };
}

// ============================================================================
// 6. SYSTEM HEALTH DOCTOR PROBES (<300ms BUDGET)
// ============================================================================
function probeNodeRuntime() {
  const version = process.version;
  const match = version.match(/^v?(\d+)\.(\d+)\.(\d+)/);
  const major = match ? parseInt(match[1], 10) : 0;
  const isCompatible = major >= 18;
  return {
    id: 'node_runtime',
    name: 'Node.js Runtime Environment',
    status: isCompatible ? 'ready' : 'error',
    message: isCompatible ? `Node.js ${version} (>=18.0.0 satisfied)` : `Node.js ${version} is incompatible (v18.0.0+ required)`,
    details: { version, major, platform: process.platform, arch: process.arch },
    remediation: isCompatible ? null : 'Upgrade Node.js to v18.x or v20.x+ LTS.'
  };
}

function probePosixToolchain() {
  const isWindows = process.platform === 'win32';
  let bashAvailable = false;
  let bashPath = null;

  if (isWindows) {
    const candidates = [
      'C:/Program Files/Git/bin/bash.exe',
      'C:/Program Files/Git/usr/bin/bash.exe',
      'C:/Program Files (x86)/Git/bin/bash.exe'
    ];
    for (const cand of candidates) {
      if (fs.existsSync(cand)) {
        bashPath = cand;
        bashAvailable = true;
        break;
      }
    }
  }

  if (!bashAvailable) {
    try {
      const lookupCmd = isWindows ? 'where bash' : 'which bash';
      const out = childProcess.execSync(lookupCmd, { stdio: ['pipe', 'pipe', 'pipe'], timeout: 150, encoding: 'utf8', windowsHide: true });
      const firstLine = out.trim().split(/\r?\n/)[0];
      if (firstLine) {
        bashPath = toPosixPath(firstLine);
        bashAvailable = true;
      }
    } catch {}
  }

  const posixCwd = toPosixPath(process.cwd());
  return {
    id: 'posix_toolchain',
    name: 'Git Bash / POSIX Toolchain Standard',
    status: bashAvailable ? 'ready' : 'warning',
    message: bashAvailable ? `Git Bash / POSIX toolchain detected (${bashPath || 'in PATH'})` : 'POSIX bash shell not detected in PATH',
    details: { bashAvailable, bashPath, posixCwd },
    remediation: bashAvailable ? null : 'Install Git for Windows and add Git Bash to your PATH.'
  };
}

function probeEnvironmentVariables() {
  const localEnv = readLocalEnvFiles();
  const envVars = [
    { key: 'GEMINI_API_KEY', label: 'Gemini API Key', critical: false, alt: ['GOOGLE_API_KEY', 'GEMINI_KEY'] },
    { key: 'CONTEXT7_API_KEY', label: 'Context7 Docs Key', critical: false },
    { key: 'SANITY_AUTH_TOKEN', label: 'Sanity Studio Token', critical: false, alt: ['SANITY_API_TOKEN', 'SANITY_API_READ_TOKEN', 'SANITY_API_WRITE_TOKEN'] },
    { key: 'DATABASE_URL', label: 'Postgres DB URL', critical: false, alt: ['NEON_DATABASE_URL', 'DIRECT_URL'] }
  ];

  const details = {};
  let missingCritical = 0;
  let missingOptional = 0;

  for (const item of envVars) {
    let rawVal = process.env[item.key] || localEnv[item.key];
    if (!rawVal && item.alt) {
      for (const a of item.alt) {
        if (process.env[a] || localEnv[a]) {
          rawVal = process.env[a] || localEnv[a];
          break;
        }
      }
    }
    const isSet = Boolean(rawVal && rawVal.trim().length > 0);
    details[item.key] = { isSet, critical: item.critical, masked: isSet ? maskSecret(rawVal) : '(unset)' };
    if (!isSet) {
      if (item.critical) missingCritical++;
      else missingOptional++;
    }
  }

  return {
    id: 'env_variables',
    name: 'Core Environment & Auth Variables',
    status: missingCritical > 0 ? 'error' : missingOptional > 0 ? 'warning' : 'ready',
    message: missingCritical > 0 ? 'Missing critical environment variables' : missingOptional > 0 ? `${missingOptional} optional variable(s) unset` : 'All core keys configured',
    details,
    remediation: missingCritical > 0 ? 'Set required variables in .env.local' : missingOptional > 0 ? 'Configure optional API keys in .env.local for full MCP feature availability.' : null
  };
}

function probeMcpConfigurations() {
  const homeDir = os.homedir();
  const cwd = process.cwd();
  const candidatePaths = [
    path.join(homeDir, '.gemini', 'antigravity', 'mcp_config.json'),
    path.join(cwd, '.agents', 'mcp_config.json'),
    path.join(cwd, '.agents')
  ];

  const found = candidatePaths.filter(p => fs.existsSync(p)).map(p => toPosixPath(p));
  return {
    id: 'mcp_config',
    name: 'MCP Server Configurations',
    status: found.length > 0 ? 'ready' : 'warning',
    message: found.length > 0 ? `Detected active config at ${found[0]}` : 'No local MCP config found',
    details: { foundConfigs: found },
    remediation: found.length === 0 ? 'Create ~/.gemini/antigravity/mcp_config.json for MCP server integrations.' : null
  };
}

function probeRepositoryIntegrity() {
  const cwd = process.cwd();
  let toolsCount = 0;
  let toolsValid = false;
  try {
    const toolsPath = resolveToolsPath();
    const parsed = JSON.parse(fs.readFileSync(toolsPath, 'utf8'));
    if (parsed && Array.isArray(parsed.tools)) {
      toolsCount = parsed.tools.length;
      toolsValid = true;
    }
  } catch {}

  const docsExists = fs.existsSync(path.resolve(cwd, 'docs'));
  const openspecExists = fs.existsSync(path.resolve(cwd, 'openspec'));

  return {
    id: 'repo_integrity',
    name: 'Active Repository & Skill Integrity',
    status: toolsValid ? 'ready' : 'error',
    message: toolsValid ? `Repository verified (tools.json: ${toolsCount} tools, docs: ${docsExists ? 'yes' : 'opt'}, openspec: ${openspecExists ? 'yes' : 'opt'})` : 'Missing or invalid tools.json registry',
    details: { toolsCount, toolsValid, docsExists, openspecExists },
    remediation: toolsValid ? null : 'Restore .agents/skills/agy-tool/resources/tools.json from canonical template.'
  };
}

function runDoctorProbes() {
  const startTime = Date.now();
  const probes = [probeNodeRuntime(), probePosixToolchain(), probeEnvironmentVariables(), probeMcpConfigurations(), probeRepositoryIntegrity()];
  const durationMs = Date.now() - startTime;

  let passed = 0, warnings = 0, errors = 0;
  for (const p of probes) {
    if (p.status === 'ready') passed++;
    else if (p.status === 'warning') warnings++;
    else if (p.status === 'error') errors++;
  }

  return {
    schemaVersion: '1.0.0',
    generatedAt: new Date().toISOString(),
    status: errors > 0 ? 'error' : warnings > 0 ? 'warning' : 'healthy',
    executionDurationMs: durationMs,
    budgetMs: 300,
    budgetSatisfied: durationMs < 300,
    summary: { totalChecks: probes.length, passed, warnings, errors, scorePercent: Math.round(((passed + warnings * 0.5) / probes.length) * 100) },
    probes
  };
}

function renderDoctorTerminal(report) {
  const lines = [
    '',
    `${c.bold}${c.cyan}╔═══════════════════════════════════════════════════════════════════════════════════╗${c.reset}`,
    `${c.bold}${c.cyan}║   ✦ ANTIGRAVITY SYSTEM DIAGNOSTICS & HEALTH DOCTOR (--doctor) ✦                   ║${c.reset}`,
    `${c.bold}${c.cyan}╚═══════════════════════════════════════════════════════════════════════════════════╝${c.reset}`,
    `${c.dim}Execution Time:${c.reset} ${c.green}${report.executionDurationMs}ms${c.reset} ${c.dim}(Budget: <${report.budgetMs}ms)${c.reset}   |   ${c.dim}Score:${c.reset} ${c.bold}${report.summary.scorePercent}%${c.reset}`,
    ''
  ];

  for (const p of report.probes) {
    const badge = BADGES[p.status] || BADGES.info;
    lines.push(`  ${badge}  ${c.bold}${c.white}${p.name}${c.reset}`);
    lines.push(`             ${c.gray}${p.message}${c.reset}`);
    if (p.id === 'env_variables' && p.details) {
      for (const [k, v] of Object.entries(p.details)) {
        lines.push(`             ${c.dim}• ${k}:${c.reset} ${v.isSet ? `${c.green}${v.masked}${c.reset}` : `${c.yellow}(unset)${c.reset}`}`);
      }
    }
    lines.push('');
  }

  lines.push(`${c.dim}─────────────────────────────────────────────────────────────────────────────────${c.reset}`);
  lines.push(`  ${c.bold}Summary:${c.reset} ${report.summary.passed} passed | ${report.summary.warnings} warnings | ${report.summary.errors} errors`);
  const actionable = report.probes.filter(p => p.remediation);
  if (actionable.length > 0) {
    lines.push('');
    lines.push(`${c.bold}${c.yellow}Action Items:${c.reset}`);
    for (const a of actionable) lines.push(`  ${c.bold}• ${a.name}:${c.reset} ${c.cyan}${a.remediation}${c.reset}`);
  }
  lines.push('');
  return lines.join('\n');
}

// ============================================================================
// 7. RECIPE & PROMPT GENERATOR CATALOG
// ============================================================================
const RECIPES = Object.freeze({
  refactor: {
    title: 'Surgical Single-Block Refactoring',
    tool: 'replace_file_content',
    template: 'Refactor the function `[functionName]` in `[filePath]` to [desiredBehavior]. Do not alter surrounding helper functions, comments, or imports. Maintain exact indentation.',
    example: 'Refactor the function `validateAuthSession` in `src/lib/auth/session.ts` to return null on expired tokens. Do not alter surrounding helper functions or file imports.',
    tips: ['Run view_file first to get exact whitespace.', 'Keep TargetContent unique to a single block.']
  },
  background_build: {
    title: 'Background Compilation & Reactive Wakeup',
    tool: 'run_command',
    template: 'Run `[buildCommand]` in the background with Cwd="[workingDir]". While compilation runs, inspect `[followUpFile]` without polling task status.',
    example: 'Run `pnpm build` in the background with Cwd="d:/dev/arostech-hub". While compilation runs, inspect `src/middleware.ts` without polling.',
    tips: ['Never busy-wait poll manage_task.', 'Stop calling tools to await Reactive Wakeup.']
  },
  context7_docs: {
    title: 'Framework Documentation Lookup',
    tool: 'context7',
    template: 'Look up authoritative documentation for `[libraryName]` using Context7 for `[topic]`. Verify compatibility with [version].',
    example: 'Look up official Next.js 15+ documentation using Context7 for Route Handlers with streaming responses.',
    tips: ['Context7 precedes web search for all libraries.', 'Resolve library ID first, then query docs.']
  },
  neon_query: {
    title: 'Neon Serverless Postgres Diagnostics',
    tool: 'mcp-server-neon',
    template: 'On Neon Postgres project `[projectId]` branch `[branch]`, run SQL `[sqlStatement]`. Analyze query execution plan with EXPLAIN.',
    example: 'On Neon Postgres project `arostech-prod` branch `staging`, execute EXPLAIN ANALYZE on "SELECT * FROM users WHERE email = \'admin@arostech.com\'".',
    tips: ['Always test migrations on ephemeral DB branches first.', 'Use explain_sql_statement to verify index usage.']
  },
  subagent_research: {
    title: 'Subagent Parallel Research Delegation',
    tool: 'invoke_subagent',
    template: 'Spawn a subagent using model tier `[modelTier]` with Role `"[agentRole]"` to analyze `[scope]` for [objective]. Deliver findings via send_message.',
    example: 'Spawn a research subagent using model "flash" to explore prisma/schema.prisma and map Organization relations, then report back.',
    tips: ['Subagents MUST return findings via send_message.', 'Yield execution after spawning subagents.']
  },
  graphify_blast_radius: {
    title: 'Architectural Blast Radius & Path Tracing',
    tool: 'graphify:shortest_path',
    template: 'Before modifying `[targetSymbolOrFile]`, query Graphify with mode="dfs" and compute shortest_path between `[sourceSymbol]` and `[dependentSymbol]` (max_hops=[maxHops]). Identify any God nodes with 50+ connections.',
    example: 'Before modifying `src/lib/auth.ts`, query Graphify with mode="dfs" and shortest_path between "authConfig" and "middleware.ts" (max_hops=5). Verify if god_nodes are impacted.',
    tips: ['Use mode="dfs" for path tracing and mode="bfs" for broad cluster context.', 'Inspect god_nodes before making cross-layer schema or auth changes.']
  },
  graphify_memory: {
    title: 'Session Work Memory & Reflection Sync',
    tool: 'graphify:reflect',
    template: 'At the conclusion of the feature session, execute `graphify reflect --if-stale --out docs/LESSONS.md` to distill debugging insights into `.graphify_learning.json` and persist node confidence overlays.',
    example: 'Execute `graphify reflect --if-stale --out docs/LESSONS.md` to record the resolution of Next.js 16 Edge runtime cookie constraints.',
    tips: ['Runs during Layer 6 Memory Sync to capture verified solutions.', 'Tags nodes as preferred, tentative, or contested.']
  }
});

function renderRecipeScreen(key, rawRegistry) {
  const r = RECIPES[key] || Object.values(RECIPES).find(v => v.tool.toLowerCase().includes(key.toLowerCase()));
  if (!r) {
    const available = Object.keys(RECIPES).join(', ');
    throw new Error(`Recipe or tool "${key}" not found. Available recipes: ${available}`);
  }

  const lines = [
    '',
    `${c.bold}${c.cyan}╔═══════════════════════════════════════════════════════════════════════════════════╗${c.reset}`,
    `${c.bold}${c.cyan}║                     ✦ DEVELOPER PROMPT FORMULA RECIPE ✦                           ║${c.reset}`,
    `${c.bold}${c.cyan}╚═══════════════════════════════════════════════════════════════════════════════════╝${c.reset}`,
    `  ${c.bold}Recipe:${c.reset} ${c.brightWhite}${r.title}${c.reset}   |   ${c.dim}Primary Tool:${c.reset} ${c.magenta}${r.tool}${c.reset}`,
    '',
    `  ${c.bold}${c.white}PROMPT FORMULA TEMPLATE:${c.reset}`,
    `    ${c.brightCyan}${r.template}${c.reset}`,
    '',
    `  ${c.bold}${c.white}COPY-PASTEABLE EXAMPLE:${c.reset}`,
    `    ${c.green}${r.example}${c.reset}`,
    '',
    `  ${c.bold}${c.yellow}ANTI-HALLUCINATION TIPS:${c.reset}`
  ];
  for (const tip of r.tips) lines.push(`    ${c.yellow}•${c.reset} ${c.white}${tip}${c.reset}`);
  lines.push('');
  return lines.join('\n');
}

// ============================================================================
// 8. 7-PILLARS MARKDOWN CHEATSHEET EXPORTER
// ============================================================================
function generateMarkdownCheatsheet(rawRegistry) {
  const tools = Array.isArray(rawRegistry.tools) ? rawRegistry.tools : [];
  const currentDate = new Date().toISOString().split('T')[0];
  const nativeTools = tools.filter(t => CATEGORY_MAP[t.category.toLowerCase()] === 'native');
  const mcpTools = tools.filter(t => CATEGORY_MAP[t.category.toLowerCase()] === 'mcp');
  const cliTools = tools.filter(t => CATEGORY_MAP[t.category.toLowerCase()] === 'cli');
  const repoTools = tools.filter(t => CATEGORY_MAP[t.category.toLowerCase()] === 'repo');

  const md = [
    `---`,
    `title: Antigravity Unified Tool Ecosystem Cheatsheet`,
    `description: Authoritative 7-Pillars capability discovery and prompt reference cheatsheet for Google Antigravity Native tools, MCP servers, CLI commands, and Repository workflows.`,
    `standard: agentskills.io/v1.0`,
    `category: documentation`,
    `version: ${rawRegistry.version || '2.5.0'}`,
    `last_updated: ${currentDate}`,
    `tags: [antigravity, tools, mcp, cli, workflows, cheatsheet]`,
    `canonical: docs/CHEATSHEET_TOOLS.md`,
    `---`,
    ``,
    `# Antigravity Unified Tool Ecosystem Cheatsheet`,
    ``,
    `> **Skill Name:** \`agy-tool\` | **Version:** \`${rawRegistry.version || '2.5.0'}\` | **Updated:** \`${currentDate}\``,
    ``,
    `> **TL;DR**:`,
    `> - **Scope**: 4-tier tooling catalog (Native \`default_api\`, MCP Servers, CLI & TUI Controls, OpenSpec SDD Workflows).`,
    `> - **Core Invariants**: POSIX forward slashes (\`/\`), 1-based indexing, verbatim whitespace matching, and Reactive Wakeup (no polling).`,
    `> - **Discovery**: Execute \`node scripts/help.js --search <query>\` or \`/agy-tool --help\` for instant discovery.`,
    ``,
    `---`,
    ``,
    `## Table of Contents`,
    `1. [Master Tool Selection Matrix](#1-master-tool-selection-matrix)`,
    `2. [Category 1: Native Agent Tools (\`default_api\`)](#2-category-1-native-agent-tools-default_api)`,
    `3. [Category 2: Model Context Protocol (MCP) Tools](#3-category-2-model-context-protocol-mcp-tools)`,
    `4. [Category 3: Antigravity CLI Commands & TUI Controls (\`agy\`)](#4-category-3-antigravity-cli-commands--tui-controls-agy)`,
    `5. [Category 4: Repository Workflows & Custom Scripts (\`arostech-hub\`)](#5-category-4-repository-workflows--custom-scripts-arostech-hub)`,
    `6. [Critical Invariants & Guardrails](#6-critical-invariants--guardrails)`,
    `7. [Developer Prompt Recipes](#7-developer-prompt-recipes)`,
    ``,
    `---`,
    ``,
    `## 1. Master Tool Selection Matrix`,
    ``,
    `| Task Objective | Recommended Tool | Fallback / Alternative | Operational Invariant |`,
    `|---|---|---|---|`,
    `| **Precise Single Code Edit** | \`replace_file_content\` | \`multi_replace_file_content\` | Exact character match, 1-indexed lines |`,
    `| **Multi-Location / Batch Edit** | \`multi_replace_file_content\` | \`replace_file_content\` | Array of ordered replacement chunks |`,
    `| **Create New / Overwrite File** | \`write_to_file\` | — | Set \`Overwrite: true\` if rewriting |`,
    `| **Inspect File / Line Slices** | \`view_file\` | \`grep_search\` | Max 800 lines/call; \`StartLine >= 1\` |`,
    `| **Search Codebase Content** | \`grep_search\` (ripgrep) | \`token-optimizer:smart_ast_grep\` | Fast regex/literal search; max 50 matches |`,
    `| **Execute Bash / Build / Test** | \`run_command\` | \`manage_task\` | Git Bash POSIX syntax (\`/\`); specify \`Cwd\` |`,
    `| **Background Long-Running CLI** | \`run_command\` (\`IsBackground: true\`) | \`schedule\` | Stop calling tools -> *Reactive Wakeup* |`,
    `| **Subagent Task Delegation** | \`invoke_subagent\` | \`define_subagent\` | Route model: \`flash\` (lookup) vs \`pro\` (architecture) |`,
    `| **Inter-Agent Sync / Report** | \`send_message\` | — | Mandatory subagent output contract; never use for user |`,
    `| **Official Library / SDK Docs** | \`context7\` (\`resolve-library-id\` -> \`query-docs\`) | \`search_web\` | Canonical docs over generic web search |`,
    `| **Codebase Graph & God Nodes** | \`graphify:query_graph\` | \`graphify:get_neighbors\` | Layer 0 boot; structural blast radius |`,
    `| **Live Database & Branching** | \`mcp-server-neon\` | \`pnpm prisma\` (local) | Serverless Postgres branching, EXPLAIN plans |`,
    `| **CMS Lake & GROQ Queries** | \`Sanity:query_documents\` | \`Sanity:patch_documents\` | Live datasets, draft perspectives & releases |`,
    `| **Edge Runtime / KV / D1 / R2** | \`cloudflare-bindings\` | \`cloudflare-observability\` | Remote bindings & live telemetry logs |`,
    `| **Browser DOM / Screenshots** | \`playwright:browser_snapshot\` | \`browser-use:browser_task\` | Interactive selector inspection & verification |`,
    `| **Deep Web Scraping & Papers** | \`firecrawl:firecrawl_scrape\` | \`firecrawl:research_search_papers\` | Dynamic JS markdown extraction & arXiv search |`,
    `| **Headless CI/CD Automation** | \`agy -p "<prompt>" --non-interactive\` | \`agy --dangerously-skip-permissions\` | Single-shot scriptable agent loop execution |`,
    `| **Context Compaction in TUI** | \`/compact\` | \`/context\` | Token reclamation during long sessions |`,
    `| **OpenSpec SDD Lifecycle** | \`/opsx-propose\`, \`/opsx-apply\` | \`/opsx-verify\`, \`/opsx-archive\` | Spec-driven development without premature coding |`,
    `| **AI Documentation Audit** | \`node .agents/scripts/validate-ai-docs.cjs\` | \`ensure-tldr.cjs\` | Enforces 7-Pillars AI-Friendly Docs standard |`,
    ``,
    `---`,
    ``,
    `## 2. Category 1: Native Agent Tools (\`default_api\`)`,
    ``,
    `| Tool Name | Safety | Signature & Parameters | Description & Invariants |`,
    `|---|---|---|---|`
  ];

  for (const t of nativeTools) {
    const safety = t.safety === 'read_only' ? '`read_only`' : t.safety === 'mutating' ? '**`mutating`**' : '`standard`';
    md.push(`| **\`${t.name}\`** | ${safety} | \`${t.usage || '—'}\` | ${t.summary.replace(/\|/g, '\\|')} |`);
  }

  md.push(``, `---`, ``, `## 3. Category 2: Model Context Protocol (MCP) Tools`, ``, `| Tool / Server | Target Server | RPC / Signature | Capability & Constraints |`, `|---|---|---|---|`);
  for (const t of mcpTools) {
    md.push(`| **\`${t.name}\`** | \`${t.server || '—'}\` | \`${t.usage || '—'}\` | ${t.summary.replace(/\|/g, '\\|')} |`);
  }

  md.push(``, `---`, ``, `## 4. Category 3: Antigravity CLI Commands & TUI Controls (\`agy\`)`, ``, `| Command / Hotkey | Scope / Mode | Usage Syntax | Operational Function |`, `|---|---|---|---|`);
  for (const t of cliTools) {
    md.push(`| **\`${t.name}\`** | \`CLI / TUI\` | \`${t.usage || '—'}\` | ${t.summary.replace(/\|/g, '\\|')} |`);
  }

  md.push(``, `---`, ``, `## 5. Category 4: Repository Workflows & Custom Scripts (\`arostech-hub\`)`, ``, `| Workflow / Script | Category | Invocation Syntax | Purpose & Quality Gate |`, `|---|---|---|---|`);
  for (const t of repoTools) {
    md.push(`| **\`${t.name}\`** | \`Workflow\` | \`${t.usage || '—'}\` | ${t.summary.replace(/\|/g, '\\|')} |`);
  }

  md.push(
    ``,
    `---`,
    ``,
    `## 6. Critical Invariants & Guardrails`,
    `1. **POSIX Paths**: Use forward slashes (\`/\`) exclusively.`,
    `2. **1-Based Indexing**: \`view_file\` and \`replace_file_content\` start on Line 1.`,
    `3. **Exact Whitespace**: \`replace_file_content\` requires byte-for-byte matching.`,
    `4. **Reactive Wakeup**: Never poll \`manage_task\` or loop with \`sleep\`.`,
    `5. **No Native \`cd\`**: Pass target directories via the \`Cwd\` argument.`,
    `6. **Subagent Contract**: Subagents deliver all results via \`send_message\`.`,
    `7. **Context7 Precedence**: Use Context7 MCP tools for official library documentation.`,
    ``,
    `---`,
    ``,
    `## 7. Developer Prompt Recipes`,
    `\`\`\`text`,
    `Refactor the function validateAuthSession in src/lib/auth/session.ts to return null on expired tokens. Do not alter surrounding helper functions or file imports.`,
    `\`\`\``
  );

  return md.join('\n');
}

function exportMarkdown(targetFilePath, rawRegistry) {
  const safePath = resolveSafeExportPath(targetFilePath);
  const content = generateMarkdownCheatsheet(rawRegistry);
  const tempPath = `${safePath}.tmp-${Date.now()}`;
  fs.writeFileSync(tempPath, content, 'utf8');
  fs.renameSync(tempPath, safePath);
  const stats = fs.statSync(safePath);
  return { filePath: toPosixPath(safePath), bytes: stats.size, lines: content.split('\n').length };
}

// ============================================================================
// 9. TOOL INSPECTION & PARAMETER TABLE RENDERER
// ============================================================================
function renderParameterTable(parameters) {
  const lines = [];
  if (!Array.isArray(parameters) || parameters.length === 0) {
    lines.push(`  ${c.dim}┌─────────────────────────────────────────────────────────────────────────────┐${c.reset}`);
    lines.push(`  ${c.dim}│${c.reset}  ${c.cyan}ℹ️  No parameters required for this tool / command.${c.reset}                        ${c.dim}│${c.reset}`);
    lines.push(`  ${c.dim}└─────────────────────────────────────────────────────────────────────────────┘${c.reset}`);
    return lines;
  }

  const colWidths = { name: 20, type: 10, status: 11, defaultVal: 9, desc: 36 };
  const pad = (s, l) => {
    const str = String(s === undefined || s === null ? '-' : s);
    return str.length >= l ? str.slice(0, l) : str + ' '.repeat(l - str.length);
  };

  lines.push(`  ┌─${'─'.repeat(colWidths.name)}─┬─${'─'.repeat(colWidths.type)}─┬─${'─'.repeat(colWidths.status)}─┬─${'─'.repeat(colWidths.defaultVal)}─┬─${'─'.repeat(colWidths.desc)}─┐`);
  lines.push(`  │ ${c.bold}${pad('PARAMETER', colWidths.name)}${c.reset} │ ${c.bold}${pad('TYPE', colWidths.type)}${c.reset} │ ${c.bold}${pad('STATUS', colWidths.status)}${c.reset} │ ${c.bold}${pad('DEFAULT', colWidths.defaultVal)}${c.reset} │ ${c.bold}${pad('DESCRIPTION', colWidths.desc)}${c.reset} │`);
  lines.push(`  ├─${'─'.repeat(colWidths.name)}─┼─${'─'.repeat(colWidths.type)}─┼─${'─'.repeat(colWidths.status)}─┼─${'─'.repeat(colWidths.defaultVal)}─┼─${'─'.repeat(colWidths.desc)}─┤`);

  for (const p of parameters) {
    const isReq = Boolean(p.required);
    const statusFmt = isReq ? `${c.bold}${c.brightRed}${pad('REQUIRED', colWidths.status)}${c.reset}` : `${c.dim}${c.green}${pad('OPTIONAL', colWidths.status)}${c.reset}`;
    lines.push(`  │ ${c.cyan}${c.bold}${pad(p.name, colWidths.name)}${c.reset} │ ${c.magenta}${pad(p.type || 'string', colWidths.type)}${c.reset} │ ${statusFmt} │ ${c.gray}${pad(p.default, colWidths.defaultVal)}${c.reset} │ ${c.white}${pad(p.description, colWidths.desc)}${c.reset} │`);
  }

  lines.push(`  └─${'─'.repeat(colWidths.name)}─┴─${'─'.repeat(colWidths.type)}─┴─${'─'.repeat(colWidths.status)}─┴─${'─'.repeat(colWidths.defaultVal)}─┴─${'─'.repeat(colWidths.desc)}─┘`);
  return lines;
}

function renderToolInspection(tool, lookup) {
  const catKey = tool.category ? tool.category.toLowerCase() : 'native';
  const catMeta = CATEGORY_METADATA[catKey] || CATEGORY_METADATA.native;
  const safetyMeta = SAFETY_METADATA[tool.safety] || SAFETY_METADATA.standard;

  const lines = [
    '',
    `${c.bold}${c.cyan}╔═══════════════════════════════════════════════════════════════════════════════════╗${c.reset}`,
    `${c.bold}${c.cyan}║               ✦ ANTIGRAVITY TOOL SCHEMA & GUARDRAIL INSPECTOR ✦                   ║${c.reset}`,
    `${c.bold}${c.cyan}╚═══════════════════════════════════════════════════════════════════════════════════╝${c.reset}`
  ];

  if (lookup && lookup.matchType === 'fuzzy') {
    lines.push(`  ${c.bgYellow}${c.bold} ⚠️ FUZZY MATCH ${c.reset} Closest match: ${c.bold}"${tool.name}"${c.reset} (${Math.round(lookup.similarity * 100)}% confidence)\n`);
  }

  lines.push(`  ${c.bold}TOOL:${c.reset} ${c.brightCyan}${c.bold}${tool.name}${c.reset}  ${catMeta.badgeBg} ${catMeta.badge} ${c.reset}  ${c.dim}Provider:${c.reset} ${c.magenta}${tool.server || 'default_api'}${c.reset}  ${safetyMeta.color}${safetyMeta.label}${c.reset}`);
  lines.push(`  ${c.gray}${tool.summary}${c.reset}`);
  lines.push('');

  if (tool.usage) {
    lines.push(`  ${c.bold}USAGE SIGNATURE:${c.reset} ${c.cyan}${tool.usage}${c.reset}`);
    lines.push('');
  }

  lines.push(`  ${c.bold}PARAMETERS SPECIFICATION:${c.reset}`);
  lines.push(...renderParameterTable(tool.parameters));
  lines.push('');

  lines.push(`  ${c.bold}${c.yellow}GUARDRAILS & CRITICAL INVARIANTS:${c.reset}`);
  if (Array.isArray(tool.guardrails) && tool.guardrails.length > 0) {
    tool.guardrails.forEach((g, i) => lines.push(`    ${c.yellow}[${i + 1}]${c.reset} ${c.white}${g}${c.reset}`));
  } else {
    lines.push(`    ${c.yellow}[1]${c.reset} ${c.white}Execute in Git Bash POSIX terminal. Respect 1-based line indexing and exact whitespace.${c.reset}`);
  }
  lines.push('');

  if (tool.example) {
    lines.push(`  ${c.bold}${c.green}READY-TO-USE EXAMPLE PAYLOAD:${c.reset}`);
    lines.push(`    ${JSON.stringify(tool.example, null, 2).replace(/\n/g, '\n    ')}`);
    lines.push('');
  }

  lines.push(`${c.dim}─────────────────────────────────────────────────────────────────────────────────${c.reset}`);
  return lines.join('\n');
}

// ============================================================================
// 10. CATALOG FILTERING & TERMINAL DISPATCHER
// ============================================================================
function matchSearch(tool, query) {
  if (!query) return true;
  const q = query.toLowerCase();
  const nameMatch = tool.name && tool.name.toLowerCase().includes(q);
  const summaryMatch = tool.summary && tool.summary.toLowerCase().includes(q);
  const serverMatch = tool.server && tool.server.toLowerCase().includes(q);
  const usageMatch = tool.usage && tool.usage.toLowerCase().includes(q);
  const tagsMatch = Array.isArray(tool.tags) && tool.tags.some(t => t.toLowerCase().includes(q));
  return Boolean(nameMatch || summaryMatch || serverMatch || usageMatch || tagsMatch);
}

function filterTools(tools, options) {
  return tools.filter(tool => {
    if (options.category) {
      const toolCat = CATEGORY_MAP[tool.category.toLowerCase()];
      if (toolCat !== options.category) return false;
    }
    if (options.search && !matchSearch(tool, options.search)) return false;
    return true;
  });
}

function renderTerminalCatalog(filteredTools, options, rawRegistry) {
  const totalInRegistry = rawRegistry.tools.length;
  const lines = [
    '',
    `${c.bold}${c.cyan}╔═══════════════════════════════════════════════════════════════════════════════════╗${c.reset}`,
    `${c.bold}${c.cyan}║   ✦ ANTIGRAVITY AGENT HARNESS TOOL INVENTORY & CAPABILITY CATALOG ✦               ║${c.reset}`,
    `${c.bold}${c.cyan}╚═══════════════════════════════════════════════════════════════════════════════════╝${c.reset}`,
    `${c.dim}Showing:${c.reset} ${c.bold}${filteredTools.length}${c.reset}/${totalInRegistry} tools   |   ${c.dim}Filters:${c.reset} ${options.category ? `Category: ${options.category}` : 'ALL'} ${options.search ? `Search: "${options.search}"` : ''}`,
    ''
  ];

  if (filteredTools.length === 0) {
    lines.push(`  ${c.red}✖ No tools found matching criteria.${c.reset}\n`);
    return lines.join('\n');
  }

  for (const catId of ['native', 'mcp', 'cli', 'repo']) {
    const catMeta = CATEGORY_METADATA[catId];
    const catTools = filteredTools.filter(t => CATEGORY_MAP[t.category.toLowerCase()] === catId);
    if (catTools.length === 0) continue;

    lines.push(`${catMeta.color}${c.bold}┌─ ${catMeta.badge} ─────────────────────────────────────────────────────────────${c.reset}`);
    lines.push(`${catMeta.color}${c.bold}│ ${catMeta.title} (${catTools.length})${c.reset}`);
    lines.push(`${catMeta.color}└───────────────────────────────────────────────────────────────────────────────${c.reset}`);

    for (const tool of catTools) {
      const name = safeHighlightQuery(tool.name, options.search);
      const serverTag = tool.server ? `${c.magenta}[${tool.server}]${c.reset} ` : '';
      const safetyTag = tool.safety === 'read_only' ? `${c.green}(Read-Only)${c.reset}` : tool.safety === 'mutating' ? `${c.yellow}(Mutating)${c.reset}` : `${c.dim}(Standard)${c.reset}`;
      lines.push(`  ${c.bold}${c.white}✦ ${name}${c.reset} ${serverTag}${safetyTag}`);
      lines.push(`    ${c.gray}${safeHighlightQuery(tool.summary, options.search)}${c.reset}`);
      if (tool.usage) lines.push(`    ${c.dim}Usage:${c.reset} ${c.cyan}${safeHighlightQuery(tool.usage, options.search)}${c.reset}`);
      lines.push('');
    }
  }

  lines.push(`${c.dim}─────────────────────────────────────────────────────────────────────────────────${c.reset}`);
  lines.push(`${c.dim}Run ${c.cyan}/agy-tool --inspect <tool>${c.dim} for schema or ${c.cyan}/agy-tool --doctor${c.dim} for health diagnostics.${c.reset}\n`);
  return lines.join('\n');
}

function printHelpScreen() {
  console.log(`
${c.bold}${c.cyan}Antigravity Agent Harness Tool Catalog & Help Engine (/agy-tool)${c.reset}
${c.dim}Deterministic tool discovery, inspection, recipes, diagnostics, and cheatsheets.${c.reset}

${c.bold}USAGE:${c.reset}
  node scripts/help.js [OPTIONS]
  /agy-tool [OPTIONS]

${c.bold}OPTIONS:${c.reset}
  ${c.green}--all, -a${c.reset}                     Show complete tool inventory across all 4 categories (Default)
  ${c.green}--category, -c <cat>${c.reset}          Filter by category: ${c.yellow}native${c.reset} | ${c.yellow}mcp${c.reset} | ${c.yellow}cli${c.reset} | ${c.yellow}repo${c.reset}
  ${c.green}--search, -s <query>${c.reset}          Search tools by name, description, server, parameters, or tags
  ${c.green}--inspect, -i <name>${c.reset}          Inspect parameter schema, guardrails, and example payload
  ${c.green}--recipe, -r <intent>${c.reset}         Generate copy-pasteable prompt template for an intent or tool
  ${c.green}--doctor, --health, -d${c.reset}        Execute fast (<300ms) system diagnostic health probes
  ${c.green}--export-md, -e [path]${c.reset}        Export 7-Pillars cheatsheet (Default: docs/CHEATSHEET_TOOLS.md)
  ${c.green}--json, -j${c.reset}                     Output matching tools, schema, or diagnostics as JSON
  ${c.green}--no-color${c.reset}                     Disable ANSI color formatting
  ${c.green}--help, -h${c.reset}                     Display this help screen
`);
}

// ============================================================================
// 11. MAIN ENTRYPOINT
// ============================================================================
function main(argv = process.argv) {
  try {
    const options = parseArgs(argv);

    if (options.help) {
      printHelpScreen();
      process.exit(0);
    }

    if (options.doctor) {
      const doctorReport = runDoctorProbes();
      if (options.json) console.log(JSON.stringify(doctorReport, null, 2));
      else console.log(renderDoctorTerminal(doctorReport));
      process.exit(0);
    }

    const toolsFilePath = resolveToolsPath();
    const registry = JSON.parse(fs.readFileSync(toolsFilePath, 'utf8'));
    if (!registry || !Array.isArray(registry.tools)) {
      throw new Error('Invalid tools.json format: expected top-level "tools" array');
    }

    if (options.exportMd) {
      const exportResult = exportMarkdown(options.exportPath, registry);
      if (options.json) {
        console.log(JSON.stringify({ success: true, targetFile: exportResult.filePath, bytes: exportResult.bytes, lines: exportResult.lines }, null, 2));
      } else {
        console.log(`\n${c.green}${c.bold}✔ Successfully exported 7-Pillars Cheatsheet:${c.reset} ${c.cyan}${exportResult.filePath}${c.reset} (${exportResult.bytes} bytes, ${exportResult.lines} lines)\n`);
      }
      process.exit(0);
    }

    if (options.recipe) {
      if (options.json) {
        const r = RECIPES[options.recipe] || Object.values(RECIPES).find(v => v.tool.toLowerCase().includes(options.recipe.toLowerCase()));
        console.log(JSON.stringify({ recipe: options.recipe, data: r || null }, null, 2));
      } else {
        console.log(renderRecipeScreen(options.recipe, registry));
      }
      process.exit(0);
    }

    if (options.inspect) {
      const lookup = findTool(registry.tools, options.inspect);
      if (options.json) {
        console.log(JSON.stringify({ found: Boolean(lookup.tool), matchType: lookup.matchType, similarity: lookup.similarity, tool: lookup.tool }, null, 2));
      } else if (!lookup.tool) {
        console.error(`\n${c.red}${c.bold}✖ Error:${c.reset} Tool "${options.inspect}" not found in registry.\n`);
        process.exit(1);
      } else {
        console.log(renderToolInspection(lookup.tool, lookup));
      }
      process.exit(lookup.tool ? 0 : 1);
    }

    const filteredTools = filterTools(registry.tools, options);
    if (options.json) {
      console.log(JSON.stringify({ schemaVersion: '1.0.0', count: filteredTools.length, tools: filteredTools }, null, 2));
    } else {
      console.log(renderTerminalCatalog(filteredTools, options, registry));
    }
    process.exit(0);
  } catch (error) {
    if (process.argv.includes('--json') || process.argv.includes('-j')) {
      console.error(JSON.stringify({ error: true, message: error.message }, null, 2));
    } else {
      console.error(`\n${c.red}${c.bold}Error:${c.reset} ${error.message}\n`);
    }
    process.exit(1);
  }
}

const isMain = process.argv[1] && (
  path.resolve(process.argv[1]) === path.resolve(__filename) ||
  process.argv[1].replace(/\\/g, '/').endsWith('help.js')
);

if (isMain) {
  main();
}

export {
  parseArgs,
  validateCategory,
  findTool,
  filterTools,
  matchSearch,
  runDoctorProbes,
  exportMarkdown,
  renderToolInspection,
  renderDoctorTerminal,
  renderTerminalCatalog,
  CATEGORY_MAP,
  CATEGORY_METADATA,
  SAFETY_METADATA,
  RECIPES,
  main
};

export default {
  parseArgs,
  validateCategory,
  findTool,
  filterTools,
  matchSearch,
  runDoctorProbes,
  exportMarkdown,
  renderToolInspection,
  renderDoctorTerminal,
  renderTerminalCatalog,
  CATEGORY_MAP,
  CATEGORY_METADATA,
  SAFETY_METADATA,
  RECIPES,
  main
};
