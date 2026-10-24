import React, { useState } from 'react';
import { 
  X, 
  FolderGit2, 
  RefreshCw, 
  Sparkles, 
  Check, 
  Folder,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { ProjectAnalysis } from '../../engine/types.js';

interface ScanModalProps {
  currentRoot: string;
  onClose: () => void;
  onScanPath: (path: string) => Promise<void>;
  onSelectSample: (sampleId: string) => Promise<void>;
}

export const ScanModal: React.FC<ScanModalProps> = ({
  currentRoot,
  onClose,
  onScanPath,
  onSelectSample,
}) => {
  const [inputPath, setInputPath] = useState(currentRoot);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleScan = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputPath.trim()) return;

    setLoading(true);
    setError(null);
    try {
      await onScanPath(inputPath.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to scan path');
    } finally {
      setLoading(false);
    }
  };

  const handleSample = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await onSelectSample(id);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to load sample');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-xl bg-[#0a0f1d] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="h-14 px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <FolderGit2 className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              Switch Codebase or Sample Project
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
        <div className="p-5 space-y-5 text-xs">
          
          {/* Scan Local Folder */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-1.5">
              TARGET LOCAL DIRECTORY PATH
            </label>
            <form onSubmit={handleScan} className="flex gap-2">
              <div className="relative flex-1">
                <Folder className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={inputPath}
                  onChange={(e) => setInputPath(e.target.value)}
                  placeholder="e.g. C:\Users\name\projects\my-repo"
                  className="w-full bg-slate-950 border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>
              <button
                type="submit"
                disabled={loading || !inputPath.trim()}
                className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs btn-tactile transition-colors shrink-0"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                <span>Scan</span>
              </button>
            </form>
            {error && (
              <div className="mt-2 text-rose-400 text-[11px]">
                {error}
              </div>
            )}
          </div>

          {/* Pre-bundled Rich Samples */}
          <div className="pt-3 border-t border-slate-800">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2">
              EXPLORE PRE-BUNDLED SAMPLE REPOSITORIES:
            </div>
            
            <div className="space-y-2">
              {[
                {
                  id: 'repomix',
                  name: 'Repomix CLI',
                  lang: 'TypeScript',
                  desc: 'Pack codebases into AI-friendly context bundles with token metrics and security scanners.',
                },
                {
                  id: 'taskflow',
                  name: 'TaskFlow Kanban',
                  lang: 'TypeScript (React)',
                  desc: 'Collaborative task management board with columns, drag cards, and SQLite persistence.',
                },
                {
                  id: 'datapulse',
                  name: 'DataPulse Analytics',
                  lang: 'Python (FastAPI)',
                  desc: 'High-speed metrics aggregator with FastAPI, Redis caching, and async workers.',
                },
              ].map(sample => (
                <div
                  key={sample.id}
                  onClick={() => handleSample(sample.id)}
                  className="p-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-amber-500/50 rounded-xl cursor-pointer flex items-center justify-between gap-3 btn-tactile transition-all group"
                >
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-white group-hover:text-amber-300 transition-colors">
                        {sample.name}
                      </span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {sample.lang}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-1">
                      {sample.desc}
                    </p>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-amber-400 shrink-0 transition-colors" />
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
