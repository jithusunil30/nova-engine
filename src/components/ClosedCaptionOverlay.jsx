import React, { useState } from 'react';
import { VolumeX, Subtitles, X, Maximize2, Minimize2 } from 'lucide-react';

export default function ClosedCaptionOverlay({ 
  isSpeaking, 
  captionText, 
  charIndex = 0, 
  charLength = 0,
  ccEnabled = true, 
  onToggleCc,
  onMuteToggle 
}) {
  const [isMinimized, setIsMinimized] = useState(false);

  // ONLY render when CC is enabled AND N.O.V.A. is actively speaking!
  if (!ccEnabled || !isSpeaking) {
    return null;
  }

  const displayText = captionText || '';
  if (!displayText) {
    return null;
  }

  // Calculate highlighted text slice for real-time karaoke closed captioning
  let beforeText = displayText;
  let highlightedWord = '';
  let afterText = '';

  if (charIndex >= 0 && charIndex < displayText.length) {
    const start = charIndex;
    const end = charLength > 0 ? charIndex + charLength : displayText.indexOf(' ', start);
    const safeEnd = end > start ? end : (displayText.indexOf(' ', start) !== -1 ? displayText.indexOf(' ', start) : displayText.length);

    beforeText = displayText.slice(0, start);
    highlightedWord = displayText.slice(start, safeEnd);
    afterText = displayText.slice(safeEnd);
  }

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5">
      <div className="bg-black/98 backdrop-blur-md border-2 border-white rounded-2xl p-4 shadow-[0_0_40px_rgba(255,255,255,0.45)] flex flex-col gap-2.5 relative">
        
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-white/30 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg border bg-white/10 border-white text-white shadow-[0_0_10px_#ffffff] animate-pulse">
              <Subtitles className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="font-hud font-bold text-xs tracking-wider text-white flex items-center gap-2 glow-white-text">
                N.O.V.A. CLOSED CAPTION
                <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-mono font-bold bg-white text-black shadow-[0_0_8px_#ffffff]">
                  SPEAKING LIVE
                </span>
              </span>
              <span className="text-[10px] text-zinc-400 font-mono tracking-widest">
                LIVE VOICE TRANSMISSION CAPTIONS
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Audio Wave Visualizer (Fluorescent White) */}
            <div className="flex items-center gap-1 px-2 py-1 bg-zinc-900 rounded border border-white/30">
              {[40, 80, 50, 90, 60, 30].map((h, i) => (
                <div
                  key={i}
                  className="w-0.5 rounded-full transition-all duration-150 bg-white shadow-[0_0_6px_#ffffff] animate-pulse"
                  style={{ height: `${Math.random() * 12 + 4}px` }}
                />
              ))}
            </div>

            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 text-zinc-300 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
              title={isMinimized ? "Expand Captions Box" : "Minimize Captions Box"}
            >
              {isMinimized ? <Maximize2 className="w-3.5 h-3.5" /> : <Minimize2 className="w-3.5 h-3.5" />}
            </button>

            {onMuteToggle && (
              <button
                onClick={onMuteToggle}
                className="p-1.5 text-rose-400 hover:text-rose-200 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
                title="Mute Audio Speech"
              >
                <VolumeX className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={onToggleCc}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition cursor-pointer"
              title="Hide Closed Captions"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Captions Text Display Body */}
        {!isMinimized && (
          <div className="bg-zinc-950 rounded-xl p-3.5 border border-white/25 text-xs sm:text-sm font-mono leading-relaxed max-h-36 overflow-y-auto shadow-inner">
            <div className="text-white tracking-wide select-text">
              <span className="text-white font-bold mr-2 glow-white-text">[NOVA]:</span>
              {highlightedWord ? (
                <>
                  <span>{beforeText}</span>
                  <mark className="bg-white text-black px-1.5 py-0.5 rounded font-bold shadow-[0_0_12px_#ffffff]">
                    {highlightedWord}
                  </mark>
                  <span>{afterText}</span>
                </>
              ) : (
                <span>{displayText}</span>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
