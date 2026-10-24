import React from 'react';
import { 
  Sparkles, 
  FolderGit2, 
  Compass, 
  Layers, 
  GitFork, 
  Wrench, 
  Footprints, 
  Cpu, 
  Plug,
  RefreshCw,
  Terminal
} from 'lucide-react';
import { ProjectAnalysis } from '../../engine/types.js';

interface NavbarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  analysis: ProjectAnalysis;
  onOpenScanModal: () => void;
  onOpenMcpModal: () => void;
  onOpenSettingsModal: () => void;
  modelProvider: string;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  onSelectTab,
  analysis,
  onOpenScanModal,
  onOpenMcpModal,
  onOpenSettingsModal,
  modelProvider,
}) => {
  const tabs = [
    { id: 'overview', label: 'What is this?', icon: Compass },
    { id: 'architecture', label: 'How it works', icon: Layers },
    { id: 'change', label: 'Where to change', icon: GitFork },
    { id: 'walkthrough', label: 'Walkthrough', icon: Footprints },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  return (
    <header className="sticky top-0 z-40 h-16 w-full bg-[#0a0f1d]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-6">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between gap-4">
        
        {/* Brand & Active Repository */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-amber-500/10">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="font-bold tracking-tight text-white text-base">FEINMAN</span>
          </div>

          <div className="hidden sm:flex items-center gap-1.5 pl-3 border-l border-slate-800 text-xs text-slate-400">
            <button
              onClick={onOpenScanModal}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700/60 font-medium btn-tactile transition-colors"
              title="Click to scan a different directory or switch sample"
            >
              <FolderGit2 className="w-3.5 h-3.5 text-amber-400" />
              <span className="max-w-[130px] truncate">{analysis.name}</span>
              {analysis.isSample && (
                <span className="px-1.5 py-0.2 rounded text-[10px] bg-amber-500/20 text-amber-300 font-mono">
                  Sample
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Central Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar py-1">
          {tabs.map((t) => {
            const Icon = t.icon;
            const isActive = currentTab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => onSelectTab(t.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap btn-tactile transition-all ${
                  isActive
                    ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-slate-950' : 'text-slate-400'}`} />
                <span>{t.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Right Status Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* AGY & Claude Code Terminal Options Button */}
          <button
            onClick={onOpenMcpModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/10 border border-amber-500/40 text-amber-300 hover:bg-amber-500/20 text-xs font-mono btn-tactile transition-colors"
            title="Run Feinman in Google Antigravity (AGY) terminal or Claude Code terminal"
          >
            <Terminal className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline font-sans text-[11px] font-bold text-amber-300">AGY & Claude</span>
          </button>

          {/* MCP & Skills Status Pill */}
          <button
            onClick={onOpenMcpModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-emerald-500/40 text-emerald-300 hover:bg-slate-800/80 text-xs font-mono btn-tactile transition-colors"
            title="Feinman MCP Server and Agent Skills are active. Click for setup snippet."
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Plug className="w-3 h-3 text-emerald-400" />
            <span className="hidden md:inline font-sans text-[11px] font-medium text-slate-300">MCP & Skills</span>
          </button>

          {/* AI Model Status */}
          <button
            onClick={onOpenSettingsModal}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-700/80 text-slate-300 hover:bg-slate-800/80 text-xs btn-tactile transition-colors"
            title="Configure AI model backend (Ollama / Local LLM / Heuristics)"
          >
            <Cpu className="w-3 h-3 text-amber-400" />
            <span className="hidden lg:inline text-[11px] text-slate-400 truncate max-w-[100px]">
              {modelProvider.includes('Ollama') ? 'Ollama' : 'Heuristic'}
            </span>
          </button>

          {/* Quick Rescan */}
          <button
            onClick={onOpenScanModal}
            className="p-1.5 rounded-md text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 btn-tactile transition-colors"
            title="Rescan or switch project"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};
