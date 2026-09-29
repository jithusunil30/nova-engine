import React, { useState, useEffect } from 'react';
import { 
  Globe, Rocket, Sparkles, Terminal, Volume2, VolumeX, Copy, Check, 
  ExternalLink, X, ArrowRight, Database, Code2, Cpu, CheckCircle2, ChevronRight
} from 'lucide-react';

export default function HudPopUpModal({
  isOpen,
  onClose,
  lastPrompt,
  responseText,
  currentSteps = [],
  agentState,
  isSpeaking,
  onSpeakToggle,
  onRunDirective,
  onlineSearchData
}) {
  const [activeTab, setActiveTab] = useState('answer'); // 'answer' or 'trajectory'
  const [copied, setCopied] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isExecuting = agentState === 'executing';
  const hasTrajectory = currentSteps && currentSteps.length > 0;
  
  // Detect if action was autonomous Antigravity execution
  const isAutonomous = currentSteps?.some(s => 
    s.phase === 'ACTION' && (
      s.tool?.includes('antigravity') || 
      s.tool?.includes('python') || 
      s.tool?.includes('cassandra') || 
      s.tool?.includes('shell') || 
      s.tool?.includes('file')
    )
  ) || (responseText && (responseText.includes('Autonomous') || responseText.includes('antigravity') || responseText.includes('Executed')));

  const handleCopy = () => {
    if (responseText) {
      navigator.clipboard.writeText(responseText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleFollowUpSubmit = (e) => {
    e.preventDefault();
    if (!followUpInput.trim()) return;
    onRunDirective(followUpInput.trim());
    setFollowUpInput('');
  };

  const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(lastPrompt || '')}`;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 md:p-6 animate-in fade-in duration-200">
      
      {/* Outer Glow & Frame (Black & Fluorescent White) */}
      <div className="relative w-full max-w-3xl bg-[#060606]/98 border-2 border-white/90 rounded-2xl shadow-[0_0_60px_rgba(255,255,255,0.35)] overflow-hidden flex flex-col max-h-[88vh] font-mono text-white">
        
        {/* Decorative HUD Corner Notches */}
        <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-white pointer-events-none" />
        <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-white pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-white pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-white pointer-events-none" />

        {/* ═══ TOP HEADER ═══ */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-gradient-to-r from-zinc-950 via-black to-zinc-950 border-b border-white/35">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 border border-white flex items-center justify-center shadow-[0_0_15px_#ffffff]">
              {isAutonomous ? (
                <Rocket className="w-4 h-4 text-white animate-pulse" />
              ) : (
                <Globe className="w-4 h-4 text-white animate-pulse" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-widest text-white glow-white-text">
                  N.O.V.A. // {isAutonomous ? 'ANTIGRAVITY AUTONOMOUS ENGINE' : 'ONLINE INTEL & LIVE SEARCH'}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-white text-black shadow-[0_0_8px_#ffffff]">
                  {isAutonomous ? 'AUTONOMOUS (0 TYPING)' : 'GOOGLE / LIVE WEB'}
                </span>
              </div>
              {lastPrompt && (
                <div className="text-[11px] text-zinc-300 tracking-wide truncate max-w-md mt-0.5">
                  <span className="text-white font-bold">DIRECTIVE:</span> "{lastPrompt}"
                </div>
              )}
            </div>
          </div>

          {/* Action Icons */}
          <div className="flex items-center gap-1.5">
            {/* Google Direct Link */}
            {lastPrompt && (
              <a
                href={googleSearchUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-1.5 rounded-lg bg-white/10 border border-white/40 text-white hover:bg-white hover:text-black transition cursor-pointer flex items-center gap-1 text-[11px] px-2.5 font-bold shadow-[0_0_8px_rgba(255,255,255,0.2)]"
                title="Open live query in Google Search"
              >
                <Globe className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Google</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}

            {/* Read Aloud Button */}
            <button
              onClick={onSpeakToggle}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                isSpeaking 
                  ? 'bg-white text-black border-white shadow-[0_0_12px_#ffffff]' 
                  : 'bg-white/10 border-white/40 text-white hover:bg-white/20'
              }`}
              title={isSpeaking ? "Mute Speech" : "Speak Aloud"}
            >
              {isSpeaking ? <VolumeX className="w-4 h-4 animate-pulse" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* Copy Button */}
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg bg-white/10 border border-white/40 text-white hover:bg-white/20 transition cursor-pointer"
              title="Copy Output"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg bg-zinc-900 border border-white/40 text-zinc-300 hover:bg-white hover:text-black transition cursor-pointer ml-1"
              title="Close Modal (Esc)"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ═══ TABS NAVIGATION ═══ */}
        <div className="flex items-center justify-between px-5 pt-3 border-b border-white/20 bg-black">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('answer')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'answer'
                  ? 'bg-zinc-900 border-t-2 border-l border-r border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>LIVE ANSWER & INTEL</span>
            </button>

            <button
              onClick={() => setActiveTab('trajectory')}
              className={`px-3.5 py-1.5 text-xs font-bold rounded-t-lg transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'trajectory'
                  ? 'bg-zinc-900 border-t-2 border-l border-r border-white text-white shadow-[0_0_15px_rgba(255,255,255,0.25)]'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-white" />
              <span>ANTIGRAVITY TRAJECTORY ({currentSteps?.length || 0})</span>
            </button>
          </div>

          <div className="text-[10px] text-zinc-400 font-mono hidden sm:flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            <span>STATUS: {isExecuting ? 'ACTIVE SCANNING' : 'TRANSMISSION READY'}</span>
          </div>
        </div>

        {/* ═══ MODAL BODY CONTENT ═══ */}
        <div className="p-5 overflow-y-auto flex-1 max-h-[55vh] space-y-4">
          
          {/* Live Executing Radar Indicator */}
          {isExecuting && (
            <div className="p-4 rounded-xl bg-zinc-950 border border-white/60 flex items-center gap-4 animate-pulse">
              <div className="w-10 h-10 rounded-full border-2 border-white border-t-transparent animate-spin flex items-center justify-center shrink-0 shadow-[0_0_15px_#ffffff]">
                <Globe className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <div className="text-xs font-bold text-white tracking-wider glow-white-text">
                  N.O.V.A. EXECUTING AUTONOMOUSLY (ANTIGRAVITY MODE)
                </div>
                <div className="text-[11px] text-zinc-300 mt-0.5">
                  Scanning live Google & online sources, synthesizing code, and executing without manual user typing...
                </div>
                {currentSteps && currentSteps.length > 0 && (
                  <div className="text-[10px] text-white font-mono mt-1">
                    Step: {currentSteps[currentSteps.length - 1]?.message || currentSteps[currentSteps.length - 1]?.phase}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: LIVE ANSWER & INTEL */}
          {activeTab === 'answer' && (
            <div className="space-y-4">
              {/* Formatted Text Box */}
              <div className="bg-black/90 border border-white/30 rounded-xl p-4 shadow-inner">
                <div className="text-xs md:text-sm text-white font-mono leading-relaxed whitespace-pre-wrap select-text">
                  {responseText || (isExecuting ? 'Synthesizing response from neural network and Google live intelligence...' : 'No response text available.')}
                </div>
              </div>

              {/* Live Web Intelligence Snippets & Google Card */}
              {lastPrompt && (
                <div className="bg-zinc-950/60 border border-white/30 rounded-xl p-3.5 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-white" />
                      ONLINE SEARCH & SOURCE INTEL
                    </span>
                    <a
                      href={googleSearchUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] text-white hover:underline flex items-center gap-1"
                    >
                      Search Google for "{lastPrompt}" <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                  
                  <div className="text-[11px] text-zinc-300 font-mono flex items-center gap-2 pt-1 border-t border-white/20">
                    <span className="text-white font-bold">AUTOMATED GOOGLE SYNC:</span>
                    <span>N.O.V.A. continuously queries DuckDuckGo, Wikipedia, and Google live index.</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: ANTIGRAVITY TRAJECTORY */}
          {activeTab === 'trajectory' && (
            <div className="space-y-3">
              <div className="text-xs text-white font-bold flex items-center justify-between border-b border-white/20 pb-2">
                <span className="flex items-center gap-1.5">
                  <Rocket className="w-3.5 h-3.5 text-white" />
                  AUTONOMOUS AGENT EXECUTION TRAJECTORY
                </span>
                <span className="text-[10px] text-black font-bold bg-white px-2 py-0.5 rounded shadow-[0_0_8px_#ffffff]">
                  NO USER TYPING REQUIRED
                </span>
              </div>

              {hasTrajectory ? (
                <div className="space-y-2.5">
                  {currentSteps.map((step, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-lg bg-black border border-white/25 flex flex-col gap-1.5 text-xs font-mono"
                    >
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          step.phase === 'THOUGHT' 
                            ? 'bg-zinc-800 border border-white/40 text-zinc-200'
                            : step.phase === 'ACTION'
                            ? 'bg-zinc-800 border border-white/60 text-white shadow-[0_0_6px_rgba(255,255,255,0.3)]'
                            : step.phase === 'OBSERVATION'
                            ? 'bg-zinc-900 border border-white/30 text-white'
                            : 'bg-white text-black font-bold'
                        }`}>
                          STEP {idx + 1}: {step.phase} {step.tool ? `(${step.tool})` : ''}
                        </span>
                        <span className="text-[10px] text-zinc-500">ID: {idx + 1}</span>
                      </div>

                      {step.message && (
                        <div className="text-zinc-200 text-[11px] leading-relaxed">
                          {step.message}
                        </div>
                      )}

                      {step.input && (
                        <div className="bg-zinc-950 p-2 rounded text-[11px] text-zinc-300 overflow-x-auto border border-white/20">
                          <span className="text-white font-bold">INPUT: </span>
                          {JSON.stringify(step.input, null, 2)}
                        </div>
                      )}

                      {step.output && (
                        <div className="bg-zinc-950 p-2 rounded text-[11px] text-white overflow-x-auto border border-white/20 max-h-36">
                          <span className="text-white font-bold">OBSERVATION: </span>
                          <pre className="whitespace-pre-wrap">{step.output}</pre>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-zinc-500">
                  No trajectory steps logged for this directive.
                </div>
              )}
            </div>
          )}

        </div>

        {/* ═══ BOTTOM QUICK FOLLOW-UP BAR ═══ */}
        <div className="p-3.5 bg-gradient-to-t from-black to-zinc-950 border-t border-white/30 flex flex-col gap-2">
          
          <form onSubmit={handleFollowUpSubmit} className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask follow-up query or issue Antigravity directive (e.g. 'run fibonacci in python', 'search google for...') "
                className="w-full bg-black border border-white/60 rounded-xl px-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-white font-mono tracking-wide shadow-inner"
              />
            </div>
            
            <button
              type="submit"
              disabled={isExecuting}
              className="px-4 py-2 rounded-xl bg-white text-black font-bold text-xs flex items-center gap-1.5 shadow-[0_0_15px_#ffffff] hover:bg-zinc-200 transition cursor-pointer disabled:opacity-50"
            >
              <span>SEND</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </form>

          {/* Quick Action Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px] text-zinc-300 pt-1">
            <span className="text-zinc-500 uppercase font-bold shrink-0">DIRECTIVES:</span>
            {[
              'Write python script to calculate fibonacci and run it',
              'Check Cassandra 3.11 cluster status',
              'What is quantum computing',
              'Check system CPU and RAM',
              'Launch Antigravity IDE'
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => onRunDirective(chip)}
                className="shrink-0 px-2 py-0.5 rounded-full bg-zinc-900 border border-white/30 hover:border-white hover:text-white transition cursor-pointer truncate max-w-[210px]"
                title={chip}
              >
                {chip}
              </button>
            ))}
          </div>

        </div>

      </div>
    </div>
  );
}
