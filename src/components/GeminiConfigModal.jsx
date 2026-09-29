import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Key, CheckCircle2, AlertCircle, RefreshCw, X, ShieldCheck, Cpu, ExternalLink, Eye, EyeOff, Zap, Server 
} from 'lucide-react';

export default function GeminiConfigModal({ isOpen, onClose, onConfigSaved }) {
  const [activeProvider, setActiveProvider] = useState('auto'); // 'auto', 'gemini', 'groq', 'native'
  const [geminiKeyInput, setGeminiKeyInput] = useState('');
  const [geminiModel, setGeminiModel] = useState('gemini-3.6-flash');
  const [groqKeyInput, setGroqKeyInput] = useState('');
  const [groqModel, setGroqModel] = useState('llama-3.3-70b-versatile');
  const [showKey, setShowKey] = useState(false);
  const [aiStatus, setAiStatus] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchAiStatus();
    }
  }, [isOpen]);

  const fetchAiStatus = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/ai/status');
      const data = await res.json();
      setAiStatus(data);
      if (data.provider) setActiveProvider(data.provider);
      if (data.gemini?.model) setGeminiModel(data.gemini.model);
      if (data.groq?.model) setGroqModel(data.groq.model);
      setTestResult(null);
    } catch (err) {
      setAiStatus({ error: err.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveConfig = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setTestResult(null);

    try {
      const res = await fetch('/api/ai/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          aiProvider: activeProvider,
          geminiApiKey: geminiKeyInput || undefined,
          geminiModel,
          groqApiKey: groqKeyInput || undefined,
          groqModel
        })
      });

      const data = await res.json();
      if (data.success) {
        setGeminiKeyInput('');
        setGroqKeyInput('');
        await fetchAiStatus();
        setTestResult({ success: true, message: 'AI Engine preferences saved successfully!' });
        if (onConfigSaved) onConfigSaved(data);
      }
    } catch (err) {
      setTestResult({ success: false, message: `Save error: ${err.message}` });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="hud-panel max-w-2xl w-full bg-black/95 border-2 border-white rounded-2xl shadow-[0_0_50px_rgba(255,255,255,0.4)] p-6 relative flex flex-col gap-5 font-mono text-white">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white p-1 rounded-full border border-white/30 hover:border-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-white/30 pb-3">
          <div className="p-2.5 bg-white/10 rounded-xl border border-white text-white shadow-[0_0_15px_#ffffff]">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="font-hud font-extrabold text-base tracking-wider text-white glow-white-text flex items-center gap-2">
              AI ENGINE & MULTI-API INTEGRATION
            </h2>
            <p className="text-xs text-zinc-400 font-mono-hud">
              GOOGLE GEMINI • GROQ CLOUD • RESILIENT AUTO-FALLBACK ARCHITECTURE
            </p>
          </div>
        </div>

        {/* Active Providers Status Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs font-mono-hud">
          {/* Gemini Status Card */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
            aiStatus?.gemini?.status === 'connected'
              ? 'bg-zinc-950 border-white/60 text-white'
              : 'bg-black border-white/20 text-zinc-400'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-white">
                <Sparkles className="w-3.5 h-3.5" />
                GOOGLE GEMINI
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                aiStatus?.gemini?.status === 'connected' ? 'bg-white text-black shadow-[0_0_8px_#ffffff]' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {aiStatus?.gemini?.status === 'connected' ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] opacity-80">
              {aiStatus?.gemini?.status === 'connected' ? `Model: ${aiStatus.gemini.model} (${aiStatus.gemini.maskedKey})` : 'Gemini Key configured'}
            </p>
          </div>

          {/* Groq Status Card */}
          <div className={`p-3 rounded-xl border flex flex-col gap-1 ${
            aiStatus?.groq?.status === 'connected'
              ? 'bg-zinc-950 border-white/60 text-white'
              : 'bg-black border-white/20 text-zinc-400'
          }`}>
            <div className="flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-white">
                <Zap className="w-3.5 h-3.5" />
                GROQ CLOUD (FREE)
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                aiStatus?.groq?.status === 'connected' ? 'bg-white text-black shadow-[0_0_8px_#ffffff]' : 'bg-zinc-800 text-zinc-400'
              }`}>
                {aiStatus?.groq?.status === 'connected' ? 'ACTIVE' : 'STANDBY'}
              </span>
            </div>
            <p className="text-[11px] opacity-80">
              {aiStatus?.groq?.status === 'connected' ? `Model: ${aiStatus.groq.model} (${aiStatus.groq.maskedKey})` : 'Free Groq key (Llama 3.3 70B)'}
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSaveConfig} className="flex flex-col gap-4">
          
          {/* Provider Selection Tabs */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-hud font-bold text-white flex items-center gap-1.5">
              <Cpu className="w-4 h-4 text-white" />
              PRIMARY AI PROVIDER & STRATEGY
            </label>
            <div className="grid grid-cols-3 gap-2 text-xs font-hud font-bold">
              <button
                type="button"
                onClick={() => setActiveProvider('auto')}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  activeProvider === 'auto'
                    ? 'bg-zinc-900 border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'border-white/20 bg-black text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 mx-auto mb-1 text-white" />
                AUTO-FALLBACK (RECOMMENDED)
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider('gemini')}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  activeProvider === 'gemini'
                    ? 'bg-zinc-900 border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'border-white/20 bg-black text-zinc-400 hover:text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 mx-auto mb-1 text-white" />
                GOOGLE GEMINI ONLY
              </button>

              <button
                type="button"
                onClick={() => setActiveProvider('groq')}
                className={`p-2.5 rounded-lg border text-center transition cursor-pointer ${
                  activeProvider === 'groq'
                    ? 'bg-zinc-900 border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
                    : 'border-white/20 bg-black text-zinc-400 hover:text-white'
                }`}
              >
                <Zap className="w-4 h-4 mx-auto mb-1 text-white" />
                GROQ CLOUD (FREE)
              </button>
            </div>
          </div>

          {/* Gemini Key Input */}
          <div className="flex flex-col gap-1 bg-black p-3 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-hud font-bold text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-white" />
                1. GOOGLE GEMINI API KEY
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-zinc-300 hover:underline flex items-center gap-1"
              >
                Get Free Gemini Key <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type={showKey ? 'text' : 'password'}
              value={geminiKeyInput}
              onChange={(e) => setGeminiKeyInput(e.target.value)}
              placeholder={aiStatus?.gemini?.maskedKey ? `Configured: ${aiStatus.gemini.maskedKey}` : 'Paste AIza... key here'}
              className="bg-zinc-950 border border-white/40 rounded px-3 py-1.5 text-xs text-white font-mono-hud focus:outline-none focus:border-white shadow-inner"
            />
          </div>

          {/* Groq Key Input */}
          <div className="flex flex-col gap-1 bg-black p-3 rounded-xl border border-white/20">
            <div className="flex items-center justify-between">
              <label className="text-xs font-hud font-bold text-white flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-white" />
                2. GROQ CLOUD API KEY (ULTRA FAST & FREE FALLBACK)
              </label>
              <a
                href="https://console.groq.com/keys"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] text-zinc-300 hover:underline flex items-center gap-1"
              >
                Get Free Groq Key (10 sec) <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <input
              type={showKey ? 'text' : 'password'}
              value={groqKeyInput}
              onChange={(e) => setGroqKeyInput(e.target.value)}
              placeholder={aiStatus?.groq?.maskedKey ? `Configured: ${aiStatus.groq.maskedKey}` : 'Paste gsk_... key here'}
              className="bg-zinc-950 border border-white/40 rounded px-3 py-1.5 text-xs text-white font-mono-hud focus:outline-none focus:border-white shadow-inner"
            />
          </div>

          {testResult && (
            <div className={`p-2.5 rounded-lg border text-xs font-mono-hud ${
              testResult.success ? 'bg-zinc-900 border-white/40 text-white' : 'bg-rose-950/60 border-rose-500/40 text-rose-200'
            }`}>
              {testResult.message}
            </div>
          )}

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/20">
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="px-3 py-1.5 rounded border border-white/30 text-zinc-300 text-xs font-mono-hud hover:text-white cursor-pointer"
            >
              {showKey ? 'Hide Keys' : 'Show Keys'}
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="btn-hud-white px-5 py-2 text-xs flex items-center gap-1.5 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>SAVE & APPLY AI ENGINE</span>
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
