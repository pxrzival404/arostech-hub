'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const { normalizeCanonicalSession, persistCanonicalSnapshot } = require('./canonical-session');

const ANTIGRAVITY_TARGET_PREFIXES = ['antigravity:', 'agy:'];

function parseAntigravityTarget(target) {
  if (typeof target !== 'string') {
    return null;
  }
  for (const prefix of ANTIGRAVITY_TARGET_PREFIXES) {
    if (target.startsWith(prefix)) {
      return target.slice(prefix.length).trim();
    }
  }
  return null;
}

function resolveAntigravityStorageDir(options = {}, context = {}) {
  const explicit = options.storageDir
    || context.antigravityStorageDir
    || process.env.ANTIGRAVITY_STORAGE_DIR;

  if (typeof explicit === 'string' && explicit.length > 0) {
    return path.resolve(explicit);
  }
  return path.join(os.homedir(), '.gemini', 'antigravity');
}

function createAntigravityAdapter(options = {}) {
  return {
    id: 'antigravity',
    description: 'Antigravity MCP harness session adapter',
    targetTypes: ['antigravity', 'agy', 'antigravity-session'],
    canOpen(target) {
      if (typeof target !== 'string') return false;
      return parseAntigravityTarget(target) !== null || target === 'antigravity:latest';
    },
    open(target, context = {}) {
      const parsedId = parseAntigravityTarget(target) || 'latest';
      const storageDir = resolveAntigravityStorageDir(options, context);

      const snapshot = {
        sessionId: parsedId,
        harness: 'antigravity',
        openedAt: new Date().toISOString(),
        storageDir,
        messages: []
      };

      return {
        getSnapshot() {
          return snapshot;
        }
      };
    }
  };
}

module.exports = {
  createAntigravityAdapter,
  parseAntigravityTarget,
  resolveAntigravityStorageDir
};
