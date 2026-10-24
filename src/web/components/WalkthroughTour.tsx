import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Footprints, 
  FileCode2, 
  ArrowRight, 
  ArrowLeft, 
  Check, 
  Sparkles, 
  ExternalLink,
  Lightbulb,
  CheckCircle2,
  Send,
  MessageSquare,
  Bot,
  User,
  HelpCircle,
  Code,
  Flame,
  Zap,
  ChevronDown,
  ChevronUp,
  Loader2,
  Terminal
} from 'lucide-react';
import { ProjectAnalysis, WalkthroughStep } from '../../engine/types.js';

interface WalkthroughTourProps {
  analysis: ProjectAnalysis;
  onOpenFile: (filePath: string) => void;
  onExplainSymbol: (name: string, kind: string, file: string, snippet?: string) => void;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const WalkthroughTour: React.FC<WalkthroughTourProps> = ({
  analysis,
  onOpenFile,
  onExplainSymbol,
}) => {
  const { walkthrough } = analysis;
  const [currentStepIdx, setCurrentStepIdx] = useState(0);

  // Completed milestones map: stepNumber -> boolean
  const [completedMilestones, setCompletedMilestones] = useState<Record<number, boolean>>({});

  // Checklist items map: `${stepNumber}-${itemIdx}` -> boolean
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});

  // Ask Anything Chatbot state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'assistant',
      text: `Hey! I'm your Feynman Code Tutor. As you walk through each milestone, ask me anything—why code is structured this way, what a function does, or how to modify it!`,
      timestamp: 'Just now',
    },
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAsking, setIsAsking] = useState(false);
  const [isChatExpanded, setIsChatExpanded] = useState(true);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  // Progress metrics
  const totalSteps = walkthrough.length;
  const completedCount = Object.values(completedMilestones).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / totalSteps) * 100);

  // Toggle milestone completion
  const toggleMilestone = (stepNum: number) => {
    setCompletedMilestones(prev => ({
      ...prev,
      [stepNum]: !prev[stepNum],
    }));
  };

  // Toggle checklist item
  const toggleCheckItem = (key: string, stepNum: number, totalInStep: number) => {
    setCheckedItems(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      
      // If all items in this step are checked, mark the milestone as completed
      const allChecked = Array.from({ length: totalInStep }).every((_, i) => updated[`${stepNum}-${i}`]);
      if (allChecked) {
        setCompletedMilestones(m => ({ ...m, [stepNum]: true }));
      }
      return updated;
    });
  };

  // Handle Ask Anything submission
  const handleSendQuestion = async (customQ?: string) => {
    const q = customQ || chatInput;
    if (!q.trim() || isAsking) return;

    const userMsg: ChatMessage = {
      id: String(Date.now()),
      sender: 'user',
      text: q,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages(prev => [...prev, userMsg]);
    if (!customQ) setChatInput('');
    setIsAsking(true);

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: q,
          file: currentStep.targetFile,
          stepTitle: currentStep.title,
          stepSummary: currentStep.summary,
          whatToNotice: currentStep.whatToNotice,
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        const botMsg: ChatMessage = {
          id: String(Date.now() + 1),
          sender: 'assistant',
          text: json.data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        };
        setChatMessages(prev => [...prev, botMsg]);
      } else {
        throw new Error('No answer');
      }
    } catch {
      const fallbackMsg: ChatMessage = {
        id: String(Date.now() + 1),
        sender: 'assistant',
        text: `In **${currentStep.targetFile}**, this milestone establishes **${currentStep.summary}**. Inspect the exported functions and note how it handles inputs and delegates execution.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setChatMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsAsking(false);
    }
  };

  const promptSuggestions = [
    "ELI5: Explain like I'm 5",
    "How does this file connect to others?",
    "Why was this architectural choice made?",
    "How do I safely modify this part?",
  ];

  return (
    <div className="max-w-7xl mx-auto py-2 space-y-4">
      
      {/* Top Header Bar: Track Title & Progress Meter */}
      <section className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-card flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/20 font-bold shrink-0">
            <Footprints className="w-5 h-5 text-slate-950" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold tracking-tight text-white uppercase font-mono">
                Interactive Codebase Learning Journey
              </h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">
                Taste Skill Guided
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Step-by-step masterclass: learn the mental models, anatomy, and critical milestones of this repository.
            </p>
          </div>
        </div>

        {/* Learning Mastery Meter */}
        <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-2 rounded-xl border border-slate-800 shrink-0 self-end md:self-center">
          <div className="text-right">
            <div className="text-[10px] font-mono uppercase text-slate-400">
              Mastery Progress
            </div>
            <div className="text-xs font-mono font-bold text-emerald-400">
              {completedCount} of {totalSteps} Mastered ({progressPercent}%)
            </div>
          </div>
          <div className="w-20 bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
            <motion.div 
              className="bg-emerald-500 h-full rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>
        </div>
      </section>

      {/* Main Split Layout: Left Roadmap (Scrollable) + Right AI Master Stage */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        
        {/* LEFT COLUMN: Scrollable Milestone Track (5 cols on lg) */}
        <div className="lg:col-span-4 bg-[#0a0f1d]/95 border border-slate-800 rounded-2xl p-3.5 shadow-card flex flex-col max-h-[820px] overflow-hidden">
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-slate-800/80">
            <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400 font-bold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Learning Milestones ({walkthrough.length})
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              Click step to jump
            </span>
          </div>

          {/* Connected Vertical Timeline */}
          <div className="overflow-y-auto space-y-2 pr-1 custom-scrollbar flex-1 relative">
            {walkthrough.map((step, idx) => {
              const isActive = idx === currentStepIdx;
              const isDone = !!completedMilestones[step.stepNumber];

              return (
                <motion.div
                  key={step.stepNumber}
                  whileHover={{ scale: 1.01, x: 2 }}
                  transition={{ duration: 0.15 }}
                  onClick={() => setCurrentStepIdx(idx)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all relative select-none ${
                    isActive
                      ? 'bg-amber-950/30 border-amber-500/80 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50'
                      : isDone
                      ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                      : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  {/* Left Active Indicator Bar */}
                  {isActive && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 rounded-r bg-amber-400" />
                  )}

                  <div className="flex items-start gap-2.5 pl-1">
                    {/* Checklistable Milestone Toggle Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleMilestone(step.stepNumber);
                      }}
                      className={`w-5 h-5 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                        isDone
                          ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/30'
                          : isActive
                          ? 'border-amber-400/80 bg-slate-900 text-amber-300'
                          : 'border-slate-700 bg-slate-900 text-slate-500 hover:border-slate-500'
                      }`}
                      title={isDone ? 'Mark as incomplete' : 'Mark milestone as mastered'}
                    >
                      {isDone ? (
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold">0{step.stepNumber}</span>
                      )}
                    </button>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-0.5">
                        <span className={`text-xs font-bold font-mono truncate ${
                          isActive ? 'text-amber-300' : isDone ? 'text-emerald-300' : 'text-slate-200'
                        }`}>
                          {step.title.split(':')[0]}
                        </span>
                        {isDone && (
                          <span className="text-[9px] font-mono text-emerald-400 uppercase font-bold">
                            Done
                          </span>
                        )}
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 truncate flex items-center gap-1">
                        <FileCode2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        <span className="truncate">{step.targetFile.split('/').pop()}</span>
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1 line-clamp-1 leading-snug">
                        {step.conceptExplained}
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Feynman AI Stage + Docked Chatbot (7 cols on lg) */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Main Stage Lesson Card */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep.stepNumber}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2 }}
              className="bg-[#0a0f1d]/95 border border-slate-800 rounded-2xl p-5 shadow-card space-y-4 relative"
            >
              {/* Header: Milestone Counter & Action Pills */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3.5 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      Milestone {currentStep.stepNumber} of {totalSteps}
                    </span>
                    {completedMilestones[currentStep.stepNumber] && (
                      <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                        <Check className="w-3 h-3" />
                        Mastered
                      </span>
                    )}
                  </div>
                  <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                    {currentStep.title}
                  </h3>
                </div>

                {/* Inspect and Explain Buttons */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => onOpenFile(currentStep.targetFile)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 hover:bg-slate-800 border border-slate-700/80 text-amber-300 hover:text-amber-200 text-xs font-mono font-medium btn-tactile transition-colors"
                  >
                    <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="truncate max-w-[120px]">{currentStep.targetFile.split('/').pop()}</span>
                    <ExternalLink className="w-3 h-3 text-slate-500" />
                  </button>

                  <button
                    onClick={() => onExplainSymbol(currentStep.title, 'milestone', currentStep.targetFile)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 text-xs font-mono btn-tactile transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Explain</span>
                  </button>
                </div>
              </div>

              {/* 1. Feynman Mental Model Callout (Vivid Analogy) */}
              <div className="bg-gradient-to-r from-amber-500/15 via-amber-950/20 to-transparent border border-amber-500/30 rounded-xl p-4 flex items-start gap-3 shadow-sm">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                  <Lightbulb className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-amber-400 font-mono mb-1">
                    Feynman Mental Model
                  </div>
                  <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-normal">
                    {currentStep.conceptExplained}
                  </p>
                </div>
              </div>

              {/* 2. What Happens Under the Hood */}
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-3.5">
                <div className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold mb-1.5 flex items-center gap-1.5">
                  <Code className="w-3.5 h-3.5 text-sky-400" />
                  <span>Execution Role & Architecture</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  {currentStep.summary}
                </p>
              </div>

              {/* 3. Checklistable Milestone Learning Goals */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="text-[10px] font-mono uppercase tracking-wider text-emerald-400 font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Checklist to Master This Milestone</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Click items as you understand them
                  </span>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {currentStep.whatToNotice.map((note, idx) => {
                    const itemKey = `${currentStep.stepNumber}-${idx}`;
                    const isChecked = !!checkedItems[itemKey];

                    return (
                      <motion.div
                        key={idx}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => toggleCheckItem(itemKey, currentStep.stepNumber, currentStep.whatToNotice.length)}
                        className={`p-2.5 rounded-lg border cursor-pointer flex items-start gap-2.5 transition-all ${
                          isChecked
                            ? 'bg-emerald-950/25 border-emerald-500/40 text-slate-300'
                            : 'bg-slate-950/70 border-slate-800 hover:border-slate-700 text-slate-300'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                          isChecked ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-600 bg-slate-900'
                        }`}>
                          {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                        </div>
                        <span className={`text-xs leading-snug ${isChecked ? 'text-slate-300 font-medium' : 'text-slate-400'}`}>
                          {note}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <button
                  onClick={() => setCurrentStepIdx(prev => Math.max(0, prev - 1))}
                  disabled={isFirst}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 disabled:opacity-40 text-slate-300 text-xs font-mono btn-tactile transition-colors border border-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Previous</span>
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleMilestone(currentStep.stepNumber)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all ${
                      completedMilestones[currentStep.stepNumber]
                        ? 'bg-emerald-950 border border-emerald-500 text-emerald-300'
                        : 'bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300'
                    }`}
                  >
                    {completedMilestones[currentStep.stepNumber] ? '✔ Mastered' : 'Mark Mastered'}
                  </button>

                  <button
                    onClick={() => {
                      if (!isLast) {
                        setCurrentStepIdx(prev => prev + 1);
                      }
                    }}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold font-mono btn-tactile transition-colors shadow-sm shadow-amber-500/20"
                  >
                    <span>{isLast ? 'Complete Tour' : 'Next Milestone'}</span>
                    {!isLast && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </motion.div>
          </AnimatePresence>

          {/* DOCKED CHATBOT: Ask Anything Assistant at Middle Lower */}
          <div className="bg-[#0a0f1d]/95 border border-slate-800 rounded-2xl shadow-card overflow-hidden">
            
            {/* Chatbot Header */}
            <div 
              onClick={() => setIsChatExpanded(!isChatExpanded)}
              className="p-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between cursor-pointer hover:bg-slate-900 transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 border border-sky-500/30 flex items-center justify-center">
                  <Bot className="w-3.5 h-3.5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-white font-mono flex items-center gap-2">
                    <span>Ask Anything Assistant</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-[10px] text-slate-400 font-sans">
                    Ask questions about {currentStep.targetFile.split('/').pop()} or architecture
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-slate-400">
                <span className="text-[10px] font-mono hidden sm:inline">
                  {isChatExpanded ? 'Collapse' : 'Expand'}
                </span>
                {isChatExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </div>

            {/* Chatbot Body */}
            {isChatExpanded && (
              <div className="p-3.5 space-y-3">
                
                {/* Prompt Suggestions Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  {promptSuggestions.map((s, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSendQuestion(s)}
                      disabled={isAsking}
                      className="px-2.5 py-1 rounded-lg bg-slate-950 hover:bg-slate-900 text-slate-300 hover:text-amber-300 border border-slate-800 text-[10px] font-mono whitespace-nowrap btn-tactile transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>

                {/* Message Thread */}
                <div className="max-h-52 overflow-y-auto space-y-2.5 p-2 rounded-xl bg-slate-950/80 border border-slate-800/80 custom-scrollbar text-xs">
                  {chatMessages.map(msg => (
                    <div 
                      key={msg.id}
                      className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender === 'assistant' && (
                        <div className="w-5 h-5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center shrink-0 mt-0.5">
                          <Bot className="w-3 h-3" />
                        </div>
                      )}
                      
                      <div className={`p-2.5 rounded-xl max-w-[85%] text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-amber-500 text-slate-950 font-medium rounded-br-none'
                          : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-bl-none font-sans'
                      }`}>
                        {msg.text}
                      </div>

                      {msg.sender === 'user' && (
                        <div className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                          <User className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                  ))}
                  {isAsking && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-amber-400" />
                      <span className="font-mono text-[11px]">Feynman is pondering...</span>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Question Input Box */}
                <form 
                  onSubmit={(e) => { e.preventDefault(); handleSendQuestion(); }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder={`Ask anything about ${currentStep.targetFile.split('/').pop()}...`}
                    disabled={isAsking}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 font-sans"
                  />
                  <button
                    type="submit"
                    disabled={isAsking || !chatInput.trim()}
                    className="p-2 rounded-xl bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold btn-tactile transition-colors shrink-0"
                    title="Send Question"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
};
