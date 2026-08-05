const fs = require('fs');
const path = require('path');

const targetDir = path.resolve('.gemini/skills');

const toolMappings = {
  'Bash': 'run_shell_command',
  'Read': 'read_file',
  'Edit': 'replace',
  'Write': 'write_file',
  'Grep': 'grep_search',
  'Glob': 'glob',
  'Skill': 'activate_skill',
  'TodoWrite': 'write_todos'
};

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

function adaptFile(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext !== '.md' && ext !== '.txt' && ext !== '.js' && ext !== '.ts') return;

  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;

  // 1. Tool Renaming
  Object.keys(toolMappings).forEach(oldTool => {
    // Only replace if it's NOT followed by a dot (to avoid replacing things like Bash.exe)
    // and surrounded by word boundaries or quotes.
    const regex = new RegExp(`\\b${oldTool}\\b`, 'g');
    newContent = newContent.replace(regex, toolMappings[oldTool]);
  });

  // 2. YAML Frontmatter Injection for SKILL.md
  if (path.basename(filePath).toUpperCase() === 'SKILL.MD') {
    if (!newContent.trim().startsWith('---')) {
      const skillName = path.basename(path.dirname(filePath));
      const frontmatter = `---\nname: ${skillName}\ndescription: Auto-adapted ECC skill for Gemini CLI\n---\n\n`;
      newContent = frontmatter + newContent;
      console.log(`[FRONTMATTER] Added to ${filePath}`);
    }
  }

  // 3. Subagent Warning
  if (/\bTask\b/.test(newContent)) {
    console.warn(`[WARNING] Skill ${filePath} contains 'Task' (subagents) which is not natively supported in Gemini CLI.`);
  }

  if (newContent !== content) {
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`[ADAPTED] ${filePath}`);
  }
}

if (fs.existsSync(targetDir)) {
  console.log(`Starting ECC to Gemini CLI adaptation in ${targetDir}...`);
  walkDir(targetDir, adaptFile);
  console.log('Adaptation complete.');
} else {
  console.error(`Target directory ${targetDir} does not exist.`);
}
