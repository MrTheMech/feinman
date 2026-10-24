import readline from 'readline';
import path from 'path';
import { planCodeChange } from '../engine/changePlanner.js';
import { explainWithFeynman } from '../engine/llm.js';
export class FeinmanMCPServer {
    context;
    constructor(context) {
        this.context = context;
    }
    updateContext(newContext) {
        this.context = newContext;
    }
    async handleMessage(req) {
        const id = req.id !== undefined ? req.id : null;
        switch (req.method) {
            case 'initialize':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        protocolVersion: '2024-11-05',
                        serverInfo: {
                            name: 'feinman-mcp-server',
                            version: '1.0.0',
                        },
                        capabilities: {
                            tools: {},
                            resources: {},
                        },
                    },
                };
            case 'notifications/initialized':
                return null; // Notifications do not have responses
            case 'ping':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {},
                };
            case 'tools/list':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        tools: [
                            {
                                name: 'feinman_understand_project',
                                description: 'Answers "What is this project?" in plain English, explaining its purpose, mental model, tech stack, and entry points.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {},
                                },
                            },
                            {
                                name: 'feinman_explain_file',
                                description: 'Explains what a specific file does, its role, exports, imports, and a simplified real-world Feynman analogy.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        filePath: {
                                            type: 'string',
                                            description: 'Relative path of the file to explain (e.g. "src/engine/scanner.ts")',
                                        },
                                    },
                                    required: ['filePath'],
                                },
                            },
                            {
                                name: 'feinman_trace_feature',
                                description: 'Traces how a feature or concept works across files in the codebase (e.g. "authentication", "change planning", "import resolution").',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        feature: {
                                            type: 'string',
                                            description: 'Name of the feature or concept to trace',
                                        },
                                    },
                                    required: ['feature'],
                                },
                            },
                            {
                                name: 'feinman_plan_change',
                                description: 'Answers "Where should I make a change?". Given a natural language user goal, identifies exact files to modify, blast radius, and verification steps.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        goal: {
                                            type: 'string',
                                            description: 'What you want to change, add, or fix in the codebase',
                                        },
                                    },
                                    required: ['goal'],
                                },
                            },
                            {
                                name: 'feinman_find_tests',
                                description: 'Finds automated test suites and files that exercise a given module, file, or feature.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        target: {
                                            type: 'string',
                                            description: 'File path or feature name to find tests for',
                                        },
                                    },
                                    required: ['target'],
                                },
                            },
                            {
                                name: 'feinman_walkthrough',
                                description: 'Returns the progressive 5-step guided walkthrough of the entire repository.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {},
                                },
                            },
                            {
                                name: 'feinman_pack_repomix',
                                description: 'Generates a condensed, token-efficient repository digest of key files for LLM context packing.',
                                inputSchema: {
                                    type: 'object',
                                    properties: {
                                        maxFiles: {
                                            type: 'number',
                                            description: 'Maximum number of files to include in digest (default 15)',
                                        },
                                    },
                                },
                            },
                        ],
                    },
                };
            case 'tools/call':
                return this.handleToolCall(id, req.params?.name, req.params?.arguments || {});
            case 'resources/list':
                return {
                    jsonrpc: '2.0',
                    id,
                    result: {
                        resources: [
                            {
                                uri: 'feinman://overview',
                                name: 'Project Overview & Purpose',
                                description: 'High-level purpose, tech stack, and entry points',
                                mimeType: 'text/markdown',
                            },
                            {
                                uri: 'feinman://architecture',
                                name: 'Architecture & Subsystems',
                                description: 'Subsystem clusters, mental model, and data flows',
                                mimeType: 'text/markdown',
                            },
                            {
                                uri: 'feinman://maintenance',
                                name: 'Maintenance & Testing Runbook',
                                description: 'Testing instructions, debugging tips, and gotchas',
                                mimeType: 'text/markdown',
                            },
                        ],
                    },
                };
            case 'resources/read':
                return this.handleResourceRead(id, req.params?.uri);
            default:
                return {
                    jsonrpc: '2.0',
                    id,
                    error: {
                        code: -32601,
                        message: `Method not found: ${req.method}`,
                    },
                };
        }
    }
    async handleToolCall(id, toolName, args) {
        const { analysis, files, depGraph } = this.context;
        try {
            if (toolName === 'feinman_understand_project') {
                const text = `# ${analysis.name} — Overview\n\n` +
                    `**Purpose**: ${analysis.whatIsThis.summary}\n\n` +
                    `**Mental Model**: ${analysis.howItWorks.mentalModel}\n\n` +
                    `### Quickstart Commands\n` +
                    `- Install: \`${analysis.whatIsThis.quickstart.installCmd}\`\n` +
                    `- Run Dev: \`${analysis.whatIsThis.quickstart.devCmd}\`\n` +
                    `- Run Tests: \`${analysis.whatIsThis.quickstart.testCmd}\`\n\n` +
                    `### Primary Entry Points\n` +
                    analysis.whatIsThis.entryPoints.map(e => `- \`${e.file}\`: ${e.description}`).join('\n') + '\n\n' +
                    `### Subsystems\n` +
                    analysis.howItWorks.subsystems.map(s => `- **${s.name}**: ${s.description} (${s.files.length} files)`).join('\n');
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text }] },
                };
            }
            if (toolName === 'feinman_explain_file') {
                const targetPath = args.filePath || '';
                const normTarget = targetPath.replace(/\\/g, '/');
                const fileObj = files.find(f => f.relativePath === normTarget || f.relativePath.endsWith(normTarget));
                if (!fileObj) {
                    return {
                        jsonrpc: '2.0',
                        id,
                        result: {
                            content: [{ type: 'text', text: `File "${targetPath}" not found in scanned repository.` }],
                        },
                    };
                }
                const fileImports = Array.from(depGraph.imports.get(fileObj.relativePath) || []);
                const fileImporters = Array.from(depGraph.importedBy.get(fileObj.relativePath) || []);
                const symbols = depGraph.fileSymbols.get(fileObj.relativePath) || [];
                const explanation = await explainWithFeynman(path.basename(fileObj.relativePath), fileObj.language, fileObj.content?.slice(0, 1500) || '', fileObj.relativePath, analysis.whatIsThis.summary);
                const text = `## File: ${fileObj.relativePath} (${fileObj.language}, ${fileObj.lineCount} lines)\n\n` +
                    `### Plain Summary\n${explanation.plainSummary}\n\n` +
                    `### Feynman Analogy\n${explanation.feynmanAnalogy}\n\n` +
                    `### Inputs & Outputs\n${explanation.inputsAndOutputs}\n\n` +
                    `### Exported Symbols\n` +
                    (symbols.length > 0 ? symbols.map(s => `- \`${s.name}\` (${s.kind}, line ${s.line})`).join('\n') : '*No explicit top-level exported symbols.*') + '\n\n' +
                    `### Direct Imports (${fileImports.length})\n` +
                    (fileImports.length > 0 ? fileImports.slice(0, 8).map(i => `- \`${i}\``).join('\n') : '*None*') + '\n\n' +
                    `### Imported By (${fileImporters.length})\n` +
                    (fileImporters.length > 0 ? fileImporters.slice(0, 8).map(i => `- \`${i}\``).join('\n') : '*None*');
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text }] },
                };
            }
            if (toolName === 'feinman_plan_change') {
                const goal = args.goal || 'Make an update';
                const plan = planCodeChange(goal, files, depGraph);
                const text = `## Change Plan: "${goal}"\n\n` +
                    `**Summary**: ${plan.summary}\n\n` +
                    `### Primary Files to Modify\n` +
                    plan.filesToModify.map(f => `- **\`${f.file}\`** (${f.importance}): ${f.reason}${f.lines ? ` — *Target: ${f.lines}*` : ''}`).join('\n') + '\n\n' +
                    `### Downstream Blast Radius (${plan.blastRadius.length} affected files)\n` +
                    (plan.blastRadius.length > 0
                        ? plan.blastRadius.map(b => `- **\`${b.file}\`** [${b.impact}]: ${b.explanation}`).join('\n')
                        : '*Change is localized with no downstream imports affected.*') + '\n\n' +
                    `### Implementation Checklist\n` +
                    plan.stepByStepGuide.map(s => `- ${s}`).join('\n') + '\n\n' +
                    `### Verification Steps\n` +
                    plan.verificationSteps.map(v => `- ${v}`).join('\n');
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text }] },
                };
            }
            if (toolName === 'feinman_walkthrough') {
                const text = `# Codebase Walkthrough: ${analysis.name}\n\n` +
                    analysis.walkthrough.map(w => `### Step ${w.stepNumber}: ${w.title}\n` +
                        `- **File**: \`${w.targetFile}\`\n` +
                        `- **Concept**: ${w.conceptExplained}\n` +
                        `- **Summary**: ${w.summary}\n` +
                        `- **What to Notice**:\n` +
                        w.whatToNotice.map(n => `  - ${n}`).join('\n')).join('\n\n');
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text }] },
                };
            }
            if (toolName === 'feinman_find_tests') {
                const target = (args.target || '').toLowerCase();
                const testFiles = files.filter(f => {
                    const r = f.relativePath.toLowerCase();
                    return r.includes('test') || r.includes('spec');
                });
                const matchingTests = testFiles.filter(f => {
                    if (!target)
                        return true;
                    return f.relativePath.toLowerCase().includes(target) || (f.content && f.content.toLowerCase().includes(target));
                });
                const text = `## Test Search for: "${target}"\n\n` +
                    `Found **${matchingTests.length}** matching test files in \`${analysis.howToMaintain.testDir}\`:\n\n` +
                    (matchingTests.length > 0
                        ? matchingTests.map(t => `- \`${t.relativePath}\` (${t.lineCount} lines)`).join('\n')
                        : `*No specific test file matched "${target}". General test runner is \`${analysis.howToMaintain.testCommand}\`.*`);
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text }] },
                };
            }
            if (toolName === 'feinman_trace_feature') {
                const feature = args.feature || '';
                const plan = planCodeChange(feature, files, depGraph);
                const text = `## Feature Trace: "${feature}"\n\n` +
                    `This feature centers around **${plan.filesToModify.map(f => `\`${f.file}\``).join(', ')}**.\n\n` +
                    `### Execution & Dependency Path\n` +
                    plan.filesToModify.map(f => {
                        const importers = Array.from(depGraph.importedBy.get(f.file) || []);
                        return `- **\`${f.file}\`**: ${f.reason}\n  Imported by: ${importers.slice(0, 3).map(i => `\`${i}\``).join(', ') || 'entrypoint'}`;
                    }).join('\n\n');
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text }] },
                };
            }
            if (toolName === 'feinman_pack_repomix') {
                const maxFiles = Number(args.maxFiles) || 12;
                const keyFiles = files
                    .filter(f => f.content && !f.relativePath.includes('test') && !f.relativePath.endsWith('.json'))
                    .slice(0, maxFiles);
                let digest = `# Repository Digest: ${analysis.name}\n\n`;
                for (const kf of keyFiles) {
                    digest += `## File: ${kf.relativePath}\n\`\`\`${kf.language.toLowerCase()}\n${kf.content?.slice(0, 2000)}\n\`\`\`\n\n`;
                }
                return {
                    jsonrpc: '2.0',
                    id,
                    result: { content: [{ type: 'text', text: digest }] },
                };
            }
            return {
                jsonrpc: '2.0',
                id,
                error: { code: -32601, message: `Tool not found: ${toolName}` },
            };
        }
        catch (err) {
            return {
                jsonrpc: '2.0',
                id,
                error: { code: -32000, message: err.message || 'Internal tool execution error' },
            };
        }
    }
    handleResourceRead(id, uri) {
        const { analysis } = this.context;
        if (uri === 'feinman://overview') {
            return {
                jsonrpc: '2.0',
                id,
                result: {
                    contents: [
                        {
                            uri,
                            mimeType: 'text/markdown',
                            text: `# ${analysis.name} — Overview\n\n${analysis.whatIsThis.summary}\n\nQuickstart: \`${analysis.whatIsThis.quickstart.devCmd}\``,
                        },
                    ],
                },
            };
        }
        if (uri === 'feinman://architecture') {
            return {
                jsonrpc: '2.0',
                id,
                result: {
                    contents: [
                        {
                            uri,
                            mimeType: 'text/markdown',
                            text: `# Architecture: ${analysis.name}\n\n${analysis.howItWorks.mentalModel}\n\nSubsystems:\n` +
                                analysis.howItWorks.subsystems.map(s => `- **${s.name}**: ${s.description}`).join('\n'),
                        },
                    ],
                },
            };
        }
        if (uri === 'feinman://maintenance') {
            return {
                jsonrpc: '2.0',
                id,
                result: {
                    contents: [
                        {
                            uri,
                            mimeType: 'text/markdown',
                            text: `# Maintenance Guide\n\nTest Framework: ${analysis.howToMaintain.testFramework}\nCommand: \`${analysis.howToMaintain.testCommand}\``,
                        },
                    ],
                },
            };
        }
        return {
            jsonrpc: '2.0',
            id,
            error: { code: -32602, message: `Unknown resource URI: ${uri}` },
        };
    }
    startStdio() {
        const rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout,
            terminal: false,
        });
        rl.on('line', async (line) => {
            const trimmed = line.trim();
            if (!trimmed)
                return;
            try {
                const req = JSON.parse(trimmed);
                const res = await this.handleMessage(req);
                if (res) {
                    process.stdout.write(JSON.stringify(res) + '\n');
                }
            }
            catch (err) {
                process.stdout.write(JSON.stringify({
                    jsonrpc: '2.0',
                    id: null,
                    error: { code: -32700, message: 'Parse error: invalid JSON' },
                }) + '\n');
            }
        });
    }
}
