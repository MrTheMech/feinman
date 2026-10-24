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
  Compass
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
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. Core Purpose Hero */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-card">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                {analysis.name}
              </h1>
              {analysis.isSample ? (
                <span className="px-2 py-0.5 text-xs rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 font-medium">
                  Sample Project
                </span>
              ) : (
                <span className="flex items-center gap-1 px-2 py-0.5 text-xs rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Local Codebase
                </span>
              )}
            </div>
            <p className="text-slate-300 text-sm md:text-base leading-relaxed max-w-3xl">
              {whatIsThis.summary}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0 text-xs font-mono bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800 text-slate-400">
            <div><span className="text-white font-semibold">{fileCount}</span> files</div>
            <div className="text-slate-700">•</div>
            <div><span className="text-white font-semibold">{totalLines.toLocaleString()}</span> lines</div>
            <div className="text-slate-700">•</div>
            <div className="text-amber-400">{primaryLanguage}</div>
          </div>
        </div>

        {/* Problem Solved */}
        <div className="pt-4 flex items-start gap-2.5 text-xs md:text-sm text-slate-300">
          <div className="p-1 rounded bg-amber-500/10 text-amber-400 shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <strong className="text-white font-medium">Problem it solves: </strong>
            <span className="text-slate-300">{whatIsThis.problemSolved}</span>
          </div>
        </div>
      </section>

      {/* 2. Quickstart & Verification Commands */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              How to Run It
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Verified from project manifests
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {/* Install */}
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
            <div className="text-[11px] font-medium text-slate-400 mb-1">1. Install Dependencies</div>
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
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
            <div className="text-[11px] font-medium text-slate-400 mb-1">2. Run Development Server</div>
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
          <div className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between">
            <div className="text-[11px] font-medium text-slate-400 mb-1">3. Execute Test Suite</div>
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

      {/* 3. Starting Entry Points */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Where the Application Starts (Entry Points)
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Click any file to inspect real code
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {whatIsThis.entryPoints.map((ep, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-lg border flex flex-col justify-between transition-all ${
                ep.isPrimary
                  ? 'bg-slate-950/90 border-amber-500/40 hover:border-amber-400/60'
                  : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <button
                    onClick={() => onOpenFile(ep.file)}
                    className="flex items-center gap-1.5 text-xs font-mono font-semibold text-amber-300 hover:text-amber-200 transition-colors"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>{ep.file}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>
                  {ep.isPrimary && (
                    <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                      Primary Entrypoint
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {ep.description}
                </p>
              </div>

              <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                <button
                  onClick={() => onOpenFile(ep.file)}
                  className="text-slate-400 hover:text-white transition-colors"
                >
                  Inspect file
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

      {/* 4. Technologies & Why They Are Here */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Technologies & Their Purpose in This Codebase
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            Plain-English explanation of why each dependency exists
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {whatIsThis.techStack.map((item, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="font-semibold text-xs text-white">
                    {item.name}
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                    {item.category}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {item.role}
                </p>
              </div>
              {item.version && (
                <div className="mt-2 text-[10px] font-mono text-slate-500">
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
