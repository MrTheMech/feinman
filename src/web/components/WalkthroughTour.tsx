import React, { useState } from 'react';
import { 
  Footprints, 
  FileCode2, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  ExternalLink,
  Lightbulb
} from 'lucide-react';
import { ProjectAnalysis, WalkthroughStep } from '../../engine/types.js';

interface WalkthroughTourProps {
  analysis: ProjectAnalysis;
  onOpenFile: (filePath: string) => void;
  onExplainSymbol: (name: string, kind: string, file: string, snippet?: string) => void;
}

export const WalkthroughTour: React.FC<WalkthroughTourProps> = ({
  analysis,
  onOpenFile,
  onExplainSymbol,
}) => {
  const { walkthrough } = analysis;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  if (!walkthrough || walkthrough.length === 0) {
    return (
      <div className="max-w-4xl mx-auto py-12 text-center text-slate-400 text-xs">
        No walkthrough steps generated for this codebase.
      </div>
    );
  }

  const currentStep = walkthrough[currentStepIdx] || walkthrough[0];
  const isFirst = currentStepIdx === 0;
  const isLast = currentStepIdx === walkthrough.length - 1;

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      
      {/* Header and Step Indicator Tabs */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <Footprints className="w-4 h-4 text-amber-400" />
              <h2 className="text-sm font-semibold tracking-wide text-white uppercase">
                Guided Codebase Tour
              </h2>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Follow this progressive path to understand the codebase step-by-step from entrypoint to tests.
            </p>
          </div>

          <div className="text-xs font-mono text-slate-400">
            Step <span className="text-amber-400 font-bold">{currentStepIdx + 1}</span> of {walkthrough.length}
          </div>
        </div>

        {/* Step Progress Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {walkthrough.map((step, idx) => {
            const isActive = idx === currentStepIdx;
            const isCompleted = idx < currentStepIdx;

            return (
              <button
                key={step.stepNumber}
                onClick={() => setCurrentStepIdx(idx)}
                className={`p-2.5 rounded-lg border text-left btn-tactile transition-all ${
                  isActive
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-sm'
                    : isCompleted
                    ? 'bg-slate-950/80 border-slate-800 text-slate-300 hover:text-white'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500 hover:text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className={`text-[10px] font-mono font-bold ${isActive ? 'text-amber-400' : 'text-slate-400'}`}>
                    0{step.stepNumber}
                  </span>
                  {isCompleted && <Check className="w-3 h-3 text-emerald-400" />}
                </div>
                <div className="text-xs font-medium truncate">
                  {step.title.split(':')[0]}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {/* Active Step Content Card */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-6 shadow-card space-y-5">
        
        {/* Step Title & Target File */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-wider text-amber-400 mb-1">
              Step {currentStep.stepNumber}
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {currentStep.title}
            </h3>
          </div>

          <button
            onClick={() => onOpenFile(currentStep.targetFile)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 text-xs font-mono font-medium btn-tactile transition-colors shrink-0"
          >
            <FileCode2 className="w-3.5 h-3.5" />
            <span>{currentStep.targetFile}</span>
            <ExternalLink className="w-3 h-3 text-slate-500" />
          </button>
        </div>

        {/* Real-world Feynman Analogy Box */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wider text-amber-400 mb-1">
              Mental Model
            </div>
            <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-normal">
              {currentStep.conceptExplained}
            </p>
          </div>
        </div>

        {/* Summary */}
        <div>
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-1.5">
            What Happens Here
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {currentStep.summary}
          </p>
        </div>

        {/* What to Notice Checklist */}
        <div className="bg-slate-950/80 border border-slate-800 rounded-lg p-4 space-y-2">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>What to notice when inspecting this file:</span>
          </div>
          {currentStep.whatToNotice.map((note, idx) => (
            <div key={idx} className="flex items-start gap-2 text-xs text-slate-300">
              <span className="text-amber-400 font-bold">•</span>
              <span>{note}</span>
            </div>
          ))}
        </div>

        {/* Tour Navigation Controls */}
        <div className="pt-4 border-t border-slate-800 flex items-center justify-between">
          <button
            onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
            disabled={isFirst}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-medium btn-tactile transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Previous Step</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenFile(currentStep.targetFile)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 btn-tactile transition-colors"
            >
              Open Full Source
            </button>
            <button
              onClick={() => {
                if (!isLast) {
                  setCurrentStepIdx(prev => prev + 1);
                }
              }}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold btn-tactile transition-colors"
            >
              <span>{isLast ? 'Complete Tour' : 'Next Step'}</span>
              {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

      </section>

    </div>
  );
};
