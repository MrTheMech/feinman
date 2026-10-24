import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { 
  Compass, 
  Workflow, 
  Cpu, 
  Database, 
  Layout, 
  Wrench,
  FileCode2,
  Sparkles,
  Bot,
  ArrowDownLeft,
  ArrowUpRight,
  Code
} from 'lucide-react';

export interface CustomNodeData {
  label: string;
  type: 'entry' | 'core' | 'service' | 'data' | 'ui' | 'util';
  subsystem: string;
  file?: string;
  description: string;
  isPrimary?: boolean;
  inDegree?: number;
  outDegree?: number;
  symbols?: string[];
  status?: 'normal' | 'target' | 'blast' | 'dimmed' | 'highlighted';
  isNeighbor?: boolean;
  onInspectFile?: (file: string) => void;
  [key: string]: unknown;
}

const TYPE_CONFIG = {
  entry: {
    icon: Compass,
    color: '#f59e0b', // Amber
    glow: 'rgba(245, 158, 11, 0.25)',
    bg: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.5)',
    badge: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  },
  service: {
    icon: Workflow,
    color: '#0284c7', // Sky
    glow: 'rgba(2, 132, 199, 0.25)',
    bg: 'rgba(2, 132, 199, 0.12)',
    border: 'rgba(2, 132, 199, 0.5)',
    badge: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  },
  core: {
    icon: Cpu,
    color: '#8b5cf6', // Violet
    glow: 'rgba(139, 92, 246, 0.25)',
    bg: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.5)',
    badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  },
  data: {
    icon: Database,
    color: '#10b981', // Emerald
    glow: 'rgba(16, 185, 129, 0.25)',
    bg: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.5)',
    badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
  },
  ui: {
    icon: Layout,
    color: '#ec4899', // Pink
    glow: 'rgba(236, 72, 153, 0.25)',
    bg: 'rgba(236, 72, 153, 0.12)',
    border: 'rgba(236, 72, 153, 0.5)',
    badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
  },
  util: {
    icon: Wrench,
    color: '#94a3b8', // Slate
    glow: 'rgba(148, 163, 184, 0.2)',
    bg: 'rgba(148, 163, 184, 0.1)',
    border: 'rgba(148, 163, 184, 0.4)',
    badge: 'bg-slate-800 text-slate-300 border-slate-700',
  },
};

export const CustomFlowNode = memo(({ data, selected }: { data: CustomNodeData; selected?: boolean }) => {
  const cfg = TYPE_CONFIG[data.type] || TYPE_CONFIG.util;
  const Icon = cfg.icon;

  const isTarget = data.status === 'target';
  const isBlast = data.status === 'blast';
  const isDimmed = data.status === 'dimmed';
  const isHighlighted = data.status === 'highlighted' || data.isNeighbor;

  return (
    <div
      className={`min-w-[210px] max-w-[260px] rounded-xl border p-3 backdrop-blur-md transition-all duration-200 cursor-pointer relative shadow-xl ${
        isTarget
          ? 'ring-2 ring-amber-400 border-amber-400 bg-amber-950/90 shadow-amber-500/40 animate-pulse'
          : isBlast
          ? 'ring-2 ring-rose-500 border-rose-500 bg-rose-950/90 shadow-rose-500/30'
          : selected
          ? 'ring-2 ring-amber-400 border-amber-400 bg-slate-900 shadow-amber-500/30'
          : isHighlighted
          ? 'ring-1 ring-sky-400/80 border-sky-400/80 bg-slate-900/95 shadow-sky-500/20'
          : 'border-slate-800/90 bg-[#0c1220]/95 hover:border-slate-600 hover:shadow-2xl'
      } ${isDimmed ? 'opacity-50 grayscale-[50%] scale-[0.98]' : 'opacity-100'}`}
      style={{
        boxShadow: selected ? `0 0 25px ${cfg.glow}` : undefined,
      }}
    >
      {/* Target Handles (incoming dependencies) */}
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 hover:!bg-amber-400 transition-colors" 
      />
      <Handle 
        type="target" 
        position={Position.Left} 
        className="!w-2.5 !h-2.5 !bg-slate-400 !border-2 !border-slate-950 hover:!bg-amber-400 transition-colors" 
      />

      {/* Source Handles (outgoing calls) */}
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-950 hover:!bg-amber-300 transition-colors" 
      />
      <Handle 
        type="source" 
        position={Position.Right} 
        className="!w-2.5 !h-2.5 !bg-amber-400 !border-2 !border-slate-950 hover:!bg-amber-300 transition-colors" 
      />

      {/* Header: Icon + Label + Subsystem Tag */}
      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5 truncate">
          <div 
            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 border"
            style={{ 
              backgroundColor: cfg.bg, 
              color: cfg.color,
              borderColor: cfg.border 
            }}
          >
            <Icon className="w-3.5 h-3.5" />
          </div>
          <span className="font-mono text-xs font-bold text-white truncate tracking-tight">
            {data.label}
          </span>
        </div>

        <span className={`text-[9px] uppercase font-mono px-1.5 py-0.5 rounded border font-semibold ${cfg.badge}`}>
          {data.type}
        </span>
      </div>

      {/* Subsystem & File reference */}
      <div className="text-[10px] text-slate-400 font-sans truncate mb-1.5 flex items-center justify-between">
        <span className="truncate">{data.subsystem}</span>
        {data.symbols && data.symbols.length > 0 && (
          <span className="text-[9px] font-mono text-slate-500 bg-slate-900 px-1 py-0.2 rounded border border-slate-800 shrink-0">
            {data.symbols.length} exports
          </span>
        )}
      </div>

      {/* File Path Pill */}
      {data.file && (
        <div className="text-[10px] font-mono text-emerald-400/90 truncate bg-slate-950/90 px-2 py-1 rounded-md border border-slate-800/80 flex items-center justify-between group">
          <span className="truncate">{data.file}</span>
          {data.onInspectFile && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                data.onInspectFile?.(data.file!);
              }}
              className="text-slate-500 hover:text-amber-400 ml-1 p-0.5 rounded"
              title="Inspect file"
            >
              <Code className="w-2.5 h-2.5" />
            </button>
          )}
        </div>
      )}

      {/* Graph Degree Metrics: Inbound & Outbound chips */}
      <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] font-mono text-slate-400">
        <span className="flex items-center gap-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800/60" title="Incoming dependencies / callers">
          <ArrowDownLeft className="w-2.5 h-2.5 text-sky-400" />
          <span>{data.inDegree ?? 0} in</span>
        </span>
        <span className="flex items-center gap-1 bg-slate-950/80 px-1.5 py-0.5 rounded border border-slate-800/60" title="Outgoing dependencies / calls">
          <ArrowUpRight className="w-2.5 h-2.5 text-amber-400" />
          <span>{data.outDegree ?? 0} out</span>
        </span>
      </div>

      {/* Change Scenario Status Badges */}
      {isTarget && (
        <div className="mt-2 text-[9px] font-mono uppercase tracking-wider font-bold text-amber-300 flex items-center gap-1 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/40">
          <Sparkles className="w-2.5 h-2.5 text-amber-400" />
          <span>Primary Change Target</span>
        </div>
      )}

      {isBlast && (
        <div className="mt-2 text-[9px] font-mono uppercase tracking-wider font-bold text-rose-300 flex items-center gap-1 bg-rose-950/60 px-2 py-0.5 rounded border border-rose-500/40">
          <span>⚠️ Downstream Impact</span>
        </div>
      )}
    </div>
  );
});

CustomFlowNode.displayName = 'CustomFlowNode';
