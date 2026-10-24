import path from 'path';
import { Subsystem, ArchitectureNode, ArchitectureEdge, DataFlow } from './types.js';
import { ScannedFile } from './scanner.js';
import { DependencyGraph } from './astParser.js';

interface SubsystemRule {
  id: string;
  name: string;
  color: string;
  matcher: (p: string) => boolean;
  responsibilities: string[];
}

const SUBSYSTEM_RULES: SubsystemRule[] = [
  {
    id: 'cli',
    name: 'CLI & Entrypoints',
    color: '#f59e0b', // Amber
    matcher: (p) => p.startsWith('bin/') || p.includes('cli') || p.startsWith('cmd/') || p === 'main.py' || p === 'app.py',
    responsibilities: [
      'Parses user flags and terminal arguments',
      'Initializes application runtimes and settings',
      'Dispatches commands to core execution engines',
    ],
  },
  {
    id: 'api',
    name: 'API & Routing Layer',
    color: '#0284c7', // Sky Blue
    matcher: (p) => p.includes('routes') || p.includes('controllers') || p.includes('server') || p.includes('endpoints') || p.includes('api/'),
    responsibilities: [
      'Listens for incoming HTTP and WebSocket requests',
      'Validates request payloads and query parameters',
      'Routes requests to corresponding business services',
    ],
  },
  {
    id: 'core',
    name: 'Core Logic & Intelligence',
    color: '#8b5cf6', // Violet
    matcher: (p) => p.includes('engine') || p.includes('services') || p.includes('core') || p.includes('lib') || p.includes('logic'),
    responsibilities: [
      'Executes primary domain calculations and algorithms',
      'Coordinates state transitions and data transformations',
      'Enforces business rules and validation constraints',
    ],
  },
  {
    id: 'data',
    name: 'Data & Persistence',
    color: '#10b981', // Emerald
    matcher: (p) => p.includes('models') || p.includes('db') || p.includes('schema') || p.includes('repository') || p.includes('entities'),
    responsibilities: [
      'Defines data structures and entity schemas',
      'Executes queries and writes to persistent storage',
      'Manages database connections and migrations',
    ],
  },
  {
    id: 'ui',
    name: 'UI & User Experience',
    color: '#ec4899', // Pink
    matcher: (p) => p.includes('web/') || p.includes('components') || p.includes('views') || p.includes('pages') || p.endsWith('.tsx') || p.endsWith('.jsx'),
    responsibilities: [
      'Renders visual user interfaces and reactive layouts',
      'Captures user interactions, form inputs, and clicks',
      'Communicates with backend APIs and visualizes state',
    ],
  },
  {
    id: 'mcp-skills',
    name: 'MCP & Agent Skills',
    color: '#06b6d4', // Cyan
    matcher: (p) => p.includes('mcp') || p.includes('skills') || p.includes('.agents'),
    responsibilities: [
      'Exposes standard Model Context Protocol tools and resources',
      'Generates self-describing skill packs for AI agents',
      'Bridges external AI workflows with the repository engine',
    ],
  },
  {
    id: 'utils',
    name: 'Utilities & Configuration',
    color: '#64748b', // Slate
    matcher: () => true, // Fallback catch-all
    responsibilities: [
      'Provides reusable helper functions and formatting utilities',
      'Manages environment configuration and constants',
      'Handles shared errors and logging wrappers',
    ],
  },
];

export function buildArchitectureModel(
  projectName: string,
  files: ScannedFile[],
  depGraph: DependencyGraph
): {
  mentalModel: string;
  subsystems: Subsystem[];
  nodes: ArchitectureNode[];
  edges: ArchitectureEdge[];
  dataFlows: DataFlow[];
} {
  // 1. Assign each file to a subsystem
  const fileSubsystemMap = new Map<string, string>();
  const subsystemFileMap = new Map<string, string[]>();

  for (const rule of SUBSYSTEM_RULES) {
    subsystemFileMap.set(rule.id, []);
  }

  for (const file of files) {
    let assigned = false;
    for (const rule of SUBSYSTEM_RULES) {
      if (rule.matcher(file.relativePath)) {
        fileSubsystemMap.set(file.relativePath, rule.id);
        subsystemFileMap.get(rule.id)?.push(file.relativePath);
        assigned = true;
        break;
      }
    }
    if (!assigned) {
      fileSubsystemMap.set(file.relativePath, 'utils');
      subsystemFileMap.get('utils')?.push(file.relativePath);
    }
  }

  // Filter out empty subsystems
  const activeSubsystems: Subsystem[] = [];
  for (const rule of SUBSYSTEM_RULES) {
    const assignedFiles = subsystemFileMap.get(rule.id) || [];
    if (assignedFiles.length > 0) {
      // Find cross-subsystem dependencies
      const depSubsystems = new Set<string>();
      for (const f of assignedFiles) {
        const fileImports = depGraph.imports.get(f) || new Set();
        for (const imp of fileImports) {
          const targetSub = fileSubsystemMap.get(imp);
          if (targetSub && targetSub !== rule.id) {
            depSubsystems.add(targetSub);
          }
        }
      }

      activeSubsystems.push({
        id: rule.id,
        name: rule.name,
        color: rule.color,
        description: rule.responsibilities[0],
        files: assignedFiles,
        responsibilities: rule.responsibilities,
        dependencies: Array.from(depSubsystems),
      });
    }
  }

  // 2. Build Architecture Nodes & Edges
  const nodes: ArchitectureNode[] = [];
  const edges: ArchitectureEdge[] = [];

  // Group key files as nodes
  const nodeSet = new Set<string>();
  const edgeKeySet = new Set<string>();

  // Pick up to 12 representative files as visual nodes
  for (const sub of activeSubsystems) {
    const keyFiles = sub.files.slice(0, 3);
    for (const f of keyFiles) {
      const fileName = path.basename(f);
      let nodeType: ArchitectureNode['type'] = 'core';
      if (sub.id === 'cli') nodeType = 'entry';
      else if (sub.id === 'api') nodeType = 'service';
      else if (sub.id === 'data') nodeType = 'data';
      else if (sub.id === 'ui') nodeType = 'ui';
      else if (sub.id === 'utils') nodeType = 'util';

      nodes.push({
        id: f,
        label: fileName,
        type: nodeType,
        subsystem: sub.name,
        file: f,
        description: `${sub.name}: ${f}`,
      });
      nodeSet.add(f);
    }
  }

  // Connect edges between nodes based on real imports
  for (const node of nodes) {
    if (!node.file) continue;
    const fileImports = depGraph.imports.get(node.file) || new Set();
    for (const targetFile of fileImports) {
      if (nodeSet.has(targetFile)) {
        const edgeKey = `${node.file}->${targetFile}`;
        if (!edgeKeySet.has(edgeKey)) {
          edgeKeySet.add(edgeKey);
          edges.push({
            from: node.file,
            to: targetFile,
            label: 'imports',
          });
        }
      }
    }
  }

  // Calculate degrees and populate symbols
  for (const node of nodes) {
    if (node.file) {
      const inCount = depGraph.importedBy.get(node.file)?.size || 0;
      const outCount = depGraph.imports.get(node.file)?.size || 0;
      const syms = depGraph.fileSymbols.get(node.file) || [];
      node.inDegree = inCount;
      node.outDegree = outCount;
      node.symbols = syms.map(s => s.name).slice(0, 6);
    }
  }

  // If few direct node imports, link subsystem nodes logically
  if (edges.length === 0 && nodes.length > 1) {
    for (let i = 0; i < nodes.length - 1; i++) {
      if (nodes[i].subsystem !== nodes[i + 1].subsystem) {
        edges.push({
          from: nodes[i].id,
          to: nodes[i + 1].id,
          label: 'connects to',
        });
      }
    }
  }

  // 3. Generate Feynman Mental Model Analogy
  const mentalModel = generateMentalModel(projectName, activeSubsystems);

  // 4. Generate Data Flow steps
  const dataFlows: DataFlow[] = [
    {
      id: 'primary-execution',
      title: 'Standard Execution & Request Cycle',
      description: 'The journey of data from user trigger to output presentation.',
      steps: [
        {
          step: 1,
          actor: 'User / Client',
          action: 'Initiates a request or triggers a CLI command with arguments.',
          fileRef: nodes.find(n => n.type === 'entry')?.file,
        },
        {
          step: 2,
          actor: 'Entry & Routing Layer',
          action: 'Parses parameters, validates input, and delegates to domain services.',
          fileRef: nodes.find(n => n.type === 'service')?.file,
        },
        {
          step: 3,
          actor: 'Core Engine',
          action: 'Processes business rules, updates internal state, and queries required resources.',
          fileRef: nodes.find(n => n.type === 'core')?.file,
        },
        {
          step: 4,
          actor: 'Output / UI',
          action: 'Returns formatted results, streams responses, or renders updated components.',
          fileRef: nodes.find(n => n.type === 'ui')?.file,
        },
      ],
    },
  ];

  return {
    mentalModel,
    subsystems: activeSubsystems,
    nodes,
    edges,
    dataFlows,
  };
}

function generateMentalModel(projectName: string, subsystems: Subsystem[]): string {
  const subsystemNames = subsystems.map(s => s.name).join(', ');
  return (
    `Think of **${projectName}** like a well-organized clockwork workshop: ` +
    `the **entrypoints** accept external inputs (commands, clicks, or HTTP requests) ` +
    `and direct them to specialized workbenches (${subsystemNames}). ` +
    `Each part does one job with clear boundaries, ensuring that changes to the user interface ` +
    `or external adapters do not disrupt the core algorithms underneath.`
  );
}
