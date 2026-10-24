import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { analyzeProject } from '../engine/analyzer.js';
import { FeinmanMCPServer } from '../mcp/server.js';
import { createApiRouter } from './api.js';
import { generateSkillAndArtifacts } from '../skills/generator.js';
export async function startFeinmanServer(options = {}) {
    const port = options.port || 4040;
    const projectPath = options.projectPath ? path.resolve(options.projectPath) : process.cwd();
    // 1. Analyze project
    const initialContext = analyzeProject(projectPath);
    // 2. Generate initial skills & cache
    generateSkillAndArtifacts(projectPath, initialContext.analysis);
    // 3. Initialize MCP Server instance
    const mcpServer = new FeinmanMCPServer(initialContext);
    // 4. Create Express app
    const app = express();
    const server = http.createServer(app);
    // Mount API router
    const apiRouter = createApiRouter(initialContext, mcpServer);
    app.use('/api', apiRouter);
    // Serve static web build if present (e.g. dist/web or ../../dist/web)
    const candidateWebPaths = [
        path.join(__dirname, '../web'),
        path.join(__dirname, '../../dist/web'),
        path.join(process.cwd(), 'dist/web'),
    ];
    let servedStatic = false;
    for (const wp of candidateWebPaths) {
        if (fs.existsSync(wp) && fs.existsSync(path.join(wp, 'index.html'))) {
            app.use(express.static(wp));
            app.get('*', (req, res, next) => {
                if (req.path.startsWith('/api'))
                    return next();
                res.sendFile(path.join(wp, 'index.html'));
            });
            servedStatic = true;
            break;
        }
    }
    return new Promise((resolve, reject) => {
        server.listen(port, () => {
            const url = `http://localhost:${port}`;
            if (!options.silent) {
                console.log(`\n  ✦ Feinman Dashboard: ${url}`);
                console.log(`  ✦ Target Codebase:   ${projectPath}`);
                console.log(`  ✦ MCP Server Endpoint: ${url}/api/mcp`);
                console.log(`  ✦ Agent Skill:       ${projectPath}/.agents/skills/feinman/SKILL.md\n`);
            }
            resolve({ server, port, url, context: initialContext });
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                // Try fallback port
                const altPort = port + 1;
                server.listen(altPort, () => {
                    const url = `http://localhost:${altPort}`;
                    resolve({ server, port: altPort, url, context: initialContext });
                });
            }
            else {
                reject(err);
            }
        });
    });
}
// Direct execution
if (import.meta.url === `file://${process.argv[1]?.replace(/\\/g, '/')}`) {
    startFeinmanServer();
}
