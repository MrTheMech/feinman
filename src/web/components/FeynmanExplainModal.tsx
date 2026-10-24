import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  Lightbulb, 
  Layers, 
  ArrowRightLeft, 
  FileCode2,
  Cpu,
  Loader2
} from 'lucide-react';

interface FeynmanExplainModalProps {
  symbolInfo: {
    name: string;
    kind: string;
    file: string;
    snippet?: string;
  } | null;
  onClose: () => void;
}

export const FeynmanExplainModal: React.FC<FeynmanExplainModalProps> = ({
  symbolInfo,
  onClose,
}) => {
  const [loading, setLoading] = useState(false);
  const [explanation, setExplanation] = useState<{
    plainSummary: string;
    feynmanAnalogy: string;
    inputsAndOutputs: string;
    connections: string;
    modelUsed: string;
  } | null>(null);

  useEffect(() => {
    if (!symbolInfo) {
      setExplanation(null);
      return;
    }

    setLoading(true);
    fetch('/api/explain-symbol', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(symbolInfo),
    })
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setExplanation(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [symbolInfo]);

  if (!symbolInfo) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#0b101e] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="h-14 px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
                <span>{symbolInfo.name}</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 font-sans">
                  {symbolInfo.kind}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 truncate max-w-[320px]">
                {symbolInfo.file}
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
        <div className="p-5 overflow-y-auto max-h-[70vh] space-y-4 text-xs">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-3 text-slate-400">
              <Loader2 className="w-6 h-6 animate-spin text-amber-400" />
              <span>Applying Feynman decomposition...</span>
            </div>
          ) : explanation ? (
            <>
              {/* 1. Plain English Summary */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Plain-English Summary</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-normal">
                  {explanation.plainSummary}
                </p>
              </div>

              {/* 2. Feynman Real-world Analogy */}
              <div className="bg-amber-500/10 border border-amber-500/25 rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" />
                  <span>The Feynman Analogy</span>
                </div>
                <p className="text-xs md:text-sm text-slate-200 leading-relaxed">
                  {explanation.feynmanAnalogy}
                </p>
              </div>

              {/* 3. Inputs & Outputs */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-sky-400 mb-1 flex items-center gap-1.5">
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Inputs & Outputs</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line">
                  {explanation.inputsAndOutputs}
                </p>
              </div>

              {/* 4. Connections to Codebase */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4">
                <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5" />
                  <span>Connections & Callers</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {explanation.connections}
                </p>
              </div>

              {/* Footer info */}
              <div className="pt-2 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <Cpu className="w-3 h-3 text-amber-400" />
                  <span>Explained with: {explanation.modelUsed}</span>
                </span>
                <span>Feynman Technique applied</span>
              </div>
            </>
          ) : (
            <div className="py-6 text-center text-slate-400 text-xs">
              Unable to generate explanation for this component.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
