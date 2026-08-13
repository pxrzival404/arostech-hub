'use strict';

/**
 * Harness Adapter Module for Everything Claude Code (ECC) / Antigravity.
 * Provides harness identification, session tracking, path resolution,
 * and tool payload normalization across different agent harnesses.
 */

const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Detect the active harness runtime environment.
 * @returns {'antigravity' | 'claude-code' | 'generic'}
 */
function getHarnessType() {
  if (
    process.env.ANTIGRAVITY_SESSION_ID ||
    process.env.GEMINI_CLI ||
    process.env.ANTIGRAVITY_HARNESS ||
    process.cwd().includes('.gemini')
  ) {
    return 'antigravity';
  }
  if (process.env.CLAUDE_SESSION_ID || process.env.CLAUDE_PLUGIN_ROOT) {
    return 'claude-code';
  }
  return 'antigravity'; // Default to antigravity in this project environment
}

/**
 * Resolve the current session identifier across harnesses.
 * @returns {string}
 */
function getSessionId() {
  return (
    process.env.ANTIGRAVITY_SESSION_ID ||
    process.env.ECC_SESSION_ID ||
    process.env.CLAUDE_SESSION_ID ||
    'default-session'
  );
}

/**
 * Get the harness app data directory root.
 * @param {string} [cwd]
 * @returns {string}
 */
function getHarnessDataDir(cwd = process.cwd()) {
  const harness = getHarnessType();
  if (harness === 'antigravity') {
    const defaultAntigravityDir = path.join(os.homedir(), '.gemini', 'antigravity');
    if (fs.existsSync(defaultAntigravityDir)) {
      return defaultAntigravityDir;
    }
  }
  return path.join(os.homedir(), '.claude');
}

/**
 * Get the project plan directory for plan artifacts, prioritizing .agents/plans.
 * @param {string} [cwd]
 * @returns {string}
 */
function getPlanDir(cwd = process.cwd()) {
  const primaryPlanDir = path.join(cwd, '.agents', 'plans');
  const legacyPlanDir = path.join(cwd, '.claude', 'plans');

  if (!fs.existsSync(primaryPlanDir) && fs.existsSync(legacyPlanDir)) {
    return legacyPlanDir;
  }
  return primaryPlanDir;
}

/**
 * Normalize tool execution payload shapes from different harnesses.
 * Handles Antigravity native/MCP format ({ CommandLine, Cwd })
 * as well as Claude Code CLI format ({ tool_input: { command } }).
 *
 * @param {object} input - Raw event or tool input payload
 * @returns {{ command: string, cwd: string, toolName: string, raw: object }}
 */
function normalizeToolPayload(input) {
  if (!input || typeof input !== 'object') {
    return { command: '', cwd: '', toolName: '', raw: input || {} };
  }

  // Antigravity Native / MCP Tool format
  const command =
    input.CommandLine ||
    input.commandLine ||
    (input.tool_input && input.tool_input.command) ||
    input.command ||
    '';

  const cwd =
    input.Cwd ||
    input.cwd ||
    (input.tool_input && input.tool_input.cwd) ||
    process.cwd();

  const toolName =
    input.toolName ||
    input.tool_name ||
    input.tool ||
    (input.tool_input && input.tool_input.tool) ||
    '';

  return {
    command: String(command).trim(),
    cwd: String(cwd).trim(),
    toolName: String(toolName).trim(),
    raw: input,
  };
}

module.exports = {
  getHarnessType,
  getSessionId,
  getHarnessDataDir,
  getPlanDir,
  normalizeToolPayload,
};
