import express, { Request, Response } from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { AnalysisContext, analyzeProject } from '../engine/analyzer.js';
import { planCodeChange } from '../engine/changePlanner.js';
import { checkModelStatus, explainWithFeynman, answerTutorQuestion, setLLMConfig, getLLMConfig } from '../engine/llm.js';
import { generateSkillAndArtifacts } from '../skills/generator.js';
import { FeinmanMCPServer, MCPRequest } from '../mcp/server.js';
import { SAMPLE_PROJECTS } from './samples.js';

export function createApiRouter(
  initialContext: AnalysisContext,
  mcpServer: FeinmanMCPServer
): express.Router {
  const router = express.Router();
  router.use(cors());
  router.use(express.json());

  let currentContext = initialContext;

  // 1. Get current project analysis
  router.get('/project', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: currentContext.analysis,
    });
  });

  // 2. Scan a new path or rescan
  router.post('/scan', (req: Request, res: Response) => {
    try {
      const targetPath = req.body?.path || currentContext.analysis.rootPath;
      if (!fs.existsSync(targetPath)) {
        return res.status(400).json({ success: false, error: `Directory "${targetPath}" does not exist.` });
      }

      const newContext = analyzeProject(targetPath);
      currentContext = newContext;
      mcpServer.updateContext(newContext);

      // Generate skills and artifacts
      generateSkillAndArtifacts(targetPath, newContext.analysis);

      res.json({
        success: true,
        data: newContext.analysis,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Failed to scan repository' });
    }
  });

  // 3. Get single file content and symbol details
  router.get('/file', (req: Request, res: Response) => {
    const filePath = (req.query.path as string) || '';
    const norm = filePath.replace(/\\/g, '/');

    const fileObj = currentContext.files.find(f => f.relativePath === norm);
    if (!fileObj) {
      return res.status(404).json({ success: false, error: `File "${filePath}" not found` });
    }

    const absPath = path.resolve(currentContext.analysis.rootPath, norm);
    let fullContent = fileObj.content || '';
    if (!fullContent && fs.existsSync(absPath)) {
      try {
        fullContent = fs.readFileSync(absPath, 'utf-8');
      } catch {
        fullContent = '// Unable to read binary or protected file content';
      }
    }

    const imports = Array.from(currentContext.depGraph.imports.get(norm) || []);
    const importedBy = Array.from(currentContext.depGraph.importedBy.get(norm) || []);
    const symbols = currentContext.depGraph.fileSymbols.get(norm) || [];

    res.json({
      success: true,
      data: {
        relativePath: norm,
        language: fileObj.language,
        lineCount: fileObj.lineCount,
        sizeBytes: fileObj.sizeBytes,
        content: fullContent,
        imports,
        importedBy,
        symbols,
      },
    });
  });

  // 4. Change Planner API
  router.post('/plan-change', (req: Request, res: Response) => {
    const query = req.body?.query || '';
    if (!query.trim()) {
      return res.status(400).json({ success: false, error: 'Query is required' });
    }

    const plan = planCodeChange(query, currentContext.files, currentContext.depGraph);
    res.json({
      success: true,
      data: plan,
    });
  });

  // 5. Explain Symbol / File with Feynman technique
  router.post('/explain-symbol', async (req: Request, res: Response) => {
    try {
      const { name, kind, file, snippet } = req.body || {};
      const explanation = await explainWithFeynman(
        name || 'Component',
        kind || 'module',
        snippet || '',
        file || '',
        currentContext.analysis.whatIsThis.summary
      );

      res.json({
        success: true,
        data: explanation,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Explanation failed' });
    }
  });

  // 5b. Ask Anything Chatbot Route for Walkthrough
  router.post('/ask', async (req: Request, res: Response) => {
    try {
      const { question, file, stepTitle, stepSummary, whatToNotice } = req.body || {};
      if (!question || !question.trim()) {
        return res.status(400).json({ success: false, error: 'Question is required' });
      }

      const answerData = await answerTutorQuestion(
        question,
        file || '',
        stepTitle || '',
        stepSummary || '',
        whatToNotice || [],
        currentContext.analysis.whatIsThis.summary
      );

      res.json({
        success: true,
        data: answerData,
      });
    } catch (err: any) {
      res.status(500).json({ success: false, error: err.message || 'Tutor query failed' });
    }
  });

  // 6. MCP HTTP Endpoint (execute MCP JSON-RPC over HTTP)
  router.post('/mcp', async (req: Request, res: Response) => {
    try {
      const mcpReq = req.body as MCPRequest;
      const mcpRes = await mcpServer.handleMessage(mcpReq);
      res.json(mcpRes || { jsonrpc: '2.0', id: mcpReq.id, result: {} });
    } catch (err: any) {
      res.status(500).json({
        jsonrpc: '2.0',
        id: req.body?.id || null,
        error: { code: -32000, message: err.message },
      });
    }
  });

  // 7. MCP Status & Client Config Generators
  router.get('/mcp/status', (req: Request, res: Response) => {
    const root = currentContext.analysis.rootPath;
    const absFeynstart = path.resolve(__dirname, '../../bin/feynstart.js');

    const claudeConfig = {
      mcpServers: {
        feinman: {
          command: "node",
          args: [absFeynstart, "--mcp", root],
        },
      },
    };

    const cursorConfig = {
      mcpServers: {
        feinman: {
          command: "node",
          args: [absFeynstart, "--mcp", root],
        },
      },
    };

    res.json({
      success: true,
      data: {
        serverName: 'feinman-mcp-server',
        version: '1.0.0',
        activeRoot: root,
        toolsCount: 7,
        resourcesCount: 3,
        configs: {
          claude: JSON.stringify(claudeConfig, null, 2),
          cursor: JSON.stringify(cursorConfig, null, 2),
          terminalCommand: `feynstart --mcp "${root}"`,
        },
      },
    });
  });

  // 8. Model Status & Config
  router.get('/model/status', async (req: Request, res: Response) => {
    const status = await checkModelStatus();
    res.json({
      success: true,
      data: {
        ...status,
        config: getLLMConfig(),
      },
    });
  });

  router.post('/model/config', (req: Request, res: Response) => {
    const { endpoint, model, provider } = req.body || {};
    setLLMConfig({ endpoint, model, provider });
    res.json({
      success: true,
      data: getLLMConfig(),
    });
  });

  // 9. Sample Projects
  router.get('/samples', (req: Request, res: Response) => {
    res.json({
      success: true,
      data: Object.values(SAMPLE_PROJECTS).map(s => ({
        id: s.analysis.id,
        name: s.analysis.name,
        summary: s.analysis.whatIsThis.summary,
        language: s.analysis.primaryLanguage,
        fileCount: s.analysis.fileCount,
      })),
    });
  });

  router.post('/samples/:id', (req: Request, res: Response) => {
    const sample = SAMPLE_PROJECTS[req.params.id];
    if (!sample) {
      return res.status(404).json({ success: false, error: 'Sample not found' });
    }

    currentContext = sample;
    mcpServer.updateContext(sample);
    res.json({
      success: true,
      data: sample.analysis,
    });
  });

  return router;
}
