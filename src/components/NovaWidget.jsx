import React, { useState } from 'react';
import { 
  Zap, Camera, Volume2, VolumeX, Eye, 
  Play, X, Sparkles, Cpu, Mic, FolderSync, FileText, Wifi
} from 'lucide-react';

export default function NovaWidget({ onRunDirective, sysInfo, isSpeaking, agentState }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  const executeAction = async (directiveText) => {
    setStatusMsg(`Executing: "${directiveText}"...`);
    setIsExecuting(true);
    try {
      await onRunDirective(directiveText);
      setStatusMsg('Directive complete');
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setStatusMsg(''), 3500);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isExecuting) return;
    const cmd = prompt.trim();
    setPrompt('');
    executeAction(cmd);
  };

  const isActive = isSpeaking || agentState === 'executing' || isExecuting;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none font-hud">
      {/* Expanded Siri-Mode Floating Assistant Card */}
      {isOpen && (
        <div className="hud-panel p-4 rounded-2xl w-84 sm:w-96 flex flex-col gap-3.5 shadow-[0_0_50px_rgba(255,255,255,0.35)] border border-white/40 bg-black/95 backdrop-blur-2xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-white/20 pb-2.5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-black border border-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.7)] siri-orb-pulse">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-bold text-xs tracking-wider text-white flex items-center gap-1.5">
                  N.O.V.A. ASSISTANT
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-white text-black font-extrabold uppercase">
                    Siri Mode
                  </span>
                </h3>
                <p className="font-mono-hud text-[10px] text-zinc-400 tracking-wider">
                  Always-On Autonomous Workstation Agent
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full bg-zinc-900 border border-white/30 text-zinc-300 hover:text-white hover:border-white transition"
              title="Minimize Assistant"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Telemetry Pill */}
          {sysInfo && (
            <div className="flex items-center justify-between bg-zinc-950 px-3 py-1.5 rounded-lg border border-white/15 font-mono-hud text-[11px] text-zinc-300">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-zinc-400" /> CPU: {sysInfo.cpu?.load || 0}%
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-white" /> RAM: {sysInfo.memory?.percent || 0}%
              </span>
              <span className="flex items-center gap-1.5 text-white">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" /> ACTIVE
              </span>
            </div>
          )}

          {/* Natural Language Directive Bar */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything... ('what is on my screen', 'clean downloads')"
              className="flex-1 bg-zinc-950 border border-white/30 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 font-mono-hud focus:outline-none focus:border-white focus:shadow-[0_0_15px_rgba(255,255,255,0.3)] transition"
            />
            <button
              type="submit"
              disabled={isExecuting}
              className="btn-hud-white px-3.5 py-2.5 rounded-xl flex items-center justify-center text-xs font-bold transition hover:scale-105 active:scale-95"
              title="Send Directive"
            >
              {isExecuting ? <Sparkles className="w-4 h-4 animate-spin text-black" /> : <Play className="w-4 h-4 fill-black text-black" />}
            </button>
          </form>

          {/* Live Status Toast */}
          {statusMsg && (
            <div className="text-[11px] font-mono-hud text-black bg-white px-3 py-1 rounded-md text-center font-bold animate-pulse shadow-[0_0_15px_rgba(255,255,255,0.5)]">
              {statusMsg}
            </div>
          )}

          {/* Siri-Style Natural 1-Click Quick Actions */}
          <div className="flex flex-col gap-1.5">
            <span className="font-hud text-[10px] text-zinc-400 tracking-wider">NATURAL WORKSTATION SHORTCUTS</span>
            <div className="grid grid-cols-3 gap-1.5 font-mono-hud text-[11px]">
              <button
                onClick={() => executeAction('what is on my screen')}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-white/20 hover:border-white hover:bg-zinc-900 text-white transition text-left"
                title="Vision Perception"
              >
                <Eye className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] leading-tight">Vision Screen</span>
              </button>

              <button
                onClick={() => executeAction('clean up my downloads')}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-white/20 hover:border-white hover:bg-zinc-900 text-white transition text-left"
                title="File Organizer"
              >
                <FolderSync className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] leading-tight">Clean Downloads</span>
              </button>

              <button
                onClick={() => executeAction('find recent notes')}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-white/20 hover:border-white hover:bg-zinc-900 text-white transition text-left"
                title="Find Recent Notes"
              >
                <FileText className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] leading-tight">Recent Notes</span>
              </button>

              <button
                onClick={() => executeAction('check wifi and battery status')}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-white/20 hover:border-white hover:bg-zinc-900 text-white transition text-left"
                title="Hardware Diagnostics"
              >
                <Wifi className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] leading-tight">Hardware</span>
              </button>

              <button
                onClick={() => executeAction('increase volume')}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-white/20 hover:border-white hover:bg-zinc-900 text-white transition text-left"
                title="Volume Up"
              >
                <Volume2 className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] leading-tight">Volume Up</span>
              </button>

              <button
                onClick={() => executeAction('mute sound')}
                className="flex items-center gap-2 p-2 rounded-xl bg-zinc-950 border border-white/20 hover:border-white hover:bg-zinc-900 text-white transition text-left"
                title="Toggle Mute"
              >
                <VolumeX className="w-4 h-4 text-white shrink-0" />
                <span className="text-[10px] leading-tight">Mute Sound</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Siri Orb Button (Always-Visible Trigger) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full bg-black border-2 border-white flex items-center justify-center transition-all duration-300 group cursor-pointer relative ${
          isActive 
            ? 'shadow-[0_0_40px_rgba(255,255,255,1)] siri-orb-pulse scale-110' 
            : 'shadow-[0_0_20px_rgba(255,255,255,0.5)] hover:shadow-[0_0_35px_rgba(255,255,255,0.9)] hover:scale-105 active:scale-95'
        }`}
        title={isOpen ? "Close NOVA Assistant" : "Activate NOVA Siri Assistant"}
      >
        {/* Pulsing Concentric Outer Rings */}
        <span className="absolute inset-0 rounded-full border border-white/40 animate-ping pointer-events-none" />
        <span className="absolute -inset-1 rounded-full border border-white/25 animate-pulse pointer-events-none" />

        {/* Central Core Icon */}
        <div className="relative flex items-center justify-center">
          <Zap className={`w-7 h-7 text-white transition-transform duration-300 ${isActive ? 'scale-110 rotate-12' : 'group-hover:scale-110'}`} />
        </div>

        {/* Status Indicator Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-white border-2 border-black shadow-[0_0_8px_#ffffff]" />
      </button>
    </div>
  );
}
