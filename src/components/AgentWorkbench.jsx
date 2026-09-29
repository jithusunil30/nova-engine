import React, { useState } from 'react';
import { Play, Terminal, Sparkles, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';

export default function AgentWorkbench({ onRunDirective, agentState, currentSteps, responseText }) {
  const [prompt, setPrompt] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    onRunDirective(prompt);
    setPrompt('');
  };

  return (
    <div className="hud-card p-6 flex flex-col gap-6 w-full">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
        <div className="flex items-center gap-3">
          <Sparkles className="w-5 h-5 text-cyan-400" />
          <div>
            <h2 className="font-hud font-bold text-lg text-slate-100">
              AUTONOMOUS REACT WORKBENCH
            </h2>
            <p className="text-xs text-slate-400 font-normal">
              Reasoning + System Tool Execution Trajectory
            </p>
          </div>
        </div>
        <span className="text-xs px-3 py-1 rounded-full bg-cyan-950 border border-cyan-500/40 text-cyan-300 font-mono-hud font-medium">
          ReAct Loop: Active
        </span>
      </div>

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="flex gap-3 w-full">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Type directive (e.g., 'Take a screenshot', 'Open Notepad', 'Check system specs')..."
          className="flex-1 bg-slate-900/90 border border-slate-700/80 rounded-xl px-5 py-3.5 text-sm md:text-base text-slate-100 placeholder-slate-500 font-sans focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30"
        />
        <button
          type="submit"
          disabled={agentState === 'executing'}
          className="btn-hud px-6 py-3.5 rounded-xl font-bold text-sm tracking-wide shadow-md"
        >
          {agentState === 'executing' ? (
            <Sparkles className="w-5 h-5 animate-spin text-amber-400" />
          ) : (
            <Play className="w-5 h-5" />
          )}
          <span>EXECUTE</span>
        </button>
      </form>

      {/* Trajectory Stream Container */}
      <div className="flex flex-col gap-4 bg-slate-950/80 rounded-xl p-5 border border-slate-800 min-h-[300px]">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-400 border-b border-slate-800 pb-2">
          <span className="uppercase tracking-wider">EXECUTION TRAJECTORY & REASONING</span>
          <span className="font-mono-hud">STEPS: {currentSteps.length}</span>
        </div>

        {currentSteps.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-slate-500 italic text-sm gap-2.5 py-12 text-center">
            <Terminal className="w-8 h-8 opacity-40 text-cyan-400" />
            <span>Standing by for your prompt, voice directive, or quick action...</span>
          </div>
        ) : (
          <div className="flex flex-col gap-3 font-sans text-sm overflow-y-auto max-h-[380px] pr-1">
            {currentSteps.map((step, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/60 flex flex-col gap-2">
                <div className="flex items-center gap-2.5">
                  {step.phase === 'THOUGHT' && <Sparkles className="w-4 h-4 text-cyan-400" />}
                  {step.phase === 'ACTION' && <Terminal className="w-4 h-4 text-amber-400" />}
                  {step.phase === 'OBSERVATION' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                  {step.phase === 'SECURITY_ALERT' && <AlertCircle className="w-4 h-4 text-rose-400 animate-pulse" />}
                  <span className="font-hud font-bold text-xs px-2.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300">
                    {step.phase}
                  </span>
                  {step.tool && <span className="text-amber-400 font-mono-hud font-medium">Tool: {step.tool}</span>}
                </div>

                {step.message && <div className="text-slate-200 pl-6 text-sm font-normal">{step.message}</div>}
                {step.input && (
                  <pre className="text-cyan-300 bg-slate-950 p-3 rounded-lg text-xs font-mono-hud overflow-x-auto border border-slate-800">
                    {JSON.stringify(step.input, null, 2)}
                  </pre>
                )}
                {step.output && (
                  <div className="pl-6 text-emerald-300 bg-emerald-950/30 p-3 rounded-lg border border-emerald-500/20 whitespace-pre-wrap font-mono-hud text-xs leading-relaxed">
                    {step.output}
                  </div>
                )}
              </div>
            ))}

            {responseText && (
              <div className="mt-3 p-5 rounded-xl bg-slate-900/95 border border-cyan-500/50 text-slate-100 flex flex-col gap-2.5 shadow-lg">
                <div className="flex items-center gap-2 font-hud font-bold text-sm text-cyan-400">
                  <ArrowRight className="w-4 h-4 text-cyan-400" />
                  <span>N.O.V.A. RESPONSE:</span>
                </div>
                <div className="text-sm md:text-base leading-relaxed whitespace-pre-wrap text-slate-200">{responseText}</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
