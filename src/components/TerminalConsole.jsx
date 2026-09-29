import React, { useState } from 'react';
import { Terminal, Shield, Play, Trash2, Copy, Check } from 'lucide-react';

export default function TerminalConsole({ onExecuteCmd, history = [] }) {
  const [cmd, setCmd] = useState('');
  const [copied, setCopied] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!cmd.trim()) return;
    onExecuteCmd(cmd);
    setCmd('');
  };

  const copyLogs = () => {
    const text = history.map(h => `$ ${h.cmd}\n${h.stdout || h.stderr}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="hud-panel p-6 flex flex-col items-center justify-center gap-4 w-full max-w-6xl mx-auto">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center gap-1 border-b border-cyan-500/30 pb-3 w-full">
        <div className="flex items-center justify-center gap-2">
          <Terminal className="w-5 h-5 text-amber-400" />
          <h2 className="font-hud font-bold text-base tracking-wider text-cyan-200">
            POWERSHELL / SYSTEM CLI CONSOLE
          </h2>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={copyLogs}
            className="p-1.5 px-3 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 hover:text-white transition text-xs flex items-center gap-1.5 font-mono-hud"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>COPY TERMINAL LOGS</span>
          </button>
        </div>
      </div>

      {/* Terminal View Output */}
      <div className="bg-[#02050b] p-4 rounded-lg border border-cyan-500/30 font-mono-hud text-xs min-h-[300px] max-h-[400px] overflow-y-auto flex flex-col gap-3 w-full">
        <div className="text-cyan-600 border-b border-cyan-950 pb-2 text-center">
          Microsoft Windows PowerShell [N.O.V.A. System Terminal Gateway]
          <br />
          Type commands directly or execute python scripts (`python nova_agent.py`).
        </div>

        {history.length === 0 ? (
          <div className="text-cyan-800 italic text-center py-10">
            Console output stream initialized. Standing by for command execution...
          </div>
        ) : (
          history.map((item, idx) => (
            <div key={idx} className="flex flex-col gap-1 border-b border-cyan-950/60 pb-2">
              <div className="flex items-center justify-between text-amber-300">
                <span className="flex items-center gap-2">
                  <span className="text-cyan-500">$</span> {item.cmd}
                </span>
                <span className="text-[10px] text-cyan-600">{item.durationMs}ms</span>
              </div>
              {item.stdout && (
                <pre className="text-emerald-300 bg-emerald-950/10 p-2.5 rounded whitespace-pre-wrap overflow-x-auto border border-emerald-500/10">
                  {item.stdout}
                </pre>
              )}
              {item.stderr && (
                <pre className="text-rose-400 bg-rose-950/20 p-2.5 rounded whitespace-pre-wrap overflow-x-auto border border-rose-500/20">
                  {item.stderr}
                </pre>
              )}
            </div>
          ))
        )}
      </div>

      {/* Command Input */}
      <form onSubmit={handleSubmit} className="flex gap-2 w-full">
        <div className="flex-1 relative flex items-center">
          <span className="absolute left-3 text-amber-400 font-mono-hud text-sm font-bold">$</span>
          <input
            type="text"
            value={cmd}
            onChange={(e) => setCmd(e.target.value)}
            placeholder="Type powershell command (e.g. dir, node -v, python jarvis_agent.py 'task')..."
            className="w-full bg-black/60 border border-cyan-500/40 rounded-lg pl-8 pr-4 py-2.5 text-sm text-cyan-100 placeholder-cyan-700 font-mono-hud focus:outline-none focus:border-amber-400"
          />
        </div>
        <button type="submit" className="btn-hud-gold px-6 py-2.5 rounded-lg font-hud font-bold text-xs">
          RUN
        </button>
      </form>
    </div>
  );
}
