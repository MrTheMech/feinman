import React, { useMemo, useCallback, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
  Node,
  Edge,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { 
  Search, 
  Maximize2, 
  Sparkles, 
  FileCode2, 
  ArrowDownLeft,
  ArrowUpRight,
  X,
  Compass
} from 'lucide-react';

import { CustomFlowNode, CustomNodeData } from './CustomFlowNode.js';
import { ArchitectureNode, ArchitectureEdge, Subsystem } from '../../../engine/types.js';

interface ArchitectureGraphCanvasProps {
  architectureNodes: ArchitectureNode[];
  architectureEdges: ArchitectureEdge[];
  subsystems: Subsystem[];
  selectedNodeId: string | null;
  onSelectNode: (node: ArchitectureNode) => void;
  targetFile?: string;
  blastFiles?: string[];
  height?: string | number;
  onInspectFile?: (file: string) => void;
  onExplainSymbol?: (name: string, kind: string, file: string) => void;
}

const nodeTypes = {
  custom: CustomFlowNode,
};

function FlowInner({
  architectureNodes,
  architectureEdges,
  subsystems,
  selectedNodeId,
  onSelectNode,
  targetFile,
  blastFiles = [],
  onInspectFile,
  onExplainSymbol,
}: ArchitectureGraphCanvasProps) {
  const { fitView } = useReactFlow();
  const [activeSubsystemFilter, setActiveSubsystemFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Identify direct callers and dependencies of selected node
  const directCallers = useMemo(() => {
    const callers = new Set<string>();
    if (!selectedNodeId) return callers;
    architectureEdges.forEach(e => {
      if (e.to === selectedNodeId) callers.add(e.from);
    });
    return callers;
  }, [selectedNodeId, architectureEdges]);

  const directDependencies = useMemo(() => {
    const deps = new Set<string>();
    if (!selectedNodeId) return deps;
    architectureEdges.forEach(e => {
      if (e.from === selectedNodeId) deps.add(e.to);
    });
    return deps;
  }, [selectedNodeId, architectureEdges]);

  // 2. Pre-calculate compact, centered 2D grid coordinates for all nodes
  const nodePositions = useMemo(() => {
    const posMap = new Map<string, { x: number; y: number }>();
    const tierGroups: Record<string, ArchitectureNode[]> = {
      entry: [],
      service: [],
      core: [],
      data: [],
      ui: [],
      util: [],
    };

    architectureNodes.forEach(n => {
      const t = n.type || 'core';
      (tierGroups[t] || tierGroups.core).push(n);
    });

    const tierOrder = ['entry', 'service', 'core', 'data', 'ui', 'util'];
    const colSpacing = 270;
    const rowSpacing = 140;
    const maxCols = 3;

    let currentRow = 0;
    tierOrder.forEach(tierKey => {
      const group = tierGroups[tierKey] || [];
      if (group.length > 0) {
        group.forEach((node, idx) => {
          const col = idx % maxCols;
          const rowOffset = Math.floor(idx / maxCols);
          posMap.set(node.id, {
            x: 80 + col * colSpacing,
            y: 60 + (currentRow + rowOffset) * rowSpacing,
          });
        });
        currentRow += Math.ceil(group.length / maxCols);
      }
    });

    return posMap;
  }, [architectureNodes]);

  // 3. Build Nodes - fully controlled, stable positions, explicit dimensions
  const nodes: Node<CustomNodeData>[] = useMemo(() => {
    return architectureNodes.map(node => {
      const pos = nodePositions.get(node.id) || { x: 80, y: 60 };
      const isSelected = selectedNodeId === node.id;
      const isNeighbor = directCallers.has(node.id) || directDependencies.has(node.id);

      // Subsystem & Search filtering
      const matchesSubsystem = activeSubsystemFilter === 'all' || 
        node.subsystem.toLowerCase().includes(activeSubsystemFilter.toLowerCase());
      const matchesSearch = !searchQuery.trim() || 
        node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (node.file && node.file.toLowerCase().includes(searchQuery.toLowerCase()));

      let status: CustomNodeData['status'] = 'normal';

      if (targetFile) {
        if (node.file === targetFile) {
          status = 'target';
        } else if (blastFiles.includes(node.file || '')) {
          status = 'blast';
        } else {
          status = 'dimmed';
        }
      } else if (selectedNodeId) {
        if (isSelected) {
          status = 'normal';
        } else if (isNeighbor) {
          status = 'highlighted';
        } else {
          status = 'dimmed';
        }
      } else if (!matchesSubsystem || !matchesSearch) {
        status = 'dimmed';
      }

      return {
        id: node.id,
        type: 'custom',
        position: pos,
        width: 230,
        height: 110,
        data: {
          label: node.label,
          type: node.type,
          subsystem: node.subsystem,
          file: node.file,
          description: node.description,
          inDegree: node.inDegree ?? 0,
          outDegree: node.outDegree ?? 0,
          symbols: node.symbols ?? [],
          status,
          isNeighbor,
          onInspectFile,
        },
        selected: isSelected,
      };
    });
  }, [
    architectureNodes, 
    nodePositions,
    selectedNodeId, 
    directCallers, 
    directDependencies, 
    targetFile, 
    blastFiles, 
    activeSubsystemFilter, 
    searchQuery, 
    onInspectFile
  ]);

  // 4. Build edges with flowing animated dashes and connection highlights
  const edges: Edge[] = useMemo(() => {
    return architectureEdges.map((e, idx) => {
      const isTargetEdge = e.from === targetFile || e.to === targetFile;
      const isBlastEdge = blastFiles.includes(e.to) || blastFiles.includes(e.from);
      const isSelectedEdge = selectedNodeId && (e.from === selectedNodeId || e.to === selectedNodeId);
      const isOutboundFromSelected = selectedNodeId && e.from === selectedNodeId;
      const isInboundToSelected = selectedNodeId && e.to === selectedNodeId;

      let strokeColor = '#334155'; // default muted slate
      let strokeWidth = 1.5;
      let animated = true;

      if (isTargetEdge) {
        strokeColor = '#f59e0b'; // amber
        strokeWidth = 2.5;
      } else if (isBlastEdge) {
        strokeColor = '#f43f5e'; // rose
        strokeWidth = 2.5;
      } else if (isOutboundFromSelected) {
        strokeColor = '#f59e0b'; // outgoing calls: amber
        strokeWidth = 2.5;
      } else if (isInboundToSelected) {
        strokeColor = '#38bdf8'; // incoming calls: sky
        strokeWidth = 2.5;
      } else if (selectedNodeId && !isSelectedEdge) {
        strokeColor = '#1e293b'; // dimmed
        strokeWidth = 1;
        animated = false;
      }

      return {
        id: `e-${e.from}-${e.to}-${idx}`,
        source: e.from,
        target: e.to,
        label: e.label,
        type: 'smoothstep',
        animated,
        style: {
          stroke: strokeColor,
          strokeWidth,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: strokeColor,
        },
      };
    });
  }, [architectureEdges, targetFile, blastFiles, selectedNodeId]);

  const handleNodeClick = useCallback((_: React.MouseEvent, node: Node) => {
    const raw = architectureNodes.find(n => n.id === node.id);
    if (raw) {
      onSelectNode(raw);
    }
  }, [architectureNodes, onSelectNode]);

  const selectedRawNode = useMemo(() => {
    return architectureNodes.find(n => n.id === selectedNodeId) || null;
  }, [architectureNodes, selectedNodeId]);

  const handleResetView = () => {
    fitView({ padding: 0.2, duration: 250 });
  };

  return (
    <>
      {/* Top Interactive Graph Header: Subsystem Filter Pills + Node Search */}
      <div className="absolute top-3 left-3 right-3 z-10 flex flex-wrap items-center justify-between gap-2 pointer-events-none">
        
        {/* Subsystem Filter Chips */}
        <div className="flex items-center gap-1.5 bg-slate-950/90 backdrop-blur-md border border-slate-800/90 p-1 rounded-xl shadow-lg pointer-events-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveSubsystemFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all ${
              activeSubsystemFilter === 'all'
                ? 'bg-amber-500 text-slate-950 font-bold shadow'
                : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            All ({architectureNodes.length})
          </button>

          {subsystems.map(sub => (
            <button
              key={sub.id}
              onClick={() => setActiveSubsystemFilter(sub.name)}
              className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono transition-all whitespace-nowrap ${
                activeSubsystemFilter === sub.name
                  ? 'bg-slate-800 text-white font-bold ring-1 ring-slate-700'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900'
              }`}
            >
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sub.color }} />
              <span>{sub.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Quick Search Bar & Fit View */}
        <div className="flex items-center gap-2 pointer-events-auto">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find node or file..."
              className="bg-slate-950/90 backdrop-blur-md border border-slate-800/90 rounded-xl pl-8 pr-7 py-1 text-[11px] font-mono text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 w-44"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <button
            onClick={handleResetView}
            className="p-1.5 rounded-xl bg-slate-950/90 backdrop-blur-md border border-slate-800/90 text-slate-400 hover:text-white hover:bg-slate-900 shadow-lg flex items-center gap-1 text-[11px] font-mono"
            title="Reset View"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodeClick={handleNodeClick}
        nodeTypes={nodeTypes}
        defaultViewport={{ x: 40, y: 40, zoom: 0.7 }}
        minZoom={0.2}
        maxZoom={1.5}
        className="feinman-react-flow"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={22} 
          size={1.5} 
          color="#334155" 
        />
        <Controls 
          className="!bg-slate-950/90 !border-slate-800 !text-slate-300 !rounded-xl !shadow-xl [&>button]:!bg-slate-950 [&>button]:!border-slate-800 [&>button]:!text-slate-300 [&>button:hover]:!bg-slate-800"
        />
        <MiniMap 
          nodeColor={(n: Node<CustomNodeData>) => {
            if (n.data?.type === 'entry') return '#f59e0b';
            if (n.data?.type === 'service') return '#0284c7';
            if (n.data?.type === 'core') return '#8b5cf6';
            if (n.data?.type === 'data') return '#10b981';
            return '#64748b';
          }}
          className="!bg-slate-950/90 !border-slate-800 !rounded-xl !overflow-hidden hidden sm:block"
        />
      </ReactFlow>

      {/* Floating Canvas Legend */}
      <div className="absolute bottom-3 left-3 z-10 bg-slate-950/85 backdrop-blur-md border border-slate-800/80 px-3 py-1.5 rounded-xl flex items-center gap-3 text-[10px] font-mono text-slate-400 shadow-lg">
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-amber-400" />
          <span>Entrypoint</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-sky-400" />
          <span>Service/API</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-purple-400" />
          <span>Core Engine</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>Data Store</span>
        </span>
      </div>

      {/* Selected Node Flow Bar (Understand-Anything visual way) */}
      {selectedRawNode && (
        <div className="absolute bottom-3 right-3 z-10 bg-slate-950/95 backdrop-blur-md border border-slate-800 p-2.5 rounded-xl shadow-2xl flex items-center gap-3 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono uppercase text-amber-400 font-bold">
              Active:
            </span>
            <span className="text-xs font-mono font-bold text-white truncate max-w-[140px]">
              {selectedRawNode.label}
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Quick Flow Jumpers: Inbound & Outbound */}
          <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1 text-sky-400">
              <ArrowDownLeft className="w-3 h-3" />
              <span>{directCallers.size} callers</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1 text-amber-400">
              <ArrowUpRight className="w-3 h-3" />
              <span>{directDependencies.size} deps</span>
            </span>
          </div>

          <div className="h-4 w-px bg-slate-800" />

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-1.5">
            {selectedRawNode.file && onInspectFile && (
              <button
                onClick={() => onInspectFile(selectedRawNode.file!)}
                className="px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-[10px] font-mono flex items-center gap-1"
                title="Inspect source code"
              >
                <FileCode2 className="w-3 h-3 text-emerald-400" />
                <span>Code</span>
              </button>
            )}

            {selectedRawNode.file && onExplainSymbol && (
              <button
                onClick={() => onExplainSymbol(selectedRawNode.label, selectedRawNode.type, selectedRawNode.file!)}
                className="px-2 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10px] font-mono flex items-center gap-1"
                title="Explain component role"
              >
                <Sparkles className="w-3 h-3 text-amber-400" />
                <span>Explain</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export const ArchitectureGraphCanvas: React.FC<ArchitectureGraphCanvasProps> = (props) => {
  return (
    <div 
      className="w-full rounded-2xl overflow-hidden border border-slate-800/90 bg-[#070b14] relative shadow-2xl"
      style={{ height: props.height || '540px' }}
    >
      <ReactFlowProvider>
        <FlowInner {...props} />
      </ReactFlowProvider>
    </div>
  );
};
