import path from 'path';
import { scanRepository } from './scanner.js';
import { detectProjectMetadata } from './detector.js';
import { buildDependencyGraph } from './astParser.js';
import { buildArchitectureModel } from './architecture.js';
import { generateWalkthrough } from './walkthrough.js';
import { generateDefaultScenarios } from './changePlanner.js';
export function analyzeProject(rootPath) {
    const absoluteRoot = path.resolve(rootPath);
    // 1. Scan directory
    const scanResult = scanRepository(absoluteRoot);
    // 2. Detect tech stack, entrypoints, quickstart
    const detected = detectProjectMetadata(absoluteRoot, scanResult.files);
    // 3. Build AST & dependency graph
    const depGraph = buildDependencyGraph(scanResult.files);
    // 4. Cluster subsystems & build architecture diagram
    const architecture = buildArchitectureModel(detected.projectName, scanResult.files, depGraph);
    // 5. Generate walkthrough tour
    const walkthrough = generateWalkthrough(scanResult.files, depGraph);
    // 6. Generate change scenarios
    const scenarios = generateDefaultScenarios(scanResult.files, depGraph);
    // 7. Assemble ProjectAnalysis
    const analysis = {
        id: detected.projectName.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
        name: detected.projectName,
        rootPath: absoluteRoot,
        isSample: false,
        analyzedAt: new Date().toISOString(),
        fileCount: scanResult.files.length,
        totalLines: scanResult.totalLines,
        primaryLanguage: scanResult.primaryLanguage,
        whatIsThis: {
            summary: detected.projectDescription,
            problemSolved: `Helps users build and run ${detected.projectName} with verified tooling and clear modular structure.`,
            techStack: detected.techStack,
            entryPoints: detected.entryPoints,
            quickstart: detected.quickstart,
        },
        howItWorks: {
            mentalModel: architecture.mentalModel,
            subsystems: architecture.subsystems,
            nodes: architecture.nodes,
            edges: architecture.edges,
            dataFlows: architecture.dataFlows,
        },
        whereToChange: {
            scenarios,
        },
        howToMaintain: {
            testFramework: detected.testFramework,
            testDir: detected.testDir,
            testCommand: detected.testCommand,
            debuggingTips: [
                `Run with \`${detected.quickstart.devCmd}\` to launch local development environment.`,
                `Inspect console outputs and terminal logs for unhandled rejections or runtime warnings.`,
                `Set debugger breakpoints in the primary entrypoints (${detected.entryPoints.map(e => e.file).join(', ') || 'root'}).`,
            ],
            envVars: detected.envVars,
            gotchas: [
                {
                    title: 'Respect Subsystem Boundaries',
                    description: 'Avoid importing UI components directly into server or core engine modules to maintain clean layering.',
                    severity: 'info',
                },
                {
                    title: 'Verified Configuration',
                    description: 'Dependencies and scripts are parsed directly from project manifests (e.g. package.json, pyproject.toml).',
                    severity: 'info',
                },
            ],
        },
        walkthrough,
        fileTree: scanResult.fileTree,
    };
    return {
        analysis,
        files: scanResult.files,
        depGraph,
    };
}
