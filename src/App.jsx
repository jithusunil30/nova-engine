import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Terminal, Activity, Folder, Database, Monitor, LayoutGrid, X, Subtitles
} from 'lucide-react';
import NovaHudCore from './components/NovaHudCore';
import AgentWorkbench from './components/AgentWorkbench';
import TerminalConsole from './components/TerminalConsole';
import TelemetryDashboard from './components/TelemetryDashboard';
import FileExplorer from './components/FileExplorer';
import MemoryMatrix from './components/MemoryMatrix';
import SystemControlDeck from './components/SystemControlDeck';
import ApprovalModal from './components/ApprovalModal';
import HudPopUpModal from './components/HudPopUpModal';
import GeminiConfigModal from './components/GeminiConfigModal';
import ClosedCaptionOverlay from './components/ClosedCaptionOverlay';

export default function App() {
  const [activeTab, setActiveTab] = useState('hud'); // 'hud', 'agent', 'system', 'terminal', 'telemetry', 'files', 'memory'
  const [showNavDrawer, setShowNavDrawer] = useState(false);
  const [agentState, setAgentState] = useState('idle'); // 'idle', 'executing', 'alert'
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentSteps, setCurrentSteps] = useState([]);
  const [responseText, setResponseText] = useState('');
  const [sysInfo, setSysInfo] = useState(null);
  const [processes, setProcesses] = useState([]);
  const [terminalHistory, setTerminalHistory] = useState([]);
  const [lastPrompt, setLastPrompt] = useState('');
  const [memoryData, setMemoryData] = useState(null);
  const [pendingApprovalCmd, setPendingApprovalCmd] = useState(null);
  const [isPopUpOpen, setIsPopUpOpen] = useState(false);
  const [isGeminiModalOpen, setIsGeminiModalOpen] = useState(false);
  const [geminiStatus, setGeminiStatus] = useState(null);

  // Closed Caption (CC) State
  const [ccEnabled, setCcEnabled] = useState(true);
  const [captionText, setCaptionText] = useState('');
  const [charIndex, setCharIndex] = useState(0);
  const [charLength, setCharLength] = useState(0);

  // Speech Output Helper with Real-Time Closed Captioning
  const speakText = (text) => {
    if (!text) return;
    const cleanText = text
      .replace(/```[\s\S]*?```/g, 'Code block provided in transmission.')
      .replace(/[*#`_~]/g, '')
      .replace(/https?:\/\/\S+/g, 'web link')
      .slice(0, 450);

    setCaptionText(cleanText);
    setCharIndex(0);
    setCharLength(0);

    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.rate = 1.05;
      utterance.pitch = 1.0;

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utterance.onboundary = (event) => {
        if (event.charIndex !== undefined) {
          setCharIndex(event.charIndex);
          setCharLength(event.charLength || 0);
        }
      };

      window.speechSynthesis.speak(utterance);
    } catch (e) {}
  };


  // Fetch System Info & Memory Data on Mount
  useEffect(() => {
    fetchSysInfo();
    fetchMemory();
    fetchGeminiStatus();

    // WebSocket Telemetry Connection
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.hostname}:3001/ws`;
    const ws = new WebSocket(wsUrl);

    ws.onmessage = (event) => {
      try {
        const msg = JSON.parse(event.data);
        if (msg.type === 'TELEMETRY' && sysInfo) {
          setSysInfo(prev => prev ? {
            ...prev,
            cpu: { ...prev.cpu, load: msg.data.cpuLoad },
            memory: { ...prev.memory, percent: msg.data.memPercent }
          } : prev);
        } else if (msg.type === 'PROACTIVE_ALERT') {
          const alertMsg = `⏰ **[PROACTIVE REMINDER]**: ${msg.message}`;
          setResponseText(alertMsg);
          setIsPopUpOpen(true);
          speakText(`Reminder for Jithu: ${msg.message}`);
          setCurrentSteps([
            { phase: 'THOUGHT', message: 'Proactive daemon timer triggered scheduled event.' },
            { phase: 'OBSERVATION', output: msg.message },
            { phase: 'CONCLUSION', output: 'Dispatched alert to HUD and voice engine.' }
          ]);
        }
      } catch (e) {}
    };

    return () => {
      ws.close();
    };
  }, []);

  const fetchGeminiStatus = async () => {
    try {
      const res = await fetch('/api/gemini/status');
      const data = await res.json();
      setGeminiStatus(data);
    } catch (e) {}
  };

  // Synchronize captionText whenever responseText changes
  useEffect(() => {
    if (responseText) {
      const clean = responseText
        .replace(/```[\s\S]*?```/g, 'Code block output attached.')
        .replace(/[*#`_~]/g, '')
        .replace(/https?:\/\/\S+/g, 'web link')
        .slice(0, 450);
      setCaptionText(clean);
    }
  }, [responseText]);

  const fetchSysInfo = async () => {
    try {
      const [infoRes, procRes] = await Promise.all([
        fetch('/api/system/info'),
        fetch('/api/system/processes')
      ]);
      const info = await infoRes.json();
      const procs = await procRes.json();
      setSysInfo(info);
      setProcesses(procs.list || []);
    } catch (err) {
      console.warn('Backend connecting...', err);
      setSysInfo({
        cpu: { brand: 'Intel Core i7 / AMD Ryzen', cores: 8, load: 24 },
        memory: { total: 17179869184, free: 8589934592, used: 8589934592, percent: 50 },
        os: { distro: 'Windows 11', hostname: 'NOVA-COMMAND-CORE' },
        disk: [{ fs: 'C:', usePercent: 83 }]
      });
    }
  };

  const fetchMemory = async () => {
    try {
      const res = await fetch('/api/memory');
      const data = await res.json();
      setMemoryData(data);
    } catch (err) {}
  };

  // Run Agent Directive
  const handleRunDirective = async (prompt) => {
    setLastPrompt(prompt);
    setAgentState('executing');
    setResponseText('');
    setIsPopUpOpen(true);
    setCurrentSteps([
      { phase: 'THOUGHT', message: `Directive received: "${prompt}". Formulating ReAct strategy.` }
    ]);

    try {
      const res = await fetch('/api/agent/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      });

      if (res.status === 202) {
        const data = await res.json();
        setPendingApprovalCmd(data.command);
        setAgentState('alert');
        return;
      }

      const data = await res.json();
      setCurrentSteps(data.steps || []);
      const answer = data.response || '';
      setResponseText(answer);
      setAgentState('idle');
      speakText(answer);
      fetchMemory();
    } catch (err) {
      setAgentState('alert');
      const errMsg = `Execution error: ${err.message}`;
      setResponseText(errMsg);
      speakText(errMsg);
    }
  };

  // Direct CLI Execute
  const handleExecuteCmd = async (command, bypassConfirmation = false) => {
    try {
      const res = await fetch('/api/tools/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command, bypassConfirmation })
      });

      if (res.status === 202) {
        setPendingApprovalCmd(command);
        return;
      }

      const data = await res.json();
      setTerminalHistory(prev => [...prev, { cmd: command, ...data }]);
    } catch (err) {
      setTerminalHistory(prev => [...prev, { cmd: command, stdout: '', stderr: err.message, durationMs: 0 }]);
    }
  };

  const handleKillProcess = async (pid) => {
    try {
      await fetch('/api/system/process/kill', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pid })
      });
      fetchSysInfo();
    } catch (err) {}
  };

  const handleSaveKnowledge = async (item) => {
    try {
      await fetch('/api/memory/knowledge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      fetchMemory();
    } catch (err) {}
  };

  const handleDeleteKnowledge = async (id) => {
    try {
      await fetch(`/api/memory/knowledge/${id}`, { method: 'DELETE' });
      fetchMemory();
    } catch (err) {}
  };

  const handleUpdatePreferences = async (newPrefs) => {
    try {
      await fetch('/api/memory/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPrefs)
      });
      fetchMemory();
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-mono relative selection:bg-white selection:text-black">
      
      {/* ─── Floating Discreet View Switcher / Dock (Black & Fluorescent White) ─── */}
      <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-black/95 border-2 border-white/40 p-1.5 rounded-full shadow-[0_0_25px_rgba(255,255,255,0.25)] backdrop-blur-md">
        
        {/* Gemini API Quick Connection Status Badge */}
        <button
          onClick={() => setIsGeminiModalOpen(true)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${
            geminiStatus?.status === 'connected'
              ? 'bg-zinc-900 border-white/60 text-white shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:bg-zinc-800'
              : 'bg-zinc-900 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse hover:bg-zinc-800'
          }`}
          title="Configure Google Gemini API Key"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">
            {geminiStatus?.status === 'connected' ? `GEMINI ${geminiStatus.model?.replace('gemini-', '').toUpperCase()}` : 'CONNECT GEMINI'}
          </span>
        </button>

        {/* Closed Captions Toggle Badge */}
        <button
          onClick={() => setCcEnabled(!ccEnabled)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer border ${
            ccEnabled
              ? 'bg-zinc-900 border-white text-white shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:bg-zinc-800'
              : 'bg-black border-zinc-700 text-zinc-500 hover:text-white'
          }`}
          title="Toggle Closed Captions (CC) Overlay"
        >
          <Subtitles className="w-3.5 h-3.5 text-white" />
          <span className="hidden sm:inline">CC {ccEnabled ? 'ON' : 'OFF'}</span>
        </button>

        <div className="w-[1px] h-4 bg-white/30" />

        {[
          { id: 'hud', label: 'HUD VIEW', icon: LayoutGrid },
          { id: 'agent', label: 'WORKBENCH', icon: Sparkles },
          { id: 'system', label: 'SYSTEM', icon: Monitor },
          { id: 'terminal', label: 'TERMINAL', icon: Terminal },
          { id: 'telemetry', label: 'METRICS', icon: Activity },
          { id: 'files', label: 'FILES', icon: Folder },
          { id: 'memory', label: 'MEMORY', icon: Database }
        ].map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-white text-black shadow-[0_0_15px_#ffffff]'
                  : 'text-zinc-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ─── Primary Content View ─── */}
      <div className="flex-1 flex flex-col">
        {activeTab === 'hud' && (
          <NovaHudCore
            sysInfo={sysInfo}
            onRunDirective={handleRunDirective}
            agentState={agentState}
            currentSteps={currentSteps}
            responseText={responseText}
            lastPrompt={lastPrompt}
            onClearResponse={() => setResponseText('')}
            isSpeaking={isSpeaking}
            setIsSpeaking={setIsSpeaking}
            onExecuteCmd={handleExecuteCmd}
            onOpenWorkbench={() => setActiveTab('agent')}
            onOpenPopUp={() => setIsPopUpOpen(true)}
            onOpenGeminiModal={() => setIsGeminiModalOpen(true)}
            geminiStatus={geminiStatus}
            onSpeakText={speakText}
          />
        )}

        {activeTab === 'agent' && (
          <div className="p-6 max-w-6xl mx-auto w-full my-auto">
            <AgentWorkbench
              onRunDirective={handleRunDirective}
              agentState={agentState}
              currentSteps={currentSteps}
              responseText={responseText}
            />
          </div>
        )}

        {activeTab === 'system' && (
          <div className="p-6 max-w-6xl mx-auto w-full my-auto">
            <SystemControlDeck />
          </div>
        )}

        {activeTab === 'terminal' && (
          <div className="p-6 max-w-6xl mx-auto w-full my-auto">
            <TerminalConsole
              onExecuteCmd={handleExecuteCmd}
              history={terminalHistory}
            />
          </div>
        )}

        {activeTab === 'telemetry' && (
          <div className="p-6 max-w-6xl mx-auto w-full my-auto">
            <TelemetryDashboard
              sysInfo={sysInfo}
              processes={processes}
              onKillProcess={handleKillProcess}
            />
          </div>
        )}

        {activeTab === 'files' && (
          <div className="p-6 max-w-6xl mx-auto w-full my-auto">
            <FileExplorer />
          </div>
        )}

        {activeTab === 'memory' && (
          <div className="p-6 max-w-6xl mx-auto w-full my-auto">
            <MemoryMatrix
              memoryData={memoryData}
              onSaveKnowledge={handleSaveKnowledge}
              onDeleteKnowledge={handleDeleteKnowledge}
              onUpdatePreferences={handleUpdatePreferences}
            />
          </div>
        )}
      </div>

      {/* Permanent Holographic Closed Caption (CC) Box Overlay */}
      <ClosedCaptionOverlay
        isSpeaking={isSpeaking}
        captionText={captionText}
        charIndex={charIndex}
        charLength={charLength}
        ccEnabled={ccEnabled}
        agentState={agentState}
        onToggleCc={() => setCcEnabled(false)}
        onMuteToggle={() => {
          if ('speechSynthesis' in window) window.speechSynthesis.cancel();
          setIsSpeaking(false);
        }}
      />

      {/* Holographic Pop-Up Text Modal (Google Search & Antigravity Autonomous Engine) */}
      <HudPopUpModal
        isOpen={isPopUpOpen}
        onClose={() => setIsPopUpOpen(false)}
        lastPrompt={lastPrompt}
        responseText={responseText}
        currentSteps={currentSteps}
        agentState={agentState}
        isSpeaking={isSpeaking}
        onSpeakToggle={() => {
          if (isSpeaking) {
            if ('speechSynthesis' in window) window.speechSynthesis.cancel();
            setIsSpeaking(false);
          } else if (responseText) {
            speakText(responseText);
          }
        }}
        onRunDirective={handleRunDirective}
      />

      {/* Gemini API Key Configuration Modal */}
      <GeminiConfigModal
        isOpen={isGeminiModalOpen}
        onClose={() => setIsGeminiModalOpen(false)}
        onConfigSaved={() => {
          fetchGeminiStatus();
        }}
      />

      {/* Safety Approval Modal */}
      {pendingApprovalCmd && (
        <ApprovalModal
          command={pendingApprovalCmd}
          onApprove={() => {
            handleExecuteCmd(pendingApprovalCmd, true);
            setPendingApprovalCmd(null);
            setAgentState('idle');
          }}
          onDeny={() => {
            setPendingApprovalCmd(null);
            setAgentState('idle');
          }}
        />
      )}
    </div>
  );
}
