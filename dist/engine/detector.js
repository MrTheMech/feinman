import path from 'path';
// Plain English mapping for known popular packages/technologies
const KNOWN_PACKAGES = {
    // Runtimes & Frameworks
    'react': { role: 'Builds the user interface components and handles state updates in the browser', category: 'framework' },
    'react-dom': { role: 'Renders React components into web browser DOM elements', category: 'framework' },
    'next': { role: 'Full-stack React framework providing server-side rendering, routing, and API endpoints', category: 'framework' },
    'vue': { role: 'Progressive framework for building interactive user interfaces', category: 'framework' },
    'express': { role: 'Handles incoming HTTP requests, API routes, and middleware for the backend', category: 'framework' },
    'fastify': { role: 'High-performance Node.js web framework for building fast APIs', category: 'framework' },
    'vite': { role: 'Lightning-fast development server and asset bundler for the frontend', category: 'tool' },
    'tailwindcss': { role: 'Utility-first styling system used to style UI components without custom CSS files', category: 'library' },
    // Data & State
    'zustand': { role: 'Simple, lightweight state management store for frontend components', category: 'library' },
    'redux': { role: 'Predictable centralized state container for application data', category: 'library' },
    '@reduxjs/toolkit': { role: 'Standard recommended toolkit for writing efficient Redux state logic', category: 'library' },
    'prisma': { role: 'Type-safe database ORM and query builder for database models', category: 'database' },
    '@prisma/client': { role: 'Generated database client used to query the database in code', category: 'database' },
    'drizzle-orm': { role: 'Lightweight, type-safe SQL query builder and migrations tool', category: 'database' },
    'pg': { role: 'PostgreSQL database client driver for executing raw SQL queries', category: 'database' },
    'sqlite3': { role: 'Lightweight file-based SQLite database driver', category: 'database' },
    'better-sqlite3': { role: 'Fast, synchronous SQLite database driver for local storage', category: 'database' },
    'mongoose': { role: 'MongoDB object modeling and schema validation tool', category: 'database' },
    'ioredis': { role: 'Redis client for high-speed in-memory caching and message queues', category: 'database' },
    // Network & Communication
    'axios': { role: 'Sends HTTP network requests to external APIs and servers', category: 'library' },
    'ws': { role: 'Manages real-time bidirectional WebSocket connections', category: 'library' },
    'socket.io': { role: 'Enables real-time event-based communication between client and server', category: 'library' },
    'cors': { role: 'Security middleware allowing the API to accept requests from web browsers on other ports', category: 'library' },
    // AI & Parsing
    '@modelcontextprotocol/sdk': { role: 'Standard Model Context Protocol SDK for connecting to AI agents', category: 'library' },
    'repomix': { role: 'Packs entire repository files into AI-friendly context bundles', category: 'tool' },
    'openai': { role: 'Official client library for querying AI language models', category: 'library' },
    'langchain': { role: 'Framework for chaining language models and document retrieval', category: 'library' },
    'commander': { role: 'Parses command-line arguments, options, and commands for the CLI', category: 'library' },
    'chalk': { role: 'Colors and styles terminal output text for command line readability', category: 'library' },
    'lucide-react': { role: 'Modern, clean icon pack for buttons, status indicators, and navigation', category: 'library' },
    // Testing
    'vitest': { role: 'Unit and integration test runner optimized for Vite projects', category: 'testing' },
    'jest': { role: 'JavaScript testing framework for running unit and snapshot tests', category: 'testing' },
    '@testing-library/react': { role: 'Tests React components by simulating real user interactions', category: 'testing' },
    'playwright': { role: 'Automates real browser testing across Chromium, Firefox, and WebKit', category: 'testing' },
    'cypress': { role: 'End-to-end testing tool that runs tests in an interactive browser window', category: 'testing' },
    'pytest': { role: 'Python testing framework for running test functions and fixtures', category: 'testing' },
};
export function detectProjectMetadata(rootPath, files) {
    const relativeFiles = new Set(files.map(f => f.relativePath));
    let projectName = path.basename(rootPath);
    let projectDescription = 'A software project analyzed by Feinman.';
    const techStack = [];
    const entryPoints = [];
    let installCmd = 'npm install';
    let devCmd = 'npm run dev';
    let testCmd = 'npm test';
    let buildCmd = 'npm run build';
    let testFramework = 'None detected';
    let testDir = 'tests';
    let testCommand = 'npm test';
    const envVars = [];
    // 1. Inspect package.json
    const pkgJsonFile = files.find(f => f.relativePath === 'package.json');
    if (pkgJsonFile && pkgJsonFile.content) {
        try {
            const pkg = JSON.parse(pkgJsonFile.content);
            if (pkg.name)
                projectName = pkg.name;
            if (pkg.description)
                projectDescription = pkg.description;
            // Extract quickstart scripts
            if (pkg.scripts) {
                if (pkg.scripts.dev)
                    devCmd = 'npm run dev';
                else if (pkg.scripts.start)
                    devCmd = 'npm start';
                if (pkg.scripts.test) {
                    testCmd = 'npm test';
                    testCommand = 'npm test';
                }
                if (pkg.scripts.build)
                    buildCmd = 'npm run build';
            }
            // Check package manager
            if (relativeFiles.has('pnpm-lock.yaml')) {
                installCmd = 'pnpm install';
                devCmd = devCmd.replace('npm run', 'pnpm');
                testCmd = testCmd.replace('npm', 'pnpm');
                buildCmd = buildCmd.replace('npm run', 'pnpm');
            }
            else if (relativeFiles.has('yarn.lock')) {
                installCmd = 'yarn install';
                devCmd = devCmd.replace('npm run', 'yarn');
                testCmd = testCmd.replace('npm', 'yarn');
                buildCmd = buildCmd.replace('npm run', 'yarn');
            }
            else if (relativeFiles.has('bun.lockb')) {
                installCmd = 'bun install';
                devCmd = devCmd.replace('npm run', 'bun');
                testCmd = testCmd.replace('npm', 'bun');
                buildCmd = buildCmd.replace('npm run', 'bun');
            }
            // Detect dependencies
            const allDeps = {
                ...pkg.dependencies,
                ...pkg.devDependencies,
            };
            for (const [depName, version] of Object.entries(allDeps)) {
                const known = KNOWN_PACKAGES[depName];
                if (known) {
                    techStack.push({
                        name: depName,
                        category: known.category,
                        role: known.role,
                        version: String(version).replace(/[\^~]/g, ''),
                        confidence: 'verified',
                    });
                    if (known.category === 'testing') {
                        testFramework = depName;
                    }
                }
            }
            // Detect entrypoint from package.json main/bin
            if (pkg.main && relativeFiles.has(pkg.main.replace(/^\.\//, ''))) {
                entryPoints.push({
                    file: pkg.main.replace(/^\.\//, ''),
                    description: 'Declared application entrypoint in package.json main field',
                    exportedSymbols: [],
                    isPrimary: true,
                });
            }
            if (pkg.bin) {
                const binFile = typeof pkg.bin === 'string' ? pkg.bin : Object.values(pkg.bin)[0];
                if (binFile && typeof binFile === 'string') {
                    const normBin = binFile.replace(/^\.\//, '');
                    if (!entryPoints.some(e => e.file === normBin)) {
                        entryPoints.push({
                            file: normBin,
                            description: 'Command line CLI executable entrypoint',
                            exportedSymbols: [],
                            isPrimary: entryPoints.length === 0,
                        });
                    }
                }
            }
        }
        catch {
            // JSON parse error
        }
    }
    // 2. Inspect Python requirements / pyproject.toml
    const pyprojectFile = files.find(f => f.relativePath === 'pyproject.toml');
    const reqsFile = files.find(f => f.relativePath === 'requirements.txt');
    if (pyprojectFile || reqsFile) {
        installCmd = 'pip install -r requirements.txt';
        devCmd = 'python main.py';
        testCmd = 'pytest';
        testFramework = 'pytest';
        testCommand = 'pytest';
        techStack.push({
            name: 'Python',
            category: 'runtime',
            role: 'Interpreted programming language powering data logic and backend services',
            confidence: 'verified',
        });
        if (pyprojectFile?.content?.includes('fastapi') || reqsFile?.content?.includes('fastapi')) {
            techStack.push({
                name: 'FastAPI',
                category: 'framework',
                role: 'High-speed Python web framework for building asynchronous REST APIs',
                confidence: 'verified',
            });
            devCmd = 'uvicorn main:app --reload';
        }
    }
    // 3. Inspect common entrypoint file patterns if not already found
    const candidateEntrypoints = [
        { file: 'src/main.ts', desc: 'Main TypeScript bootstrap file configuring client or server' },
        { file: 'src/main.tsx', desc: 'React web client entrypoint mounting components to DOM' },
        { file: 'src/index.ts', desc: 'Main package entrypoint exporting core modules and functions' },
        { file: 'src/index.js', desc: 'Main JavaScript entrypoint exporting core modules' },
        { file: 'src/App.tsx', desc: 'Root React application component managing global layout and routing' },
        { file: 'src/server/index.ts', desc: 'Backend server bootstrap file starting the HTTP listener' },
        { file: 'main.py', desc: 'Primary Python execution script starting the application' },
        { file: 'app.py', desc: 'Primary Python web application file configuring routes' },
        { file: 'main.go', desc: 'Go binary entrypoint defining main() function' },
        { file: 'cmd/main.go', desc: 'Go application command entrypoint' },
        { file: 'bin/feynstart.js', desc: 'Feinman executable CLI runner' },
    ];
    for (const candidate of candidateEntrypoints) {
        if (relativeFiles.has(candidate.file) && !entryPoints.some(e => e.file === candidate.file)) {
            entryPoints.push({
                file: candidate.file,
                description: candidate.desc,
                exportedSymbols: [],
                isPrimary: entryPoints.length === 0,
            });
        }
    }
    // 4. Test Directory Detection
    for (const f of files) {
        if (f.relativePath.startsWith('test/') || f.relativePath.startsWith('tests/') || f.relativePath.startsWith('__tests__/')) {
            testDir = f.relativePath.split('/')[0];
            break;
        }
    }
    // 5. Detect Environment Variables from .env.example or code references
    const envExample = files.find(f => f.relativePath === '.env.example' || f.relativePath === '.env.sample');
    if (envExample && envExample.content) {
        const lines = envExample.content.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#'))
                continue;
            const [varName, ...rest] = trimmed.split('=');
            if (varName) {
                envVars.push({
                    name: varName.trim(),
                    required: true,
                    description: `Configures ${varName.trim().toLowerCase().replace(/_/g, ' ')} for the environment`,
                    defaultValue: rest.join('=').trim(),
                });
            }
        }
    }
    // If no env vars found, inspect code for process.env references
    if (envVars.length === 0) {
        const seenVars = new Set();
        const envRegex = /process\.env\.([A-Z0-9_]+)/g;
        for (const f of files.slice(0, 50)) {
            if (!f.content)
                continue;
            let match;
            while ((match = envRegex.exec(f.content)) !== null) {
                const v = match[1];
                if (v && !seenVars.has(v) && v !== 'NODE_ENV') {
                    seenVars.add(v);
                    envVars.push({
                        name: v,
                        required: false,
                        description: `Environment variable read by ${f.relativePath}`,
                    });
                }
                if (envVars.length >= 5)
                    break;
            }
            if (envVars.length >= 5)
                break;
        }
    }
    return {
        projectName,
        projectDescription,
        techStack,
        entryPoints,
        quickstart: {
            installCmd,
            devCmd,
            testCmd,
            buildCmd,
        },
        testFramework,
        testDir,
        testCommand,
        envVars,
    };
}
