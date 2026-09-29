import React from 'react';
import { Activity, Cpu, HardDrive, Zap, XCircle } from 'lucide-react';

export default function TelemetryDashboard({ sysInfo, processes = [], onKillProcess }) {
  if (!sysInfo) {
    return (
      <div className="hud-panel p-12 text-center text-cyan-400 font-hud text-lg max-w-6xl mx-auto">
        CONNECTING TO LIVE SYSTEM TELEMETRY STREAM...
      </div>
    );
  }

  const { cpu, memory, os, disk } = sysInfo;

  return (
    <div className="hud-panel p-8 flex flex-col items-center justify-center gap-6 w-full max-w-6xl mx-auto">
      {/* Centered Header */}
      <div className="flex flex-col items-center text-center gap-1 border-b border-cyan-500/30 pb-4 w-full">
        <div className="flex items-center justify-center gap-3">
          <Activity className="w-6 h-6 text-emerald-400 animate-pulse" />
          <h2 className="font-hud font-bold text-lg md:text-xl tracking-wider text-cyan-200 text-glow-cyan">
            LIVE SYSTEM TELEMETRY & PROCESS AUDITOR
          </h2>
        </div>
        <span className="font-mono-hud text-sm text-emerald-400 flex items-center justify-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
          HOST: {os.hostname || 'LOCAL-AGENT'} • PLATFORM: {os.distro || os.platform || 'WINDOWS'}
        </span>
      </div>

      {/* Metrics Gauges Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
        {/* CPU */}
        <div className="bg-black/60 p-6 rounded-xl border border-cyan-500/30 flex flex-col gap-3 text-center shadow-lg">
          <div className="flex items-center justify-between font-hud text-sm text-cyan-300">
            <span className="flex items-center gap-2 font-bold">
              <Cpu className="w-5 h-5 text-amber-400" /> CPU LOAD
            </span>
            <span className="font-extrabold text-2xl text-amber-300 text-glow-gold">{cpu.load}%</span>
          </div>
          <div className="w-full bg-cyan-950 h-3.5 rounded-full overflow-hidden border border-cyan-500/40">
            <div
              className="h-full bg-gradient-to-r from-cyan-400 to-amber-400 transition-all duration-500"
              style={{ width: `${cpu.load}%` }}
            />
          </div>
          <div className="text-xs font-mono-hud text-cyan-400 truncate mt-1">
            {cpu.brand} ({cpu.cores} Cores)
          </div>
        </div>

        {/* Memory */}
        <div className="bg-black/60 p-6 rounded-xl border border-cyan-500/30 flex flex-col gap-3 text-center shadow-lg">
          <div className="flex items-center justify-between font-hud text-sm text-cyan-300">
            <span className="flex items-center gap-2 font-bold">
              <Zap className="w-5 h-5 text-cyan-400" /> RAM UTILIZATION
            </span>
            <span className="font-extrabold text-2xl text-cyan-300 text-glow-cyan">{memory.percent}%</span>
          </div>
          <div className="w-full bg-cyan-950 h-3.5 rounded-full overflow-hidden border border-cyan-500/40">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-500"
              style={{ width: `${memory.percent}%` }}
            />
          </div>
          <div className="text-xs font-mono-hud text-cyan-400 mt-1">
            {(memory.used / 1024 / 1024 / 1024).toFixed(2)} GB / {(memory.total / 1024 / 1024 / 1024).toFixed(2)} GB
          </div>
        </div>

        {/* Storage */}
        <div className="bg-black/60 p-6 rounded-xl border border-cyan-500/30 flex flex-col gap-3 text-center shadow-lg">
          <div className="flex items-center justify-between font-hud text-sm text-cyan-300">
            <span className="flex items-center gap-2 font-bold">
              <HardDrive className="w-5 h-5 text-emerald-400" /> DISK STORAGE
            </span>
            <span className="font-extrabold text-2xl text-emerald-300">{disk[0]?.usePercent || 0}%</span>
          </div>
          <div className="w-full bg-cyan-950 h-3.5 rounded-full overflow-hidden border border-cyan-500/40">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-500"
              style={{ width: `${disk[0]?.usePercent || 0}%` }}
            />
          </div>
          <div className="text-xs font-mono-hud text-cyan-400 mt-1">
            System Drive: {disk[0]?.fs || 'C:'}
          </div>
        </div>
      </div>

      {/* Top Processes Table */}
      <div className="flex flex-col gap-3 w-full mt-2">
        <div className="font-hud text-sm font-bold text-cyan-300 tracking-wider text-center">
          ACTIVE HIGH-CONSUMPTION PROCESSES (TOP 15)
        </div>
        <div className="bg-black/70 rounded-xl border border-cyan-500/30 overflow-hidden font-mono-hud text-sm w-full shadow-lg">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-cyan-950/70 border-b border-cyan-500/40 text-cyan-300 text-xs font-hud">
                <th className="p-3.5">PID</th>
                <th className="p-3.5">PROCESS NAME</th>
                <th className="p-3.5">CPU %</th>
                <th className="p-3.5">RAM (MB)</th>
                <th className="p-3.5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {processes.map((proc, idx) => (
                <tr key={idx} className="border-b border-cyan-950/50 hover:bg-cyan-900/30 transition">
                  <td className="p-3 text-cyan-400 font-bold">{proc.pid}</td>
                  <td className="p-3 text-cyan-100 font-semibold">{proc.name}</td>
                  <td className="p-3 text-amber-400 font-bold">{proc.cpu}%</td>
                  <td className="p-3 text-cyan-300">{proc.mem} MB</td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => onKillProcess(proc.pid)}
                      className="text-rose-400 hover:text-rose-100 hover:bg-rose-950/70 border border-rose-500/30 px-3 py-1 rounded-lg transition flex items-center gap-1.5 ml-auto text-xs font-hud cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" /> KILL
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
