import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  FolderGit2, 
  Layers, 
  GitFork, 
  Wrench, 
  Footprints, 
  Compass, 
  ShieldCheck, 
  ExternalLink,
  Github,
  Loader2,
  RefreshCw,
  Heart
} from 'lucide-react';

import { ProjectAnalysis } from '../engine/types.js';
import { Navbar } from './components/Navbar.js';
import { WhatIsThis } from './components/WhatIsThis.js';
import { HowItWorks } from './components/HowItWorks.js';
import { WhereToChange } from './components/WhereToChange.js';
import { HowToMaintain } from './components/HowToMaintain.js';
import { WalkthroughTour } from './components/WalkthroughTour.js';
import { SourceViewerModal } from './components/SourceViewerModal.js';
import { FeynmanExplainModal } from './components/FeynmanExplainModal.js';
import { McpConfigModal } from './components/McpConfigModal.js';
import { ScanModal } from './components/ScanModal.js';
import { SettingsModal } from './components/SettingsModal.js';

export default function App() {
  const [currentTab, setCurrentTab] = useState('overview');
  const [analysis, setAnalysis] = useState<ProjectAnalysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [viewingFile, setViewingFile] = useState<string | null>(null);
  const [explainingSymbol, setExplainingSymbol] = useState<{
    name: string;
    kind: string;
    file: string;
    snippet?: string;
  } | null>(null);
  const [showMcpModal, setShowMcpModal] = useState(false);
  const [showScanModal, setShowScanModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Model status
  const [modelStatus, setModelStatus] = useState({
    available: true,
    provider: 'Feinman Heuristic AST Engine',
    endpoint: 'http://localhost:11434',
    models: ['feinman-ast-heuristics-v1'],
    activeModel: 'feinman-ast-heuristics-v1',
    source: 'builtin-heuristic',
  });

  const fetchProjectData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/project');
      const json = await res.json();
      if (json.success && json.data) {
        setAnalysis(json.data);
      } else {
        throw new Error(json.error || 'Failed to fetch project analysis');
      }
    } catch (err: any) {
      setError(err.message || 'Error connecting to Feinman server');
    } finally {
      setLoading(false);
    }
  };

  const fetchModelStatus = async () => {
    try {
      const res = await fetch('/api/model/status');
      const json = await res.json();
      if (json.success && json.data) {
        setModelStatus(json.data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchProjectData();
    fetchModelStatus();
  }, []);

  const handleScanPath = async (newPath: string) => {
    const res = await fetch('/api/scan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ path: newPath }),
    });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to scan');
    setAnalysis(json.data);
  };

  const handleSelectSample = async (sampleId: string) => {
    const res = await fetch(`/api/samples/${sampleId}`, { method: 'POST' });
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Failed to load sample');
    setAnalysis(json.data);
  };

  const handleSaveModelConfig = async (cfg: { endpoint: string; model: string; provider: string }) => {
    await fetch('/api/model/config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(cfg),
    });
    await fetchModelStatus();
  };

  if (loading && !analysis) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#090d16] text-white gap-3 font-mono text-xs">
        <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
        <span className="text-slate-400">Loading Feinman Codebase Understanding...</span>
      </div>
    );
  }

  if (error && !analysis) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-[#090d16] text-white gap-4 p-4 text-center">
        <div className="p-3 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <FolderGit2 className="w-8 h-8" />
        </div>
        <div className="max-w-md">
          <h2 className="text-lg font-bold mb-1">Unable to Load Codebase</h2>
          <p className="text-xs text-slate-400 mb-4">{error}</p>
          <button
            onClick={fetchProjectData}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs btn-tactile"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* 1. Single-Line Sticky Navbar */}
      <Navbar
        currentTab={currentTab}
        onSelectTab={setCurrentTab}
        analysis={analysis!}
        onOpenScanModal={() => setShowScanModal(true)}
        onOpenMcpModal={() => setShowMcpModal(true)}
        onOpenSettingsModal={() => setShowSettingsModal(true)}
        modelProvider={modelStatus.provider}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-6 py-6">
        {currentTab === 'overview' && (
          <WhatIsThis
            analysis={analysis!}
            onOpenFile={(file) => setViewingFile(file)}
            onExplainSymbol={(name, kind, file, snippet) => setExplainingSymbol({ name, kind, file, snippet })}
          />
        )}

        {currentTab === 'architecture' && (
          <HowItWorks
            analysis={analysis!}
            onOpenFile={(file) => setViewingFile(file)}
            onExplainSymbol={(name, kind, file, snippet) => setExplainingSymbol({ name, kind, file, snippet })}
          />
        )}

        {currentTab === 'change' && (
          <WhereToChange
            analysis={analysis!}
            onOpenFile={(file) => setViewingFile(file)}
            onExplainSymbol={(name, kind, file, snippet) => setExplainingSymbol({ name, kind, file, snippet })}
          />
        )}

        {currentTab === 'walkthrough' && (
          <WalkthroughTour
            analysis={analysis!}
            onOpenFile={(file) => setViewingFile(file)}
            onExplainSymbol={(name, kind, file, snippet) => setExplainingSymbol({ name, kind, file, snippet })}
          />
        )}

        {currentTab === 'maintenance' && (
          <HowToMaintain
            analysis={analysis!}
            onOpenFile={(file) => setViewingFile(file)}
          />
        )}
      </main>

      {/* 3. Footer with Attribution and Richard Feynman Principle */}
      <footer className="mt-auto border-t border-slate-800/80 bg-slate-950/60 py-6 px-4 md:px-6 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-tight">FEINMAN</span>
            <span>—</span>
            <span className="text-slate-400 italic">
              &quot;If you can&apos;t explain it simply, you don&apos;t understand it.&quot;
            </span>
          </div>

          {/* Lineage & Attribution Pill */}
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span>Built on foundations from:</span>
            <a 
              href="https://github.com/Egonex-AI/Understand-Anything" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-amber-400 hover:text-amber-300 underline underline-offset-2 flex items-center gap-1"
            >
              <span>Understand-Anything (Egonex AI)</span>
              <ExternalLink className="w-3 h-3" />
            </a>
            <span className="text-slate-700">•</span>
            <a 
              href="https://github.com/yamadashy/repomix" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="hover:text-slate-200 transition-colors"
            >
              Repomix
            </a>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <SourceViewerModal
        filePath={viewingFile}
        onClose={() => setViewingFile(null)}
        onJumpToFile={(newPath) => setViewingFile(newPath)}
        onExplainSymbol={(name, kind, file, snippet) => setExplainingSymbol({ name, kind, file, snippet })}
      />

      <FeynmanExplainModal
        symbolInfo={explainingSymbol}
        onClose={() => setExplainingSymbol(null)}
      />

      {showMcpModal && (
        <McpConfigModal
          analysis={analysis!}
          onClose={() => setShowMcpModal(false)}
        />
      )}

      {showScanModal && (
        <ScanModal
          currentRoot={analysis!.rootPath}
          onClose={() => setShowScanModal(false)}
          onScanPath={handleScanPath}
          onSelectSample={handleSelectSample}
        />
      )}

      {showSettingsModal && (
        <SettingsModal
          onClose={() => setShowSettingsModal(false)}
          modelStatus={modelStatus}
          onSaveConfig={handleSaveModelConfig}
        />
      )}

    </div>
  );
}
