'use client';

import React, { useState, useEffect, useRef } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { Activity, Power, Gauge } from 'lucide-react';
import type { CanvasNodeConfig, PipeSegmentConfig, PipeColorId } from '@/types/canvas';
import { PIPE_COLOR_PRESETS } from '@/types/canvas';
import { useCanvasState } from '@/hooks/useCanvasState';
import NodeSidebar from '@/components/hmi/NodeSidebar';
import NumberFlow from '@/components/NumberFlow';
import { useTheme } from '@/context/ThemeContext';

/* ═══════════════════════════════════════════════════════
   DEFAULT CANVAS CONFIGURATION
   ═══════════════════════════════════════════════════════ */

const DEFAULT_NODES: CanvasNodeConfig[] = [
  { id: 'BOILER', tag: 'BOILER', label: 'Main Boiler', type: 'boiler', visible: true },
  { id: 'HEADER-BLR', tag: 'HEADER-BLR', label: 'Header Boiler', type: 'header_boiler', visible: true },
  { id: 'PT-HB', tag: 'PT-HB', label: 'Header Pressure', type: 'sensor', visible: true },
  { id: 'TT-HB', tag: 'TT-HB', label: 'Header Temperature', type: 'sensor', visible: true },
  { id: 'FT-HB', tag: 'FT-HB', label: 'Steam Flow Meter', type: 'flowmeter', visible: true },
  { id: 'STEAM-OUT', tag: 'STEAM-OUT', label: 'Steam Consumers', type: 'consumer', visible: true },
];

const DEFAULT_PIPES: PipeSegmentConfig[] = [
  { id: 'boiler-to-header', label: 'Boiler → Header', colorId: 'cyan' },
  { id: 'header-to-consumer', label: 'Header → Consumer', colorId: 'green' },
];

/* ═══════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════ */

export default function SteamPlantPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const {
    config, isNodeVisible, toggleNodeVisibility, deleteNode,
    getPipeColor, setPipeColor, addNode, addPipe, restoreAll, hiddenCount,
  } = useCanvasState('hmi-steam-plant', DEFAULT_NODES, DEFAULT_PIPES);

  // Simulated telemetry for boiler
  const [ptHb, setPtHb] = useState(12.04);
  const [ttHb, setTtHb] = useState(181.0);
  const [ftHb, setFtHb] = useState(3471);
  const [ftActive, setFtActive] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = useState<number | null>(null);

  useEffect(() => {
    const obs = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        setFitScale(Math.min(width / 1000, height / 420, 1.2));
      }
    });
    if (containerRef.current) obs.observe(containerRef.current);
    return () => obs.disconnect();
  }, []);

  // Simulation tick
  useEffect(() => {
    const id = setInterval(() => {
      setPtHb((p) => Number((12.0 + Math.sin(Date.now() / 8000) * 0.3 + (Math.random() - 0.5) * 0.1).toFixed(2)));
      setTtHb((t) => Number((180.0 + Math.sin(Date.now() / 6000) * 2 + (Math.random() - 0.5) * 0.5).toFixed(1)));
      setFtHb((f) => Math.round(3400 + Math.sin(Date.now() / 5000) * 80 + (Math.random() - 0.5) * 20));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const V = isNodeVisible;

  const ps = (segId: string) => {
    const colorId = getPipeColor(segId);
    const preset = PIPE_COLOR_PRESETS[colorId];
    const active = segId === 'header-to-consumer' ? ftActive : true;
    return {
      core: active ? preset.core : (isDark ? '#1e293b' : '#D8E1EA'),
      dash: active ? preset.dash : 'transparent',
      fill: active ? preset.fill : (isDark ? '#1e293b' : '#D8E1EA'),
      bg: isDark ? '#1e293b' : '#EBF0F6',
    };
  };

  const fmStyle = ftActive
    ? { wrapper: 'border-l-2 border-[#59C7F9] shadow-[0_0_10px_rgba(89,199,249,0.15)] bg-white dark:bg-slate-900', icon: 'text-[#00B8FF]', val: 'text-[#00B8FF]' }
    : { wrapper: 'border-l-2 border-[#D8E1EA] dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40', icon: 'text-slate-300', val: 'text-slate-400' };

  return (
    <div className={`w-screen h-screen flex overflow-hidden transition-colors ${isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      {/* LEFT */}
      <NodeSidebar
        title="Steam Plant"
        nodes={config.nodes}
        pipes={config.pipes}
        onToggleNode={toggleNodeVisibility}
        onDeleteNode={deleteNode}
        onRestoreAll={restoreAll}
        onChangePipeColor={setPipeColor}
        onAddNode={addNode}
        onAddPipe={addPipe}
        hiddenCount={hiddenCount}
      />

      {/* CENTER CANVAS */}
      <div ref={containerRef} className={`relative flex-1 select-none min-h-[400px] h-full overflow-hidden ${isDark ? 'bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-slate-950' : 'bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] bg-[#F5F7FA]'} [background-size:20px_20px] [background-position:center_center]`}>
        <style>{`
          @keyframes flow-dash { to { stroke-dashoffset: -40; } }
          .anim-flow { animation: flow-dash 2.5s linear infinite; }
        `}</style>

        {fitScale !== null && (
          <TransformWrapper initialScale={1} minScale={fitScale} maxScale={3} limitToBounds>
            <TransformComponent wrapperClass="!w-full !h-full">
              <div className="relative w-[950px] h-[380px] shrink-0">

                <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 950 380">
                  <defs>
                    <filter id="glow-s" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="5" result="b"/><feComposite in="SourceGraphic" in2="b" operator="over"/></filter>
                    <linearGradient id="gt-ls" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#e2e8f0"/><stop offset="30%" stopColor="#f8fafc"/><stop offset="70%" stopColor="#f1f5f9"/><stop offset="100%" stopColor="#cbd5e1"/></linearGradient>
                    <linearGradient id="gt-ds" x1="0%" y1="0%" x2="100%" y2="0%"><stop offset="0%" stopColor="#1e293b"/><stop offset="30%" stopColor="#475569"/><stop offset="70%" stopColor="#334155"/><stop offset="100%" stopColor="#0f172a"/></linearGradient>
                    <linearGradient id="gws" x1="0%" y1="0%" x2="0%" y2="100%"><stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8"/><stop offset="100%" stopColor="#0284c7" stopOpacity="0.95"/></linearGradient>
                  </defs>

                  {/* Section Labels */}
                  <text x="160" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase" textAnchor="middle">Boiler Plant</text>
                  <text x="470" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase" textAnchor="middle">Steam Header</text>
                  <text x="800" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase" textAnchor="middle">Steam Consumers</text>

                  {/* Pipe shields */}
                  <path d="M 160,210 L 160,170 L 370,170" fill="none" style={{ stroke: ps('boiler-to-header').bg }} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M 470,170 L 850,170" fill="none" style={{ stroke: ps('header-to-consumer').bg }} strokeWidth="8" strokeLinecap="round"/>

                  {/* Pipe cores */}
                  <path d="M 160,210 L 160,170 L 370,170" fill="none" style={{ stroke: ps('boiler-to-header').core }} strokeWidth="3" strokeLinejoin="round"/>
                  <line x1="160" y1="210" x2="160" y2="170" strokeDasharray="6,10" strokeWidth="2.5" style={{ stroke: ps('boiler-to-header').dash }} className="anim-flow"/>
                  <line x1="160" y1="170" x2="370" y2="170" strokeDasharray="6,10" strokeWidth="2.5" style={{ stroke: ps('boiler-to-header').dash }} className="anim-flow"/>

                  <path d="M 470,170 L 850,170" fill="none" style={{ stroke: ps('header-to-consumer').core }} strokeWidth="3"/>
                  {ftActive && <line x1="470" y1="170" x2="850" y2="170" strokeDasharray="6,10" strokeWidth="2.5" style={{ stroke: ps('header-to-consumer').dash }} className="anim-flow"/>}
                  <polygon points="845,166 855,170 845,174" style={{ fill: ps('header-to-consumer').fill }}/>

                  {/* BOILER */}
                  {V('BOILER') && (
                    <g transform="translate(100, 210)">
                      <path d="M 0 160 L 120 160 L 120 60 A 60 60 0 0 0 0 60 Z" className="fill-slate-300 dark:fill-[#020617]" opacity="0.6" filter="url(#glow-s)"/>
                      <path d="M 0 160 L 120 160 L 120 60 A 60 60 0 0 0 0 60 Z" className="fill-[url(#gt-ls)] dark:fill-[url(#gt-ds)] stroke-slate-400 dark:stroke-[#475569]" strokeWidth="2.5"/>
                      <text x="60" y="35" fill="#94a3b8" className="font-mono text-[12px] font-extrabold tracking-widest uppercase" textAnchor="middle">BOILER</text>
                      <rect x="40" y="55" width="40" height="65" rx="20" className="fill-slate-800 dark:fill-[#090d16] stroke-slate-500 dark:stroke-[#1e293b]" strokeWidth="1.5"/>
                      <clipPath id="bwc"><rect x="40" y="55" width="40" height="65" rx="20"/></clipPath>
                      <g clipPath="url(#bwc)">
                        <rect x="40" y="55" width="40" height="65" className="fill-slate-800 dark:fill-[#090d16]"/>
                        <path fill="url(#gws)" opacity="0.9"><animate attributeName="d" values="M0,80 Q30,70 60,80 T120,80 L120,130 L0,130 Z; M0,80 Q30,90 60,80 T120,80 L120,130 L0,130 Z; M0,80 Q30,70 60,80 T120,80 L120,130 L0,130 Z" dur="3s" repeatCount="indefinite"/></path>
                      </g>
                      <rect x="43" y="58" width="8" height="59" rx="4" fill="#ffffff" opacity="0.1"/>
                      <g transform="translate(30, 130)">
                        <rect x="0" y="0" width="60" height="20" rx="10" className="fill-[#1a0f00] stroke-slate-500 dark:stroke-[#334155]" strokeWidth="1.5"/>
                        <g className="animate-pulse">
                          <path d="M 10,6 L 50,6 M 10,10 L 50,10 M 10,14 L 50,14" className="stroke-[#ea580c] blur-[2px]" strokeWidth="5" strokeLinecap="round"/>
                          <path d="M 10,6 L 50,6 M 10,10 L 50,10 M 10,14 L 50,14" className="stroke-[#f97316] blur-[1px]" strokeWidth="3" strokeLinecap="round"/>
                          <path d="M 10,6 L 50,6 M 10,10 L 50,10 M 10,14 L 50,14" className="stroke-[#fed7aa]" strokeWidth="1.5" strokeLinecap="round"/>
                        </g>
                      </g>
                    </g>
                  )}

                  {/* HEADER BOILER */}
                  {V('HEADER-BLR') && (
                    <g transform="translate(370, 154)">
                      <rect x="0" y="0" width="100" height="32" rx="16" className="fill-slate-300 dark:fill-[#020617]" opacity="0.6" filter="url(#glow-s)"/>
                      <rect x="20" y="28" width="8" height="12" className="fill-slate-600 dark:fill-slate-800 stroke-slate-800 dark:stroke-[#334155]" strokeWidth="1"/>
                      <rect x="72" y="28" width="8" height="12" className="fill-slate-600 dark:fill-slate-800 stroke-slate-800 dark:stroke-[#334155]" strokeWidth="1"/>
                      <rect x="0" y="0" width="100" height="32" rx="16" className="fill-[url(#gt-ls)] dark:fill-[url(#gt-ds)] stroke-slate-400 dark:stroke-[#475569]" strokeWidth="2.5"/>
                      <line x1="22" y1="0" x2="22" y2="32" className="stroke-slate-400 dark:stroke-[#334155]" strokeWidth="1.5"/>
                      <line x1="78" y1="0" x2="78" y2="32" className="stroke-slate-400 dark:stroke-[#334155]" strokeWidth="1.5"/>
                      <circle cx="50" cy="16" r="10" className="fill-slate-200 dark:fill-slate-700 stroke-slate-500 dark:stroke-[#475569]" strokeWidth="1.5"/>
                      <circle cx="50" cy="16" r="3.5" className="fill-slate-300 dark:fill-slate-800 stroke-slate-500 dark:stroke-[#475569]" strokeWidth="1"/>
                      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => { const r = (a * Math.PI) / 180; return <circle key={a} cx={50 + 7 * Math.cos(r)} cy={16 + 7 * Math.sin(r)} r="0.5" className="fill-slate-500"/>; })}
                      <text x="50" y="55" fill="#94a3b8" className="font-mono text-[10px] font-extrabold tracking-widest uppercase pointer-events-none" textAnchor="middle">HEADER BOILER</text>
                    </g>
                  )}

                  {/* Leader lines */}
                  <g className="stroke-slate-400 dark:stroke-slate-500 opacity-60" strokeWidth="1" strokeDasharray="3,3" fill="none">
                    {V('PT-HB') && <><path d="M 420,120 L 420,154" strokeLinejoin="round"/><circle cx="420" cy="154" r="2" className="fill-[#94a3b8] stroke-none"/></>}
                    {V('TT-HB') && <><path d="M 510,120 L 510,170" strokeLinejoin="round"/><circle cx="510" cy="170" r="2" className="fill-[#94a3b8] stroke-none"/></>}
                  </g>
                </svg>

                {/* HTML NODE OVERLAYS */}

                {/* PT-HB */}
                {V('PT-HB') && (
                  <div className="absolute left-[380px] top-[85px] px-2 py-0.5 rounded border border-[#59C7F9] bg-white dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer z-10 w-[80px] flex flex-col items-center">
                    <div className="text-[8px] text-slate-500 font-mono font-black leading-none mb-0.5">PT-HB</div>
                    <span className="text-[10px] font-mono font-bold text-[#00B8FF]"><NumberFlow value={ptHb} format={(v) => v.toFixed(2)}/> bar</span>
                  </div>
                )}

                {/* TT-HB */}
                {V('TT-HB') && (
                  <div className="absolute left-[470px] top-[85px] px-2 py-0.5 rounded border border-[#59C7F9] bg-white dark:bg-slate-900 transition-all hover:-translate-y-0.5 hover:shadow-md cursor-pointer z-10 w-[80px] flex flex-col items-center">
                    <div className="text-[8px] text-slate-500 font-mono font-black leading-none mb-0.5">TT-HB</div>
                    <span className="text-[10px] font-mono font-bold text-[#00B8FF]"><NumberFlow value={ttHb} format={(v) => v.toFixed(1)}/> °C</span>
                  </div>
                )}

                {/* FT-HB */}
                {V('FT-HB') && (
                  <div className={`absolute left-[650px] top-[130px] w-[96px] bg-white dark:bg-slate-900 border ${fmStyle.wrapper} rounded-none p-1.5 flex flex-col transition-all z-10 hover:-translate-y-0.5 hover:shadow-md`}>
                    <div className="flex items-start justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                      <div className="flex flex-col"><span className="font-mono font-black text-[9px] text-slate-500 tracking-wider leading-tight">FT-HB</span><span className="text-[6.5px] font-bold text-slate-400 tracking-widest uppercase">Flow Meter</span></div>
                      <Activity className={`w-3 h-3 ${fmStyle.icon}`}/>
                    </div>
                    <div className="flex items-baseline justify-center gap-1 mb-1 bg-slate-50 dark:bg-slate-900/50 py-1.5 rounded">
                      <div className={`text-[12px] font-mono font-bold leading-none ${fmStyle.val}`}><NumberFlow value={ftActive ? ftHb : 0} format={(v) => v.toFixed(0)}/></div>
                      <span className="text-[7.5px] font-bold text-slate-400">Nm³/h</span>
                    </div>
                    <button onClick={() => setFtActive(!ftActive)} className={`w-full py-1 rounded-none font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all ${ftActive ? 'bg-[#F0FAF5] border-[#16C784]/30 text-[#16C784] hover:bg-[#E1F6EB]' : 'bg-white border-[#D8E1EA] text-slate-400 hover:bg-[#F5F7FA]'}`}>
                      <Power className={`w-2.5 h-2.5 ${ftActive ? 'text-[#16C784]' : 'text-slate-400'}`}/>{ftActive ? 'Stop' : 'Start'}
                    </button>
                  </div>
                )}

                {/* STEAM CONSUMERS label */}
                {V('STEAM-OUT') && (
                  <div className="absolute left-[830px] top-[148px] w-[100px] bg-white dark:bg-slate-900 border border-l-2 border-[#16C784] rounded-none p-1.5 text-center">
                    <div className="text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300 tracking-wider">STEAM OUT</div>
                    <div className="text-[9px] font-mono text-slate-400 mt-0.5">CONSUMERS</div>
                    <div className={`h-1.5 w-1.5 rounded-full mx-auto mt-1 ${ftActive ? 'bg-[#16C784] animate-ping' : 'bg-slate-300'}`}/>
                  </div>
                )}

              </div>
            </TransformComponent>
          </TransformWrapper>
        )}
      </div>
    </div>
  );
}
