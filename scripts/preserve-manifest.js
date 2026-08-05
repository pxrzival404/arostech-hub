import fs from 'fs'
import path from 'path'
import { spawn } from 'child_process'

const nextDir = path.join(process.cwd(), '.next')
const backupDir = path.join(process.cwd(), '.next-backups')

const filesToBackup = [
  'BUILD_ID',
  'build-manifest.json',
  'routes-manifest.json',
  'prerender-manifest.json',
  'images-manifest.json',
  'required-server-files.json',
  'package.json',
  'server/pages-manifest.json',
]

for (const file of filesToBackup) {
  const src = path.join(nextDir, file)
  const dest = path.join(backupDir, file)
  if (fs.existsSync(src)) {
    try {
      fs.mkdirSync(path.dirname(dest), { recursive: true })
      fs.copyFileSync(src, dest)
      console.log(`[preserve-manifest] Backed up ${file}`)
    } catch (e) {
      console.error(`[preserve-manifest] Error backing up ${file}:`, e)
    }
  }
}

// Pre-create server/pages-manifest.json if missing
const serverDir = path.join(nextDir, 'server')
const pagesManifestPath = path.join(serverDir, 'pages-manifest.json')
if (!fs.existsSync(serverDir)) {
  fs.mkdirSync(serverDir, { recursive: true })
}
if (!fs.existsSync(pagesManifestPath)) {
  fs.writeFileSync(pagesManifestPath, '{}', 'utf8')
  console.log('[preserve-manifest] Created fallback server/pages-manifest.json')
}

// Spawn detached restoration daemon to keep restoring files
// during Vercel CLI output collection on Windows
const manifestPath = path.join(nextDir, 'routes-manifest.json')
const backupManifestPath = path.join(backupDir, 'routes-manifest.json')
const buildIdPath = path.join(nextDir, 'BUILD_ID')
const backupBuildIdPath = path.join(backupDir, 'BUILD_ID')

const daemonScript = `
import fs from 'fs';
import path from 'path';

const manifestPath = ${JSON.stringify(manifestPath)};
const backupManifestPath = ${JSON.stringify(backupManifestPath)};
const buildIdPath = ${JSON.stringify(buildIdPath)};
const backupBuildIdPath = ${JSON.stringify(backupBuildIdPath)};

const startTime = Date.now();
const timer = setInterval(() => {
  if (Date.now() - startTime > 90000) {
    clearInterval(timer);
    process.exit(0);
  }
  if (fs.existsSync(backupManifestPath) && !fs.existsSync(manifestPath)) {
    try {
      fs.mkdirSync(path.dirname(manifestPath), { recursive: true });
      fs.copyFileSync(backupManifestPath, manifestPath);
    } catch (e) {}
  }
  if (fs.existsSync(backupBuildIdPath) && !fs.existsSync(buildIdPath)) {
    try {
      fs.mkdirSync(path.dirname(buildIdPath), { recursive: true });
      fs.copyFileSync(backupBuildIdPath, buildIdPath);
    } catch (e) {}
  }
}, 25);
`

try {
  const child = spawn(process.execPath, ['--input-type=module', '-e', daemonScript], {
    detached: true,
    stdio: 'ignore',
    cwd: process.cwd(),
  })
  child.unref()
  console.log('[preserve-manifest] Started background manifest restoration daemon')
} catch (e) {
  console.error('[preserve-manifest] Error starting restoration daemon:', e)
}


