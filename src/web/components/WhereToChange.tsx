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
  Loader2, 
  Workflow,
  Target,
  Flame,
  CheckSquare
} from 'lucide-react';
import { ProjectAnalysis, ChangePlanResult, ArchitectureNode } from '../../engine/types.js';
import { ArchitectureGraphCanvas } from './graph/ArchitectureGraphCanvas.js';

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
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  const primaryTargetFile = activePlan?.filesToModify[0]?.file;
  const blastFilePaths = activePlan?.blastRadius.map(b => b.file) || [];

  const totalSteps = activePlan?.stepByStepGuide.length || 0;
  const completedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = totalSteps > 0 ? Math.round((completedCount / totalSteps) * 100) : 0;

  return (
    <div className="space-y-4 max-w-7xl mx-auto py-1">
      
      {/* 1. Natural Language Intent Bar & Quick Scenarios */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 shadow-card">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <GitFork className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
              Where Should I Make a Change?
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono">
            Graph-driven visual blast radius & impact calculator
          </span>
        </div>

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
              placeholder="e.g. Add a new API endpoint, support auth tokens, modify scanner..."
              className="w-full bg-slate-950/90 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
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
        <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto no-scrollbar">
          <span className="text-[10px] font-mono text-slate-400 shrink-0 uppercase">
            QUICK SCENARIOS:
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

      {/* 2. Visual Change Pipeline Flowchart (Taste Skill Visual Explanation) */}
      {activePlan && (
        <section className="bg-slate-950/90 border border-slate-800/90 rounded-xl p-3 shadow-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-mono">
            {/* Step 1: Target */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-amber-950/40 border border-amber-500/40 text-amber-300 w-full sm:w-auto">
              <Target className="w-4 h-4 text-amber-400 shrink-0" />
              <div>
                <div className="text-[9px] uppercase text-amber-400 font-bold">1. Target Node</div>
                <div className="font-bold truncate max-w-[140px]">{primaryTargetFile?.split('/').pop() || 'Analyzing...'}</div>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

            {/* Step 2: Blast Radius */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-rose-950/40 border border-rose-500/40 text-rose-300 w-full sm:w-auto">
              <Flame className="w-4 h-4 text-rose-400 shrink-0" />
              <div>
                <div className="text-[9px] uppercase text-rose-400 font-bold">2. Downstream Impact</div>
                <div className="font-bold">{blastFilePaths.length} dependents affected</div>
              </div>
            </div>

            <ArrowRight className="w-4 h-4 text-slate-600 hidden sm:block" />

            {/* Step 3: Verification */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 w-full sm:w-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <div className="text-[9px] uppercase text-emerald-400 font-bold">3. Verification</div>
                <div className="font-bold">{activePlan.verificationSteps.length} checks required</div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Visual Blast Radius Graph (Understand-Anything visual way) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-amber-400" />
            <h3 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
              Visual Topology Impact Map
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-300 font-bold">Primary Target</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400" />
              <span className="text-rose-300 font-bold">Downstream Blast</span>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-600" />
              <span>Unaffected</span>
            </span>
          </div>
        </div>

        {/* The Visual ReactFlow Canvas */}
        <ArchitectureGraphCanvas
          architectureNodes={analysis.howItWorks.nodes}
          architectureEdges={analysis.howItWorks.edges}
          subsystems={analysis.howItWorks.subsystems}
          selectedNodeId={null}
          onSelectNode={(node) => {
            if (node.file) onOpenFile(node.file);
          }}
          targetFile={primaryTargetFile}
          blastFiles={blastFilePaths}
          onInspectFile={onOpenFile}
          onExplainSymbol={onExplainSymbol}
          height="440px"
        />
      </section>

      {/* 4. Visual Result Breakdown: Targets + Blast + Interactive Checklist */}
      {activePlan && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5">
          
          {/* Target Files Card */}
          <div className="bg-[#0c1220]/95 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-card">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  Files to Modify ({activePlan.filesToModify.length})
                </span>
                <span className="text-[10px] font-mono text-slate-500">Primary Targets</span>
              </div>
              
              <div className="space-y-2">
                {activePlan.filesToModify.map((f, i) => (
                  <div key={i} className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
                    <button
                      onClick={() => onOpenFile(f.file)}
                      className="text-xs font-mono font-bold text-amber-300 hover:underline truncate block w-full text-left"
                    >
                      {f.file}
                    </button>
                    <div className="text-[11px] text-slate-400 mt-1 leading-snug">
                      {f.reason}
                    </div>
                    {f.lines && (
                      <div className="text-[10px] font-mono text-emerald-400 mt-1 bg-emerald-950/30 px-1.5 py-0.5 rounded border border-emerald-800/40 inline-block">
                        📍 {f.lines}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Blast Radius Card */}
          <div className="bg-[#0c1220]/95 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-card">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-rose-400 font-bold flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" />
                  Downstream Blast ({activePlan.blastRadius.length})
                </span>
                <span className="text-[10px] font-mono text-slate-500">Dependents</span>
              </div>

              {activePlan.blastRadius.length > 0 ? (
                <div className="space-y-2">
                  {activePlan.blastRadius.map((b, i) => (
                    <div key={i} className="bg-slate-950/90 border border-slate-800 rounded-lg p-2.5">
                      <button
                        onClick={() => onOpenFile(b.file)}
                        className="text-xs font-mono font-medium text-slate-200 hover:text-amber-300 truncate block w-full text-left"
                      >
                        {b.file.split('/').pop()}
                      </button>
                      <div className="text-[11px] text-slate-400 mt-0.5 leading-snug">
                        {b.explanation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs text-slate-400 bg-slate-950 p-4 rounded-lg border border-slate-800 text-center">
                  ✔ Change is isolated. No downstream files impacted.
                </div>
              )}
            </div>
          </div>

          {/* Action Checklist with Progress Meter */}
          <div className="bg-[#0c1220]/95 border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between shadow-card">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                  <CheckSquare className="w-3.5 h-3.5" />
                  Action Checklist ({completedCount}/{totalSteps})
                </span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold">{progressPercent}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800 mb-2.5">
                <div 
                  className="bg-emerald-500 h-full transition-all duration-300"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>

              <div className="space-y-1.5">
                {activePlan.stepByStepGuide.map((step, idx) => {
                  const isChecked = !!completedSteps[idx];
                  return (
                    <div
                      key={idx}
                      onClick={() => setCompletedSteps(prev => ({ ...prev, [idx]: !prev[idx] }))}
                      className={`p-2 rounded-lg border cursor-pointer flex items-start gap-2 transition-colors ${
                        isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-500 line-through'
                          : 'bg-slate-950/90 border-slate-800 hover:border-slate-700 text-slate-200'
                      }`}
                    >
                      <div className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 mt-0.5 ${
                        isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600'
                      }`}>
                        {isChecked && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                      </div>
                      <span className="text-[11px] leading-snug">{step}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
