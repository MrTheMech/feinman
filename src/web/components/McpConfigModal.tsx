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
  Sparkles,
  Bot,
  Laptop
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
  const [activeTab, setActiveTab] = useState<'antigravity' | 'claude' | 'cursor' | 'cli'>('antigravity');
  const [copied, setCopied] = useState(false);

  const absRoot = analysis.rootPath;

  const getAgyCommand = () => `agy mcp add feinman node "${absRoot}/bin/feynstart.js" --mcp "${absRoot}"`;
  const getClaudeCommand = () => `claude mcp add feinman -- node "${absRoot}/bin/feynstart.js" --mcp "${absRoot}"`;

  const cursorConfig = {
    mcpServers: {
      feinman: {
        command: "node",
        args: [`${absRoot}/bin/feynstart.js`, "--mcp", absRoot],
      },
    },
  };

  const claudeDesktopConfig = {
    mcpServers: {
      feinman: {
        command: "node",
        args: [`${absRoot}/bin/feynstart.js`, "--mcp", absRoot],
      },
    },
  };

  const getConfigText = () => {
    switch (activeTab) {
      case 'antigravity':
        return getAgyCommand();
      case 'claude':
        return getClaudeCommand();
      case 'cursor':
        return JSON.stringify(cursorConfig, null, 2);
      case 'cli':
        return `feynstart --scan\nfeynstart --plan "Add new feature"\nfeynstart --tour\nfeynstart --agy\nfeynstart --claude`;
    }
  };

  const handleCopy = (text?: string) => {
    navigator.clipboard.writeText(text || getConfigText());
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
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
              <Terminal className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span>TERMINAL & AGENT RUNNERS</span>
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
              </div>
              <div className="text-[10px] text-slate-400">
                Run in AGY Terminal, Claude Code, Cursor, or CLI
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
          <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-transparent border border-amber-500/20 rounded-xl p-3 flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-200 leading-snug">
              Feinman runs everywhere: directly in your <strong>AGY Terminal</strong>, <strong>Claude Code Terminal</strong>, or as a standard <strong>JSON-RPC 2.0 MCP server</strong>.
            </div>
          </div>

          {/* Integration Option Tabs */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase font-bold">
                SELECT TERMINAL / AGENT RUNNER:
              </span>
              <button
                onClick={() => handleCopy()}
                className="flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 btn-tactile font-mono"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy Command'}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 mb-3 overflow-x-auto no-scrollbar">
              {[
                { id: 'antigravity', label: 'AGY Terminal' },
                { id: 'claude', label: 'Claude Code' },
                { id: 'cursor', label: 'Cursor (.cursor/mcp.json)' },
                { id: 'cli', label: 'CLI Standalone' },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-semibold btn-tactile transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Specific Content */}
            {activeTab === 'antigravity' && (
              <div className="space-y-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-amber-300 font-mono">
                  Google Antigravity (AGY) Terminal Setup
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Run this command in your AGY terminal to register the Feinman MCP server and activate the agent skill:
                </p>
                <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-emerald-300">
                  <code className="truncate">{getAgyCommand()}</code>
                  <button 
                    onClick={() => handleCopy(getAgyCommand())}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 font-mono">
                  <div>✦ Or run in terminal: <code className="text-amber-300">feynstart --agy</code></div>
                  <div>✦ Agent Skill location: <code className="text-emerald-400">.agents/skills/feinman/SKILL.md</code></div>
                  <div>✦ In AGY chat, ask: <span className="text-slate-200">"Explain this codebase using Feinman"</span></div>
                </div>
              </div>
            )}

            {activeTab === 'claude' && (
              <div className="space-y-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-sky-300 font-mono">
                  Claude Code Terminal Setup
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Run this command directly in your terminal to connect Feinman to Claude Code:
                </p>
                <div className="flex items-center justify-between bg-black/60 p-2.5 rounded-lg border border-slate-800 font-mono text-xs text-sky-300">
                  <code className="truncate">{getClaudeCommand()}</code>
                  <button 
                    onClick={() => handleCopy(getClaudeCommand())}
                    className="p-1 rounded text-slate-400 hover:text-white"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="text-[11px] text-slate-400 space-y-1 pt-1 font-mono">
                  <div>✦ Or run in terminal: <code className="text-amber-300">feynstart --claude</code></div>
                  <div>✦ In Claude Code session, ask: <span className="text-slate-200">"Use Feinman to plan where to change code for auth"</span></div>
                </div>
              </div>
            )}

            {activeTab === 'cursor' && (
              <div className="space-y-2 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-amber-300 font-mono">
                  Cursor IDE (.cursor/mcp.json)
                </div>
                <pre className="p-3 bg-black/60 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
                  {JSON.stringify(cursorConfig, null, 2)}
                </pre>
              </div>
            )}

            {activeTab === 'cli' && (
              <div className="space-y-2.5 bg-slate-950/80 p-3.5 rounded-xl border border-slate-800">
                <div className="text-xs font-bold text-amber-300 font-mono">
                  Fast Standalone Terminal Commands
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-amber-300 font-bold">feynstart --scan</span>
                      <span className="text-slate-500 ml-2">Instant terminal visual summary</span>
                    </div>
                    <button onClick={() => handleCopy('feynstart --scan')} className="text-slate-400 hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-amber-300 font-bold">feynstart --plan "Add auth route"</span>
                      <span className="text-slate-500 ml-2">Terminal blast radius calculation</span>
                    </div>
                    <button onClick={() => handleCopy('feynstart --plan "Add auth route"')} className="text-slate-400 hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="p-2 rounded bg-black/60 border border-slate-800 flex items-center justify-between">
                    <div>
                      <span className="text-amber-300 font-bold">feynstart --tour</span>
                      <span className="text-slate-500 ml-2">Terminal guided walkthrough tour</span>
                    </div>
                    <button onClick={() => handleCopy('feynstart --tour')} className="text-slate-400 hover:text-white">
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Available MCP Tools Reference */}
          <div>
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 font-bold">
              AVAILABLE AGENT MCP TOOLS ({mcpTools.length}):
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
