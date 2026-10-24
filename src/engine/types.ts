export interface TechStackItem {
  name: string;
  category: 'runtime' | 'framework' | 'library' | 'database' | 'tool' | 'testing';
  role: string; // Plain English explanation: "Runs the HTTP server and handles routing"
  version?: string;
  confidence: 'verified' | 'inferred';
}

export interface EntryPointItem {
  file: string;
  description: string;
  exportedSymbols: string[];
  isPrimary: boolean;
}

export interface Subsystem {
  id: string;
  name: string;
  description: string;
  color: string;
  files: string[];
  responsibilities: string[];
  dependencies: string[];
}

export interface ArchitectureNode {
  id: string;
  label: string;
  type: 'entry' | 'core' | 'service' | 'data' | 'ui' | 'util';
  subsystem: string;
  file?: string;
  description: string;
  x?: number;
  y?: number;
  inDegree?: number;
  outDegree?: number;
  symbols?: string[];
}

export interface ArchitectureEdge {
  from: string;
  to: string;
  label?: string;
  protocol?: string;
}

export interface DataFlowStep {
  step: number;
  actor: string;
  action: string;
  fileRef?: string;
}

export interface DataFlow {
  id: string;
  title: string;
  description: string;
  steps: DataFlowStep[];
}

export interface ChangeScenario {
  title: string;
  query: string;
  summary: string;
  targetFiles: Array<{
    file: string;
    reason: string;
    confidence: number;
    recommendedLines?: string;
  }>;
  blastRadius: Array<{
    file: string;
    impact: 'direct-import' | 'shared-type' | 'test-suite' | 'configuration';
    explanation: string;
  }>;
  checklist: string[];
}

export interface GotchaItem {
  title: string;
  description: string;
  severity: 'info' | 'warning' | 'caution';
  fileRef?: string;
}

export interface WalkthroughStep {
  stepNumber: number;
  title: string;
  targetFile: string;
  keyLines?: [number, number];
  summary: string;
  whatToNotice: string[];
  conceptExplained: string;
}

export interface FileNode {
  path: string;
  name: string;
  isDirectory: boolean;
  size?: number;
  lineCount?: number;
  language?: string;
  children?: FileNode[];
  subsystem?: string;
}

export interface ProjectAnalysis {
  id: string;
  name: string;
  rootPath: string;
  isSample: boolean;
  analyzedAt: string;
  fileCount: number;
  totalLines: number;
  primaryLanguage: string;
  
  // The 4 Fundamental Questions
  whatIsThis: {
    summary: string;
    problemSolved: string;
    techStack: TechStackItem[];
    entryPoints: EntryPointItem[];
    quickstart: {
      installCmd: string;
      devCmd: string;
      testCmd: string;
      buildCmd?: string;
      notes?: string;
    };
  };

  howItWorks: {
    mentalModel: string;
    subsystems: Subsystem[];
    nodes: ArchitectureNode[];
    edges: ArchitectureEdge[];
    dataFlows: DataFlow[];
  };

  whereToChange: {
    scenarios: ChangeScenario[];
  };

  howToMaintain: {
    testFramework: string;
    testDir: string;
    testCommand: string;
    debuggingTips: string[];
    envVars: Array<{
      name: string;
      required: boolean;
      description: string;
      defaultValue?: string;
    }>;
    gotchas: GotchaItem[];
  };

  walkthrough: WalkthroughStep[];
  fileTree: FileNode[];
}

export interface ChangePlanRequest {
  query: string;
  contextPath?: string;
}

export interface ChangePlanResult {
  query: string;
  summary: string;
  filesToModify: Array<{
    file: string;
    importance: 'primary' | 'secondary' | 'test';
    reason: string;
    lines?: string;
  }>;
  blastRadius: Array<{
    file: string;
    impact: string;
    explanation: string;
  }>;
  stepByStepGuide: string[];
  verificationSteps: string[];
  modelUsed?: string;
}

export interface LLMConfig {
  provider: 'ollama' | 'gemini' | 'openai-compatible' | 'heuristic';
  endpoint: string;
  model: string;
  apiKey?: string;
}
