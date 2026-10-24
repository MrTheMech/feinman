import React, { useState } from 'react';
import { 
  X, 
  Plug, 
  Copy, 
  Check, 
  Terminal, 
  FileCode2, 
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { ProjectAnalysis } from '../../engine/types.js';

interface McpConfigModalProps {
  analysis: ProjectAnalysis;
  onClose: () => void;
}

export const McpConfigModal: React.FC<McpConfigModalProps> = ({
  analysis,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'claude' | 'cursor' | 'antigravity' | 'cli'>('cursor');
  const [copied, setCopied] = useState(false);

  const absRoot = analysis.rootPath;

  const claudeConfig = {
    mcpServers: {
      feinman: {
        command: "feynstart",
        args: ["--mcp", absRoot],
      },
    },
  };

  const cursorConfig = {
    mcpServers: {
      feinman: {
        command: "feynstart",
        args: ["--mcp", absRoot],
      },
    },
  };

  const antigravityConfig = {
    mcpServers: {
      feinman: {
        command: "feynstart",
        args: ["--mcp", absRoot],
      },
    },
  };

  const getConfigText = () => {
    switch (activeTab) {
      case 'claude': return JSON.stringify(claudeConfig, null, 2);
      case 'cursor': return JSON.stringify(cursorConfig, null, 2);
      case 'antigravity': return JSON.stringify(antigravityConfig, null, 2);
      case 'cli': return `feynstart --mcp "${absRoot}"`;
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getConfigText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mcpTools = [
    { name: 'feinman_understand_project', desc: 'Answers "What is this project?", summarizing purpose, stack, and entry points.' },
    { name: 'feinman_explain_file', desc: 'Explains any file in plain English with role, imports, exports, and Feynman analogy.' },
    { name: 'feinman_trace_feature', desc: 'Traces execution flows for any feature or concept across files.' },
    { name: 'feinman_plan_change', desc: 'Pinpoints exact files, line numbers, blast radius, and checklist for code changes.' },
    { name: 'feinman_find_tests', desc: 'Discovers automated tests exercising a specific module or feature.' },
    { name: 'feinman_walkthrough', desc: 'Returns the progressive 5-step guided walkthrough of the repository.' },
    { name: 'feinman_pack_repomix', desc: 'Outputs an optimized, token-efficient repository digest for AI context.' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0a0f1d] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="h-14 px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <Plug className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span>MCP & AGENT SKILLS INTEGRATION</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400">
                Connect Cursor, Claude Desktop, Antigravity, or Copilot
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 btn-tactile transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto max-h-[75vh] space-y-4 text-xs">
          
          {/* Status banner */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3.5 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-relaxed">
              Feinman exposes standard <strong>JSON-RPC 2.0 Model Context Protocol (MCP)</strong> tools and generates an official <strong>Agent Skill</strong> at <code className="text-emerald-300 font-mono text-[11px]">.agents/skills/feinman/SKILL.md</code>.
            </div>
          </div>

          {/* Config Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase">
                ONE-CLICK CLIENT CONFIGURATION:
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 btn-tactile"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Config'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 mb-2">
              {[
                { id: 'cursor', label: 'Cursor IDE (.cursor/mcp.json)' },
                { id: 'claude', label: 'Claude Desktop' },
                { id: 'antigravity', label: 'Antigravity' },
                { id: 'cli', label: 'Terminal stdio' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-2.5 py-1 rounded text-xs font-medium btn-tactile transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <div className="relative">
              <pre className="p-3 bg-slate-950 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                {getConfigText()}
              </pre>
            </div>
          </div>

          {/* Available MCP Tools Reference */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              EXPOSED MCP TOOLS ({mcpTools.length}):
            </div>
            <div className="space-y-1.5">
              {mcpTools.map(tool => (
                <div 
                  key={tool.name}
                  className="bg-slate-950/80 border border-slate-800/80 rounded-lg p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-1"
                >
                  <code className="text-[11px] font-mono font-bold text-amber-300">
                    {tool.name}
                  </code>
                  <span className="text-slate-400 text-[11px] text-left sm:text-right max-w-sm">
                    {tool.desc}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
