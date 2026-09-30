import React, { useState, useEffect, useRef } from 'react';
import { 
  Cpu, HardDrive, Wifi, Bell, Settings, 
  User, Terminal, Power, Zap, Lock, Camera, ExternalLink,
  Mic, MicOff, Send, Database, Code2, Globe, Brain, Rocket,
  Volume2, Copy, X, Sparkles, Maximize2
} from 'lucide-react';

export default function NovaHudCore({ 
  sysInfo, 
  onRunDirective, 
  agentState, 
  currentSteps, 
  responseText, 
  lastPrompt,
  onClearResponse,
  isSpeaking, 
  setIsSpeaking,
  onExecuteCmd,
  onOpenWorkbench,
  onOpenPopUp,
  onOpenGeminiModal,
  geminiStatus,
  onSpeakText
}) {
  const [promptInput, setPromptInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [localTime, setLocalTime] = useState('');
  const [logs, setLogs] = useState([
    { time: '12:35:01', text: 'SYSTEM INTEGRITY CHECK COMPLETE' },
    { time: '12:35:12', text: 'BIO-SYNC STABLE AT 98.4%' },
    { time: '12:35:22', text: 'ARC REACTOR OUTPUT OPTIMAL' },
    { time: '12:35:34', text: 'SAT-LINK ESTABLISHED (NOVA-NET)' },
    { time: '12:35:45', text: 'AWAITING USER INPUT...' },
    { time: '12:35:52', text: 'NEURAL MAPPING RECALIBRATED' },
    { time: '12:36:01', text: 'DEFENSE PERIMETER ACTIVE' }
  ]);

  const radarCanvasRef = useRef(null);
  const ekgCanvasRef = useRef(null);
  const recognitionRef = useRef(null);

  // Real-time Clock
  useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      const h = String(d.getHours()).padStart(2, '0');
      const m = String(d.getMinutes()).padStart(2, '0');
      const s = String(d.getSeconds()).padStart(2, '0');
      setLocalTime(`${h}:${m}:${s}`);
    };
    updateClock();
    const timer = setInterval(updateClock, 1000);
    return () => clearInterval(timer);
  }, []);

  // Web Speech Recognition
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onresult = (event) => {
        const text = event.results[0][0].transcript;
        if (text) {
          onRunDirective(text);
          addLog(`DIRECTIVE: ${text.toUpperCase()}`);
        }
        setIsListening(false);
      };

      recognition.onerror = () => setIsListening(false);
      recognition.onend = () => setIsListening(false);
      recognitionRef.current = recognition;
    }
  }, [onRunDirective]);

  const toggleMic = () => {
    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
      } catch (e) {}
    }
  };

  const addLog = (msg) => {
    const d = new Date();
    const t = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}:${String(d.getSeconds()).padStart(2, '0')}`;
    setLogs(prev => [...prev.slice(-8), { time: t, text: msg }]);
  };

  // EKG Waveform Canvas Animation (Fluorescent White Heartbeat on Black)
  useEffect(() => {
    const canvas = ekgCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let x = 0;
    const points = [];

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.beginPath();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1.8;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 10;

      x = (x + 2) % canvas.width;
      let y = canvas.height / 2;

      // EKG spike
      const phase = x % 90;
      if (phase > 35 && phase < 42) y -= 16;
      else if (phase >= 42 && phase < 48) y += 18;
      else if (phase >= 48 && phase < 54) y -= 10;
      else y += (Math.random() * 2 - 1);

      points.push({ x, y });
      if (points.length > canvas.width / 2) points.shift();

      for (let i = 0; i < points.length - 1; i++) {
        ctx.moveTo(points[i].x, points[i].y);
        ctx.lineTo(points[i + 1].x, points[i + 1].y);
      }
      ctx.stroke();

      animId = requestAnimationFrame(draw);
    };

    draw();
    return () => cancelAnimationFrame(animId);
  }, []);

  // Live state ref so the 60fps Siri Canvas loop reacts immediately to speech/listening
  const siriStateRef = useRef({ isSpeaking, isListening, agentState });
  useEffect(() => {
    siriStateRef.current = { isSpeaking, isListening, agentState };
  }, [isSpeaking, isListening, agentState]);

  // Siri Fluid Wave Circle Animation (Voice-Reactive Morphing Sphere & Fluid Ribbons)
  useEffect(() => {
    const canvas = radarCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    let time = 0;
    let smoothEnergy = 0.15;

    const ribbons = [
      { freq: 1.4, speed: 2.8, amp: 1.0, phase: 0.0, alpha: 0.85, width: 2.5 },
      { freq: 2.1, speed: -3.4, amp: 0.78, phase: 1.3, alpha: 0.65, width: 2.0 },
      { freq: 2.9, speed: 4.1, amp: 0.62, phase: 2.7, alpha: 0.50, width: 1.8 },
      { freq: 1.8, speed: -2.2, amp: 0.88, phase: 4.1, alpha: 0.40, width: 1.5 },
      { freq: 3.5, speed: 5.0, amp: 0.45, phase: 5.2, alpha: 0.32, width: 1.2 }
    ];

    const renderSiriOrb = () => {
      const { isSpeaking: speaking, isListening: listening, agentState: aState } = siriStateRef.current;
      const isExecuting = aState === 'executing';

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const cx = canvas.width / 2;
      const cy = canvas.height / 2;

      // Calculate target voice/activity energy
      let targetEnergy = 0.14 + 0.04 * Math.sin(time * 1.6);
      if (speaking) {
        // Dynamic multi-harmonic voice syllable modulation while speaking
        const syllablePulse =
          Math.abs(Math.sin(time * 6.5)) * 0.45 +
          Math.abs(Math.cos(time * 11.2)) * 0.35 +
          Math.abs(Math.sin(time * 3.1)) * 0.2;
        targetEnergy = 0.42 + syllablePulse * 0.65;
      } else if (listening) {
        targetEnergy = 0.45 + 0.25 * Math.abs(Math.sin(time * 4.5));
      } else if (isExecuting) {
        targetEnergy = 0.38 + 0.2 * Math.sin(time * 5.0);
      }

      smoothEnergy += (targetEnergy - smoothEnergy) * 0.14;
      time += 0.018 + smoothEnergy * 0.032;

      const baseRadius = 148 + smoothEnergy * 18;

      // 1. Ambient Outer Glow Halo
      const outerHalo = ctx.createRadialGradient(cx, cy, baseRadius * 0.2, cx, cy, baseRadius * 1.42);
      outerHalo.addColorStop(0, `rgba(255, 255, 255, ${0.12 + smoothEnergy * 0.22})`);
      outerHalo.addColorStop(0.55, `rgba(255, 255, 255, ${0.05 + smoothEnergy * 0.12})`);
      outerHalo.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = outerHalo;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 1.42, 0, Math.PI * 2);
      ctx.fill();

      // 2. Morphing Liquid Siri Outer Contours (3 organic harmonic lobes)
      for (let lobe = 0; lobe < 3; lobe++) {
        ctx.save();
        ctx.beginPath();
        const steps = 120;
        const lobePhase = time * (lobe % 2 === 0 ? 1.2 : -1.4) + lobe * 2.1;
        const deformAmp = (4 + smoothEnergy * 24) * (1 - lobe * 0.18);
        const ringRadius = baseRadius + lobe * 7;

        for (let i = 0; i <= steps; i++) {
          const theta = (i / steps) * Math.PI * 2;
          const rOffset =
            Math.sin(theta * 3 + lobePhase) * deformAmp * 0.55 +
            Math.cos(theta * 5 - lobePhase * 1.3) * deformAmp * 0.3 +
            Math.sin(theta * 2 + time * 2) * deformAmp * 0.15;
          const r = ringRadius + rOffset;
          const x = cx + Math.cos(theta) * r;
          const y = cy + Math.sin(theta) * r;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(255, 255, 255, ${(0.45 - lobe * 0.12) + smoothEnergy * 0.3})`;
        ctx.lineWidth = lobe === 0 ? 2.2 : 1.2;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 12 + smoothEnergy * 20;
        ctx.stroke();
        ctx.restore();
      }

      // 3. Clipped Inner Siri Sphere & Multi-Ribbon Fluid Waves
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.clip();

      // Deep glossy sphere background
      const sphereBg = ctx.createRadialGradient(cx, cy - baseRadius * 0.3, 10, cx, cy, baseRadius);
      sphereBg.addColorStop(0, 'rgba(30, 30, 35, 0.75)');
      sphereBg.addColorStop(0.7, 'rgba(5, 5, 8, 0.92)');
      sphereBg.addColorStop(1, 'rgba(0, 0, 0, 0.98)');
      ctx.fillStyle = sphereBg;
      ctx.fillRect(cx - baseRadius, cy - baseRadius, baseRadius * 2, baseRadius * 2);

      // Additive light blending for overlapping Siri wave ribbons
      ctx.globalCompositeOperation = 'lighter';

      ribbons.forEach((ribbon, idx) => {
        const maxWaveHeight = (16 + smoothEnergy * 95) * ribbon.amp;
        const stepX = 3;
        const startX = cx - baseRadius;
        const endX = cx + baseRadius;

        // Upper curve and mirrored lower curve forming a 3D Siri fluid ribbon
        ctx.beginPath();
        for (let x = startX; x <= endX; x += stepX) {
          const normX = (x - cx) / baseRadius; // -1 to 1
          // Bell-shaped envelope so waves taper smoothly at sphere edges
          const envelope = Math.pow(Math.max(0, 1 - normX * normX), 1.6);
          const wave1 = Math.sin(normX * Math.PI * ribbon.freq + time * ribbon.speed + ribbon.phase);
          const wave2 = Math.cos(normX * Math.PI * (ribbon.freq * 1.7) - time * (ribbon.speed * 0.7));
          const yOffset = (wave1 * 0.72 + wave2 * 0.28) * maxWaveHeight * envelope;
          const y = cy + yOffset;
          if (x === startX) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }

        for (let x = endX; x >= startX; x -= stepX) {
          const normX = (x - cx) / baseRadius;
          const envelope = Math.pow(Math.max(0, 1 - normX * normX), 1.6);
          const wave1 = Math.sin(normX * Math.PI * ribbon.freq - time * (ribbon.speed * 0.85) + ribbon.phase + 0.9);
          const yOffset = wave1 * maxWaveHeight * 0.55 * envelope;
          const y = cy - yOffset;
          ctx.lineTo(x, y);
        }
        ctx.closePath();

        const ribbonGrad = ctx.createLinearGradient(startX, cy - maxWaveHeight, endX, cy + maxWaveHeight);
        ribbonGrad.addColorStop(0, 'rgba(255, 255, 255, 0.02)');
        ribbonGrad.addColorStop(0.3, `rgba(220, 235, 255, ${ribbon.alpha * (0.28 + smoothEnergy * 0.42)})`);
        ribbonGrad.addColorStop(0.5, `rgba(255, 255, 255, ${ribbon.alpha * (0.45 + smoothEnergy * 0.55)})`);
        ribbonGrad.addColorStop(0.7, `rgba(210, 225, 255, ${ribbon.alpha * (0.28 + smoothEnergy * 0.42)})`);
        ribbonGrad.addColorStop(1, 'rgba(255, 255, 255, 0.02)');

        ctx.fillStyle = ribbonGrad;
        ctx.shadowColor = '#ffffff';
        ctx.shadowBlur = 15 + smoothEnergy * 25;
        ctx.fill();

        // Bright filament spine along primary wave
        if (idx < 3) {
          ctx.beginPath();
          for (let x = startX; x <= endX; x += stepX) {
            const normX = (x - cx) / baseRadius;
            const envelope = Math.pow(Math.max(0, 1 - normX * normX), 1.6);
            const wave1 = Math.sin(normX * Math.PI * ribbon.freq + time * ribbon.speed + ribbon.phase);
            const wave2 = Math.cos(normX * Math.PI * (ribbon.freq * 1.7) - time * (ribbon.speed * 0.7));
            const y = cy + (wave1 * 0.72 + wave2 * 0.28) * maxWaveHeight * envelope;
            if (x === startX) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.strokeStyle = `rgba(255, 255, 255, ${0.45 + smoothEnergy * 0.55})`;
          ctx.lineWidth = ribbon.width;
          ctx.stroke();
        }
      });

      // Central core hotspot glow when speaking
      const coreGlow = ctx.createRadialGradient(cx, cy, 2, cx, cy, baseRadius * (0.35 + smoothEnergy * 0.45));
      coreGlow.addColorStop(0, `rgba(255, 255, 255, ${0.25 + smoothEnergy * 0.65})`);
      coreGlow.addColorStop(0.45, `rgba(255, 255, 255, ${0.08 + smoothEnergy * 0.25})`);
      coreGlow.addColorStop(1, 'rgba(255, 255, 255, 0)');
      ctx.fillStyle = coreGlow;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.85, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();

      // 4. Crisp Glassmorphic Siri Sphere Rim & Specular Highlight
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.55 + smoothEnergy * 0.45})`;
      ctx.lineWidth = 2;
      ctx.shadowColor = '#ffffff';
      ctx.shadowBlur = 18 + smoothEnergy * 25;
      ctx.stroke();

      animId = requestAnimationFrame(renderSiriOrb);
    };

    renderSiriOrb();
    return () => cancelAnimationFrame(animId);
  }, []);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!promptInput.trim()) return;
    onRunDirective(promptInput);
    addLog(`DIRECTIVE: ${promptInput.toUpperCase()}`);
    setPromptInput('');
  };

  const cpuLoad = sysInfo?.cpu?.load || 24;
  const ramPercent = sysInfo?.memory?.percent || 50;
  const ramUsedGB = sysInfo?.memory?.used ? (sysInfo.memory.used / 1024 / 1024 / 1024).toFixed(1) : '12.4';
  const diskPercent = sysInfo?.disk?.[0]?.usePercent || 83;

  return (
    <div className="hud-viewport">
      {/* ─── STARK HUD STAGE CONTAINER (Black and Fluorescent White) ─── */}
      <div className="hud-stage">
        
        {/* Subtle Background Grid Pattern */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.08) 1px, transparent 1px)`,
            backgroundSize: '40px 40px'
          }}
        />

        {/* ─── 1. TOP HEADER BAR ─── */}
        <header className="hud-header">
          {/* Left: Brand */}
          <div className="flex items-center gap-3">
            <div className="w-3.5 h-3.5 bg-white rotate-45 shadow-[0_0_15px_#ffffff]" />
            <div>
              <div className="text-xl font-bold tracking-[0.25em] text-white leading-none glow-white-text">
                N.O.V.A.
              </div>
              <div className="text-[10px] text-zinc-400 tracking-[0.2em] uppercase font-semibold mt-1">
                NEURAL OPERATIONS & VIRTUAL ARCHITECTURE
              </div>
            </div>
          </div>

          {/* Center: System Status & Local Time */}
          <div className="flex items-center gap-8 text-xs font-semibold">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400 tracking-widest text-[11px]">SYSTEM STATUS</span>
              <span className="text-white font-bold flex items-center gap-1.5 tracking-wider glow-white-text">
                <span className="w-2 h-2 rounded-full bg-white animate-pulse shadow-[0_0_10px_#ffffff]" />
                OPTIMAL
              </span>
            </div>

            <div className="flex items-center gap-2 border-l border-white/25 pl-8">
              <span className="text-zinc-400 tracking-widest text-[11px]">LOCAL TIME</span>
              <span className="text-white font-bold tracking-[0.2em] glow-white-text">
                {localTime || '18:40:35'}
              </span>
            </div>
          </div>

          {/* Right: Controls, Notifications & User Badge */}
          <div className="flex items-center gap-3 text-white">
            {/* Gemini API Badge */}
            <button
              onClick={onOpenGeminiModal}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-bold transition cursor-pointer ${
                geminiStatus?.status === 'connected'
                  ? 'bg-zinc-900 border-white/60 text-white shadow-[0_0_12px_rgba(255,255,255,0.4)] hover:bg-zinc-800'
                  : 'bg-zinc-900 border-amber-400 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.4)] animate-pulse hover:bg-zinc-800'
              }`}
              title="Configure Gemini API Settings"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              <span>{geminiStatus?.status === 'connected' ? `GEMINI 3.6 FLASH` : 'CONNECT GEMINI API'}</span>
            </button>

            <button 
              onClick={onOpenWorkbench}
              className="p-1.5 rounded hover:bg-white/10 text-zinc-200 hover:text-white transition cursor-pointer"
              title="Open Extended Workbench"
            >
              <Terminal className="w-4 h-4" />
            </button>
            <Settings onClick={onOpenGeminiModal} className="w-4 h-4 opacity-75 hover:opacity-100 cursor-pointer transition text-zinc-300 hover:text-white" title="Gemini & System Settings" />
            
            <div className="flex items-center gap-2 border border-white/50 px-3.5 py-1 rounded-full bg-white/10 shadow-[0_0_10px_rgba(255,255,255,0.2)]">
              <User className="w-3.5 h-3.5 text-white" />
              <span className="text-xs font-bold text-white tracking-wider">JITHU</span>
            </div>
          </div>
        </header>

        {/* ─── 2. MAIN 3-COLUMN HUD GRID (290px Left | 1fr Center | 290px Right) ─── */}
        <div className="hud-grid">
          
          {/* ═══ LEFT COLUMN (290px) ═══ */}
          <div className="hud-col-left">
            
            {/* Box 1: SYSTEM // BIOMETRICS */}
            <div className="hud-box">
              <div className="hud-box-header">
                <span>SYSTEM // BIOMETRICS</span>
                <span className="text-[10px] text-zinc-400 tracking-widest">VITAL SIGNS</span>
              </div>

              <div className="flex items-center justify-between my-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-400 tracking-wider">Heart Rate</span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-bold text-white glow-white-text">72</span>
                    <span className="text-[10px] text-zinc-300">BPM</span>
                  </div>
                </div>
                <canvas ref={ekgCanvasRef} width={140} height={36} className="rounded border border-white/30 bg-black" />
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs pt-1.5 border-t border-white/20">
                <div>
                  <span className="text-[9px] text-zinc-400 block">Body Temp</span>
                  <span className="font-bold text-white text-xs">98.6 °F</span>
                </div>
                <div>
                  <span className="text-[9px] text-zinc-400 block">Neural Link</span>
                  <span className="font-bold text-white text-xs tracking-wider glow-white-text">ACTIVE</span>
                </div>
              </div>
            </div>

            {/* Box 2: SYSTEM // RESOURCES */}
            <div className="hud-box">
              <div className="hud-box-header">
                <span>SYSTEM // RESOURCES</span>
                <span className="text-[10px] text-zinc-400 tracking-widest">RT-MONITOR</span>
              </div>

              <div className="flex flex-col gap-2 my-auto text-xs">
                {/* CPU */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-300 flex items-center gap-1.5"><Cpu className="w-3 h-3 text-white" /> CPU Load</span>
                    <span className="text-white font-bold">{cpuLoad}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/30">
                    <div className="h-full bg-white shadow-[0_0_8px_#ffffff] transition-all duration-500" style={{ width: `${cpuLoad}%` }} />
                  </div>
                </div>

                {/* Memory */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-300 flex items-center gap-1.5"><Zap className="w-3 h-3 text-white" /> Memory</span>
                    <span className="text-white font-bold">{ramUsedGB} GB</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/30">
                    <div className="h-full bg-white shadow-[0_0_8px_#ffffff] transition-all duration-500" style={{ width: `${ramPercent}%` }} />
                  </div>
                </div>

                {/* Storage */}
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-300 flex items-center gap-1.5"><HardDrive className="w-3 h-3 text-white" /> Storage</span>
                    <span className="text-white font-bold">{diskPercent}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/30">
                    <div className="h-full bg-white shadow-[0_0_8px_#ffffff] transition-all duration-500" style={{ width: `${diskPercent}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Box 3: SYSTEM // STACK & GPT MEMORY */}
            <div className="hud-box">
              <div className="hud-box-header w-full">
                <span>SYSTEM // STACK & MEMORY</span>
                <span className="text-[10px] text-zinc-400 tracking-widest">GPT-CONTEXT</span>
              </div>

              <div className="my-auto flex flex-col gap-1.5 w-full text-[10px]">
                <div className="flex items-center justify-between py-0.5 border-b border-white/15">
                  <span className="text-zinc-200 flex items-center gap-1.5"><Rocket className="w-3 h-3 text-white" /> Antigravity IDE</span>
                  <span className="text-white font-bold text-[9px] bg-white/15 px-1.5 py-0.5 rounded border border-white/40 shadow-[0_0_6px_rgba(255,255,255,0.3)]">ONLINE</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-white/15">
                  <span className="text-zinc-200 flex items-center gap-1.5"><Database className="w-3 h-3 text-zinc-300" /> Cassandra 3.11</span>
                  <span className="text-zinc-200 font-bold text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded border border-white/30">READY (9042)</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-white/15">
                  <span className="text-zinc-200 flex items-center gap-1.5"><Terminal className="w-3 h-3 text-white" /> Python 3.13</span>
                  <span className="text-white font-bold text-[9px] bg-white/15 px-1.5 py-0.5 rounded border border-white/40">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between py-0.5 border-b border-white/15">
                  <span className="text-zinc-200 flex items-center gap-1.5"><Code2 className="w-3 h-3 text-zinc-300" /> VS Code</span>
                  <span className="text-zinc-200 font-bold text-[9px] bg-zinc-800 px-1.5 py-0.5 rounded border border-white/30">LINKED</span>
                </div>
                <div className="flex items-center justify-between py-0.5">
                  <span className="text-zinc-200 flex items-center gap-1.5"><Brain className="w-3 h-3 text-white" /> GPT Memory</span>
                  <span className="text-white font-bold text-[9px] bg-white/15 px-1.5 py-0.5 rounded border border-white/40">PERSISTENT</span>
                </div>
              </div>
            </div>

          </div>

          {/* ═══ CENTER COLUMN: GIANT FLOATING RADAR CORE (Strict Dead Center) ═══ */}
          <div className="hud-col-center">
            
            {/* Siri Fluid Wave Sphere (Voice-Reactive Central Circle) */}
            <div 
              onClick={() => {
                if (isSpeaking) {
                  if ('speechSynthesis' in window) window.speechSynthesis.cancel();
                  setIsSpeaking(false);
                } else {
                  toggleMic();
                }
              }}
              className="relative w-[440px] h-[440px] flex items-center justify-center my-auto cursor-pointer group select-none"
              title={isSpeaking ? "Click to Stop Speaking" : isListening ? "Listening... Click to Stop" : "Click to Speak to N.O.V.A."}
            >
              <canvas 
                ref={radarCanvasRef} 
                width={450} 
                height={450} 
                className="absolute inset-0 m-auto pointer-events-none transition-transform duration-300 group-hover:scale-[1.03]" 
              />

              {/* Subtle Floating Siri Status Pill at Bottom of Sphere */}
              <div className="z-10 mt-64 px-4 py-1 rounded-full border border-white/40 bg-black/80 backdrop-blur-md flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.35)] transition-all duration-300 group-hover:border-white">
                <span className={`w-2 h-2 rounded-full bg-white shadow-[0_0_8px_#ffffff] ${isSpeaking || isListening || agentState === 'executing' ? 'animate-ping' : 'animate-pulse'}`} />
                <span className="font-bold text-[10px] text-white tracking-[0.22em] glow-white-text">
                  {isSpeaking
                    ? 'N.O.V.A. SPEAKING'
                    : isListening
                    ? 'LISTENING...'
                    : agentState === 'executing'
                    ? 'SYNTHESIZING...'
                    : 'N.O.V.A. CORE'}
                </span>
              </div>
            </div>

            {/* Bottom Audio Spectrum & Awaiting Command Input */}
            <div className="w-full flex flex-col items-center gap-2.5 pb-2">
              
              {/* Center Stage Holographic Response / Live Transmission Box */}
              {agentState === 'executing' && (
                <div className="w-full max-w-lg bg-black/95 border-2 border-white/80 p-2.5 rounded-xl flex items-center justify-center gap-2.5 text-xs font-mono text-white animate-pulse shadow-[0_0_30px_rgba(255,255,255,0.4)] my-1">
                  <Sparkles className="w-4 h-4 text-white animate-spin" />
                  <span className="font-bold tracking-wider truncate glow-white-text">
                    N.O.V.A. EXECUTING: {currentSteps[currentSteps.length - 1]?.message || `Processing "${lastPrompt}"...`}
                  </span>
                </div>
              )}

              {responseText && agentState !== 'executing' && (
                <div className="w-full max-w-lg bg-black/95 border-2 border-white rounded-xl p-3.5 flex flex-col gap-2 shadow-[0_0_40px_rgba(255,255,255,0.45)] backdrop-blur-md z-20 my-1">
                  <div className="flex items-center justify-between border-b border-white/30 pb-2 text-[11px]">
                    <div className="flex items-center gap-2 font-bold text-white glow-white-text">
                      <Sparkles className="w-3.5 h-3.5 text-white" />
                      <span className="tracking-wider">N.O.V.A. INTELLIGENCE RESPONSE</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {onOpenPopUp && (
                        <button
                          onClick={onOpenPopUp}
                          className="px-2 py-0.5 rounded bg-white text-black text-[10px] font-bold flex items-center gap-1 cursor-pointer transition shadow-[0_0_10px_#ffffff] hover:bg-zinc-200"
                          title="Open Holographic Pop-Up Modal"
                        >
                          <Maximize2 className="w-3 h-3 text-black" />
                          <span>POP-UP</span>
                        </button>
                      )}
                      <button
                        onClick={() => onSpeakText && onSpeakText(responseText)}
                        className="p-1 hover:bg-white/20 text-white rounded cursor-pointer"
                        title="Speak Aloud & Show Closed Captions"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => navigator.clipboard.writeText(responseText)}
                        className="p-1 hover:bg-white/20 text-white rounded cursor-pointer"
                        title="Copy Response"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={onClearResponse}
                        className="p-1 hover:bg-rose-500/20 text-rose-400 rounded cursor-pointer"
                        title="Dismiss"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {lastPrompt && (
                    <div className="text-[10px] text-zinc-300 font-mono tracking-wider truncate border-b border-white/15 pb-1">
                      <span className="text-white font-bold">DIRECTIVE:</span> "{lastPrompt}"
                    </div>
                  )}

                  <div className="text-xs text-white font-mono leading-relaxed max-h-[140px] overflow-y-auto whitespace-pre-wrap pr-1 select-text">
                    {responseText}
                  </div>
                </div>
              )}

              {/* Fluorescent White Equalizer Bars */}
              <div className="flex items-center gap-1 h-6">
                {[30, 60, 90, 45, 80, 100, 75, 45, 90, 50, 85, 40].map((h, i) => (
                  <div
                    key={i}
                    className={`w-1 rounded-full bg-white shadow-[0_0_6px_#ffffff] ${isListening || isSpeaking ? 'animate-pulse' : 'opacity-40'}`}
                    style={{ height: (isListening || isSpeaking) ? `${Math.random() * 24 + 6}px` : '7px' }}
                  />
                ))}
              </div>

              {/* Pill Button: AWAITING COMMAND (Black & Fluorescent White) */}
              <form onSubmit={handleFormSubmit} className="w-full max-w-md flex items-center bg-black border-2 border-white/60 rounded-full px-4 py-2 shadow-[0_0_25px_rgba(255,255,255,0.25)] focus-within:border-white focus-within:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
                <button
                  type="button"
                  onClick={toggleMic}
                  className="p-1 rounded-full text-white hover:text-zinc-300 mr-2 cursor-pointer"
                  title="Voice Control"
                >
                  {isListening ? <Mic className="w-4 h-4 text-white animate-bounce shadow-[0_0_10px_#ffffff]" /> : <MicOff className="w-4 h-4" />}
                </button>

                <input
                  type="text"
                  value={promptInput}
                  onChange={(e) => setPromptInput(e.target.value)}
                  placeholder={isListening ? "LISTENING TO VOICE..." : "ASK N.O.V.A. (ANTIGRAVITY • CASSANDRA • PYTHON • VS CODE • CHROME • MEMORY)..."}
                  className="flex-1 bg-transparent text-xs text-white placeholder-zinc-500 focus:outline-none tracking-wider font-mono"
                />

                <button
                  type="submit"
                  className="p-1 text-white hover:text-zinc-300 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>

          </div>

          {/* ═══ RIGHT COLUMN (290px) ═══ */}
          <div className="hud-col-right">
            
            {/* Box 1: SYSTEM // ARMOR STATUS */}
            <div className="hud-box">
              <div className="hud-box-header">
                <span>SYSTEM // ARMOR & STACK LAUNCH</span>
                <span className="text-[10px] text-zinc-400 tracking-widest">MARK LXXXV</span>
              </div>

              <div className="flex flex-col gap-2 my-auto text-xs">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-300 font-medium">POWER CORE</span>
                    <span className="text-white font-bold glow-white-text">98%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/30">
                    <div className="h-full bg-white shadow-[0_0_8px_#ffffff] w-[98%]" />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-zinc-300 font-medium">STRUCTURAL</span>
                    <span className="text-white font-bold glow-white-text">100%</span>
                  </div>
                  <div className="w-full bg-zinc-900 h-1.5 rounded-full overflow-hidden border border-white/30">
                    <div className="h-full bg-white shadow-[0_0_8px_#ffffff] w-[100%]" />
                  </div>
                </div>
              </div>

              {/* 6 Quick Tech Stack & Memory Launcher Buttons */}
              <div className="grid grid-cols-6 gap-1 pt-1.5 border-t border-white/20">
                <button 
                  onClick={() => onRunDirective('Launch Antigravity IDE')} 
                  className="p-1.5 border border-white/40 rounded bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Launch Antigravity IDE"
                >
                  <Rocket className="w-3.5 h-3.5 text-white" />
                </button>
                <button 
                  onClick={() => onRunDirective('Check Cassandra status')} 
                  className="p-1.5 border border-white/40 rounded bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Check Cassandra Cluster / DB"
                >
                  <Database className="w-3.5 h-3.5 text-zinc-300" />
                </button>
                <button 
                  onClick={() => onRunDirective('Inspect Python environment')} 
                  className="p-1.5 border border-white/40 rounded bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Run Python 3.13 / Environment"
                >
                  <Terminal className="w-3.5 h-3.5 text-white" />
                </button>
                <button 
                  onClick={() => onRunDirective('Open Visual Studio Code')} 
                  className="p-1.5 border border-white/40 rounded bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Launch Visual Studio Code"
                >
                  <Code2 className="w-3.5 h-3.5 text-zinc-300" />
                </button>
                <button 
                  onClick={() => onRunDirective('Open Google Chrome')} 
                  className="p-1.5 border border-white/40 rounded bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Open Google Chrome"
                >
                  <Globe className="w-3.5 h-3.5 text-white" />
                </button>
                <button 
                  onClick={() => onRunDirective('What do you remember about me?')} 
                  className="p-1.5 border border-white/40 rounded bg-white/5 hover:bg-white hover:text-black flex items-center justify-center transition cursor-pointer"
                  title="Recall GPT Memories"
                >
                  <Brain className="w-3.5 h-3.5 text-zinc-300" />
                </button>
              </div>
            </div>

            {/* Box 2: SYSTEM // SYSTEM LOGS */}
            <div className="hud-box">
              <div className="hud-box-header">
                <span>SYSTEM // SYSTEM LOGS</span>
                <span className="text-[10px] text-zinc-400 tracking-widest">RT-LOG</span>
              </div>

              <div className="flex flex-col gap-1 text-[10px] leading-tight overflow-y-auto max-h-[110px] my-auto pr-1">
                {logs.map((item, idx) => (
                  <div key={idx} className="flex gap-1.5">
                    <span className="text-zinc-400">[{item.time}]</span>
                    <span className="text-zinc-100 truncate">{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 3: SYSTEM // TERMINAL */}
            <div className="hud-box">
              <div className="hud-box-header">
                <span>SYSTEM // TERMINAL</span>
                <span className="text-[10px] text-zinc-400 tracking-widest">ROOT@NOVA</span>
              </div>

              <div className="bg-black/90 p-2 rounded border border-white/30 text-[10px] text-white flex flex-col gap-1 my-auto h-[100px] overflow-y-auto">
                <div className="text-zinc-400">&gt; nova --analyze --current-environment</div>
                <div className="text-white leading-relaxed">
                  {responseText || "Analyzing... Host system nominal. Nova agent ready for Jithu."}
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
