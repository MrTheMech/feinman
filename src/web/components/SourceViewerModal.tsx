import React, { useState, useEffect } from 'react';
import { 
  X, 
  Maximize2, 
  Minimize2, 
  Copy, 
  Check, 
  Sparkles, 
  FileCode2, 
  ArrowRight,
  Loader2
} from 'lucide-react';

interface SourceViewerModalProps {
  filePath: string | null;
  onClose: () => void;
  onJumpToFile: (newPath: string) => void;
  onExplainSymbol: (name: string, kind: string, file: string, snippet?: string) => void;
}

export const SourceViewerModal: React.FC<SourceViewerModalProps> = ({
  filePath,
  onClose,
  onJumpToFile,
  onExplainSymbol,
}) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileData, setFileData] = useState<{
    relativePath: string;
    language: string;
    lineCount: number;
    sizeBytes: number;
    content: string;
    imports: string[];
    importedBy: string[];
  } | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!filePath) {
      setFileData(null);
      return;
    }

    setLoading(true);
    fetch(`/api/file?path=${encodeURIComponent(filePath)}`)
      .then(res => res.json())
      .then(json => {
        if (json.success && json.data) {
          setFileData(json.data);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [filePath]);

  if (!filePath) return null;

  const handleCopyCode = () => {
    if (fileData?.content) {
      navigator.clipboard.writeText(fileData.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const lines = fileData?.content ? fileData.content.split('\n') : [];

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 backdrop-blur-sm transition-all p-0 sm:p-4">
      <div 
        className={`w-full bg-[#0a0f1d] border border-slate-800 rounded-t-2xl sm:rounded-2xl shadow-2xl flex flex-col transition-all overflow-hidden ${
          isFullScreen 
            ? 'h-full sm:h-[96vh] max-w-7xl' 
            : 'h-[75vh] max-w-5xl'
        }`}
      >
        {/* Header Bar */}
        <div className="h-14 px-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 truncate">
            <FileCode2 className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="font-mono text-xs md:text-sm font-semibold text-white truncate">
              {filePath}
            </span>
            {fileData && (
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 hidden sm:inline">
                {fileData.language} • {fileData.lineCount} lines • {(fileData.sizeBytes / 1024).toFixed(1)} KB
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {/* Explain with Feynman */}
            <button
              onClick={() => onExplainSymbol(filePath.split('/').pop() || filePath, 'file', filePath, fileData?.content?.slice(0, 1000))}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-medium btn-tactile transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Explain File</span>
            </button>

            {/* Copy code */}
            <button
              onClick={handleCopyCode}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 btn-tactile transition-colors"
              title="Copy file content"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Toggle Full Screen */}
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 btn-tactile transition-colors"
              title={isFullScreen ? 'Restore height' : 'Expand full screen'}
            >
              {isFullScreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Close */}
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 btn-tactile transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Dependency Navigation Strip */}
        {fileData && (fileData.imports.length > 0 || fileData.importedBy.length > 0) && (
          <div className="px-4 py-2 bg-slate-950/80 border-b border-slate-800 flex items-center gap-4 text-xs overflow-x-auto no-scrollbar shrink-0">
            {fileData.imports.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase">IMPORTS ({fileData.imports.length}):</span>
                {fileData.imports.slice(0, 4).map(imp => (
                  <button
                    key={imp}
                    onClick={() => onJumpToFile(imp)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-amber-300 border border-slate-800 btn-tactile"
                  >
                    {imp.split('/').pop()}
                  </button>
                ))}
              </div>
            )}

            {fileData.importedBy.length > 0 && (
              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[10px] font-mono text-slate-400 uppercase">IMPORTED BY ({fileData.importedBy.length}):</span>
                {fileData.importedBy.slice(0, 4).map(by => (
                  <button
                    key={by}
                    onClick={() => onJumpToFile(by)}
                    className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-emerald-300 hover:text-emerald-200 border border-slate-800 btn-tactile"
                  >
                    {by.split('/').pop()}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Code Content Area */}
        <div className="flex-1 overflow-auto bg-[#070b14] p-4 font-mono text-xs leading-relaxed text-slate-200">
          {loading ? (
            <div className="h-full flex items-center justify-center gap-2 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin text-amber-500" />
              <span>Loading file contents...</span>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <tbody>
                {lines.map((lineText, idx) => (
                  <tr key={idx} className="hover:bg-slate-800/40 group">
                    <td className="w-12 text-right pr-4 select-none text-slate-600 group-hover:text-slate-400 text-[11px] align-top">
                      {idx + 1}
                    </td>
                    <td className="whitespace-pre font-mono text-slate-300">
                      {lineText || ' '}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

      </div>
    </div>
  );
};
