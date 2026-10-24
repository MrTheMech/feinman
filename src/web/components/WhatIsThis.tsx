import React, { useState } from 'react';
import { 
  Play, 
  Terminal, 
  FileCode2, 
  Check, 
  Copy, 
  Layers, 
  Sparkles, 
  ExternalLink, 
  ShieldCheck, 
  Compass,
  ArrowRight,
  Workflow,
  Cpu,
  Bot,
  Zap
} from 'lucide-react';
import { ProjectAnalysis } from '../../engine/types.js';

interface WhatIsThisProps {
  analysis: ProjectAnalysis;
  onOpenFile: (filePath: string) => void;
  onExplainSymbol: (name: string, kind: string, file: string, snippet?: string) => void;
}

export const WhatIsThis: React.FC<WhatIsThisProps> = ({
  analysis,
  onOpenFile,
  onExplainSymbol,
}) => {
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const { whatIsThis, rootPath, fileCount, totalLines, primaryLanguage } = analysis;

  return (
    <div className="space-y-4 max-w-5xl mx-auto py-1">
      
      {/* 1. Core Purpose Hero with Visual Metric Pills */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 pb-3.5 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white font-mono">
                {analysis.name}
              </h1>
              {analysis.isSample ? (
                <span className="px-2 py-0.5 text-[10px] font-mono rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold uppercase">
                  Sample Project
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 text-[10px] font-mono rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold uppercase">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Codebase
                </span>
              )}
            </div>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed max-w-2xl font-medium">
              {whatIsThis.summary}
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-2.5 shrink-0 text-xs font-mono bg-slate-950/90 px-3 py-1.5 rounded-lg border border-slate-800 text-slate-400">
            <div><span className="text-white font-bold">{fileCount}</span> files</div>
            <div className="text-slate-700">•</div>
            <div><span className="text-white font-bold">{totalLines.toLocaleString()}</span> lines</div>
            <div className="text-slate-700">•</div>
            <div className="text-amber-400 font-bold">{primaryLanguage}</div>
          </div>
        </div>

        {/* Problem Solved Badge */}
        <div className="pt-3 flex items-center gap-2 text-xs text-slate-300">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 shrink-0">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div>
            <strong className="text-amber-300 font-medium">Solves: </strong>
            <span className="text-slate-300">{whatIsThis.problemSolved}</span>
          </div>
        </div>
      </section>

      {/* 2. Visual Architecture Pipeline at a Glance (Visual Way of Explaining!) */}
      <section className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
              System Architecture at a Glance
            </h2>
          </div>
          <span className="text-[10px] font-mono text-slate-500">
            High-level component flow
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 relative">
          {/* Stage 1: Inputs */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1.5">
                  <Compass className="w-3.5 h-3.5" />
                  1. Inputs & Entry
                </span>
                <span className="text-[9px] font-mono text-slate-500">Triggers</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Receives user intent via CLI commands, web browser requests, or AI Agent MCP calls.
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/20">CLI Terminal</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/20">HTTP Server</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-amber-300 border border-amber-500/20">MCP Stdio</span>
            </div>
          </div>

          {/* Stage 2: Core Processing */}
          <div className="bg-slate-900/80 border border-purple-500/30 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-purple-400 flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5" />
                  2. Core Engine
                </span>
                <span className="text-[9px] font-mono text-slate-500">Analysis</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Executes AST dependency scanning, subsystem clustering, and blast radius calculation.
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-500/20">AST Graph</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-500/20">Clustering</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-purple-300 border border-purple-500/20">Blast Engine</span>
            </div>
          </div>

          {/* Stage 3: Outputs */}
          <div className="bg-slate-900/80 border border-sky-500/30 rounded-lg p-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[10px] font-mono uppercase font-bold text-sky-400 flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" />
                  3. Interfaces & Output
                </span>
                <span className="text-[9px] font-mono text-slate-500">Delivery</span>
              </div>
              <p className="text-xs text-slate-300 leading-snug">
                Presents interactive ReactFlow topology, agent skills markdown, and JSON-RPC tools.
              </p>
            </div>
            <div className="mt-2 pt-2 border-t border-slate-800 flex flex-wrap gap-1">
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-sky-300 border border-sky-500/20">Web Dashboard</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-sky-300 border border-sky-500/20">SKILL.md</span>
              <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-950 text-sky-300 border border-sky-500/20">MCP Tools</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Quickstart & Verification Commands */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
              Runnable Commands (Verified from Manifests)
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Click copy icon to run
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
          {/* Install */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="text-[10px] font-medium text-slate-400 mb-1">1. Install Dependencies</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-emerald-300 truncate">
                {whatIsThis.quickstart.installCmd}
              </code>
              <button
                onClick={() => copyToClipboard(whatIsThis.quickstart.installCmd)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 btn-tactile"
                title="Copy command"
              >
                {copiedCmd === whatIsThis.quickstart.installCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Dev Server */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="text-[10px] font-medium text-slate-400 mb-1">2. Run Dev Server / App</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-amber-300 truncate">
                {whatIsThis.quickstart.devCmd}
              </code>
              <button
                onClick={() => copyToClipboard(whatIsThis.quickstart.devCmd)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 btn-tactile"
                title="Copy command"
              >
                {copiedCmd === whatIsThis.quickstart.devCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Run Tests */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5 flex flex-col justify-between">
            <div className="text-[10px] font-medium text-slate-400 mb-1">3. Run Test Suite</div>
            <div className="flex items-center justify-between gap-2">
              <code className="text-xs font-mono text-sky-300 truncate">
                {whatIsThis.quickstart.testCmd}
              </code>
              <button
                onClick={() => copyToClipboard(whatIsThis.quickstart.testCmd)}
                className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 btn-tactile"
                title="Copy command"
              >
                {copiedCmd === whatIsThis.quickstart.testCmd ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Entry Points Matrix */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <h2 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
              Application Entry Points
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Click to inspect source
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {whatIsThis.entryPoints.map((ep, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border flex flex-col justify-between transition-all ${
                ep.isPrimary
                  ? 'bg-slate-950/90 border-amber-500/40 hover:border-amber-400/60'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <button
                    onClick={() => onOpenFile(ep.file)}
                    className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>{ep.file}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>
                  {ep.isPrimary && (
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Primary
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {ep.description}
                </p>
              </div>

              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                <button
                  onClick={() => onOpenFile(ep.file)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Inspect code
                </button>
                <button
                  onClick={() => onExplainSymbol(ep.file, 'entrypoint', ep.file)}
                  className="flex items-center gap-1 text-amber-400 hover:text-amber-300 btn-tactile"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Explain role</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 5. Technologies & Roles */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
              Technologies & Roles in This Codebase
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Plain-English purpose for each dependency
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {whatIsThis.techStack.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1">
                  <div className="font-bold text-xs text-white font-mono">
                    {item.name}
                  </div>
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-snug">
                  {item.role}
                </p>
              </div>
              {item.version && (
                <div className="mt-2 text-[9px] font-mono text-slate-500">
                  v{item.version}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
