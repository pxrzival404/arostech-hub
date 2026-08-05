import { execSync } from 'child_process'
import fs from 'fs'
import path from 'path'

if (process.platform === 'win32') {
  const candidatePaths = new Set()

  // 1. Static potential Git/bash installation directories
  candidatePaths.add('C:\\Program Files\\Git\\bin')
  candidatePaths.add('C:\\Program Files\\Git\\usr\\bin')
  candidatePaths.add('C:\\Program Files (x86)\\Git\\bin')
  candidatePaths.add('C:\\Program Files (x86)\\Git\\usr\\bin')

  if (process.env.LOCALAPPDATA) {
    candidatePaths.add(path.join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'bin'))
    candidatePaths.add(path.join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'usr', 'bin'))
    candidatePaths.add(path.join(process.env.LOCALAPPDATA, 'Programs', 'Git', 'cmd'))
  }

  if (process.env.ProgramFiles) {
    candidatePaths.add(path.join(process.env.ProgramFiles, 'Git', 'cmd'))
  }

  if (process.env['ProgramFiles(x86)']) {
    candidatePaths.add(path.join(process.env['ProgramFiles(x86)'], 'Git', 'cmd'))
  }

  // 2. Dynamic resolution via where.exe git / bash
  const resolveCommandPaths = (cmd) => {
    try {
      const output = execSync(`where.exe ${cmd}`, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] })
      const lines = output.split(/\r?\n/).map(l => l.trim()).filter(Boolean)
      for (const execPath of lines) {
        const dir = path.dirname(execPath)
        const parentDir = path.dirname(dir)
        candidatePaths.add(dir)
        candidatePaths.add(path.join(parentDir, 'bin'))
        candidatePaths.add(path.join(parentDir, 'usr', 'bin'))
        candidatePaths.add(path.join(parentDir, 'cmd'))
      }
    } catch {
      // Ignore if command is not found in current PATH
    }
  }

  resolveCommandPaths('git')
  resolveCommandPaths('bash')

  const validPaths = Array.from(candidatePaths).filter(p => p && fs.existsSync(p))
  if (validPaths.length > 0) {
    process.env.PATH = `${validPaths.join(';')};${process.env.PATH || ''}`
  }
}

console.log('[pages-build] Executing @cloudflare/next-on-pages build...')
execSync('npx @cloudflare/next-on-pages', {
  stdio: 'inherit',
  env: process.env,
})

const staticDir = path.join(process.cwd(), '.vercel', 'output', 'static')
if (fs.existsSync(staticDir)) {
  console.log('[pages-build] Contents of static dir:', fs.readdirSync(staticDir))
} else {
  console.log('[pages-build] Static dir does not exist!')
}

const workerPath = path.join(staticDir, '_worker.js')
if (fs.existsSync(workerPath)) {
  const stats = fs.statSync(workerPath)
  const sizeInBytes = stats.size
  const sizeInMB = sizeInBytes / (1024 * 1024)
  console.log(`[pages-build] Successfully verified _worker.js at: ${workerPath}`)
  console.log(`[pages-build] _worker.js uncompressed size: ${sizeInBytes} bytes (${sizeInMB.toFixed(2)} MiB)`)
  if (sizeInMB >= 25) {
    console.error(`[pages-build] Error: _worker.js size (${sizeInMB.toFixed(2)} MiB) exceeds 25 MiB limit!`)
    process.exit(1)
  }
} else {
  console.error('[pages-build] Error: _worker.js not found at:', workerPath)
  process.exit(1)
}

