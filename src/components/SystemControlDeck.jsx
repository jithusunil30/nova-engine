import React, { useState, useEffect } from 'react';
import { 
  Monitor, Camera, Volume2, Volume1, VolumeX, Lock, Trash2, 
  Copy, ClipboardCheck, ExternalLink, Play, Wifi, RefreshCw, 
  Sliders, Cpu, Terminal, Shield, Sparkles, Folder, Layers,
  Rocket, Database, Code2, Globe, Brain, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function SystemControlDeck() {
  const [screenshotUrl, setScreenshotUrl] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [clipboardText, setClipboardText] = useState('');
  const [newClipboardText, setNewClipboardText] = useState('');
  const [customLaunch, setCustomLaunch] = useState('');
  const [launchMessage, setLaunchMessage] = useState('');
  const [networkInfo, setNetworkInfo] = useState(null);
  const [loadingNet, setLoadingNet] = useState(false);
  const [controlStatus, setControlStatus] = useState('');

  // Tech Stack State: Antigravity, Cassandra, Python, VS Code, Chrome
  const [antigravityRunning, setAntigravityRunning] = useState(false);
  const [cassandraUp, setCassandraUp] = useState(false);
  const [cassandraOutput, setCassandraOutput] = useState('');
  const [cqlQuery, setCqlQuery] = useState('DESCRIBE KEYSPACES;');
  const [cqlResult, setCqlResult] = useState('');
  const [executingCql, setExecutingCql] = useState(false);
  
  const [pythonCode, setPythonCode] = useState('import sys\nimport math\n\nprint(f"Python: {sys.version.split()[0]}")\nprint(f"Fibonacci: {[round(((1 + 5**0.5)/2)**n / 5**0.5) for n in range(1, 9)]}")\n');
  const [pythonOutput, setPythonOutput] = useState('');
  const [pythonDuration, setPythonDuration] = useState(null);
  const [runningPython, setRunningPython] = useState(false);

  const [chromeSearchQuery, setChromeSearchQuery] = useState('');

  // Quick Launcher presets
  const appPresets = [
    { name: 'Antigravity', icon: '🚀', app: 'antigravity' },
    { name: 'VS Code', icon: '💻', app: 'vscode' },
    { name: 'Chrome', icon: '🌐', app: 'chrome' },
    { name: 'Cassandra', icon: '🗄️', app: 'cassandra' },
    { name: 'Notepad', icon: '📝', app: 'notepad' },
    { name: 'Task Manager', icon: '⚡', app: 'taskmgr' },
    { name: 'PowerShell', icon: '💻', app: 'powershell' },
    { name: 'CMD Console', icon: '⌨️', app: 'cmd' },
    { name: 'File Explorer', icon: '📁', app: 'explorer' },
  ];

  // Fetch initial clipboard, network, & tech stack status
  useEffect(() => {
    fetchClipboard();
    fetchNetwork();
    checkAntigravityStatus();
    checkCassandraStatus();
  }, []);

  const handleLaunch = async (appName) => {
    setLaunchMessage(`Launching ${appName}...`);
    try {
      const res = await fetch('/api/system/launch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ app: appName })
      });
      const data = await res.json();
      if (data.success) {
        setLaunchMessage(`Successfully launched: ${appName}`);
      } else {
        setLaunchMessage(`Launch error: ${data.error}`);
      }
    } catch (err) {
      setLaunchMessage(`Failed to launch: ${err.message}`);
    }
    setTimeout(() => setLaunchMessage(''), 4000);
  };

  const handleCustomLaunch = (e) => {
    e.preventDefault();
    if (!customLaunch.trim()) return;
    handleLaunch(customLaunch);
    setCustomLaunch('');
  };

  // Antigravity integration
  const checkAntigravityStatus = async () => {
    try {
      const res = await fetch('/api/integrations/antigravity/status');
      const data = await res.json();
      setAntigravityRunning(data.isRunning);
    } catch (err) {}
  };

  const launchAntigravity = async () => {
    try {
      await fetch('/api/integrations/antigravity/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      setControlStatus('Antigravity IDE launched.');
      setTimeout(checkAntigravityStatus, 2000);
    } catch (err) {
      setControlStatus(`Antigravity error: ${err.message}`);
    }
    setTimeout(() => setControlStatus(''), 4000);
  };

  // Cassandra integration
  const checkCassandraStatus = async () => {
    try {
      const res = await fetch('/api/integrations/cassandra/status');
      const data = await res.json();
      setCassandraUp(data.isUp);
      setCassandraOutput(data.statusOutput || '');
    } catch (err) {}
  };

  const startCassandra = async () => {
    setControlStatus('Starting Cassandra service daemon...');
    try {
      const res = await fetch('/api/integrations/cassandra/start', { method: 'POST' });
      const data = await res.json();
      setControlStatus(data.message || 'Cassandra start sequence initiated.');
      setTimeout(checkCassandraStatus, 5000);
    } catch (err) {
      setControlStatus(`Start failed: ${err.message}`);
    }
    setTimeout(() => setControlStatus(''), 4000);
  };

  const executeCql = async (e) => {
    e.preventDefault();
    if (!cqlQuery.trim()) return;
    setExecutingCql(true);
    setCqlResult('Executing CQL query on cluster...');
    try {
      const res = await fetch('/api/integrations/cassandra/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cql: cqlQuery })
      });
      const data = await res.json();
      setCqlResult(data.stdout || data.stderr || 'Executed cleanly with no output.');
    } catch (err) {
      setCqlResult(`CQL execution failed: ${err.message}`);
    } finally {
      setExecutingCql(false);
    }
  };

  // Python integration
  const executePython = async (e) => {
    e.preventDefault();
    if (!pythonCode.trim()) return;
    setRunningPython(true);
    try {
      const res = await fetch('/api/integrations/python/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: pythonCode })
      });
      const data = await res.json();
      setPythonOutput(data.stdout || data.stderr || 'Execution finished (no stdout).');
      setPythonDuration(data.durationMs);
    } catch (err) {
      setPythonOutput(`Python run error: ${err.message}`);
    } finally {
      setRunningPython(false);
    }
  };

  // VS Code integration
  const launchVsCode = async () => {
    try {
      await fetch('/api/integrations/vscode/launch', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      setControlStatus('Visual Studio Code launched.');
    } catch (err) {
      setControlStatus(`VS Code error: ${err.message}`);
    }
    setTimeout(() => setControlStatus(''), 3500);
  };

  // Chrome integration
  const launchChromeSearch = async (e) => {
    e.preventDefault();
    if (!chromeSearchQuery.trim()) return;
    try {
      await fetch('/api/integrations/chrome/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: chromeSearchQuery })
      });
      setControlStatus(`Chrome opened search: "${chromeSearchQuery}"`);
      setChromeSearchQuery('');
    } catch (err) {
      setControlStatus(`Chrome search error: ${err.message}`);
    }
    setTimeout(() => setControlStatus(''), 3500);
  };

  const captureScreen = async () => {
    setIsCapturing(true);
    try {
      const res = await fetch('/api/system/screenshot', { method: 'POST' });
      const data = await res.json();
      if (data.url) {
        setScreenshotUrl(data.url);
      }
    } catch (err) {
      console.error('Screenshot error:', err);
    } finally {
      setIsCapturing(false);
    }
  };

  const handleSystemControl = async (action) => {
    setControlStatus(`Executing ${action}...`);
    try {
      const res = await fetch('/api/system/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      });
      const data = await res.json();
      setControlStatus(data.message || `Action ${action} executed.`);
    } catch (err) {
      setControlStatus(`Action failed: ${err.message}`);
    }
    setTimeout(() => setControlStatus(''), 3500);
  };

  const fetchClipboard = async () => {
    try {
      const res = await fetch('/api/system/clipboard');
      const data = await res.json();
      setClipboardText(data.content || '');
    } catch (err) {}
  };

  const updateClipboard = async (e) => {
    e.preventDefault();
    if (!newClipboardText.trim()) return;
    try {
      await fetch('/api/system/clipboard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: newClipboardText })
      });
      setClipboardText(newClipboardText);
      setNewClipboardText('');
      setControlStatus('System clipboard updated!');
      setTimeout(() => setControlStatus(''), 3000);
    } catch (err) {}
  };

  const fetchNetwork = async () => {
    setLoadingNet(true);
    try {
      const res = await fetch('/api/system/network');
      const data = await res.json();
      setNetworkInfo(data);
    } catch (err) {}
    setLoadingNet(false);
  };

  return (
    <div className="hud-panel p-6 flex flex-col items-center justify-center gap-6 max-w-6xl mx-auto w-full">
      {/* Centered Panel Header */}
      <div className="flex flex-col items-center text-center gap-1 border-b border-cyan-500/30 pb-4 w-full">
        <div className="flex items-center justify-center gap-2">
          <Monitor className="w-6 h-6 text-cyan-400 animate-pulse" />
          <h2 className="font-hud font-extrabold text-lg tracking-wider text-cyan-200 text-glow-cyan">
            SYSTEM CONTROL DECK & STACK HUB
          </h2>
        </div>
        <p className="font-mono-hud text-xs text-cyan-400 tracking-wider">
          ANTIGRAVITY • CASSANDRA • PYTHON 3.13 • VS CODE • CHROME • OS HARDWARE
        </p>

        {controlStatus && (
          <div className="mt-2 text-xs font-mono-hud text-amber-300 bg-amber-950/40 px-4 py-1.5 rounded-full border border-amber-500/40 animate-pulse">
            {controlStatus}
          </div>
        )}
      </div>

      {/* ══════════ PRIMARY TECH STACK INTEGRATIONS ROW ══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Card 1: Apache Cassandra 3.11 Database Manager */}
        <div className="hud-panel p-5 flex flex-col gap-3.5 border-amber-500/30 bg-black/40">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Database className="w-4 h-4 text-amber-400" />
              <h3 className="font-hud font-bold text-xs text-amber-200 tracking-wider">
                APACHE CASSANDRA 3.11 CLUSTER
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono-hud font-bold px-2 py-0.5 rounded border ${
                cassandraUp 
                  ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' 
                  : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
              }`}>
                {cassandraUp ? '● ONLINE (PORT 9042)' : 'STANDBY / OFFLINE'}
              </span>
              <button 
                onClick={checkCassandraStatus} 
                className="p-1 text-amber-400 hover:text-white"
                title="Refresh Cassandra Status"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={startCassandra}
              className="flex-1 btn-hud-gold py-1.5 rounded text-xs font-hud font-bold flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> START CASSANDRA DAEMON
            </button>
            <button
              onClick={() => handleLaunch('cqlsh')}
              className="btn-hud py-1.5 px-3 rounded text-xs font-hud font-bold flex items-center gap-1"
              title="Launch cqlsh console"
            >
              <Terminal className="w-3.5 h-3.5" /> CQLSH CLI
            </button>
          </div>

          {/* Interactive CQL Query Executor */}
          <form onSubmit={executeCql} className="flex flex-col gap-2 pt-1 border-t border-amber-500/15">
            <div className="flex items-center justify-between text-[11px] font-mono-hud text-amber-300">
              <span>Interactive CQL Query:</span>
              <span className="text-amber-500">Localhost:9042</span>
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                value={cqlQuery}
                onChange={(e) => setCqlQuery(e.target.value)}
                placeholder="e.g. DESCRIBE KEYSPACES; or SELECT * FROM ..."
                className="flex-1 bg-black/80 border border-amber-500/30 rounded px-3 py-1.5 text-xs text-amber-100 font-mono-hud focus:outline-none focus:border-amber-400"
              />
              <button
                type="submit"
                disabled={executingCql}
                className="btn-hud-gold px-3 py-1.5 rounded text-xs font-hud font-bold flex items-center gap-1 cursor-pointer"
              >
                {executingCql ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>RUN</span>
              </button>
            </div>
          </form>

          {/* Query Output Display */}
          <div className="bg-black/70 p-2.5 rounded border border-amber-500/20 font-mono-hud text-[11px] text-amber-200/90 h-[100px] overflow-y-auto whitespace-pre-wrap">
            {cqlResult || cassandraOutput || "Standing by. Click 'Start Cassandra Daemon' or run a CQL query above."}
          </div>
        </div>

        {/* Card 2: Python 3.13 Live Code Execution Engine */}
        <div className="hud-panel p-5 flex flex-col gap-3.5 border-emerald-500/30 bg-black/40">
          <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <h3 className="font-hud font-bold text-xs text-emerald-200 tracking-wider">
                PYTHON 3.13 EXECUTION ENGINE
              </h3>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono-hud text-emerald-300 font-bold px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-500/40">
                ACTIVE • WINDOWS 11
              </span>
              {pythonDuration !== null && (
                <span className="text-[10px] text-emerald-500 font-mono-hud">{pythonDuration}ms</span>
              )}
            </div>
          </div>

          <form onSubmit={executePython} className="flex flex-col gap-2">
            <textarea
              rows={4}
              value={pythonCode}
              onChange={(e) => setPythonCode(e.target.value)}
              placeholder="Write arbitrary Python 3 code here..."
              className="bg-black/80 border border-emerald-500/30 rounded p-2.5 text-xs text-emerald-100 font-mono-hud focus:outline-none focus:border-emerald-400 leading-relaxed"
            />
            <div className="flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono-hud text-emerald-600">
                Executes via system python.exe with stdout capture
              </span>
              <button
                type="submit"
                disabled={runningPython}
                className="btn-hud py-1.5 px-4 rounded text-xs font-hud font-bold flex items-center gap-1.5 shadow-md"
              >
                {runningPython ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                <span>EXECUTE SCRIPT</span>
              </button>
            </div>
          </form>

          {/* Python Stdout Box */}
          <div className="bg-black/70 p-2.5 rounded border border-emerald-500/20 font-mono-hud text-[11px] text-emerald-300 h-[80px] overflow-y-auto whitespace-pre-wrap">
            {pythonOutput || "Python stdout/stderr output will appear here..."}
          </div>
        </div>

      </div>

      {/* ══════════ APP LAUNCHER, SCREENSHOT, CONTROLS ══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Section 1: Quick App Launcher with Antigravity, VS Code, Chrome */}
        <div className="hud-panel p-5 flex flex-col items-center gap-4 text-center border-cyan-500/30">
          <div className="flex items-center justify-center gap-2 border-b border-cyan-500/20 pb-2 w-full">
            <ExternalLink className="w-4 h-4 text-cyan-400" />
            <h3 className="font-hud font-bold text-sm text-cyan-200 tracking-wider">
              QUICK APP LAUNCHER
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2.5 w-full">
            {appPresets.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (preset.app === 'antigravity') launchAntigravity();
                  else if (preset.app === 'vscode') launchVsCode();
                  else if (preset.app === 'cassandra') startCassandra();
                  else handleLaunch(preset.app);
                }}
                className="flex flex-col items-center justify-center gap-1 p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/25 hover:border-cyan-400 hover:bg-cyan-900/40 transition group cursor-pointer shadow-md"
              >
                <span className="text-xl group-hover:scale-110 transition-transform">{preset.icon}</span>
                <span className="font-mono-hud text-[11px] text-cyan-200 group-hover:text-white font-semibold">
                  {preset.name}
                </span>
              </button>
            ))}
          </div>

          {/* Chrome Google Search Box */}
          <form onSubmit={launchChromeSearch} className="flex gap-2 w-full mt-1 border-t border-cyan-500/15 pt-2">
            <input
              type="text"
              value={chromeSearchQuery}
              onChange={(e) => setChromeSearchQuery(e.target.value)}
              placeholder="Search Google on Chrome..."
              className="flex-1 bg-black/60 border border-cyan-500/30 rounded px-3 py-1.5 text-xs text-cyan-100 placeholder-cyan-700 font-mono-hud focus:outline-none focus:border-cyan-400"
            />
            <button type="submit" className="btn-hud px-3 py-1.5 rounded text-xs font-hud font-bold flex items-center gap-1">
              <Globe className="w-3.5 h-3.5" /> GOOGLE
            </button>
          </form>

          {/* Custom App / URL Launcher Input */}
          <form onSubmit={handleCustomLaunch} className="flex gap-2 w-full">
            <input
              type="text"
              value={customLaunch}
              onChange={(e) => setCustomLaunch(e.target.value)}
              placeholder="Launch custom command or path..."
              className="flex-1 bg-black/60 border border-cyan-500/30 rounded px-3 py-1.5 text-xs text-cyan-100 placeholder-cyan-700 font-mono-hud focus:outline-none focus:border-cyan-400"
            />
            <button type="submit" className="btn-hud px-4 py-1.5 rounded text-xs font-hud font-bold flex items-center gap-1">
              <Play className="w-3.5 h-3.5" /> LAUNCH
            </button>
          </form>

          {launchMessage && (
            <div className="text-xs font-mono-hud text-emerald-300 bg-emerald-950/30 px-3 py-1.5 rounded border border-emerald-500/30 w-full text-center">
              {launchMessage}
            </div>
          )}
        </div>

        {/* Section 2: Desktop Screen Capture / Screenshot */}
        <div className="hud-panel p-5 flex flex-col items-center gap-3.5 text-center border-cyan-500/30">
          <div className="flex items-center justify-center gap-2 border-b border-cyan-500/20 pb-2 w-full">
            <Camera className="w-4 h-4 text-cyan-400" />
            <h3 className="font-hud font-bold text-sm text-cyan-200 tracking-wider">
              DESKTOP SCREENSHOT & PREVIEW
            </h3>
          </div>

          <button
            onClick={captureScreen}
            disabled={isCapturing}
            className="btn-hud-gold px-6 py-2 rounded-lg flex items-center justify-center gap-2 font-hud font-bold text-xs tracking-wider w-full shadow-lg"
          >
            <Camera className={`w-4 h-4 ${isCapturing ? 'animate-spin' : ''}`} />
            <span>{isCapturing ? 'CAPTURING DESKTOP...' : 'TAKE LIVE DESKTOP SCREENSHOT'}</span>
          </button>

          {/* Screenshot Display Box */}
          <div className="w-full h-[180px] bg-black/70 rounded-lg border border-cyan-500/30 flex flex-col items-center justify-center overflow-hidden relative group">
            {screenshotUrl ? (
              <>
                <img
                  src={screenshotUrl}
                  alt="Desktop Screenshot"
                  className="w-full h-full object-contain"
                />
                <a
                  href={screenshotUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute bottom-2 right-2 bg-black/80 hover:bg-cyan-900 border border-cyan-400 text-cyan-200 text-[10px] px-2.5 py-1 rounded font-mono-hud flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <ExternalLink className="w-3 h-3" /> FULL VIEW
                </a>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-cyan-700 font-mono-hud text-xs gap-1 p-4">
                <Monitor className="w-8 h-8 opacity-30 text-cyan-500" />
                <span>No desktop screenshot captured yet. Click capture above.</span>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* ══════════ HARDWARE AUDIO & CLIPBOARD CONTROLS ══════════ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
        
        {/* Section 3: Hardware & Desktop Quick Controls */}
        <div className="hud-panel p-5 flex flex-col items-center gap-4 text-center border-cyan-500/30">
          <div className="flex items-center justify-center gap-2 border-b border-cyan-500/20 pb-2 w-full">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <h3 className="font-hud font-bold text-sm text-cyan-200 tracking-wider">
              HARDWARE & AUDIO CONTROLS
            </h3>
          </div>

          <div className="grid grid-cols-3 gap-2 w-full">
            <button
              onClick={() => handleSystemControl('volume_up')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 text-xs font-mono-hud text-cyan-200 transition"
            >
              <Volume2 className="w-4 h-4 text-cyan-400" />
              <span>Vol +5%</span>
            </button>

            <button
              onClick={() => handleSystemControl('volume_down')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 text-xs font-mono-hud text-cyan-200 transition"
            >
              <Volume1 className="w-4 h-4 text-cyan-400" />
              <span>Vol -5%</span>
            </button>

            <button
              onClick={() => handleSystemControl('volume_mute')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 text-xs font-mono-hud text-cyan-200 transition"
            >
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span>Mute</span>
            </button>

            <button
              onClick={() => handleSystemControl('lock_workstation')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 text-xs font-mono-hud text-cyan-200 transition"
            >
              <Lock className="w-4 h-4 text-amber-400" />
              <span>Lock PC</span>
            </button>

            <button
              onClick={() => handleSystemControl('empty_recycle_bin')}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 text-xs font-mono-hud text-cyan-200 transition"
            >
              <Trash2 className="w-4 h-4 text-rose-400" />
              <span>Recycle Bin</span>
            </button>

            <button
              onClick={fetchClipboard}
              className="flex items-center justify-center gap-1.5 p-2.5 rounded bg-cyan-950/40 border border-cyan-500/20 hover:border-cyan-400 hover:bg-cyan-900/40 text-xs font-mono-hud text-cyan-300 transition"
            >
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span>Sync OS</span>
            </button>
          </div>
        </div>

        {/* Section 4: System Clipboard Manager */}
        <div className="hud-panel p-5 flex flex-col items-center gap-3.5 text-center border-cyan-500/30">
          <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 w-full">
            <div className="flex items-center justify-center gap-2 mx-auto">
              <Copy className="w-4 h-4 text-cyan-400" />
              <h3 className="font-hud font-bold text-sm text-cyan-200 tracking-wider">
                SYSTEM CLIPBOARD MANAGER
              </h3>
            </div>
            <button onClick={fetchClipboard} className="p-1 text-cyan-400 hover:text-white" title="Refresh clipboard">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="bg-black/60 p-2.5 rounded border border-cyan-500/20 font-mono-hud text-xs text-emerald-300 w-full text-left min-h-[55px] max-h-[85px] overflow-y-auto break-all">
            {clipboardText ? (
              <span>{clipboardText}</span>
            ) : (
              <span className="text-cyan-700 italic">System clipboard is empty or non-text.</span>
            )}
          </div>

          <form onSubmit={updateClipboard} className="flex gap-2 w-full">
            <input
              type="text"
              value={newClipboardText}
              onChange={(e) => setNewClipboardText(e.target.value)}
              placeholder="Type text to copy into OS clipboard..."
              className="flex-1 bg-black/60 border border-cyan-500/30 rounded px-3 py-1.5 text-xs text-cyan-100 placeholder-cyan-700 font-mono-hud focus:outline-none focus:border-cyan-400"
            />
            <button type="submit" className="btn-hud px-4 py-1.5 rounded text-xs font-hud font-bold flex items-center gap-1">
              <ClipboardCheck className="w-3.5 h-3.5" /> COPY TO OS
            </button>
          </form>
        </div>

      </div>

      {/* Section 5: Network Interfaces & Listening Ports Monitor */}
      <div className="hud-panel p-5 flex flex-col items-center gap-4 text-center border-cyan-500/30 w-full">
        <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2 w-full">
          <div className="flex items-center justify-center gap-2 mx-auto">
            <Wifi className="w-4 h-4 text-emerald-400" />
            <h3 className="font-hud font-bold text-sm text-cyan-200 tracking-wider">
              NETWORK INTERFACES & LOCAL CONNECTIONS
            </h3>
          </div>
          <button onClick={fetchNetwork} className="p-1 text-cyan-400 hover:text-white" title="Refresh network">
            <RefreshCw className={`w-3.5 h-3.5 ${loadingNet ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {networkInfo ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full text-left font-mono-hud text-xs">
            <div className="bg-black/50 p-3 rounded border border-cyan-500/20 flex flex-col gap-1">
              <span className="text-cyan-400 font-bold uppercase">HOSTNAME / GATEWAY</span>
              <span className="text-cyan-200">{networkInfo.hostname || 'Local Machine'}</span>
              <span className="text-cyan-600 text-[11px]">Platform: {networkInfo.platform}</span>
            </div>

            <div className="bg-black/50 p-3 rounded border border-cyan-500/20 flex flex-col gap-1">
              <span className="text-emerald-400 font-bold uppercase">INTERNAL IP ADDRESS</span>
              <span className="text-emerald-300">{networkInfo.ip || '127.0.0.1'}</span>
              <span className="text-cyan-600 text-[11px]">Interface: {networkInfo.iface || 'Ethernet/WiFi'}</span>
            </div>

            <div className="bg-black/50 p-3 rounded border border-cyan-500/20 flex flex-col gap-1">
              <span className="text-amber-400 font-bold uppercase">ACTIVE SERVER PORTS</span>
              <span className="text-amber-300">HTTP: 3001 | WS: 3001/ws</span>
              <span className="text-cyan-600 text-[11px]">Cassandra: 9042 | Antigravity IDE</span>
            </div>
          </div>
        ) : (
          <div className="text-xs font-mono-hud text-cyan-600 italic">
            Click refresh icon to inspect active network interfaces...
          </div>
        )}
      </div>
    </div>
  );
}
