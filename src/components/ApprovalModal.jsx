import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

export default function ApprovalModal({ command, onApprove, onDeny }) {
  if (!command) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in">
      <div className="hud-panel max-w-lg w-full p-6 flex flex-col gap-4 bg-black/95 border-2 border-white shadow-[0_0_50px_rgba(255,255,255,0.35)]">
        <div className="flex items-center gap-3 border-b border-white/30 pb-3">
          <ShieldAlert className="w-7 h-7 text-white animate-pulse shadow-[0_0_12px_#ffffff]" />
          <div>
            <h3 className="font-hud font-bold text-base text-white tracking-wider glow-white-text">
              SECURITY SHIELD APPROVAL REQUIRED
            </h3>
            <p className="text-xs font-mono-hud text-zinc-300">
              Under strict safety policy, high-privilege system command requires manual authorization.
            </p>
          </div>
        </div>

        <div className="bg-zinc-950 p-3.5 rounded border border-white/30 font-mono-hud text-xs text-white overflow-x-auto shadow-inner">
          <span className="text-white font-bold">$ </span>{command}
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            onClick={onDeny}
            className="px-4 py-2 rounded bg-zinc-900 border border-white/30 text-zinc-300 hover:bg-zinc-800 hover:text-white transition text-xs font-hud font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <X className="w-4 h-4" /> ABORT & DENY
          </button>
          <button
            onClick={onApprove}
            className="btn-hud-white px-5 py-2 rounded text-xs font-hud font-bold flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-4 h-4" /> AUTHORIZE & EXECUTE
          </button>
        </div>
      </div>
    </div>
  );
}
