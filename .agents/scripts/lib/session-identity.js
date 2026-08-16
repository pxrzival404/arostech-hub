/**
 * Session Identity & State Resolver for Antigravity & ECC Harness
 *
 * Extracts and sanitizes conversationId / sessionId from:
 * 1. Antigravity stdin JSON payload (conversationId)
 * 2. Legacy session ID fields (sessionId, session_id, session.id)
 * 3. Environment variables (CONVERSATION_ID, CLAUDE_SESSION_ID, ECC_SESSION_ID)
 * 4. Deterministic workspace cwd SHA-1 fallback
 */

'use strict';

const crypto = require('crypto');
const os = require('os');
const path = require('path');

function sanitizeSessionId(id) {
  if (!id || typeof id !== 'string') return '';
  return id.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
}

function getFallbackSessionId(cwd = process.cwd()) {
  return crypto.createHash('sha1').update(cwd).digest('hex').slice(0, 12);
}

function extractSessionId(inputOrRaw, cwd = process.cwd()) {
  let data = inputOrRaw;
  if (typeof inputOrRaw === 'string') {
    const trimmed = inputOrRaw.trim();
    if (trimmed.startsWith('{')) {
      try {
        data = JSON.parse(trimmed);
      } catch {
        data = null;
      }
    } else {
      data = null;
    }
  }

  if (data && typeof data === 'object') {
    const candidates = [
      data.conversationId,
      data.conversation_id,
      data.sessionId,
      data.session_id,
      data.session?.id,
    ];
    for (const c of candidates) {
      if (c && typeof c === 'string' && c.trim()) {
        const sanitized = sanitizeSessionId(c.trim());
        if (sanitized) return sanitized;
      }
    }
  }

  const envCandidates = [
    process.env.CONVERSATION_ID,
    process.env.AGY_CONVERSATION_ID,
    process.env.ANTIGRAVITY_SESSION_ID,
    process.env.ECC_SESSION_ID,
  ];
  for (const envVal of envCandidates) {
    if (envVal && typeof envVal === 'string' && envVal.trim()) {
      const sanitized = sanitizeSessionId(envVal.trim());
      if (sanitized) return sanitized;
    }
  }

  return getFallbackSessionId(cwd);
}

function getSessionTempPath(prefix, inputOrRaw, ext = '.txt') {
  const sessionId = extractSessionId(inputOrRaw);
  const safePrefix = prefix.replace(/[^a-zA-Z0-9_-]/g, '_');
  const safeExt = ext.startsWith('.') ? ext : `.${ext}`;
  return path.join(os.tmpdir(), `${safePrefix}-${sessionId}${safeExt}`);
}

module.exports = {
  sanitizeSessionId,
  getFallbackSessionId,
  extractSessionId,
  getSessionTempPath,
};
