/**
 * AGY Command Inspector Helper Library
 * Inspects shell command strings for destructive write/delete operations
 * targeting the READ-ONLY repository (d:/CLAUDE-PROJECT/website).
 * Standardized with -agy.js suffix per AGENTS.md Section 11.
 */

const { isReadonlyViolation, hasWindowsBackslash } = require('./path-validator-agy.js');

/**
 * Inspects a shell command string for destructive operations targeting
 * the READ-ONLY target repository or unapproved file mutations.
 * @param {string} cmdStr - Command string to analyze
 * @returns {boolean} True if command is destructive or violates guardrails
 */
function isDestructiveCommand(cmdStr) {
  if (typeof cmdStr !== 'string' || !cmdStr.trim()) return false;

  const normalized = cmdStr.replace(/\\/g, '/').toLowerCase();

  // Pattern 1: Check for backslashes in command strings
  if (hasWindowsBackslash(cmdStr)) {
    return true;
  }

  // Pattern 2: Destructive operations targeting configured readonly repo
  const readonlyRepo = (process.env.AGY_READONLY_REPO || '').replace(/\\/g, '/').toLowerCase();
  if (readonlyRepo && normalized.includes(readonlyRepo)) {
    const isWriteOrDeleteOp =
      /\b(rm|rmdir|unlink|echo\s*>|cat\s*>|touch|cp|mv|rsync)\b/.test(normalized) ||
      />+/g.test(normalized) ||
      /\bgit\s+(checkout|reset|clean|apply|patch)\b/.test(normalized);

    if (isWriteOrDeleteOp && !normalized.includes('harness/patches/')) {
      return true;
    }
  }

  // Pattern 3: Direct file redirects or destructive deletes targeting readonly repo
  if (readonlyRepo && (new RegExp(`>\\s*.*${readonlyRepo}`, 'i').test(normalized) || new RegExp(`\\brm\\b.*${readonlyRepo}`, 'i').test(normalized))) {
    if (!normalized.includes('harness/patches/')) {
      return true;
    }
  }

  return false;
}

module.exports = {
  isDestructiveCommand
};
