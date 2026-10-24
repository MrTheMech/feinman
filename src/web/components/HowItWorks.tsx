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
  Info,
  ArrowDownLeft,
  ArrowUpRight,
  GitBranch
} from 'lucide-react';
import { ProjectAnalysis, Subsystem, ArchitectureNode } from '../../engine/types.js';
import { ArchitectureGraphCanvas } from './graph/ArchitectureGraphCanvas.js';

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
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode | null>(null);

  // Direct callers and dependencies of selected node
  const directCallers = howItWorks.edges
    .filter(e => e.to === selectedNode?.id)
    .map(e => howItWorks.nodes.find(n => n.id === e.from))
    .filter(Boolean) as ArchitectureNode[];

  const directDependencies = howItWorks.edges
    .filter(e => e.from === selectedNode?.id)
    .map(e => howItWorks.nodes.find(n => n.id === e.to))
    .filter(Boolean) as ArchitectureNode[];

  return (
    <div className="space-y-4 max-w-7xl mx-auto py-1">
      
      {/* 1. Visual Mental Model Header (Compact & Diagrammatic) */}
      <div className="bg-gradient-to-r from-slate-900/90 via-[#0c1220]/90 to-amber-950/30 border border-slate-800 rounded-xl p-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono">
              The Feynman Mental Model
            </div>
            <p className="text-xs text-slate-200 font-medium leading-snug">
              {howItWorks.mentalModel}
            </p>
          </div>
        </div>

        {/* Visual Metric Pills */}
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 shrink-0 self-end md:self-center">
          <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-white font-semibold">
            {howItWorks.nodes.length} nodes
          </span>
          <span className="text-slate-600">/</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-sky-400 font-semibold">
            {howItWorks.edges.length} connections
          </span>
          <span className="text-slate-600">/</span>
          <span className="px-2 py-0.5 rounded-md bg-slate-950 border border-slate-800 text-amber-400 font-semibold">
            {howItWorks.subsystems.length} subsystems
          </span>
        </div>
      </div>

      {/* 2. Visual Interactive Architecture Graph (Code Anything / Understand-Anything style) */}
      <section className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <Workflow className="w-4 h-4 text-amber-400" />
            <h2 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
              Interactive Component Topology Map
            </h2>
          </div>
          <span className="text-[10px] text-slate-400 font-mono hidden sm:inline">
            Click any node to isolate connections • Filter by subsystem chips • Drag & Zoom freely
          </span>
        </div>

        <div className="w-full min-w-0">
          <ArchitectureGraphCanvas
            architectureNodes={howItWorks.nodes}
            architectureEdges={howItWorks.edges}
            subsystems={howItWorks.subsystems}
            selectedNodeId={selectedNode?.id || null}
            onSelectNode={(n) => setSelectedNode(n)}
            onInspectFile={onOpenFile}
            onExplainSymbol={onExplainSymbol}
            height="480px"
          />
        </div>
      </section>

      {/* 3. Visual Node Anatomy & Subsystem Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Selected Component Anatomy Card (5 cols) */}
        <div className="lg:col-span-5 bg-[#0c1220]/95 border border-slate-800 rounded-xl p-4 flex flex-col justify-between shadow-card">
          {selectedNode ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Inspected Node
                </span>
                <span className="px-2 py-0.5 text-[10px] rounded bg-slate-800 text-slate-300 font-mono uppercase">
                  {selectedNode.type}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-white font-mono break-all">
                  {selectedNode.label}
                </h3>
                <div className="text-xs text-slate-400 mt-0.5">
                  Subsystem: <span className="text-slate-200 font-medium">{selectedNode.subsystem}</span>
                </div>
              </div>

              {selectedNode.file && (
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                  <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">
                    SOURCE FILE
                  </div>
                  <code className="text-xs font-mono text-emerald-300 block truncate">
                    {selectedNode.file}
                  </code>
                </div>
              )}

              {/* Inbound & Outbound Connections (Visual Dependency Chips) */}
              <div className="space-y-2 pt-1">
                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-sky-400">
                      <ArrowDownLeft className="w-3 h-3" />
                      <span>Used By ({directCallers.length})</span>
                    </span>
                    <span className="text-slate-500 text-[9px]">click to jump</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {directCallers.length > 0 ? (
                      directCallers.map(c => (
                        <button
                          key={c.id}
                          onClick={() => setSelectedNode(c)}
                          className="px-2 py-0.5 rounded bg-sky-950/40 hover:bg-sky-900/60 text-sky-300 border border-sky-800/40 text-[10px] font-mono transition-colors"
                        >
                          {c.label}
                        </button>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No inbound callers in graph</span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                    <span className="flex items-center gap-1 text-amber-400">
                      <ArrowUpRight className="w-3 h-3" />
                      <span>Dependencies ({directDependencies.length})</span>
                    </span>
                    <span className="text-slate-500 text-[9px]">click to jump</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {directDependencies.length > 0 ? (
                      directDependencies.map(d => (
                        <button
                          key={d.id}
                          onClick={() => setSelectedNode(d)}
                          className="px-2 py-0.5 rounded bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 border border-amber-800/40 text-[10px] font-mono transition-colors"
                        >
                          {d.label}
                        </button>
                      ))
                    ) : (
                      <span className="text-[11px] text-slate-500 italic">No outbound dependencies</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center gap-2">
                {selectedNode.file && (
                  <button
                    onClick={() => onOpenFile(selectedNode.file!)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold btn-tactile transition-colors"
                  >
                    <FileCode2 className="w-3.5 h-3.5" />
                    <span>Inspect Code</span>
                  </button>
                )}
                {selectedNode.file && (
                  <button
                    onClick={() => onExplainSymbol(selectedNode.label, selectedNode.type, selectedNode.file!)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 btn-tactile transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Feynman Explain</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500 text-xs p-6">
              <Info className="w-6 h-6 mb-2 text-slate-600" />
              Click any node in the topology map above to inspect.
            </div>
          )}
        </div>

        {/* Subsystems Visual Cards Grid (7 cols) */}
        <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {howItWorks.subsystems.slice(0, 4).map((sub) => (
            <div
              key={sub.id}
              className="bg-slate-950/80 border border-slate-800/90 rounded-xl p-3 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-2.5 h-2.5 rounded-full shrink-0" 
                      style={{ backgroundColor: sub.color }} 
                    />
                    <h3 className="font-semibold text-xs text-white">
                      {sub.name}
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-900 text-slate-400 border border-slate-800">
                    {sub.files.length} files
                  </span>
                </div>

                <p className="text-xs text-slate-400 leading-snug line-clamp-2 mb-2">
                  {sub.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800/80">
                {sub.files.slice(0, 3).map((f) => (
                  <button
                    key={f}
                    onClick={() => onOpenFile(f)}
                    className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 truncate max-w-[130px]"
                    title={f}
                  >
                    {f.split('/').pop()}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>

      {/* 4. Visual Execution Sequence (Visual Flow Pipeline) */}
      {howItWorks.dataFlows.length > 0 && (
        <section className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-3.5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-sky-400" />
              <h3 className="text-xs font-bold tracking-wide text-white uppercase font-mono">
                Visual Execution Pipeline: {howItWorks.dataFlows[0].title}
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              End-to-end data trajectory
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2.5 relative">
            {howItWorks.dataFlows[0].steps.map((step, idx) => (
              <div 
                key={step.step}
                className="bg-slate-950/90 border border-slate-800 rounded-lg p-3 flex flex-col justify-between relative group hover:border-slate-700 transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center justify-center font-bold text-[10px]">
                      0{step.step}
                    </span>
                    <span className="text-slate-400 font-mono text-[10px] uppercase font-bold truncate max-w-[120px]">
                      {step.actor}
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-snug">
                    {step.action}
                  </p>
                </div>

                {step.fileRef && (
                  <button
                    onClick={() => onOpenFile(step.fileRef!)}
                    className="mt-2 pt-1.5 border-t border-slate-800/80 text-[10px] font-mono text-emerald-400 hover:text-emerald-300 text-left truncate flex items-center justify-between"
                  >
                    <span>{step.fileRef.split('/').pop()}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
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
