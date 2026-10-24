export const SAMPLE_PROJECTS = {
    'repomix': createRepomixSample(),
    'taskflow': createTaskFlowSample(),
    'datapulse': createDataPulseSample(),
};
function createRepomixSample() {
    const files = [
        {
            relativePath: 'bin/repomix.js',
            absolutePath: '/sample/repomix/bin/repomix.js',
            language: 'JavaScript',
            lineCount: 28,
            sizeBytes: 850,
            content: `#!/usr/bin/env node\nimport { runCli } from '../src/cli/index.js';\n\nrunCli(process.argv);`,
        },
        {
            relativePath: 'src/cli/index.ts',
            absolutePath: '/sample/repomix/src/cli/index.ts',
            language: 'TypeScript',
            lineCount: 142,
            sizeBytes: 4200,
            content: `import { Command } from 'commander';\nimport { packRepository } from '../core/packager.js';\nimport { loadConfig } from '../config/configLoader.js';\nimport { logger } from '../utils/logger.js';\n\nexport async function runCli(args: string[]) {\n  const program = new Command();\n  program\n    .name('repomix')\n    .description('Pack entire repository into AI-friendly context files')\n    .option('-o, --output <file>', 'Output file path', 'repomix-output.txt')\n    .option('--style <type>', 'Output format: plain, xml, markdown', 'plain')\n    .action(async (options) => {\n      const config = await loadConfig();\n      await packRepository(process.cwd(), config, options);\n    });\n  await program.parseAsync(args);\n}`,
        },
        {
            relativePath: 'src/core/packager.ts',
            absolutePath: '/sample/repomix/src/core/packager.ts',
            language: 'TypeScript',
            lineCount: 210,
            sizeBytes: 6800,
            content: `import { scanFiles } from './fileScanner.js';\nimport { formatOutput } from './formatter.js';\nimport { countTokens } from './tokenizer.js';\nimport { checkSecurityRules } from './securityScanner.js';\n\nexport async function packRepository(rootDir: string, config: any, options: any) {\n  const rawFiles = await scanFiles(rootDir, config.ignorePatterns);\n  const safeFiles = checkSecurityRules(rawFiles);\n  const tokenCount = countTokens(safeFiles);\n  const formatted = formatOutput(safeFiles, options.style);\n  return { formatted, tokenCount, fileCount: safeFiles.length };\n}`,
        },
        {
            relativePath: 'src/core/fileScanner.ts',
            absolutePath: '/sample/repomix/src/core/fileScanner.ts',
            language: 'TypeScript',
            lineCount: 95,
            sizeBytes: 3100,
            content: `import fs from 'fs';\nimport path from 'path';\nimport ignore from 'ignore';\n\nexport async function scanFiles(dir: string, customIgnores: string[] = []) {\n  const ig = ignore().add(['.git', 'node_modules', ...customIgnores]);\n  // Recursive scan logic\n  return [];\n}`,
        },
        {
            relativePath: 'src/core/tokenizer.ts',
            absolutePath: '/sample/repomix/src/core/tokenizer.ts',
            language: 'TypeScript',
            lineCount: 65,
            sizeBytes: 1950,
            content: `export function countTokens(files: any[]): number {\n  // Calculates BPE token metrics for GPT-4 and Claude\n  return files.reduce((acc, f) => acc + (f.content?.length || 0) / 4, 0);\n}`,
        },
        {
            relativePath: 'src/core/securityScanner.ts',
            absolutePath: '/sample/repomix/src/core/securityScanner.ts',
            language: 'TypeScript',
            lineCount: 88,
            sizeBytes: 2900,
            content: `const SECRET_PATTERNS = [\n  /AIza[0-9A-Za-z-_]{35}/,\n  /sk-[a-zA-Z0-9]{32,}/,\n];\n\nexport function checkSecurityRules(files: any[]) {\n  return files.filter(f => !SECRET_PATTERNS.some(p => p.test(f.content || '')));\n}`,
        },
        {
            relativePath: 'tests/packager.test.ts',
            absolutePath: '/sample/repomix/tests/packager.test.ts',
            language: 'TypeScript',
            lineCount: 75,
            sizeBytes: 2400,
            content: `import { describe, it, expect } from 'vitest';\nimport { packRepository } from '../src/core/packager.js';\n\ndescribe('packRepository', () => {\n  it('packs sample repository with XML style', async () => {\n    // Test assertion\n  });\n});`,
        },
    ];
    const depGraph = {
        imports: new Map([
            ['bin/repomix.js', new Set(['src/cli/index.ts'])],
            ['src/cli/index.ts', new Set(['src/core/packager.ts'])],
            ['src/core/packager.ts', new Set(['src/core/fileScanner.ts', 'src/core/tokenizer.ts', 'src/core/securityScanner.ts'])],
            ['tests/packager.test.ts', new Set(['src/core/packager.ts'])],
        ]),
        importedBy: new Map([
            ['src/cli/index.ts', new Set(['bin/repomix.js'])],
            ['src/core/packager.ts', new Set(['src/cli/index.ts', 'tests/packager.test.ts'])],
            ['src/core/fileScanner.ts', new Set(['src/core/packager.ts'])],
            ['src/core/tokenizer.ts', new Set(['src/core/packager.ts'])],
            ['src/core/securityScanner.ts', new Set(['src/core/packager.ts'])],
        ]),
        fileSymbols: new Map([
            ['src/cli/index.ts', [{ name: 'runCli', kind: 'function', file: 'src/cli/index.ts', line: 7, snippet: 'export async function runCli', isExported: true }]],
            ['src/core/packager.ts', [{ name: 'packRepository', kind: 'function', file: 'src/core/packager.ts', line: 6, snippet: 'export async function packRepository', isExported: true }]],
            ['src/core/tokenizer.ts', [{ name: 'countTokens', kind: 'function', file: 'src/core/tokenizer.ts', line: 1, snippet: 'export function countTokens', isExported: true }]],
            ['src/core/securityScanner.ts', [{ name: 'checkSecurityRules', kind: 'function', file: 'src/core/securityScanner.ts', line: 6, snippet: 'export function checkSecurityRules', isExported: true }]],
        ]),
        allSymbols: [],
    };
    const analysis = {
        id: 'repomix',
        name: 'Repomix (Sample Repository)',
        rootPath: '/sample/repomix',
        isSample: true,
        analyzedAt: new Date().toISOString(),
        fileCount: files.length,
        totalLines: 706,
        primaryLanguage: 'TypeScript',
        whatIsThis: {
            summary: 'Repomix packs entire codebases into clean, AI-friendly context files with token counts and secret filtering.',
            problemSolved: 'Developers often need to feed large multi-file codebases into LLMs without exceeding context windows or leaking API keys.',
            techStack: [
                { name: 'TypeScript', category: 'runtime', role: 'Provides static typing for safe CLI packaging logic', version: '5.6', confidence: 'verified' },
                { name: 'commander', category: 'library', role: 'Parses terminal flags, options, and commands for the CLI', version: '12.1', confidence: 'verified' },
                { name: 'vitest', category: 'testing', role: 'Runs automated unit and integration tests with fast hot reloading', version: '2.1', confidence: 'verified' },
            ],
            entryPoints: [
                { file: 'bin/repomix.js', description: 'Executable CLI script invoked when running `repomix` in terminal', exportedSymbols: [], isPrimary: true },
                { file: 'src/cli/index.ts', description: 'CLI argument parser and option dispatcher', exportedSymbols: ['runCli'], isPrimary: false },
            ],
            quickstart: {
                installCmd: 'npm install -g repomix',
                devCmd: 'npm run dev',
                testCmd: 'npm test',
                buildCmd: 'npm run build',
            },
        },
        howItWorks: {
            mentalModel: 'Think of Repomix like a luggage packer for airport travel: it inspects your closet (scans files), checks for prohibited items (security secrets scanner), weighs the suitcase (token counter), and neatly folds everything into a single carry-on bag (digest markdown file).',
            subsystems: [
                {
                    id: 'cli',
                    name: 'CLI Interface',
                    color: '#f59e0b',
                    description: 'Parses user flags and configures packager options',
                    files: ['bin/repomix.js', 'src/cli/index.ts'],
                    responsibilities: ['Terminal argument parsing', 'Config loading', 'Status logging'],
                    dependencies: ['core'],
                },
                {
                    id: 'core',
                    name: 'Packaging Engine',
                    color: '#8b5cf6',
                    description: 'Coordinates file scanning, security checks, and formatting',
                    files: ['src/core/packager.ts', 'src/core/fileScanner.ts', 'src/core/tokenizer.ts', 'src/core/securityScanner.ts'],
                    responsibilities: ['Recursive file crawling', 'Secret redaction', 'Token counting', 'Output serialization'],
                    dependencies: [],
                },
            ],
            nodes: [
                { id: 'bin/repomix.js', label: 'repomix.js', type: 'entry', subsystem: 'CLI Interface', description: 'Terminal binary entrypoint' },
                { id: 'src/cli/index.ts', label: 'index.ts', type: 'entry', subsystem: 'CLI Interface', description: 'Command dispatcher' },
                { id: 'src/core/packager.ts', label: 'packager.ts', type: 'core', subsystem: 'Packaging Engine', description: 'Core packaging coordinator' },
                { id: 'src/core/securityScanner.ts', label: 'securityScanner.ts', type: 'core', subsystem: 'Packaging Engine', description: 'Secret detector' },
                { id: 'src/core/tokenizer.ts', label: 'tokenizer.ts', type: 'util', subsystem: 'Packaging Engine', description: 'BPE token calculator' },
            ],
            edges: [
                { from: 'bin/repomix.js', to: 'src/cli/index.ts', label: 'invokes' },
                { from: 'src/cli/index.ts', to: 'src/core/packager.ts', label: 'dispatches to' },
                { from: 'src/core/packager.ts', to: 'src/core/securityScanner.ts', label: 'scans with' },
                { from: 'src/core/packager.ts', to: 'src/core/tokenizer.ts', label: 'measures' },
            ],
            dataFlows: [
                {
                    id: 'pack-flow',
                    title: 'CLI Pack Execution Cycle',
                    description: 'How files are selected, sanitized, and serialized.',
                    steps: [
                        { step: 1, actor: 'User', action: 'Runs `repomix --style markdown` in project directory', fileRef: 'bin/repomix.js' },
                        { step: 2, actor: 'CLI', action: 'Parses options and passes config to packager', fileRef: 'src/cli/index.ts' },
                        { step: 3, actor: 'Security Filter', action: 'Redacts detected API keys and secrets', fileRef: 'src/core/securityScanner.ts' },
                        { step: 4, actor: 'Output Writer', action: 'Generates output file with verified token count', fileRef: 'src/core/packager.ts' },
                    ],
                },
            ],
        },
        whereToChange: {
            scenarios: [
                {
                    title: 'Add a new secret pattern to security scanner',
                    query: 'Add secret pattern for Anthropic API keys',
                    summary: 'Modify `src/core/securityScanner.ts` to add the Anthropic key regex to `SECRET_PATTERNS`.',
                    targetFiles: [{ file: 'src/core/securityScanner.ts', reason: 'Defines SECRET_PATTERNS array', confidence: 0.98, recommendedLines: 'Around line 2' }],
                    blastRadius: [{ file: 'src/core/packager.ts', impact: 'direct-import', explanation: 'Calls checkSecurityRules before packaging' }],
                    checklist: ['Add regex `/sk-ant-[a-zA-Z0-9_-]{32,}/` to `SECRET_PATTERNS`', 'Add a unit test in `tests/packager.test.ts`', 'Run `npm test`'],
                },
            ],
        },
        howToMaintain: {
            testFramework: 'vitest',
            testDir: 'tests',
            testCommand: 'npm test',
            debuggingTips: [
                'Run `npm run dev -- --verbose` for detailed scanning logs',
                'Check `repomix.config.json` if certain files are unexpectedly ignored',
            ],
            envVars: [],
            gotchas: [
                { title: 'Binary File Handling', description: 'Images and compiled binaries are automatically excluded from token packs to avoid corrupting text output.', severity: 'info' },
            ],
        },
        walkthrough: [
            {
                stepNumber: 1,
                title: 'The Gateway: bin/repomix.js',
                targetFile: 'bin/repomix.js',
                keyLines: [1, 5],
                summary: 'Small executable shell script that enables users to invoke `repomix` from any terminal directory.',
                whatToNotice: ['Notice the node shebang line `#!/usr/bin/env node`', 'Delegates immediately to the TypeScript CLI module'],
                conceptExplained: 'The ignition key: turns on the car and lets the driver steer.',
            },
            {
                stepNumber: 2,
                title: 'The Coordinator: src/core/packager.ts',
                targetFile: 'src/core/packager.ts',
                keyLines: [6, 25],
                summary: 'The master workflow function coordinating file scanning, security filters, token counting, and serialization.',
                whatToNotice: ['Sequential pipeline pattern: scan -> check security -> count -> format', 'Clean separation of concerns between stages'],
                conceptExplained: 'The general manager of the assembly line.',
            },
        ],
        fileTree: [
            { path: 'bin/repomix.js', name: 'repomix.js', isDirectory: false, language: 'JavaScript', lineCount: 28 },
            { path: 'src/cli/index.ts', name: 'index.ts', isDirectory: false, language: 'TypeScript', lineCount: 142 },
            { path: 'src/core/packager.ts', name: 'packager.ts', isDirectory: false, language: 'TypeScript', lineCount: 210 },
            { path: 'src/core/securityScanner.ts', name: 'securityScanner.ts', isDirectory: false, language: 'TypeScript', lineCount: 88 },
            { path: 'src/core/tokenizer.ts', name: 'tokenizer.ts', isDirectory: false, language: 'TypeScript', lineCount: 65 },
            { path: 'tests/packager.test.ts', name: 'packager.test.ts', isDirectory: false, language: 'TypeScript', lineCount: 75 },
        ],
    };
    return { analysis, files, depGraph };
}
function createTaskFlowSample() {
    // Return TaskFlow Kanban board sample
    const repomix = createRepomixSample();
    const analysis = { ...repomix.analysis, id: 'taskflow', name: 'TaskFlow Kanban (Sample App)', primaryLanguage: 'TypeScript (React)' };
    analysis.whatIsThis.summary = 'A collaborative task management application with real-time Kanban columns, drag-and-drop cards, and local SQLite persistence.';
    return { analysis, files: repomix.files, depGraph: repomix.depGraph };
}
function createDataPulseSample() {
    // Return DataPulse Python sample
    const repomix = createRepomixSample();
    const analysis = { ...repomix.analysis, id: 'datapulse', name: 'DataPulse Analytics (Sample Service)', primaryLanguage: 'Python' };
    analysis.whatIsThis.summary = 'An asynchronous Python FastAPI microservice that aggregates time-series metrics into Redis and computes rolling averages.';
    return { analysis, files: repomix.files, depGraph: repomix.depGraph };
}
