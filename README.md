# Feinman — Understand Complex Code with Ease

> *"If you can't explain it simply, you don't understand it."*  
> — Richard Feynman

**Feinman** is an open-source, AI-powered developer tool and **Model Context Protocol (MCP)** server that makes unfamiliar software repositories effortless to understand, navigate, and maintain for both humans and AI coding agents.

---

## 🌟 Foundational Architecture & Attribution

Feinman stands on the shoulders of notable open-source pioneers in codebase comprehension:

- **[Understand-Anything](https://github.com/Egonex-AI/Understand-Anything) (Egonex AI)**: Serves as the primary architectural foundation for Feinman's graph-first interactive topology mapping, bottom-drawer code inspection, subsystem clustering, and agent skills pipeline.
- **[Repomix](https://github.com/yamadashy/repomix) (Yamadashy)**: Inspired our token-efficient repository crawler, secret redaction, and AI-friendly context packaging.
- **[WikiPilot](https://github.com/guymoyal/wikipilot)**: Influenced our structured codebase walkthrough and progressive mental model documentation.
- **[RepoMind](https://github.com/Philipcyrus/RepoMind)**: Guided our reverse dependency blast radius and change impact tracing.

---

## ⚡ The Four Fundamental Questions

Feinman is organized around answering four practical developer questions:

### 1. What is this project?
- **Plain-English Purpose**: A jargon-free explanation of what problem the software solves.
- **Verified Tech Stack**: Every library and framework listed alongside a clear explanation of *why* it is there and what role it plays.
- **Runnable Quickstart**: Step-by-step commands to install, run the development server, and execute tests directly extracted from project manifests.
- **Starting Entry Points**: Pinpoints where execution begins (e.g. `bin/feynstart.js`, `src/server/index.ts`, `main.py`).

### 2. How does it work?
- **Feynman Mental Model**: A concrete real-world analogy (e.g. airport control tower, clockwork workshop) explaining the whole system.
- **Interactive Architecture Map**: An interactive component topology visualizer displaying nodes (entrypoints, services, core engine, data layer, UI), their connections, and subsystems.
- **Subsystem Breakdown**: Cohesive groupings of files with explicit boundary responsibilities.
- **End-to-End Data Flow**: Step-by-step sequence of how user inputs travel through the system to outputs.

### 3. Where should I make a change?
- **Natural Language Intent Input**: Type what you want to add, fix, or modify (e.g. *"Add rate limiting to API routes"*, *"Support PostgreSQL database"*, *"Fix token expiration"*).
- **Target File Recommendations**: Pinpoints primary files with target line numbers and importance scores.
- **Downstream Blast Radius**: Computes reverse dependency graphs to reveal which other modules, importers, or test suites could be affected.
- **Step-by-Step Checklist**: An interactive checklist guiding your implementation and verification.

### 4. How do I maintain it?
- **Automated Test Suite**: Detected test runner, test directory, and verified command to run tests.
- **Debugging Runbook**: Concrete diagnostic tips for runtime issues and log inspection.
- **Environment Variables**: Table of detected environment flags, required status, and descriptions.
- **Code Quirks & Gotchas**: Source-grounded cautions and architectural boundaries.

---

## 🚀 Installation & Instant Startup

Install Feinman globally or run it directly with `npx`:

```bash
# Install globally
npm install -g feinman

# Or run directly via npx in any project folder
npx feinman
```

### Starting Feinman with `feynstart`

Run `feynstart` from any codebase directory:

```bash
cd /path/to/any-repo
feynstart
```

When you run `feynstart`, Feinman automatically:
1. **Detects & Indexes**: Recursively crawls files, respecting `.gitignore` and ignoring node_modules, build directories, and binaries in milliseconds.
2. **Builds AST & Dependency Graph**: Traces imports, exports, and call graphs.
3. **Generates Intelligence Bundle**: Writes `.feinman/` cache and standard `.agents/skills/feinman/SKILL.md`.
4. **Launches Interactive Dashboard**: Starts the local server at `http://localhost:4040` and opens your default browser.
5. **Exposes MCP Server**: Ready to connect AI agents over stdio or HTTP.

### CLI Options

```text
Usage: feynstart [options] [path]

Arguments:
  path                  Directory path of the codebase to analyze (default: current directory)

Options:
  --mcp                 Run directly as a Model Context Protocol (MCP) server over stdio
  -p, --port <number>   Dashboard HTTP port (default: 4040)
  --no-open             Do not automatically open the dashboard in browser
  --export              Export repomix-style codebase pack to feinman-digest.md
  -v, --version         Show version
  -h, --help            Show this help message
```

---

## 🤖 MCP (Model Context Protocol) Integration

Feinman implements standard JSON-RPC 2.0 MCP protocol specifications. Compatible AI clients (**Cursor**, **Claude Desktop**, **Antigravity**, **Windsurf**, **Copilot**) can discover and invoke 7 codebase understanding tools:

### Available MCP Tools

| Tool Name | Description |
|---|---|
| `feinman_understand_project` | Plain-English summary of purpose, mental model, tech stack, and entry points. |
| `feinman_explain_file` | Explains any file's role, exported symbols, imports, and a Feynman analogy. |
| `feinman_trace_feature` | Traces execution flows for a feature across files. |
| `feinman_plan_change` | Pinpoints exact files, line numbers, blast radius, and checklist for a code change. |
| `feinman_find_tests` | Discovers tests that exercise a specific module or feature. |
| `feinman_walkthrough` | Returns the progressive 5-step guided walkthrough of the repository. |
| `feinman_pack_repomix` | Generates a condensed, token-efficient repository digest for LLM context. |

### Configuration Snippets

#### Cursor IDE (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "feinman": {
      "command": "feynstart",
      "args": ["--mcp", "/absolute/path/to/project"]
    }
  }
}
```

#### Claude Desktop (`claude_desktop_config.json`)
```json
{
  "mcpServers": {
    "feinman": {
      "command": "feynstart",
      "args": ["--mcp", "/absolute/path/to/project"]
    }
  }
}
```

---

## 🧠 Open-Weight & Local AI Models

Feinman is designed with a **hybrid intelligence engine**:
1. **Deterministic Heuristic AST Engine**: Runs 100% locally and offline with 0ms latency, zero API keys, and zero external network calls.
2. **Local Open-Weight Models via Ollama**: Connects to `http://localhost:11434` to utilize open-weight models (**Llama 3.2**, **CodeLlama**, **DeepSeek-R1**, **Qwen2.5-Coder**, **Mistral**) for deep Feynman analogies and reasoning.
3. Transparent fallback: If no LLM server is active, Feinman operates reliably using its deterministic parser without throwing errors.

---

## 🧭 Pre-bundled Sample Projects

Feinman includes 3 pre-bundled, full-depth sample codebases switchable with one click in the UI:
1. **Repomix CLI**: TypeScript/Node AI packaging tool with token counters and security scanners.
2. **TaskFlow Kanban**: React + Express + SQLite collaborative board.
3. **DataPulse Analytics**: Python FastAPI + Redis asynchronous metrics microservice.

---

## ⚖️ Honest Documentation of Limitations

- **Dynamic Reflection & Metaprogramming**: Dynamic runtime imports (e.g. `import(variable)`) or reflection in Python/Java are approximated statically based on string heuristics.
- **Monorepo Workspaces**: Feinman analyzes sub-packages within the scanned root; for complex multi-language monorepos with dozens of independent packages, scanning individual package directories yields the most focused architecture graphs.
- **Binary & Media Files**: Non-text assets (images, fonts, precompiled binaries) are omitted from source token packs to prevent buffer corruption.

---

## 📜 License

Licensed under the **Apache License, Version 2.0**. See the [LICENSE](LICENSE) file for details.
