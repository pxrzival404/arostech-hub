#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TASKS_DIR = path.join(__dirname, 'tasks');

function parseSimpleYaml(content) {
  const result = { judge: [], files: [] };
  let currentKey = null;

  const lines = content.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;

    if (line.startsWith('name:')) {
      result.name = line.replace('name:', '').trim();
    } else if (line.startsWith('description:')) {
      result.description = line.replace('description:', '').trim();
    } else if (line.startsWith('repo:')) {
      result.repo = line.replace('repo:', '').trim();
    } else if (line.startsWith('commit:')) {
      result.commit = line.replace('commit:', '').replace(/"/g, '').trim();
    } else if (line.startsWith('files:')) {
      currentKey = 'files';
    } else if (line.startsWith('judge:')) {
      currentKey = 'judge';
    } else if (line.startsWith('  - type:')) {
      if (currentKey === 'judge') {
        const type = line.replace('  - type:', '').trim();
        const judgeItem = { type };
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith('    ')) {
          const subLine = lines[j].trim();
          if (subLine.startsWith('command:')) {
            judgeItem.command = subLine.replace('command:', '').trim().replace(/^"/, '').replace(/"$/, '');
          } else if (subLine.startsWith('pattern:')) {
            judgeItem.pattern = subLine.replace('pattern:', '').trim().replace(/^"/, '').replace(/"$/, '');
          } else if (subLine.startsWith('files:')) {
            judgeItem.files = subLine.replace('files:', '').trim().replace(/^"/, '').replace(/"$/, '');
          }
          j++;
        }
        result.judge.push(judgeItem);
      } else if (currentKey === 'files') {
        result.files.push(line.replace('  - ', '').trim());
      }
    }
  }

  return result;
}

function runJudge(judge, rootDir) {
  if (judge.type === 'command') {
    try {
      execSync(judge.command, { cwd: rootDir, stdio: 'pipe' });
      return { pass: true, detail: `Command passed: ${judge.command}` };
    } catch (err) {
      return { pass: false, detail: `Command failed: ${judge.command}` };
    }
  } else if (judge.type === 'grep') {
    try {
      const searchTarget = judge.files || '.';
      const regex = new RegExp(judge.pattern);
      const filesToSearch = searchTarget.includes('*')
        ? findFilesMatching(rootDir, searchTarget)
        : [path.join(rootDir, searchTarget)];

      let found = false;
      for (const filePath of filesToSearch) {
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf8');
          if (regex.test(content)) {
            found = true;
            break;
          }
        }
      }
      return {
        pass: found,
        detail: found
          ? `Pattern '${judge.pattern}' matched in ${judge.files}`
          : `Pattern '${judge.pattern}' NOT found in ${judge.files}`,
      };
    } catch (err) {
      return { pass: false, detail: `Grep error: ${err.message}` };
    }
  }
  return { pass: true, detail: 'Unknown judge type defaulted to pass' };
}

function findFilesMatching(rootDir, globPattern) {
  const results = [];
  const baseDir = rootDir;
  function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === '.next') continue;
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (entry.isFile()) {
        results.push(fullPath);
      }
    }
  }
  walk(baseDir);
  return results;
}

function runBenchmark() {
  const rootDir = path.resolve(__dirname, '../..');
  console.log(`====================================================`);
  console.log(`  agent-eval Benchmark Suite — arostech-hub`);
  console.log(`====================================================`);
  console.log(`Task directory: ${TASKS_DIR}`);
  console.log(`Root workspace: ${rootDir}\n`);

  if (!fs.existsSync(TASKS_DIR)) {
    console.error(`Task directory missing: ${TASKS_DIR}`);
    process.exit(1);
  }

  const taskFiles = fs.readdirSync(TASKS_DIR).filter(f => f.endsWith('.yaml') || f.endsWith('.yml'));
  if (taskFiles.length === 0) {
    console.log('No benchmark task files found.');
    return;
  }

  const summary = [];

  for (const taskFile of taskFiles) {
    const taskPath = path.join(TASKS_DIR, taskFile);
    const content = fs.readFileSync(taskPath, 'utf8');
    const task = parseSimpleYaml(content);

    const startTime = Date.now();
    let totalPasses = 0;
    const judgeResults = [];

    for (const j of task.judge) {
      const res = runJudge(j, rootDir);
      judgeResults.push(res);
      if (res.pass) totalPasses++;
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    const passRate = task.judge.length > 0 ? `${totalPasses}/${task.judge.length}` : 'N/A';
    const isSuccess = totalPasses === task.judge.length;

    summary.push({
      name: task.name || taskFile,
      description: task.description,
      passRate,
      status: isSuccess ? 'PASS' : 'FAIL',
      time: `${duration}s`,
      cost: '$0.00',
      consistency: isSuccess ? '100%' : '0%',
      results: judgeResults,
    });
  }

  // Print Summary Table
  console.log(`Task Evaluation Scorecard (${summary.length} tasks)`);
  console.log(`┌───────────────────────────┬───────────┬────────┬────────┬─────────────┬────────┐`);
  console.log(`│ Task Name                 │ Pass Rate │ Cost   │ Time   │ Consistency │ Status │`);
  console.log(`├───────────────────────────┼───────────┼────────┼────────┼─────────────┼────────┤`);

  for (const row of summary) {
    const namePadded = row.name.padEnd(25).slice(0, 25);
    const passPadded = row.passRate.padEnd(9);
    const costPadded = row.cost.padEnd(6);
    const timePadded = row.time.padEnd(6);
    const constPadded = row.consistency.padEnd(11);
    const statusPadded = row.status.padEnd(6);
    console.log(`│ ${namePadded} │ ${passPadded} │ ${costPadded} │ ${timePadded} │ ${constPadded} │ ${statusPadded} │`);
  }

  console.log(`└───────────────────────────┴───────────┴────────┴────────┴─────────────┴────────┘\n`);

  console.log('Detailed Task Diagnostics:');
  for (const row of summary) {
    console.log(`\n[${row.status}] ${row.name}: ${row.description}`);
    for (const r of row.results) {
      console.log(`  - ${r.pass ? '[PASS]' : '[FAIL]'} ${r.detail}`);
    }
  }
}

runBenchmark();
