import React, { useState } from 'react';
import { 
  X, 
  Cpu, 
  Check, 
  Sparkles, 
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Loader2
} from 'lucide-react';

interface SettingsModalProps {
  onClose: () => void;
  modelStatus: {
    available: boolean;
    provider: string;
    endpoint: string;
    models: string[];
    activeModel: string;
    source: string;
  };
  onSaveConfig: (cfg: { endpoint: string; model: string; provider: string }) => Promise<void>;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  onClose,
  modelStatus,
  onSaveConfig,
}) => {
  const [provider, setProvider] = useState(modelStatus.provider.includes('Ollama') ? 'ollama' : 'heuristic');
  const [endpoint, setEndpoint] = useState(modelStatus.endpoint || 'http://localhost:11434');
  const [selectedModel, setSelectedModel] = useState(modelStatus.activeModel || 'llama3.2');
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSaveConfig({
        provider,
        endpoint,
        model: selectedModel,
      });
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        onClose();
      }, 800);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-[#0a0f1d] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="h-14 px-5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Cpu className="w-4 h-4" />
            </div>
            <div className="text-xs font-bold text-white uppercase tracking-wider font-mono">
              AI Model & Inference Configuration
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
        <form onSubmit={handleSave} className="p-5 space-y-4 text-xs">
          
          <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-3 text-slate-300 leading-relaxed">
            Feinman prioritizes open-source and open-weight models (e.g. <strong>Llama 3.2, CodeLlama, DeepSeek-R1, Qwen2.5-Coder</strong>) via Ollama, with instant fallback to deterministic AST heuristics when offline.
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
              INFERENCE PROVIDER
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setProvider('ollama')}
                className={`p-3 rounded-lg border text-left btn-tactile transition-all ${
                  provider === 'ollama'
                    ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">Ollama (Open-Weight)</div>
                <div className="text-[10px] text-slate-400 font-normal">Local LLMs (Llama, DeepSeek, Qwen)</div>
              </button>

              <button
                type="button"
                onClick={() => setProvider('heuristic')}
                className={`p-3 rounded-lg border text-left btn-tactile transition-all ${
                  provider === 'heuristic'
                    ? 'bg-amber-500/15 border-amber-500 text-white font-semibold'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                }`}
              >
                <div className="text-xs font-bold mb-0.5">AST Heuristics</div>
                <div className="text-[10px] text-slate-400 font-normal">100% offline, 0ms latency, zero keys</div>
              </button>
            </div>
          </div>

          {/* Ollama Endpoint */}
          {provider === 'ollama' && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                OLLAMA SERVER URL
              </label>
              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                placeholder="http://localhost:11434"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Model selection */}
          {provider === 'ollama' && (
            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-400 mb-1.5">
                MODEL NAME
              </label>
              <input
                type="text"
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value)}
                placeholder="llama3.2 or codellama or deepseek-r1"
                className="w-full bg-slate-950 border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
              />
            </div>
          )}

          {/* Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium btn-tactile"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold btn-tactile transition-colors"
            >
              {loading ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : saved ? (
                <Check className="w-3.5 h-3.5" />
              ) : null}
              <span>{saved ? 'Saved!' : 'Save Configuration'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
