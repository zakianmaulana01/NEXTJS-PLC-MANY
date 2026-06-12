"use client";

import React, { useState, useEffect } from 'react';
import { RefreshCw, Wind } from 'lucide-react';
import { SystemTelemetry } from '@/types/scada';
import { useTheme } from '@/context/ThemeContext';

interface HeaderProps {
  telemetry: SystemTelemetry;
  setSimMode: (mode: SystemTelemetry['simMode']) => void;
  resetSimulation: () => void;
  muteAlarms: () => void;
  alarmsMuted: boolean;
}

export default function Header({
  telemetry,
  setSimMode,
  resetSimulation,
  muteAlarms,
  alarmsMuted,
}: HeaderProps) {
  const { theme } = useTheme();
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleDateString() + ' ' + now.toLocaleTimeString(undefined, { hour12: false })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const isDark = theme === 'dark';

  return (
    <header className={`min-h-[56px] py-2 lg:py-0 lg:h-14 border-b flex flex-col lg:flex-row items-center justify-between px-6 shrink-0 relative z-10 gap-3 transition-colors duration-500 ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-sm'
    }`}>
      {/* Title block */}
      <div className="flex items-center gap-4 w-full lg:w-auto justify-between lg:justify-start">
        <div className="flex items-center gap-3">
          <div className={`p-2 border rounded transition-colors ${
            isDark ? 'bg-slate-950 border-slate-800' : 'bg-sky-50 border-sky-100'
          }`}>
            <Wind className={`w-5 h-5 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-[9px] font-mono tracking-widest uppercase font-bold ${
                isDark ? 'text-slate-500' : 'text-slate-500'
              }`}>P&ID HMI GRAPHIC SCREEN</span>
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <h1 className={`text-[13px] font-mono font-bold uppercase tracking-tight flex items-center gap-1.5 mt-0.5 ${
              isDark ? 'text-slate-100' : 'text-slate-800'
            }`}>
              COMPRESSED AIR SYSTEM
              <span className="text-slate-500 text-[10px] font-normal">| ST-A5</span>
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3 lg:hidden">
          <div className={`w-2.5 h-2.5 rounded-full ${
            telemetry.overallStatus === 'NORMAL'
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : telemetry.overallStatus === 'WARNING'
              ? 'bg-amber-500'
              : 'bg-rose-500 animate-ping'
          }`} />
        </div>
      </div>

      {/* Center simulation controller */}
      <div className={`flex flex-wrap items-center gap-1 p-1 border rounded transition-colors ${
        isDark ? 'bg-slate-950 border-slate-800' : 'bg-slate-100 border-slate-200'
      }`}>
        <span className="text-[9px] text-slate-500 font-mono px-2 font-bold uppercase tracking-wider">Sim Mode:</span>
        
        <button
          onClick={() => setSimMode('NORMAL')}
          className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold rounded transition ${
            telemetry.simMode === 'NORMAL'
              ? isDark 
                ? 'bg-slate-850 border-slate-750 text-cyan-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]'
                : 'bg-white border-slate-200 text-sky-600 shadow-sm'
              : isDark
                ? 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          Flow Meter Compressed
        </button>

        <button
          onClick={() => setSimMode('PEAK_DEMAND')}
          className={`px-2.5 py-1 text-[10px] font-mono uppercase font-bold rounded transition ${
            telemetry.simMode === 'PEAK_DEMAND'
              ? isDark
                ? 'bg-slate-850 border-slate-750 text-violet-400 shadow-[inset_0_1px_3px_rgba(0,0,0,0.4)]'
                : 'bg-violet-50 border-violet-200 text-violet-700 shadow-sm'
              : isDark
                ? 'text-slate-500 hover:text-slate-350 hover:bg-slate-900/60'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200'
          }`}
        >
          Flow Meter Boiler
        </button>

        <div className={`h-4 w-px mx-1 ${isDark ? 'bg-slate-800' : 'bg-slate-300'}`} />

        <button
          onClick={resetSimulation}
          title="Reset Simulation Data"
          className={`p-1 px-2.5 rounded transition flex items-center gap-1 text-[10px] font-mono uppercase font-bold ${
            isDark 
              ? 'text-slate-400 hover:text-rose-400 hover:bg-slate-900'
              : 'text-slate-500 hover:text-rose-600 hover:bg-slate-200'
          }`}
        >
          <RefreshCw className="w-2.5 h-2.5" />
          Reset
        </button>
      </div>

      {/* Right details */}
      <div className="flex items-center justify-between w-full lg:w-auto lg:justify-end gap-4">
        
        <div className="hidden lg:flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            telemetry.overallStatus === 'NORMAL'
              ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
              : telemetry.overallStatus === 'WARNING'
              ? 'bg-amber-500'
              : 'bg-rose-500 animate-ping'
          }`} />
          <span className="text-[10px] font-bold tracking-wider text-slate-500 uppercase font-mono">STATUS:</span>
          <span className={`text-xs font-mono font-black ${
            telemetry.overallStatus === 'NORMAL'
              ? 'text-emerald-500'
              : telemetry.overallStatus === 'WARNING'
              ? 'text-amber-500'
              : 'text-rose-500'
          }`}>
            {telemetry.overallStatus}
          </span>
        </div>

        <div className={`hidden lg:block h-6 w-[1px] ${isDark ? 'bg-slate-800' : 'bg-slate-200'}`} />

        <div className="flex flex-col items-end">
          <span className="text-[8px] text-slate-500 font-mono uppercase tracking-wider font-bold">SYSTEM CLOCK</span>
          <span className={`text-xs font-extrabold font-mono tracking-tight mt-0.5 ${
            isDark ? 'text-slate-300' : 'text-slate-700'
          }`}>
            {timeStr || '2026-06-11 04:00:53'}
          </span>
        </div>
      </div>
    </header>
  );
}
