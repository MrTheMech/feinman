#!/usr/bin/env node

import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import open from 'open';
import { analyzeProject } from '../dist/engine/analyzer.js';
import { FeinmanMCPServer } from '../dist/mcp/server.js';
import { startFeinmanServer } from '../dist/server/index.js';
import { generateSkillAndArtifacts } from '../dist/skills/generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const args = process.argv.slice(2);

// Check for --help
if (args.includes('--help') || args.includes('-h')) {
  console.log(`
  Usage: feynstart [options] [path]

  Feinman — AI-powered tool and MCP server that makes unfamiliar codebases understandable to humans.

  Arguments:
    path                  Directory path of the codebase to analyze (default: current directory)

  Options:
    --mcp                 Run directly as a Model Context Protocol (MCP) server over stdio
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

// Check if stdio MCP mode requested
if (args.includes('--mcp')) {
  const targetDir = args.find(a => !a.startsWith('-')) || process.cwd();
  const absTarget = path.resolve(targetDir);
  const context = analyzeProject(absTarget);
  generateSkillAndArtifacts(absTarget, context.analysis);
  const mcpServer = new FeinmanMCPServer(context);
  mcpServer.startStdio();
} else {
  // Interactive Dashboard Mode
  runDashboardFlow();
}

async function runDashboardFlow() {
  const portArgIdx = args.findIndex(a => a === '-p' || a === '--port');
  const customPort = portArgIdx !== -1 && args[portArgIdx + 1] ? parseInt(args[portArgIdx + 1], 10) : 4040;
  const noOpen = args.includes('--no-open');
  const targetDir = args.find(a => !a.startsWith('-') && a !== args[portArgIdx + 1]) || process.cwd();
  const absTarget = path.resolve(targetDir);

  // Print Banner
  console.log(`
  \x1b[38;2;245;158;11m┌────────────────────────────────────────────────────────┐
  │  \x1b[1m\x1b[37mFEINMAN\x1b[0m\x1b[38;2;245;158;11m — Understand Complex Code With Ease          │
  │  \x1b[38;2;148;163;184m"If you can't explain it simply, you don't understand it"\x1b[38;2;245;158;11m │
  └────────────────────────────────────────────────────────┘\x1b[0m
`);

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
