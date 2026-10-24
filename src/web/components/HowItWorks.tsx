import React, { useState } from 'react';
import { 
  Layers, 
  Lightbulb, 
  FileCode2, 
  ArrowRight, 
  Workflow, 
  Compass, 
  Cpu, 
  Database, 
  Layout, 
  Wrench,
  ExternalLink,
  Sparkles,
  Info
} from 'lucide-react';
import { ProjectAnalysis, Subsystem, ArchitectureNode } from '../../engine/types.js';

interface HowItWorksProps {
  analysis: ProjectAnalysis;
  onOpenFile: (filePath: string) => void;
  onExplainSymbol: (name: string, kind: string, file: string, snippet?: string) => void;
}

export const HowItWorks: React.FC<HowItWorksProps> = ({
  analysis,
  onOpenFile,
  onExplainSymbol,
}) => {
  const { howItWorks } = analysis;
  const [selectedSubsystem, setSelectedSubsystem] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(howItWorks.nodes[0] || null);

  const activeSubsystems = selectedSubsystem
    ? howItWorks.subsystems.filter(s => s.id === selectedSubsystem)
    : howItWorks.subsystems;

  const getNodeIcon = (type: ArchitectureNode['type']) => {
    switch (type) {
      case 'entry': return Compass;
      case 'service': return Workflow;
      case 'core': return Cpu;
      case 'data': return Database;
      case 'ui': return Layout;
      default: return Wrench;
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto py-2">
      
      {/* 1. Feynman Mental Model Banner */}
      <section className="bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/30 border border-slate-800 rounded-xl p-5 relative overflow-hidden shadow-card">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                Mental Model (The Feynman Analogy)
              </span>
            </div>
            <p className="text-sm md:text-base text-slate-200 leading-relaxed font-normal">
              {howItWorks.mentalModel}
            </p>
          </div>
        </div>
      </section>

      {/* 2. Interactive Architecture Topology Graph & Detail Inspector */}
      <section className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                Interactive Architecture Map
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Click any node in the topology to trace data flow, inspect dependencies, and view real code.
            </p>
          </div>

          {/* Subsystem filter pill row */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedSubsystem(null)}
              className={`px-2.5 py-1 rounded text-xs font-medium btn-tactile transition-colors ${
                selectedSubsystem === null
                  ? 'bg-amber-500 text-slate-950 font-semibold'
                  : 'bg-slate-800/80 text-slate-400 hover:text-white'
              }`}
            >
              All Subsystems ({howItWorks.subsystems.length})
            </button>
            {howItWorks.subsystems.map(s => (
              <button
                key={s.id}
                onClick={() => setSelectedSubsystem(s.id === selectedSubsystem ? null : s.id)}
                className={`px-2.5 py-1 rounded text-xs font-medium btn-tactile transition-colors whitespace-nowrap ${
                  selectedSubsystem === s.id
                    ? 'bg-amber-500 text-slate-950 font-semibold'
                    : 'bg-slate-800/80 text-slate-400 hover:text-white'
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>

        {/* Visual Graph Canvas & Sidebar Split */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          
          {/* Visual Graph Node Grid */}
          <div className="lg:col-span-2 bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 min-h-[340px] flex flex-col justify-between relative overflow-hidden">
            
            {/* Background decorative blueprint grid */}
            <div 
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'radial-gradient(circle, #f59e0b 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />

            <div className="relative z-10">
              <div className="text-[11px] font-mono text-slate-400 mb-3 flex items-center justify-between">
                <span>COMPONENT TOPOLOGY</span>
                <span>{howItWorks.nodes.length} Key Nodes • {howItWorks.edges.length} Directed Relationships</span>
              </div>

              {/* Node cards layout grouped by role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {howItWorks.nodes.map((node) => {
                  const Icon = getNodeIcon(node.type);
                  const isSelected = selectedNode?.id === node.id;
                  
                  return (
                    <button
                      key={node.id}
                      onClick={() => setSelectedNode(node)}
                      className={`text-left p-3 rounded-lg border btn-tactile transition-all ${
                        isSelected
                          ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-mono font-semibold truncate">
                          <Icon className={`w-3.5 h-3.5 ${isSelected ? 'text-amber-400' : 'text-slate-400'}`} />
                          <span className="truncate">{node.label}</span>
                        </div>
                        <span className="text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                          {node.type}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 line-clamp-2">
                        {node.subsystem}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Edge Flow Indicators */}
            <div className="relative z-10 mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Entry</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="w-2 h-2 rounded-full bg-sky-400" />
                <span>Service / Core</span>
                <ArrowRight className="w-3 h-3 text-slate-600" />
                <span className="w-2 h-2 rounded-full bg-purple-400" />
                <span>Data / Store</span>
              </div>
              <span className="text-slate-500 hidden sm:inline">Understand-Anything Architecture Graph</span>
            </div>
          </div>

          {/* Right Selected Node Inspector Card */}
          <div className="bg-slate-950/90 border border-slate-800/80 rounded-xl p-4 flex flex-col justify-between">
            {selectedNode ? (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                      Selected Node Inspector
                    </span>
                    <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-mono">
                      {selectedNode.type}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white font-mono break-all">
                    {selectedNode.label}
                  </h3>
                  <div className="text-xs text-slate-400 mt-0.5">
                    Subsystem: <span className="text-slate-200 font-medium">{selectedNode.subsystem}</span>
                  </div>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
                    Role in System
                  </div>
                  {selectedNode.description}
                </div>

                {selectedNode.file && (
                  <div className="space-y-2">
                    <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
                      Target File
                    </div>
                    <code className="text-xs font-mono text-emerald-300 bg-slate-900 px-2 py-1 rounded block truncate border border-slate-800">
                      {selectedNode.file}
                    </code>
                  </div>
                )}

                {/* Direct Action Buttons */}
                <div className="pt-2 flex flex-col gap-2">
                  {selectedNode.file && (
                    <button
                      onClick={() => onOpenFile(selectedNode.file!)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold btn-tactile transition-colors"
                    >
                      <FileCode2 className="w-3.5 h-3.5" />
                      <span>Inspect Source Code</span>
                    </button>
                  )}
                  {selectedNode.file && (
                    <button
                      onClick={() => onExplainSymbol(selectedNode.label, selectedNode.type, selectedNode.file!)}
                      className="w-full flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 btn-tactile transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      <span>Feynman Deep-Dive</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-4">
                <Info className="w-6 h-6 mb-2 text-slate-600" />
                Select any node in the topology map to inspect its details.
              </div>
            )}
          </div>

        </div>
      </section>

      {/* 3. Subsystem Breakdown Cards */}
      <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
              Subsystems & Responsibility Boundaries
            </h2>
          </div>
          <span className="text-[11px] text-slate-400">
            {activeSubsystems.length} active architectural workbenches
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activeSubsystems.map((sub) => (
            <div
              key={sub.id}
              className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: sub.color }} 
                    />
                    <h3 className="font-semibold text-xs text-white">
                      {sub.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {sub.files.length} files
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {sub.description}
                </p>

                <div className="space-y-1 mb-3">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                    Responsibilities:
                  </div>
                  {sub.responsibilities.map((r, i) => (
                    <div key={i} className="text-xs text-slate-300 flex items-start gap-1.5">
                      <span className="text-amber-400">•</span>
                      <span>{r}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sample Files Pill List */}
              <div className="pt-3 border-t border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400 mb-1.5">
                  KEY FILES:
                </div>
                <div className="flex flex-wrap gap-1">
                  {sub.files.slice(0, 3).map((f) => (
                    <button
                      key={f}
                      onClick={() => onOpenFile(f)}
                      className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 btn-tactile transition-colors truncate max-w-[170px]"
                      title={f}
                    >
                      {f.split('/').pop()}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Execution Data Flow Sequence */}
      {howItWorks.dataFlows.length > 0 && (
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-sky-400" />
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                {howItWorks.dataFlows[0].title}
              </h2>
            </div>
            <span className="text-[11px] text-slate-400">
              End-to-end request lifecycle
            </span>
          </div>

          <p className="text-xs text-slate-300 mb-4">
            {howItWorks.dataFlows[0].description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {howItWorks.dataFlows[0].steps.map((step) => (
              <div 
                key={step.step}
                className="bg-slate-950/80 border border-slate-800 rounded-lg p-3.5 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-2">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-[11px]">
                      {step.step}
                    </span>
                    <span className="text-slate-400 font-sans font-medium">
                      {step.actor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {step.action}
                  </p>
                </div>

                {step.fileRef && (
                  <button
                    onClick={() => onOpenFile(step.fileRef!)}
                    className="mt-3 pt-2 border-t border-slate-800/80 text-[11px] font-mono text-emerald-400 hover:text-emerald-300 text-left truncate block"
                  >
                    inspect: {step.fileRef.split('/').pop()}
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

    </div>
  );
};
