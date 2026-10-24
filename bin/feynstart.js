#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import open from 'open';
import { analyzeProject } from '../dist/engine/analyzer.js';
import { FeinmanMCPServer } from '../dist/mcp/server.js';
import { startFeinmanServer } from '../dist/server/index.js';
import { generateSkillAndArtifacts } from '../dist/skills/generator.js';
import { planCodeChange } from '../dist/engine/changePlanner.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

// Check for --help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  \x1b[1m\x1b[38;2;245;158;11mFeinman\x1b[0m — AI-powered tool and MCP server that makes unfamiliar codebases understandable to humans.

  \x1b[1mUsage:\x1b[0m feynstart [options] [path]

  \x1b[1mTerminal & Agent Modes:\x1b[0m
    --agy                 Run with Google Antigravity (AGY) terminal configuration and agent skills
    --claude              Show Claude Code terminal setup and connection command
    --mcp                 Run directly as a Model Context Protocol (MCP) server over stdio
    --scan, --summary     Print instant visual codebase architecture summary directly in terminal
    --plan <query>        Plan a code change directly in terminal (pinpoints files, blast radius, checklist)
    --tour                Run progressive guided tour directly in terminal

  \x1b[1mDashboard Options:\x1b[0m
    -p, --port <number>   Dashboard HTTP port (default: 4040)
    --no-open             Do not automatically open the dashboard in browser
    --export              Export repomix-style codebase pack to feinman-digest.md
    -v, --version         Show version
    -h, --help            Show this help message
`);
  process.exit(0);
}

// Check for --version
if (args.includes('--version') || args.includes('-v')) {
  const pkg = JSON.parse(fs.readFileSync(path.join(__dirname, '../package.json'), 'utf-8'));
  console.log(`feinman v${pkg.version}`);
  process.exit(0);
}

const targetDir = args.find(a => !a.startsWith('-') && a !== args[args.indexOf('-p') + 1] && a !== args[args.indexOf('--port') + 1] && a !== args[args.indexOf('--plan') + 1]) || process.cwd();
const absTarget = path.resolve(targetDir);

// 1. Antigravity (AGY) Terminal Mode
if (args.includes('--agy')) {
  runAgyMode(absTarget);
}
// 2. Claude Code Terminal Mode
else if (args.includes('--claude')) {
  runClaudeMode(absTarget);
}
// 3. Terminal Scan / Summary Mode
else if (args.includes('--scan') || args.includes('--summary')) {
  runTerminalScan(absTarget);
}
// 4. Terminal Change Planner Mode
else if (args.includes('--plan')) {
  const planIdx = args.indexOf('--plan');
  const planQuery = args[planIdx + 1];
  if (!planQuery) {
    console.error('\x1b[31mError: Please provide a change description. Example: feynstart --plan "Add an auth endpoint"\x1b[0m');
    process.exit(1);
  }
  runTerminalPlan(absTarget, planQuery);
}
// 5. Terminal Walkthrough Tour Mode
else if (args.includes('--tour')) {
  runTerminalTour(absTarget);
}
// 6. Stdio MCP Server Mode
else if (args.includes('--mcp')) {
  const context = analyzeProject(absTarget);
  generateSkillAndArtifacts(absTarget, context.analysis);
  const mcpServer = new FeinmanMCPServer(context);
  mcpServer.startStdio();
}
// 7. Interactive Dashboard Mode (Default)
else {
  runDashboardFlow(absTarget);
}

// -------------------------------------------------------------
// Terminal Handlers
// -------------------------------------------------------------

function runAgyMode(targetPath) {
  printBanner();
  console.log(`  \x1b[1m\x1b[38;2;14;165;233m✦ GOOGLE ANTIGRAVITY (AGY) TERMINAL INTEGRATION ✦\x1b[0m\n`);

  console.log(`  Scanning codebase: ${targetPath}`);
  const context = analyzeProject(targetPath);
  const { skillPath } = generateSkillAndArtifacts(targetPath, context.analysis);

  console.log(`  \x1b[32m✔ AGY Agent Skill generated at:\x1b[0m \x1b[1m${skillPath}\x1b[0m`);
  console.log(`  \x1b[32m✔ Verified codebase:\x1b[0m ${context.analysis.fileCount} files, ${context.analysis.totalLines} lines (${context.analysis.primaryLanguage})\n`);

  console.log(`  \x1b[1m\x1b[38;2;245;158;11mHow to use in Antigravity (AGY) Terminal:\x1b[0m`);
  console.log(`  1. \x1b[1mAdd Feinman MCP to AGY:\x1b[0m`);
  console.log(`     \x1b[38;2;52;211;153magy mcp add feinman node "${path.join(__dirname, 'feynstart.js')}" --mcp "${targetPath}"\x1b[0m\n`);

  console.log(`  2. \x1b[1mUse Feinman Skill in AGY:\x1b[0m`);
  console.log(`     In your AGY prompt, simply ask:`);
  console.log(`     \x1b[38;2;245;158;11m"Explain how this codebase works using Feinman"\x1b[0m or \x1b[38;2;245;158;11m"/plan change to add new feature"\x1b[0m\n`);

  console.log(`  3. \x1b[1mRun Dashboard alongside AGY:\x1b[0m`);
  console.log(`     \x1b[38;2;148;163;184mfeynstart --no-open -p 4040\x1b[0m\n`);
  process.exit(0);
}

function runClaudeMode(targetPath) {
  printBanner();
  console.log(`  \x1b[1m\x1b[38;2;14;165;233m✦ CLAUDE CODE TERMINAL INTEGRATION ✦\x1b[0m\n`);

  console.log(`  Scanning codebase: ${targetPath}`);
  const context = analyzeProject(targetPath);
  generateSkillAndArtifacts(targetPath, context.analysis);

  console.log(`  \x1b[1m\x1b[38;2;245;158;11mRun this command in your terminal to connect Claude Code:\x1b[0m\n`);
  console.log(`  \x1b[1m\x1b[38;2;52;211;153mclaude mcp add feinman -- node "${path.join(__dirname, 'feynstart.js')}" --mcp "${targetPath}"\x1b[0m\n`);

  console.log(`  \x1b[1mOr add to your project's .claude/mcp.json:\x1b[0m`);
  const jsonCfg = {
    mcpServers: {
      feinman: {
        command: "node",
        args: [path.join(__dirname, 'feynstart.js'), "--mcp", targetPath]
      }
    }
  };
  console.log(`  \x1b[38;2;148;163;184m${JSON.stringify(jsonCfg, null, 4).replace(/\n/g, '\n  ')}\x1b[0m\n`);

  console.log(`  \x1b[1mThen inside your Claude Code session ask:\x1b[0m`);
  console.log(`  \x1b[38;2;245;158;11m"Use the feinman MCP tool to trace where to change code for <feature>"\x1b[0m\n`);
  process.exit(0);
}

function runTerminalScan(targetPath) {
  printBanner();
  const context = analyzeProject(targetPath);
  const { analysis } = context;

  console.log(`  \x1b[1m\x1b[37mProject:\x1b[0m \x1b[1m\x1b[38;2;245;158;11m${analysis.name}\x1b[0m (${analysis.fileCount} files, ${analysis.totalLines} lines, ${analysis.primaryLanguage})`);
  console.log(`  \x1b[1m\x1b[37mSummary:\x1b[0m ${analysis.whatIsThis.summary}\n`);

  console.log(`  \x1b[1m\x1b[38;2;14;165;233m┌── ARCHITECTURE TOPOLOGY & SUBSYSTEMS ────────────────────┐\x1b[0m`);
  analysis.howItWorks.subsystems.forEach(sub => {
    console.log(`  \x1b[1m\x1b[38;2;245;158;11m▶ ${sub.name}\x1b[0m (${sub.files.length} files)`);
    console.log(`    \x1b[38;2;148;163;184m${sub.description}\x1b[0m`);
    const sampleFiles = sub.files.slice(0, 3).map(f => path.basename(f)).join(', ');
    console.log(`    \x1b[38;2;52;211;153mFiles: ${sampleFiles}${sub.files.length > 3 ? '...' : ''}\x1b[0m\n`);
  });
  console.log(`  \x1b[1m\x1b[38;2;14;165;233m└──────────────────────────────────────────────────────────┘\x1b[0m\n`);

  console.log(`  \x1b[1mEntrypoints:\x1b[0m`);
  analysis.whatIsThis.entryPoints.forEach(ep => {
    console.log(`    • \x1b[38;2;245;158;11m${ep.file}\x1b[0m - ${ep.description}`);
  });
  console.log('');

  console.log(`  \x1b[1mQuickstart:\x1b[0m`);
  console.log(`    Install: \x1b[32m${analysis.whatIsThis.quickstart.installCmd}\x1b[0m`);
  console.log(`    Dev:     \x1b[33m${analysis.whatIsThis.quickstart.devCmd}\x1b[0m`);
  console.log(`    Test:    \x1b[36m${analysis.whatIsThis.quickstart.testCmd}\x1b[0m\n`);
  process.exit(0);
}

function runTerminalPlan(targetPath, query) {
  printBanner();
  console.log(`  \x1b[1m\x1b[38;2;245;158;11mChange Intent:\x1b[0m "${query}"\n`);

  const context = analyzeProject(targetPath);
  const plan = planCodeChange(query, context.files, context.depGraph);

  console.log(`  \x1b[1m\x1b[38;2;52;211;153m🎯 PRIMARY TARGET FILES (${plan.filesToModify.length}):\x1b[0m`);
  plan.filesToModify.forEach(f => {
    console.log(`    • \x1b[1m\x1b[38;2;245;158;11m${f.file}\x1b[0m`);
    console.log(`      Reason: ${f.reason}`);
    if (f.lines) console.log(`      Location: \x1b[32m${f.lines}\x1b[0m`);
  });
  console.log('');

  console.log(`  \x1b[1m\x1b[38;2;244;63;94m⚠️ DOWNSTREAM BLAST RADIUS (${plan.blastRadius.length}):\x1b[0m`);
  if (plan.blastRadius.length === 0) {
    console.log(`    ✔ Change is isolated. No downstream dependents affected.`);
  } else {
    plan.blastRadius.forEach(b => {
      console.log(`    • \x1b[1m${b.file}\x1b[0m - ${b.explanation}`);
    });
  }
  console.log('');

  console.log(`  \x1b[1m\x1b[38;2;14;165;233m📋 STEP-BY-STEP ACTION CHECKLIST:\x1b[0m`);
  plan.stepByStepGuide.forEach((step, idx) => {
    console.log(`    [ ] ${idx + 1}. ${step}`);
  });
  console.log('');
  process.exit(0);
}

function runTerminalTour(targetPath) {
  printBanner();
  const context = analyzeProject(targetPath);
  const { walkthrough } = context.analysis;

  console.log(`  \x1b[1m\x1b[38;2;245;158;11m✦ PROGRESSIVE GUIDED TOUR (${walkthrough.length} Steps) ✦\x1b[0m\n`);

  walkthrough.forEach(step => {
    console.log(`  \x1b[1m\x1b[38;2;14;165;233mStep ${step.stepNumber}: ${step.title}\x1b[0m`);
    console.log(`    Target: \x1b[32m${step.targetFile}\x1b[0m`);
    console.log(`    Mental Model: \x1b[38;2;245;158;11m${step.conceptExplained}\x1b[0m`);
    console.log(`    What happens: ${step.summary}`);
    console.log(`    What to notice:`);
    step.whatToNotice.forEach(n => console.log(`      • ${n}`));
    console.log('');
  });
  process.exit(0);
}

async function runDashboardFlow(absTarget) {
  const portArgIdx = args.findIndex(a => a === '-p' || a === '--port');
  const customPort = portArgIdx !== -1 && args[portArgIdx + 1] ? parseInt(args[portArgIdx + 1], 10) : 4040;
  const noOpen = args.includes('--no-open');

  printBanner();
  console.log(`  \x1b[38;2;14;165;233mScanning codebase:\x1b[0m ${absTarget}`);

  const startTime = Date.now();
  let context;
  try {
    context = analyzeProject(absTarget);
  } catch (err) {
    console.error(`\x1b[31mFailed to analyze directory: ${err.message}\x1b[0m`);
    process.exit(1);
  }
  const elapsed = Date.now() - startTime;

  const { analysis } = context;
  console.log(`  \x1b[32m✔ Indexed in ${elapsed}ms\x1b[0m (${analysis.fileCount} files, ${analysis.totalLines} lines, ${analysis.primaryLanguage})`);
  console.log(`  \x1b[38;2;148;163;184mPurpose: ${analysis.whatIsThis.summary}\x1b[0m`);

  // Generate skills & cache
  const { skillPath } = generateSkillAndArtifacts(absTarget, analysis);
  console.log(`  \x1b[32m✔ Agent Skill ready:\x1b[0m ${skillPath}`);

  // Start HTTP Server
  try {
    const { url } = await startFeinmanServer({
      port: customPort,
      projectPath: absTarget,
      silent: false,
    });

    console.log(`  \x1b[32m✔ Feinman Dashboard running at:\x1b[0m \x1b[1m\x1b[38;2;245;158;11m${url}\x1b[0m\n`);
    console.log(`  ✦ Terminal Options: \x1b[38;2;14;165;233mfeynstart --agy\x1b[0m | \x1b[38;2;14;165;233mfeynstart --claude\x1b[0m | \x1b[38;2;14;165;233mfeynstart --scan\x1b[0m`);
    console.log(`  Press \x1b[1mCtrl+C\x1b[0m to stop server.\n`);

    if (!noOpen) {
      try {
        await open(url);
      } catch {
        // Ignore browser open failure
      }
    }
  } catch (err) {
    console.error(`\x1b[31mFailed to start Feinman server: ${err.message}\x1b[0m`);
    process.exit(1);
  }
}

function printBanner() {
  console.log(`
  \x1b[38;2;245;158;11m┌────────────────────────────────────────────────────────┐
  │  \x1b[1m\x1b[37mFEINMAN\x1b[0m\x1b[38;2;245;158;11m — Understand Complex Code With Ease          │
  │  \x1b[38;2;148;163;184m"If you can't explain it simply, you don't understand it"\x1b[38;2;245;158;11m │
  └────────────────────────────────────────────────────────┘\x1b[0m
`);
}
