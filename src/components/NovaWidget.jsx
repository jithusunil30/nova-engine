import React, { useState } from 'react';
import { 
  Zap, Camera, Volume2, Volume1, VolumeX, 
  Lock, Play, X, Sparkles, Cpu, ExternalLink
} from 'lucide-react';

export default function NovaWidget({ onRunDirective, sysInfo }) {
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');

  // Quick Action execution from widget
  const handleQuickLaunch = async (appName) => {
    setStatusMsg(`Launching ${appName}...`);
    try {
      const res = await fetch('/api/system/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appName })
      });
      const data = await res.json();
      setStatusMsg(data.success ? `Launched ${appName}` : `Error: ${data.error}`);
    } catch (err) {
      setStatusMsg(`Failed: ${err.message}`);
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleCaptureScreen = async () => {
    setStatusMsg('Capturing desktop...');
    try {
      const res = await fetch('/api/system/screenshot', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        setStatusMsg('Desktop screenshot saved!');
      }
    } catch (err) {
      setStatusMsg('Screenshot failed');
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleControlAction = async (action) => {
    setStatusMsg(`Executing ${action}...`);
    try {
      const res = await fetch('/api/system/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setStatusMsg(data.message || 'Executed action');
    } catch (err) {
      setStatusMsg(`Failed: ${err.message}`);
    }
    setTimeout(() => setStatusMsg(''), 3000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!prompt.trim() || isExecuting) return;
    const userCmd = prompt;
    setPrompt('');
    setIsExecuting(true);
    setStatusMsg('Processing directive...');
    try {
      await onRunDirective(userCmd);
      setStatusMsg('Directive completed');
    } catch (err) {
      setStatusMsg(`Error: ${err.message}`);
    } finally {
      setIsExecuting(false);
      setTimeout(() => setStatusMsg(''), 3000);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 pointer-events-auto select-none font-hud">
      {/* Expanded Quick Access Floating Widget Overlay */}
      {isOpen && (
        <div className="hud-panel p-4 rounded-xl w-80 sm:w-96 flex flex-col gap-3.5 shadow-[0_0_40px_rgba(0,240,255,0.4)] border border-cyan-400/60 bg-[#050b18]/90 backdrop-blur-xl animate-in slide-in-from-bottom-5 duration-300">
          {/* Widget Header */}
          <div className="flex items-center justify-between border-b border-cyan-500/30 pb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-cyan-950 border border-cyan-400 flex items-center justify-center shadow-[0_0_10px_rgba(0,240,255,0.6)]">
                <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              </div>
              <div>
                <h3 className="font-bold text-xs tracking-wider text-cyan-200 text-glow-cyan">
                  N.O.V.A. QUICK WIDGET
                </h3>
                <p className="font-mono-hud text-[10px] text-cyan-400 tracking-widest uppercase">
                  ALWAYS-ON OS ACCESS HUB
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-full bg-cyan-950/60 border border-cyan-500/30 text-cyan-400 hover:text-white hover:border-cyan-400 transition"
              title="Minimize Widget"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Stats Pill */}
          {sysInfo && (
            <div className="flex items-center justify-between bg-black/60 px-3 py-1.5 rounded-lg border border-cyan-500/20 font-mono-hud text-[11px] text-cyan-300">
              <span className="flex items-center gap-1">
                <Cpu className="w-3.5 h-3.5 text-amber-400" /> CPU: {sysInfo.cpu?.load || 0}%
              </span>
              <span className="flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-cyan-400" /> RAM: {sysInfo.memory?.percent || 0}%
              </span>
              <span className="flex items-center gap-1 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> ONLINE
              </span>
            </div>
          )}

          {/* Fast Directive Input Bar */}
          <form onSubmit={handleSubmit} className="flex gap-1.5">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Directive (e.g. 'open notepad', 'screenshot')..."
              className="flex-1 bg-black/70 border border-cyan-500/40 rounded-lg px-3 py-2 text-xs text-cyan-100 placeholder-cyan-700 font-mono-hud focus:outline-none focus:border-cyan-400"
            />
            <button
              type="submit"
              disabled={isExecuting}
              className="btn-hud px-3 py-2 rounded-lg flex items-center justify-center text-xs font-bold"
            >
              {isExecuting ? <Sparkles className="w-3.5 h-3.5 animate-spin text-amber-400" /> : <Play className="w-3.5 h-3.5" />}
            </button>
          </form>

          {/* Status Message Indicator */}
          {statusMsg && (
            <div className="text-[11px] font-mono-hud text-amber-300 bg-amber-950/40 px-3 py-1 rounded border border-amber-500/30 text-center animate-pulse">
              {statusMsg}
            </div>
          )}

          {/* 1-Click Quick System Access Grid */}
          <div className="flex flex-col gap-1.5">
            <span className="font-hud text-[10px] text-cyan-400 tracking-wider">SYSTEM ACTIONS & LAUNCHERS</span>
            <div className="grid grid-cols-4 gap-1.5 font-mono-hud text-[11px]">
              <button
                onClick={handleCaptureScreen}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-900/50 text-cyan-200 transition"
                title="Take Desktop Screenshot"
              >
                <Camera className="w-4 h-4 text-cyan-400" />
                <span className="text-[9px] mt-0.5">Shot</span>
              </button>

              <button
                onClick={() => handleQuickLaunch('notepad')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-900/50 text-cyan-200 transition"
                title="Launch Notepad"
              >
                <span className="text-sm">📝</span>
                <span className="text-[9px] mt-0.5">Notepad</span>
              </button>

              <button
                onClick={() => handleQuickLaunch('calc')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-900/50 text-cyan-200 transition"
                title="Launch Calculator"
              >
                <span className="text-sm">🧮</span>
                <span className="text-[9px] mt-0.5">Calc</span>
              </button>

              <button
                onClick={() => handleQuickLaunch('explorer')}
                className="flex flex-col items-center justify-center p-2 rounded-lg bg-cyan-950/50 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-900/50 text-cyan-200 transition"
                title="Launch File Explorer"
              >
                <span className="text-sm">📁</span>
                <span className="text-[9px] mt-0.5">Explorer</span>
              </button>

              <button
                onClick={() => handleControlAction('volume_up')}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/25 hover:border-emerald-400 hover:bg-cyan-900/50 text-cyan-200 transition"
                title="Volume Up (+5%)"
              >
                <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px]">Vol +</span>
              </button>

              <button
                onClick={() => handleControlAction('volume_down')}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/25 hover:border-amber-400 hover:bg-cyan-900/50 text-cyan-200 transition"
                title="Volume Down (-5%)"
              >
                <Volume1 className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px]">Vol -</span>
              </button>

              <button
                onClick={() => handleControlAction('volume_mute')}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-cyan-950/50 border border-cyan-500/25 hover:border-rose-400 hover:bg-cyan-900/50 text-cyan-200 transition"
                title="Toggle Mute"
              >
                <VolumeX className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[9px]">Mute</span>
              </button>

              <button
                onClick={() => handleControlAction('lock_workstation')}
                className="flex flex-col items-center justify-center p-1.5 rounded-lg bg-rose-950/40 border border-rose-500/30 hover:border-rose-400 hover:bg-rose-900/50 text-rose-300 transition"
                title="Lock Computer"
              >
                <Lock className="w-3.5 h-3.5 text-rose-400" />
                <span className="text-[9px]">Lock PC</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Arc Reactor Orb Button Trigger (Always Visible) */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full bg-[#050b18] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_25px_rgba(0,240,255,0.7)] hover:shadow-[0_0_35px_rgba(0,240,255,1)] hover:scale-110 active:scale-95 transition-all duration-300 group cursor-pointer relative"
        title={isOpen ? "Close NOVA Widget" : "Open NOVA Quick Access Widget"}
      >
        {/* Pulsing Outer HUD Rings */}
        <span className="absolute inset-0 rounded-full border border-cyan-400/40 animate-ping pointer-events-none" />
        <span className="absolute -inset-1 rounded-full border border-cyan-500/30 animate-pulse pointer-events-none" />
        
        {/* Arc Core Emblem */}
        <div className="relative flex items-center justify-center">
          <Zap className="w-7 h-7 text-cyan-300 group-hover:text-amber-300 transition-colors animate-pulse" />
        </div>

        {/* Small Status Badge Dot */}
        <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-black" />
      </button>
    </div>
  );
}
