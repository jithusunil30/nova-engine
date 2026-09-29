import React, { useState } from 'react';
import { 
  Database, Shield, Trash2, Plus, Brain, Sparkles, 
  RotateCcw, Rocket, Terminal, Code2, Globe, CheckCircle2 
} from 'lucide-react';

export default function MemoryMatrix({ memoryData, onSaveKnowledge, onDeleteKnowledge, onUpdatePreferences }) {
  const [newFact, setNewFact] = useState('');
  const [category, setCategory] = useState('user_directive');
  const [activeTab, setActiveTab] = useState('memories'); // 'memories', 'history', 'preferences'
  const [statusMsg, setStatusMsg] = useState('');

  if (!memoryData) return null;

  const { preferences, memories = [], conversationHistory = [], userProfile } = memoryData;

  const handleAddMemory = async (e) => {
    e.preventDefault();
    if (!newFact.trim()) return;

    try {
      const res = await fetch('/api/memory/memories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fact: newFact, category })
      });
      const data = await res.json();
      if (data.success) {
        setStatusMsg('Memory committed to GPT long-term storage.');
        setNewFact('');
        setTimeout(() => setStatusMsg(''), 3000);
      }
    } catch (err) {
      setStatusMsg(`Error saving memory: ${err.message}`);
    }
  };

  const handleDeleteMemory = async (id) => {
    try {
      await fetch(`/api/memory/memories/${id}`, { method: 'DELETE' });
      setStatusMsg('Memory entry purged.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {}
  };

  const handleClearHistory = async () => {
    if (!window.confirm('Clear conversation context buffer? Long-term memories will be preserved.')) return;
    try {
      await fetch('/api/memory/clear-history', { method: 'POST' });
      setStatusMsg('Conversation context buffer cleared.');
      setTimeout(() => setStatusMsg(''), 3000);
    } catch (err) {}
  };

  return (
    <div className="hud-panel p-6 flex flex-col items-center justify-center gap-5 w-full max-w-6xl mx-auto">
      
      {/* ─── Header: GPT Memory Matrix ─── */}
      <div className="flex flex-col items-center text-center gap-1.5 border-b border-cyan-500/30 pb-4 w-full">
        <div className="flex items-center justify-center gap-2">
          <Brain className="w-6 h-6 text-purple-400 animate-pulse" />
          <h2 className="font-hud font-extrabold text-lg tracking-wider text-cyan-200 text-glow-cyan">
            GPT-STYLE CONTEXTUAL & LONG-TERM MEMORY ENGINE
          </h2>
        </div>
        <p className="font-mono-hud text-xs text-cyan-400 tracking-wider">
          CONTINUOUS CONTEXT BUFFER • PERSISTENT FACTS & PREFERENCES • STACK INTELLIGENCE
        </p>

        {/* User Callsign & Connected Stack Banner */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-bold text-cyan-200">
            <span>CALLSIGN:</span>
            <span className="text-amber-300">JITHU</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/60 border border-cyan-500/40 text-xs font-bold text-cyan-200">
            <span>AI CORE:</span>
            <span className="text-cyan-400">N.O.V.A.</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-950/40 border border-purple-500/40 text-xs text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>{memories.length} LONG-TERM MEMORIES STORED</span>
          </div>
        </div>

        {statusMsg && (
          <div className="mt-2 text-xs font-mono-hud text-amber-300 bg-amber-950/40 px-4 py-1 rounded-full border border-amber-500/40 animate-pulse">
            {statusMsg}
          </div>
        )}
      </div>

      {/* ─── Tabs: Memories / Conversation Context / Safety & Settings ─── */}
      <div className="flex items-center gap-2 border-b border-cyan-500/20 pb-2 w-full justify-center text-xs font-hud font-bold">
        <button
          onClick={() => setActiveTab('memories')}
          className={`px-4 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'memories'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'border-cyan-500/20 text-cyan-500 hover:text-cyan-300'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>STORED MEMORIES ({memories.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'history'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'border-cyan-500/20 text-cyan-500 hover:text-cyan-300'
          }`}
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>CONTEXT BUFFER ({conversationHistory.length} TURNS)</span>
        </button>

        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'preferences'
              ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.3)]'
              : 'border-cyan-500/20 text-cyan-500 hover:text-cyan-300'
          }`}
        >
          <Shield className="w-3.5 h-3.5" />
          <span>SAFETY & IDENTITY</span>
        </button>
      </div>

      {/* ─── TAB 1: STORED MEMORIES ─── */}
      {activeTab === 'memories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
          {/* Add New Memory Card */}
          <div className="md:col-span-1 flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-cyan-500/25">
            <span className="font-hud font-bold text-xs text-cyan-200 border-b border-cyan-500/20 pb-2 flex items-center gap-1.5">
              <Plus className="w-4 h-4 text-amber-400" />
              ADD NEW MEMORY / FACT
            </span>
            <p className="text-[11px] font-mono-hud text-cyan-400/80">
              N.O.V.A. remembers your directives across sessions just like ChatGPT.
            </p>

            <form onSubmit={handleAddMemory} className="flex flex-col gap-2.5">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="bg-black/80 border border-cyan-500/30 rounded px-3 py-2 text-xs text-cyan-200 font-mono-hud focus:outline-none"
              >
                <option value="user_directive">User Directive</option>
                <option value="user_preference">User Preference</option>
                <option value="tools">Tool & Workspace</option>
                <option value="database">Database & Schema</option>
                <option value="programming">Programming & Scripts</option>
              </select>

              <textarea
                rows={3}
                value={newFact}
                onChange={(e) => setNewFact(e.target.value)}
                placeholder="e.g. 'I am working on Cassandra clustering in Python', 'Always launch Antigravity with workspace'... "
                className="bg-black/80 border border-cyan-500/30 rounded px-3 py-2 text-xs text-cyan-100 placeholder-cyan-700 font-mono-hud focus:outline-none focus:border-cyan-400"
              />

              <button
                type="submit"
                className="btn-hud py-2.5 rounded-lg text-xs font-hud font-bold flex items-center justify-center gap-1.5 shadow-md"
              >
                <Brain className="w-4 h-4" /> COMMIT TO MEMORY
              </button>
            </form>

            {/* Quick Auto-Memory Tips */}
            <div className="mt-2 p-2.5 rounded bg-cyan-950/30 border border-cyan-500/15 text-[10px] font-mono-hud text-cyan-400/90 leading-relaxed">
              <span className="font-bold text-cyan-300 block mb-1">💡 Auto-Memory in Chat:</span>
              Say <em>"Remember that..."</em>, <em>"My favorite..."</em>, or <em>"I am working on..."</em> in the HUD chat pill and NOVA will automatically save it!
            </div>
          </div>

          {/* Stored Memories List */}
          <div className="md:col-span-2 flex flex-col gap-3 bg-black/40 p-4 rounded-xl border border-cyan-500/25 max-h-[460px] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
              <span className="font-hud font-bold text-xs text-cyan-200">ACTIVE MEMORY ITEMS</span>
              <span className="font-mono-hud text-xs text-amber-300">{memories.length} SAVED</span>
            </div>

            <div className="flex flex-col gap-2">
              {memories.map((m) => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg bg-black/60 border border-cyan-500/20 hover:border-cyan-400/50 transition flex items-start justify-between gap-3 group"
                >
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] font-bold uppercase px-2 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono-hud">
                        {m.category || 'FACT'}
                      </span>
                      <span className="text-[10px] text-cyan-600 font-mono-hud">
                        {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-xs text-cyan-100 font-mono-hud leading-relaxed">
                      {m.fact}
                    </span>
                  </div>

                  <button
                    onClick={() => handleDeleteMemory(m.id)}
                    className="text-rose-400 hover:text-rose-200 p-1.5 opacity-60 group-hover:opacity-100 transition cursor-pointer"
                    title="Purge Memory"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── TAB 2: CONTEXT BUFFER & CONVERSATION HISTORY ─── */}
      {activeTab === 'history' && (
        <div className="flex flex-col gap-4 w-full bg-black/40 p-5 rounded-xl border border-cyan-500/25">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
            <div>
              <span className="font-hud font-bold text-sm text-cyan-200 block">
                MULTI-TURN DIALOGUE BUFFER (GPT CONTEXT)
              </span>
              <span className="font-mono-hud text-xs text-cyan-400/80">
                NOVA retains the last 50 dialogue turns to provide contextual multi-turn answers.
              </span>
            </div>

            <button
              onClick={handleClearHistory}
              className="px-3.5 py-1.5 rounded-lg border border-rose-500/40 bg-rose-950/30 text-rose-300 hover:bg-rose-900/50 hover:text-white font-hud text-xs font-bold flex items-center gap-1.5 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> CLEAR CONTEXT
            </button>
          </div>

          <div className="flex flex-col gap-3 max-h-[380px] overflow-y-auto pr-2">
            {conversationHistory.length === 0 ? (
              <div className="text-center py-10 font-mono-hud text-xs text-cyan-600">
                Conversation context is fresh. Issue directives to begin.
              </div>
            ) : (
              conversationHistory.map((item, idx) => (
                <div key={idx} className="p-3.5 rounded-lg bg-black/70 border border-cyan-500/20 flex flex-col gap-1.5 font-mono-hud text-xs">
                  <div className="flex items-center justify-between text-cyan-500 text-[10px]">
                    <span className="font-bold text-amber-300">USER: {preferences.userName}</span>
                    <span>{new Date(item.timestamp).toLocaleString()}</span>
                  </div>
                  <div className="text-cyan-100 font-semibold pl-2 border-l-2 border-amber-400">
                    "{item.prompt}"
                  </div>
                  <div className="text-cyan-300 text-[11px] pl-2 border-l-2 border-cyan-500 mt-1 whitespace-pre-wrap leading-relaxed">
                    <span className="font-bold text-cyan-400">N.O.V.A.:</span> {item.response}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ─── TAB 3: SAFETY & USER IDENTITY ─── */}
      {activeTab === 'preferences' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          {/* Safety Selector */}
          <div className="bg-black/40 p-5 rounded-xl border border-cyan-500/25 flex flex-col gap-3">
            <span className="font-hud font-bold text-xs text-cyan-200 border-b border-cyan-500/20 pb-2">
              AGENT SAFETY EXECUTION MODE
            </span>
            <div className="grid grid-cols-3 gap-2 font-hud text-xs">
              {[
                { level: 'strict', label: 'STRICT', desc: 'Confirm every action' },
                { level: 'ask', label: 'CONFIRM', desc: 'Confirm mutative commands' },
                { level: 'autonomous', label: 'AUTONOMOUS', desc: 'Execute tools freely' }
              ].map((opt) => (
                <button
                  key={opt.level}
                  onClick={() => onUpdatePreferences({ safetyLevel: opt.level })}
                  className={`py-2 px-3 rounded-lg border text-center transition font-bold cursor-pointer ${
                    preferences.safetyLevel === opt.level
                      ? 'bg-cyan-500/30 border-cyan-400 text-cyan-200 shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                      : 'bg-cyan-950/20 border-cyan-500/20 text-cyan-500 hover:text-cyan-300'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            <div className="text-[11px] font-mono-hud text-cyan-400/90 bg-cyan-950/40 p-3 rounded-lg border border-cyan-500/10 leading-relaxed">
              {preferences.safetyLevel === 'strict' && 'Strict: Requires user approval modal before executing any system terminal command.'}
              {preferences.safetyLevel === 'ask' && 'Confirm: Asks confirmation for system mutation commands; allows standard queries.'}
              {preferences.safetyLevel === 'autonomous' && 'Autonomous: ReAct loop executes shell, file, and app tools automatically while auditing to nova_audit.log.'}
            </div>
          </div>

          {/* User Callsign */}
          <div className="bg-black/40 p-5 rounded-xl border border-cyan-500/25 flex flex-col gap-4 font-mono-hud text-xs">
            <span className="font-hud font-bold text-xs text-cyan-200 border-b border-cyan-500/20 pb-2">
              USER IDENTITY CONFIGURATION
            </span>

            <div className="flex items-center justify-between">
              <span className="text-cyan-400 font-bold">USER CALLSIGN / NAME:</span>
              <input
                type="text"
                value={preferences.userName}
                onChange={(e) => onUpdatePreferences({ userName: e.target.value })}
                className="bg-black/60 border border-cyan-500/30 rounded px-3 py-1.5 text-amber-300 text-right font-hud font-bold focus:outline-none focus:border-cyan-400"
              />
            </div>

            {/* Connected Stack Summary */}
            <div className="flex flex-col gap-2 pt-2 border-t border-cyan-500/15 text-[11px]">
              <span className="font-bold text-cyan-300">INTEGRATED TECH STACK:</span>
              <div className="grid grid-cols-2 gap-2">
                <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-1.5">
                  <Rocket className="w-3 h-3 text-cyan-400" />
                  <span>Antigravity IDE</span>
                </div>
                <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-1.5">
                  <Database className="w-3 h-3 text-amber-400" />
                  <span>Cassandra 3.11</span>
                </div>
                <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-1.5">
                  <Terminal className="w-3 h-3 text-emerald-400" />
                  <span>Python 3.13</span>
                </div>
                <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-1.5">
                  <Code2 className="w-3 h-3 text-blue-400" />
                  <span>VS Code</span>
                </div>
                <div className="p-2 rounded bg-cyan-950/30 border border-cyan-500/20 flex items-center gap-1.5 col-span-2">
                  <Globe className="w-3 h-3 text-cyan-400" />
                  <span>Google Chrome Browser</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
