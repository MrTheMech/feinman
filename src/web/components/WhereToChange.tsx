import React, { useState } from 'react';
import { 
  GitFork, 
  Search, 
  Sparkles, 
  FileCode2, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Check, 
  ExternalLink,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { ProjectAnalysis, ChangePlanResult } from '../../engine/types.js';

interface WhereToChangeProps {
  analysis: ProjectAnalysis;
  onOpenFile: (filePath: string) => void;
  onExplainSymbol: (name: string, kind: string, file: string, snippet?: string) => void;
}

export const WhereToChange: React.FC<WhereToChangeProps> = ({
  analysis,
  onOpenFile,
  onExplainSymbol,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState<ChangePlanResult | null>(null);
  const [completedSteps, setCompletedSteps] = useState<Record<number, boolean>>({});

  const handleSearch = async (targetQuery?: string) => {
    const q = targetQuery !== undefined ? targetQuery : query;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/plan-change', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: q }),
      });
      const json = await res.json();
      if (json.success && json.data) {
        setActivePlan(json.data);
        setCompletedSteps({});
      }
    } catch {
      // Fallback: search in local scenarios
      const scenario = analysis.whereToChange.scenarios.find(s => s.query.toLowerCase().includes(q.toLowerCase()));
      if (scenario) {
        setActivePlan({
          query: scenario.query,
          summary: scenario.summary,
          filesToModify: scenario.targetFiles.map(f => ({
            file: f.file,
            importance: 'primary',
            reason: f.reason,
            lines: f.recommendedLines,
          })),
          blastRadius: scenario.blastRadius.map(b => ({
            file: b.file,
            impact: b.impact,
            explanation: b.explanation,
          })),
          stepByStepGuide: scenario.checklist,
          verificationSteps: ['Run tests', 'Verify local server output'],
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleStep = (idx: number) => {
    setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* 1. Natural Language Intent Input Bar */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-card">
        <div className="flex items-center gap-2 mb-2">
          <GitFork className="w-4 h-4 text-amber-400" />
          <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
            Where Should I Make a Change?
          </h2>
        </div>
        <p className="text-xs text-slate-300 mb-3.5">
          Describe what feature you want to add, fix, or modify in natural language. Feinman evaluates AST symbol references and imports to pinpoint exact files and downstream blast radius.
        </p>

        {/* Input & Submit */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="flex flex-col sm:flex-row gap-2"
        >
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. Add a new API endpoint, support PostgreSQL database, fix session timeout..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-colors"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs btn-tactile transition-colors shrink-0"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Plan Change</span>
          </button>
        </form>

        {/* Quick Scenario Tap Pills */}
        <div className="mt-3.5 pt-3 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[11px] font-mono text-slate-400 shrink-0">
            COMMON SCENARIOS:
          </span>
          {analysis.whereToChange.scenarios.map((sc, idx) => (
            <button
              key={idx}
              onClick={() => {
                setQuery(sc.query);
                handleSearch(sc.query);
              }}
              className="px-2.5 py-1 rounded bg-slate-800/90 hover:bg-slate-700/90 text-slate-300 hover:text-white border border-slate-700/60 text-xs whitespace-nowrap btn-tactile transition-colors"
            >
              {sc.title}
            </button>
          ))}
        </div>
      </section>

      {/* 2. Active Change Plan Result */}
      {activePlan && (
        <div className="space-y-5 animate-in fade-in duration-200">
          
          {/* Plan Summary Card */}
          <div className="bg-slate-900/80 border border-amber-500/30 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono uppercase tracking-wider text-amber-400">
                Recommended Approach for: &quot;{activePlan.query}&quot;
              </span>
              <span className="text-[10px] font-mono text-slate-400">
                {activePlan.modelUsed || 'Feinman Engine'}
              </span>
            </div>
            <p className="text-sm text-slate-200 leading-relaxed font-normal">
              {activePlan.summary}
            </p>
          </div>

          {/* Primary Files to Touch Grid */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                  Primary Files to Inspect & Modify
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                {activePlan.filesToModify.length} key locations identified
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {activePlan.filesToModify.map((item, idx) => (
                <div
                  key={idx}
                  className="bg-slate-950/90 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between hover:border-slate-700 transition-colors"
                >
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <button
                        onClick={() => onOpenFile(item.file)}
                        className="flex items-center gap-1.5 text-xs font-mono font-bold text-amber-300 hover:text-amber-200 truncate"
                        title={item.file}
                      >
                        <FileCode2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{item.file}</span>
                        <ExternalLink className="w-3 h-3 text-slate-500 shrink-0" />
                      </button>
                      <span className={`text-[10px] uppercase font-mono px-1.5 py-0.5 rounded font-medium ${
                        item.importance === 'primary'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}>
                        {item.importance}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {item.reason}
                    </p>

                    {item.lines && (
                      <div className="mt-2 text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 inline-block">
                        📍 {item.lines}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                    <button
                      onClick={() => onOpenFile(item.file)}
                      className="text-slate-400 hover:text-white"
                    >
                      View code
                    </button>
                    <button
                      onClick={() => onExplainSymbol(item.file, 'target', item.file)}
                      className="text-amber-400 hover:text-amber-300 flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Explain file</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Blast Radius & Downstream Impact */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3.5">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                  Downstream Blast Radius & Secondary Impact
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                Reverse dependency trace
              </span>
            </div>

            {activePlan.blastRadius.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {activePlan.blastRadius.map((b, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950/80 border border-slate-800/90 rounded-lg p-3 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <button
                          onClick={() => onOpenFile(b.file)}
                          className="text-xs font-mono font-medium text-slate-200 hover:text-amber-300 truncate text-left"
                        >
                          {b.file.split('/').pop()}
                        </button>
                        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                          {b.impact}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {b.explanation}
                      </p>
                    </div>
                    <div className="mt-2 text-[10px] font-mono text-slate-500 truncate">
                      {b.file}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-xs text-slate-400 bg-slate-950/80 p-3 rounded-lg border border-slate-800">
                ✔ Change is tightly scoped: no downstream modules rely directly on the modified signatures.
              </div>
            )}
          </div>

          {/* Implementation Checklist */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <h3 className="text-sm font-semibold tracking-wide text-white uppercase">
                Step-by-Step Implementation Checklist
              </h3>
            </div>

            <div className="space-y-2">
              {activePlan.stepByStepGuide.map((step, idx) => {
                const isChecked = !!completedSteps[idx];
                return (
                  <div
                    key={idx}
                    onClick={() => toggleStep(idx)}
                    className={`p-3 rounded-lg border cursor-pointer flex items-start gap-3 transition-colors ${
                      isChecked
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-400 line-through'
                        : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 text-slate-200'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                      isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                    }`}>
                      {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                    <span className="text-xs leading-relaxed">{step}</span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      )}

      {/* Default placeholder if no search active */}
      {!activePlan && (
        <div className="bg-slate-900/40 border border-slate-800/60 rounded-xl p-8 text-center text-slate-400 text-xs">
          Select one of the common scenarios above or type your own question to generate a targeted change plan.
        </div>
      )}

    </div>
  );
};
