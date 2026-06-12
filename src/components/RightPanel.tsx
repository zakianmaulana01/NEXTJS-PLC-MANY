"use client";

import React from 'react';
import {
  Activity,
  Bell,
  Check,
  ChevronRight,
  Info,
  Shield,
  Trash2,
  Volume2,
  VolumeX,
  ChevronLeft,
} from 'lucide-react';
import { SystemTelemetry } from '@/types/scada';
import Sparkline from './Sparkline';
import NumberFlow from './NumberFlow';
import { useTheme } from '@/context/ThemeContext';

interface RightPanelProps {
  telemetry: SystemTelemetry;
  historyPressure: number[];
  historyFlow: number[];
  historyDewPoint: number[];
  onAcknowledgeAlarm: (id: string) => void;
  onClearAlarms: () => void;
  alarmsMuted: boolean;
  onToggleMute: () => void;
}

export default function RightPanel({
  telemetry,
  historyPressure,
  historyFlow,
  historyDewPoint,
  onAcknowledgeAlarm,
  onClearAlarms,
  alarmsMuted,
  onToggleMute,
}: RightPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const activeAlarms = telemetry.alarms.filter((a) => !a.acknowledged);
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  return (
    <aside className={`border-t lg:border-t-0 lg:border-l flex flex-col h-full overflow-hidden shrink-0 transition-all duration-300 ease-in-out ${
      isCollapsed ? 'w-[48px]' : 'w-[320px]'
    } ${
      isDark ? 'bg-slate-950 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Tab Header */}
      <div className={`px-2 py-3 border-b flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} transition-colors ${
        isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
      }`}>
        <div className={`flex items-center gap-2 ${isCollapsed ? 'hidden' : ''}`}>
          <Activity className={`w-4 h-4 shrink-0 ${isDark ? 'text-sky-400' : 'text-sky-600'}`} />
          <h2 className={`text-xs font-bold font-mono uppercase tracking-widest whitespace-nowrap ${
            isDark ? 'text-slate-200' : 'text-slate-800'
          }`}>
            MONITORING CONSOLE
          </h2>
        </div>
        <div className={`flex items-center ${isCollapsed ? 'flex-col gap-3' : 'gap-2'}`}>
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            className={`p-1.5 rounded transition-all ${
              isDark
                ? 'bg-slate-800 border border-slate-700 text-slate-400 hover:text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-900'
            }`}
          >
            {isCollapsed ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
          </button>
          
          <button
            onClick={onToggleMute}
            title={alarmsMuted ? 'Unmute Alarms' : 'Mute Alarms'}
            className={`p-1.5 rounded transition-all ${
              alarmsMuted
                ? 'bg-rose-950/80 border border-rose-800 text-rose-400 animate-pulse'
                : isDark
                  ? 'bg-slate-850 border border-slate-750 text-slate-400 hover:text-slate-250 hover:bg-slate-800'
                  : 'bg-white border border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
            }`}
          >
            {alarmsMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className={`flex-1 flex flex-col overflow-hidden transition-opacity duration-200 ${isCollapsed ? 'opacity-0 hidden' : 'opacity-100'}`}>
        {/* GEOMETRIC BALANCE SUMMARY DATA GRID */}
        <div className={`p-4 grid grid-cols-2 gap-2 border-b transition-colors ${
          isDark ? 'border-slate-800 bg-slate-950' : 'border-slate-200 bg-white'
        }`}>
        <div className={`p-2.5 border rounded flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">Inbound Flow</div>
          <div className={`text-sm font-mono font-extrabold mt-1 flex items-baseline gap-1 ${
            isDark ? 'text-white' : 'text-slate-900'
          }`}>
            <NumberFlow value={telemetry.compressors.reduce((acc, c) => acc + (c.status === 'RUN' ? (c.loadPercent / 100) * 800 : 0), 0)} />
            <span className="text-[9px] text-slate-500 font-normal">Nm³/h</span>
          </div>
        </div>
        <div className={`p-2.5 border rounded flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">Line Pressure</div>
          <div className={`text-sm font-mono font-extrabold mt-1 flex items-baseline gap-1 ${
            isDark ? 'text-emerald-400' : 'text-emerald-600'
          }`}>
            <NumberFlow value={telemetry.header.pressure} format={(v) => v.toFixed(2)} />
            <span className="text-[9px] text-slate-500 font-normal font-mono">bar</span>
          </div>
        </div>
        <div className={`p-2.5 border rounded flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">Power Draw</div>
          <div className={`text-sm font-mono font-extrabold mt-1 flex items-baseline gap-1 ${
            isDark ? 'text-yellow-400' : 'text-yellow-600'
          }`}>
            <NumberFlow value={telemetry.compressors.reduce((acc, c) => acc + (c.status === 'RUN' ? c.powerkW * (c.loadPercent / 100) : 0), 0)} format={(v) => v.toFixed(1)} />
            <span className="text-[9px] text-slate-500 font-normal">kW</span>
          </div>
        </div>
        <div className={`p-2.5 border rounded flex flex-col transition-colors ${
          isDark ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-100'
        }`}>
          <div className="text-[9px] text-slate-500 uppercase font-mono font-bold tracking-wider">Dew Point</div>
          <div className={`text-sm font-mono font-extrabold mt-1 flex items-baseline gap-1 ${
            isDark ? 'text-violet-400' : 'text-violet-600'
          }`}>
            <NumberFlow value={telemetry.dryers.find((d) => d.status === 'RUN')?.dewPoint ?? 15.0} format={(v) => v.toFixed(1)} />
            <span className="text-[9px] text-slate-500 font-normal font-mono">°C</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* Real-time Sparks */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase">
            Live Trend Charts
          </h3>

          <div className="space-y-2.5">
            <div className={`p-2.5 border rounded transition-colors ${
              isDark ? 'bg-slate-900/40 border-slate-850' : 'bg-[#FFFFFF] border-[#DCE3EB]'
            }`}>
              <span className={`text-[10px] font-mono block mb-1.5 font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Header Pressure (PT-102)</span>
              <Sparkline
                data={historyPressure}
                min={5.0}
                max={9.0}
                unit="bar"
                color={
                  telemetry.header.pressure > 8.0 || telemetry.header.pressure < 6.0
                    ? '#FF5A5F' // Alarm
                    : isDark ? '#06b6d4' : '#00B8FF'
                }
              />
            </div>

            <div className={`p-2.5 border rounded transition-colors ${
              isDark ? 'bg-slate-900/40 border-slate-850' : 'bg-[#FFFFFF] border-[#DCE3EB]'
            }`}>
              <span className={`text-[10px] font-mono block mb-1.5 font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Total Discharge Flow (FT-101)</span>
              <Sparkline data={historyFlow} min={0} max={2500} unit="Nm³/h" color={isDark ? '#10b981' : '#16C784'} />
            </div>

            <div className={`p-2.5 border rounded transition-colors ${
              isDark ? 'bg-slate-900/40 border-slate-850' : 'bg-[#FFFFFF] border-[#DCE3EB]'
            }`}>
              <span className={`text-[10px] font-mono block mb-1.5 font-bold uppercase tracking-wider ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>System Dew Point (DPT-101)</span>
              <Sparkline data={historyDewPoint} min={-50} max={25} unit="°C" color={isDark ? '#a855f7' : '#8B5CF6'} />
            </div>
          </div>
        </div>

        {/* System Diagnostics */}
        <div className="space-y-3">
          <h3 className="text-[10px] font-semibold text-slate-400 font-mono tracking-widest uppercase">
            Process Diagnostics
          </h3>
          <div className={`border p-3 rounded space-y-2 text-xs font-mono transition-colors ${
            isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            <div className={`flex justify-between items-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-slate-500">Inbound Generation:</span>
              <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                <NumberFlow value={telemetry.compressors.reduce((acc, c) => acc + (c.status === 'RUN' ? (c.loadPercent / 100) * 800 : 0), 0)} />{' '}
                Nm³/h
              </span>
            </div>
            
            <div className={`flex justify-between items-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-slate-500">Outbound Consumers:</span>
              <span className={`font-bold flex items-center gap-1 ${isDark ? 'text-sky-400' : 'text-sky-600'}`}>
                <NumberFlow value={telemetry.header.flow} /> <span className="text-[10px] text-slate-500 font-normal">Nm³/h</span>
              </span>
            </div>

            <div className={`flex justify-between items-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-slate-500">Unaccounted Losses:</span>
              <span className={telemetry.simMode === 'LEAK' ? 'text-amber-500 font-bold' : 'text-slate-500'}>
                {telemetry.simMode === 'LEAK' ? '200' : '0'} Nm³/h
              </span>
            </div>

            <div className={`h-px my-1 ${isDark ? 'bg-slate-800/60' : 'bg-slate-200'}`} />

            <div className={`flex justify-between items-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-slate-500">Power Transmission:</span>
              <span className={`font-bold ${isDark ? 'text-yellow-400' : 'text-yellow-600'}`}>
                <NumberFlow value={telemetry.compressors.reduce((acc, c) => acc + (c.status === 'RUN' ? c.powerkW * (c.loadPercent / 100) : 0), 0)} format={(v) => v.toFixed(1)} />{' '}
                kW
              </span>
            </div>

            <div className={`flex justify-between items-center ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
              <span className="text-slate-500">Receiver Water Level:</span>
              <span
                className={`font-bold flex items-baseline gap-1 ${
                  telemetry.tank.condensateLevel > 70 
                    ? 'text-rose-500 font-extrabold animate-pulse' 
                    : isDark ? 'text-slate-300' : 'text-slate-700'
                }`}
              >
                <NumberFlow value={telemetry.tank.condensateLevel} format={(v) => v.toFixed(1)} /> %
              </span>
            </div>
          </div>
        </div>

        {/* Dynamic Alarm Log */}
        <div className="flex flex-col min-h-[220px]">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-[10px] font-bold text-slate-400 font-mono tracking-widest uppercase flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-rose-500" />
              ALARM STATUS QUEUE ({activeAlarms.length})
            </h3>
            
            {telemetry.alarms.length > 0 && (
              <button
                onClick={onClearAlarms}
                className="text-[10px] text-slate-500 hover:text-slate-700 flex items-center gap-1 font-mono transition"
              >
                <Trash2 className="w-3 h-3" />
                CLEAR ALL
              </button>
            )}
          </div>

          <div className={`border rounded flex-1 overflow-y-auto max-h-[250px] p-2 space-y-2 transition-colors ${
            isDark ? 'bg-slate-900/30 border-slate-800' : 'bg-slate-50 border-slate-200'
          }`}>
            {telemetry.alarms.length === 0 ? (
              <div className="h-full py-8 flex flex-col items-center justify-center p-3 text-center">
                <Shield className="w-6 h-6 text-emerald-500/30 mb-1.5" />
                <span className="text-slate-500 font-mono text-[10px] uppercase tracking-wider">System telemetry clear</span>
              </div>
            ) : (
              telemetry.alarms.map((alarm) => (
                <div
                  key={alarm.id}
                  className={`p-2.5 rounded-none border-l-2 font-mono text-xs flex flex-col gap-1 transition ${
                    alarm.acknowledged
                      ? isDark 
                        ? 'border-slate-800 bg-slate-900/20 text-slate-500' 
                        : 'border-slate-300 bg-slate-100 text-slate-500'
                      : alarm.severity === 'CRITICAL'
                      ? isDark
                        ? 'border-rose-500 bg-rose-500/5 text-rose-300 shadow-[inset_0_0_8px_rgba(239,68,68,0.03)]'
                        : 'border-rose-500 bg-rose-50 text-rose-800'
                      : isDark
                        ? 'border-amber-500 bg-amber-500/5 text-amber-300'
                        : 'border-amber-500 bg-amber-50 text-amber-800'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex items-center gap-1 text-[9px] font-bold">
                      {alarm.severity === 'CRITICAL' ? (
                        <span className="text-rose-500 shrink-0 font-extrabold uppercase">[CRIT]</span>
                      ) : (
                        <span className="text-amber-500 shrink-0 font-extrabold uppercase">[WARN]</span>
                      )}
                      <span className="uppercase tracking-wider">
                        {alarm.tag} : {alarm.device}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 leading-none mt-0.5">{alarm.time}</span>
                  </div>

                  <p className={`text-[10px] leading-relaxed font-mono break-words ${
                    isDark ? 'text-slate-300' : 'text-slate-700'
                  }`}>{alarm.message}</p>

                  {!alarm.acknowledged && (
                    <button
                      onClick={() => onAcknowledgeAlarm(alarm.id)}
                      className={`self-end px-2 py-0.5 mt-1 border font-mono text-[9px] font-semibold flex items-center gap-0.5 transition ${
                        isDark 
                          ? 'bg-slate-950 hover:bg-slate-800 border-slate-800 text-slate-300'
                          : 'bg-white hover:bg-slate-50 border-slate-300 text-slate-700'
                      }`}
                    >
                      <Check className="w-2.5 h-2.5 text-emerald-500" />
                      ACK
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>

        {/* Info footer */}
        <div className={`border-t p-3 text-center transition-colors shrink-0 mt-auto ${
          isDark ? 'bg-slate-950/80 border-slate-900' : 'bg-slate-50 border-slate-200'
        }`}>
          <p className="text-[9px] font-mono font-bold tracking-wider text-slate-500 uppercase flex items-center justify-center gap-1.5">
            <Info className="w-3 h-3" />
            Click piping components or valves to alter system flow-states.
          </p>
        </div>
      </div>
    </aside>
  );
}
