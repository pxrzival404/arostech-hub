/**
 * Git Bash Path Normalization Utility
 * Normalizes Windows drive paths (e.g., C:\dev\... or D:\dev\...) to Git Bash POSIX paths (/c/dev/... or /d/dev/...) and file:/// URIs.
 */

'use strict';

const path = require('path');

function toGitBashPath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return '';
  let normalized = inputPath.trim().replace(/\\/g, '/');
  
  // Convert Windows drive letter "D:/dev/foo" -> "/d/dev/foo"
  const driveMatch = normalized.match(/^([a-zA-Z]):\/(.*)$/);
  if (driveMatch) {
    const driveLetter = driveMatch[1].toLowerCase();
    const rest = driveMatch[2];
    normalized = `/${driveLetter}/${rest}`;
  }
  return normalized;
}

function toFileUri(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return '';
  let normalized = inputPath.trim().replace(/\\/g, '/');
  
  if (!normalized.startsWith('/')) {
    normalized = '/' + normalized;
  }
  
  return `file://${normalized}`;
}

function normalizePathForGitBash(inputPath) {
  return {
    gitBashPath: toGitBashPath(inputPath),
    fileUri: toFileUri(inputPath),
    rawPath: inputPath
  };
}

module.exports = {
  toGitBashPath,
  toFileUri,
  normalizePathForGitBash
};
