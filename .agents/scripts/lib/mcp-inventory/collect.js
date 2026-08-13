'use strict';

const { normalizeServerEntry, buildInventory } = require('./canonical-mcp');
const { readClaudeCodeMcp } = require('./readers/claude-code');
const { readCodexMcp } = require('./readers/codex');
const { readOpencodeMcp } = require('./readers/opencode');

const DEFAULT_READERS = Object.freeze({
  'claude-code': readClaudeCodeMcp,
  codex: readCodexMcp,
  opencode: readOpencodeMcp
});

function filterRedundantMcpServers(inventory) {
  if (!inventory || !Array.isArray(inventory.servers)) return inventory;
  const filteredServers = inventory.servers.map(server => {
    if (server.name === 'filesystem' || server.name === 'file-system') {
      return {
        ...server,
        enabled: false,
        disabledReason: 'Suppressed in favor of native Antigravity IDE file tools (view_file, write_to_file, replace_file_content).'
      };
    }
    return server;
  });
  return {
    ...inventory,
    servers: filteredServers
  };
}

// Collect MCP server configs from every harness reader, normalize each raw
// entry to ecc.mcp.v1, then merge into a single deduplicated inventory with a
// fragmentation report. Secrets are stripped during normalization (only env
// key names survive), so the returned inventory is safe to print or persist.
function collectMcpInventory(options = {}) {
  const readers = options.readers || DEFAULT_READERS;
  const readerOptions = options.readerOptions || {};

  const rawRecords = [];
  for (const [harness, reader] of Object.entries(readers)) {
    if (typeof reader !== 'function') {
      continue;
    }

    let entries;
    try {
      entries = reader(readerOptions[harness] || readerOptions.shared || {});
    } catch {
      entries = [];
    }

    if (Array.isArray(entries)) {
      rawRecords.push(...entries);
    }
  }

  const normalized = rawRecords.map(normalizeServerEntry);
  const inventory = buildInventory(normalized);
  return filterRedundantMcpServers(inventory);
}

module.exports = {
  collectMcpInventory,
  filterRedundantMcpServers,
  DEFAULT_READERS
};
