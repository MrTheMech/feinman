import React from 'react';
import { 
  Wrench, 
  Terminal, 
  Bug, 
  KeyRound, 
  AlertCircle, 
  CheckCircle2, 
  FileCode2,
  Copy,
  Check
} from 'lucide-react';
import { ProjectAnalysis } from '../../engine/types.js';

interface HowToMaintainProps {
  analysis: ProjectAnalysis;
  onOpenFile: (filePath: string) => void;
}

export const HowToMaintain: React.FC<HowToMaintainProps> = ({
  analysis,
  onOpenFile,
}) => {
  const { howToMaintain } = analysis;
  const [copiedCmd, setCopiedCmd] = React.useState<string | null>(null);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCmd(text);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. Test Harness & Test Running */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Automated Testing & Quality Checks
            </h2>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            {howToMaintain.testFramework}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 mb-4">
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-400 mb-1 font-mono uppercase">
              Framework
            </div>
            <div className="text-sm font-bold text-white">
              {howToMaintain.testFramework}
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5">
            <div className="text-[11px] text-slate-400 mb-1 font-mono uppercase">
              Test Directory
            </div>
            <div className="text-sm font-mono text-amber-300">
              {howToMaintain.testDir}/
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between">
            <div className="text-[11px] text-slate-400 mb-1 font-mono uppercase">
              Run Tests Command
            </div>
            <div className="flex items-center justify-between gap-1">
              <code className="text-xs font-mono text-emerald-300 truncate">
                {howToMaintain.testCommand}
              </code>
              <button
                onClick={() => copy(howToMaintain.testCommand)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 btn-tactile"
              >
                {copiedCmd === howToMaintain.testCommand ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Debugging Runbook & Practical Tips */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Bug className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Debugging Guidance & Runbooks
          </h2>
        </div>

        <div className="space-y-2.5">
          {howToMaintain.debuggingTips.map((tip, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3 flex items-start gap-2.5"
            >
              <div className="w-5 h-5 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center shrink-0 mt-0.5 text-xs font-mono font-bold">
                {idx + 1}
              </div>
              <p className="text-xs text-slate-200 leading-relaxed">
                {tip}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* 3. Environment Variables Configuration */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-sky-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Environment Variables & Secrets
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            {howToMaintain.envVars.length} variables detected in code/manifests
          </span>
        </div>

        {howToMaintain.envVars.length > 0 ? (
          <div className="border border-slate-800 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 font-mono text-[11px] uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Variable Name</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Default / Example</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 bg-slate-950/40">
                {howToMaintain.envVars.map((ev, i) => (
                  <tr key={i} className="hover:bg-slate-900/50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-semibold text-amber-300">
                      {ev.name}
                    </td>
                    <td className="py-2.5 px-3">
                      {ev.required ? (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          Required
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          Optional
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-300">
                      {ev.description}
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-400">
                      {ev.defaultValue || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-xs text-slate-400 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
            No external environment variables required. The codebase runs out-of-the-box with default local configs.
          </div>
        )}
      </section>

      {/* 4. Discovered Quirks & Gotchas */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Codebase Quirks & Gotchas
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {howToMaintain.gotchas.map((g, idx) => (
            <div
              key={idx}
              className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <h3 className="text-xs font-bold text-white">
                    {g.title}
                  </h3>
                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    {g.severity}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {g.description}
                </p>
              </div>

              {g.fileRef && (
                <button
                  onClick={() => onOpenFile(g.fileRef!)}
                  className="mt-3 pt-2 border-t border-slate-800 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 text-left truncate"
                >
                  File: {g.fileRef}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
