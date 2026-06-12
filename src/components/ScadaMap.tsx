"use client";

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import {
  Fan,
  Droplets,
  Gauge,
  Thermometer,
  Zap,
  Power,
  RotateCw,
  Sliders,
  Sparkles,
  ArrowDown,
  Lock,
  Unlock,
  Activity,
} from 'lucide-react';
import { SystemTelemetry, MachineStatus } from '@/types/scada';
import NumberFlow from './NumberFlow';

interface ScadaMapProps {
  telemetry: SystemTelemetry;
  onToggleCompressor: (id: string) => void;
  onSetCompressorFault: (id: string) => void;
  onToggleValve: (id: string) => void;
  onToggleDryerStatus: (id: string) => void;
}

export default function ScadaMap({
  telemetry,
  onToggleCompressor,
  onSetCompressorFault,
  onToggleValve,
  onToggleDryerStatus,
}: ScadaMapProps) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [fitScale, setFitScale] = React.useState<number | null>(null);

  const [flowMeters, setFlowMeters] = React.useState<Record<string, boolean>>({
    'FT-HB': true,
    'FT-101': true,
    'FT-201': true,
    'FT-202': true,
  });

  const toggleFlowMeter = (id: string) => {
    setFlowMeters((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getFlowMeterStyle = (isActive: boolean, isAnomaly: boolean) => {
    if (isAnomaly) {
      return {
        wrapper: 'border-l-2 border-[#FF5A5F] bg-[#FFF0F1] dark:bg-rose-950/30 shadow-[0_0_8px_rgba(255,90,95,0.15)]',
        icon: 'text-[#FF5A5F] animate-pulse',
        valueText: 'text-[#FF5A5F]',
      };
    } else if (isActive) {
      return {
        wrapper: 'border-l-2 border-[#59C7F9] shadow-[0_0_10px_rgba(89,199,249,0.15)] bg-white dark:bg-slate-900',
        icon: 'text-[#00B8FF]',
        valueText: 'text-[#00B8FF]',
      };
    } else {
      return {
        wrapper: 'border-l-2 border-[#D8E1EA] dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40',
        icon: 'text-slate-300',
        valueText: 'text-slate-400',
      };
    }
  };

  const [simulatedAnomalies, setSimulatedAnomalies] = React.useState<Record<string, boolean>>({});

  const toggleAnomaly = (id: string) => {
    setSimulatedAnomalies((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  React.useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const triggerRandomAnomaly = () => {
      // List of sensors/components that can show an anomaly
      const sensors = ['TK-101', 'PT-102', 'PT-201', 'TT-201', 'PT-202', 'TT-202', 'DPT-101', 'TT-101', 'PT-HB', 'TT-HB'];
      const randomSensor = sensors[Math.floor(Math.random() * sensors.length)];
      
      // Turn on anomaly
      setSimulatedAnomalies(prev => ({ ...prev, [randomSensor]: true }));
      
      // Turn off after 2 to 5 seconds
      setTimeout(() => {
        setSimulatedAnomalies(prev => ({ ...prev, [randomSensor]: false }));
      }, 2000 + Math.random() * 3000);

      // Schedule next anomaly in 3 to 8 seconds
      timeoutId = setTimeout(triggerRandomAnomaly, 3000 + Math.random() * 5000);
    };

    // Start first anomaly after 1.5 seconds
    timeoutId = setTimeout(triggerRandomAnomaly, 1500);

    return () => clearTimeout(timeoutId);
  }, []);

  React.useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const { width, height } = entries[0].contentRect;
        const scaleX = width / 1150;
        const scaleY = height / 880;
        setFitScale(Math.min(scaleX, scaleY, 1.2));
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Helper to determine sensor border/text styling based on telemetry threshold status
  const getSensorStyles = (tag: string, value: number, type: 'pressure' | 'flow' | 'temp' | 'dewpoint') => {
    let status: 'NORMAL' | 'WARNING' | 'ALARM' = 'NORMAL';

    if (type === 'pressure') {
      if (value > 8.3 || value < 5.4) status = 'ALARM';
      else if (value > 8.0 || value < 5.8) status = 'WARNING';
    } else if (type === 'temp') {
      if (value > 50) status = 'ALARM';
      else if (value > 40) status = 'WARNING';
    } else if (type === 'dewpoint') {
      if (value > 5) status = 'ALARM';
      else if (value > -10) status = 'WARNING';
    }

    switch (status) {
      case 'ALARM':
        return {
          border: 'border border-l-2 border-[#FF5A5F] bg-[#FFF0F1] dark:bg-rose-950/30 rounded-none shadow-[0_0_8px_rgba(255,90,95,0.15)]',
          bg: 'bg-[#FFF0F1] dark:bg-rose-950/30',
          text: 'text-[#FF5A5F] dark:text-rose-400',
          labelBg: 'bg-[#FFE5E6] dark:bg-rose-900',
          iconColor: 'text-[#FF5A5F] dark:text-rose-400 animate-pulse',
        };
      case 'WARNING':
        return {
          border: 'border border-l-2 border-[#FFB020] bg-[#FFFBF0] dark:bg-amber-950/20 rounded-none shadow-[0_0_8px_rgba(255,176,32,0.1)]',
          bg: 'bg-[#FFFBF0] dark:bg-amber-950/20',
          text: 'text-[#FFB020] dark:text-amber-400',
          labelBg: 'bg-[#FFF4D9] dark:bg-amber-900',
          iconColor: 'text-[#FFB020] dark:text-amber-400',
        };
      default:
        return {
          border: 'border border-l-2 border-[#59C7F9] bg-white dark:bg-slate-900 rounded-none shadow-sm',
          bg: 'bg-white dark:bg-slate-900',
          text: 'text-[#00B8FF] dark:text-cyan-400',
          labelBg: 'bg-[#F5F7FA] dark:bg-slate-950',
          iconColor: 'text-slate-400 dark:text-slate-400',
        };
    }
  };

  // Check which sections have active air flow/pressure based on compressor run configurations and valve states
  const checkSectionState = (section: string) => {
    const isAnyCompRunning = telemetry.compressors.some((c) => c.status === 'RUN');
    const isDryerRunning = telemetry.dryers.some((d) => d.status === 'RUN');
    const hasCentralFeed = isAnyCompRunning && isDryerRunning;
    const isMainValveOpen = telemetry.valves['XV-101'].open;

    switch (section) {
      case 'compressor_room_out':
        return isAnyCompRunning;
      case 'dryer_feed':
        return isAnyCompRunning;
      case 'dryer_1_pass':
        return isAnyCompRunning && telemetry.dryers[0].status === 'RUN';
      case 'dryer_2_pass':
        return isAnyCompRunning && telemetry.dryers[1].status === 'RUN';
      case 'tank_inlet':
        return hasCentralFeed;
      case 'main_header_isolated':
        // Pipe between tank and main isolation valve XV-101
        return hasCentralFeed && telemetry.tank.pressure > 0.5;
      case 'main_header_out':
        // Pipe after XV-101
        return hasCentralFeed && telemetry.tank.pressure > 0.5 && isMainValveOpen && flowMeters['FT-101'];
      case 'weaving_branch':
        return (
          hasCentralFeed &&
          telemetry.tank.pressure > 0.5 &&
          isMainValveOpen &&
          telemetry.valves['XV-201'].open &&
          flowMeters['FT-201']
        );
      case 'spinning_branch':
        return (
          hasCentralFeed &&
          telemetry.tank.pressure > 0.5 &&
          isMainValveOpen &&
          telemetry.valves['XV-202'].open &&
          flowMeters['FT-202']
        );
      default:
        return false;
    }
  };

  // Helper to choose color of the pipeline glow
  const getPipeColors = (section: string) => {
    const active = checkSectionState(section);
    return {
      core: active ? 'stroke-[#59C7F9] dark:stroke-cyan-500' : 'stroke-[#D8E1EA] dark:stroke-slate-800',
      glow: active ? 'opacity-80' : 'opacity-20',
      dashClass: active ? 'stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow' : 'stroke-transparent',
    };
  };

  // Dynamic flow speed calculation based on total demand output
  let flowAnimationSpeed = '3s';
  const totalFlow = telemetry.header.flow;
  if (totalFlow > 1500) {
    flowAnimationSpeed = '1.2s';
  } else if (totalFlow > 800) {
    flowAnimationSpeed = '2.2s';
  } else if (totalFlow > 100) {
    flowAnimationSpeed = '4.5s';
  }

  // Generate dynamic state variables for sensors
  const pt101 = simulatedAnomalies['TK-101'] ? 9.5 : telemetry.tank.pressure;
  const pt102 = simulatedAnomalies['PT-102'] ? 9.2 : telemetry.header.pressure;
  const pt201 = simulatedAnomalies['PT-201'] ? 9.0 : telemetry.branches.weaving.pressure;
  const pt202 = simulatedAnomalies['PT-202'] ? 9.0 : telemetry.branches.spinning.pressure;

  const ft101 = flowMeters['FT-101'] ? telemetry.header.flow : 0;
  const ft201 = flowMeters['FT-201'] ? telemetry.branches.weaving.flow : 0;
  const ft202 = flowMeters['FT-202'] ? telemetry.branches.spinning.flow : 0;

  const dpt101 = simulatedAnomalies['DPT-101'] ? 8.5 : telemetry.dryers.find((d) => d.status === 'RUN')?.dewPoint ?? 15.0;
  const tt101 = simulatedAnomalies['TT-101'] ? 55.0 : telemetry.dryers.find((d) => d.status === 'RUN')?.outletTemp ?? 21.5;
  const tt201 = simulatedAnomalies['TT-201'] ? 55.0 : telemetry.branches.weaving.temp;
  const tt202 = simulatedAnomalies['TT-202'] ? 55.0 : telemetry.branches.spinning.temp;

  // Derived simulated values for Boiler System
  const pt_hb = 12.0 + (telemetry.header.pressure % 0.8);
  const tt_hb = 180.0 + (telemetry.header.flow % 5);
  const ft_hb = flowMeters['FT-HB'] ? 3400 + (telemetry.header.flow % 100) : 0;

  return (
    <div ref={containerRef} className="relative flex-1 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#1e293b_1px,transparent_1px)] bg-[#F5F7FA] dark:bg-slate-950 [background-size:20px_20px] [background-position:center_center] select-none min-h-[700px] w-full h-full overflow-hidden">
      {/* Dynamic inline styles for the moving dashed lines */}
      <style>{`
        @keyframes flow-dash {
          to {
            stroke-dashoffset: -40;
          }
        }
        .animate-flow {
          animation: flow-dash ${flowAnimationSpeed} linear infinite;
        }
      `}</style>

      {fitScale !== null && (
        <TransformWrapper
          initialScale={1}
          minScale={fitScale}
          maxScale={3}
          limitToBounds={true}
          wheel={{ wheelDisabled: false }}
        >
          <TransformComponent wrapperClass="!w-full !h-full">
            {/* The Map Area */}
            <div className="relative w-[1120px] h-[850px] shrink-0">
              
        {/* SVG PIPING AND SYMBOLS BACKGROUND */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 1120 850">
          
          {/* DEFINITIONS FOR GRADIENTS AND GLOW EFFECT */}
          <defs>
            <filter id="glow-heavy" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-light" x="-10%" y="-10%" width="120%" height="120%">
              <feGaussianBlur stdDeviation="2" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <linearGradient id="gradient-tank-light" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="30%" stopColor="#f8fafc" />
              <stop offset="70%" stopColor="#f1f5f9" />
              <stop offset="100%" stopColor="#cbd5e1" />
            </linearGradient>
            <linearGradient id="gradient-tank-dark" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#1e293b" />
              <stop offset="30%" stopColor="#475569" />
              <stop offset="70%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0f172a" />
            </linearGradient>
            <linearGradient id="gradient-water" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#0284c7" stopOpacity="0.95" />
            </linearGradient>
          </defs>

          {/* SECTION LABELS */}
          <text x="110" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Compressor Room</text>
          <text x="350" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Dryer Station</text>
          <text x="520" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Buffer Tank</text>
          <text x="680" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Distribution Header</text>
          <text x="960" y="40" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Plant Consumers</text>
          
          {/* SYSTEM SEPARATOR */}
          <line x1="20" y1="520" x2="1100" y2="520" stroke="#cbd5e1" strokeDasharray="10,10" strokeWidth="2" className="dark:stroke-slate-800" />
          <text x="560" y="510" fill="#94a3b8" className="font-mono text-[10px] font-bold tracking-widest uppercase text-center dark:fill-slate-600" textAnchor="middle">STEAM GENERATION PLANT</text>

          {/* Boiler Section Labels */}
          <text x="240" y="550" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Boiler Plant</text>
          <text x="570" y="550" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Header Boiler</text>
          <text x="950" y="550" className="fill-slate-400 font-mono text-xs font-bold tracking-widest uppercase text-center" textAnchor="middle">Steam Consumers</text>

          {/* PIPE SHIELD GUARDS / BACKGROUND SEGMENTS (Standard Steel Pipeline Walls) */}
          {/* Compressor Outlets */}
          <path d="M 170,105 L 240,105" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" />
          <path d="M 170,245 L 240,245" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" />
          <path d="M 170,385 L 240,385" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" />
          
          {/* Vertical Collector Header */}
          <path d="M 240,100 L 240,390" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" />
          
          {/* Main pipe going into dryers split */}
          <path d="M 240,245 L 280,245" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" />
          
          {/* Dryer parallel splits */}
          <path d="M 280,240 L 280,185 L 305,185" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 280,240 L 280,305 L 305,305" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Dryer Outlets to Recombine */}
          <path d="M 385,185 L 425,185 L 425,245" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 385,305 L 425,305 L 425,245" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Into tank header */}
          <path d="M 425,245 L 470,245" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" />

          {/* Tank Outlet to split header */}
          <path d="M 540,185 L 740,185" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" />

          {/* Branch Splits */}
          <path d="M 740,180 L 740,115 L 1000,115" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M 740,180 L 740,365 L 1000,365" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />

          {/* Main Boiler to Header Line */}
          <path d="M 240,640 L 240,600 L 450,600" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
          
          {/* Header Boiler (thick manifold pipe) */}
          {/* The header boiler body itself acts as the pipe here visually */}

          {/* Header Boiler -> Flow Meter -> Main (6" -> 8") */}
          <path d="M 550,600 L 950,600" fill="none" className="stroke-[#EBF0F6] dark:stroke-[#1e293b]" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />


          {/* 1. COMPRESSOR 1 PIPE CORE */}
          <path d="M 170,105 L 240,105" fill="none" className={getPipeColors('compressor_room_out').core} strokeWidth="3" />
          <line x1="170" y1="105" x2="240" y2="105" strokeDasharray="6,10" strokeWidth="2.5" className={getPipeColors('compressor_room_out').dashClass} />

          {/* 2. COMPRESSOR 2 PIPE CORE */}
          <path d="M 170,245 L 240,245" fill="none" className={getPipeColors('compressor_room_out').core} strokeWidth="3" />
          <line x1="170" y1="245" x2="240" y2="245" strokeDasharray="6,10" strokeWidth="2.5" className={getPipeColors('compressor_room_out').dashClass} />

          {/* 3. COMPRESSOR 3 PIPE CORE */}
          <path d="M 170,385 L 240,385" fill="none" className={getPipeColors('compressor_room_out').core} strokeWidth="3" />
          <line x1="170" y1="385" x2="240" y2="385" strokeDasharray="6,10" strokeWidth="2.5" className={getPipeColors('compressor_room_out').dashClass} />

          {/* Vertical Collector Pipeline Core */}
          <path d="M 240,103 L 240,387" fill="none" className={getPipeColors('dryer_feed').core} strokeWidth="3" />
          {checkSectionState('dryer_feed') && (
            <path d="M 240,103 L 240,387" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" />
          )}

          {/* Pipe from Collectors to split core */}
          <path d="M 240,245 L 280,245" fill="none" className={getPipeColors('dryer_feed').core} strokeWidth="3" />
          <line x1="240" y1="245" x2="280" y2="245" strokeDasharray="6,10" strokeWidth="2.5" className={getPipeColors('dryer_feed').dashClass} />

          {/* Split Up to Dryer 1 Core */}
          <path d="M 280,245 L 280,185 L 305,185" fill="none" className={getPipeColors('dryer_1_pass').core} strokeWidth="3" strokeLinejoin="round" />
          {checkSectionState('dryer_1_pass') && (
            <path d="M 280,245 L 280,185 L 305,185" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" strokeLinejoin="round" />
          )}

          {/* Split Down to Dryer 2 Core */}
          <path d="M 280,245 L 280,305 L 305,305" fill="none" className={getPipeColors('dryer_2_pass').core} strokeWidth="3" strokeLinejoin="round" />
          {checkSectionState('dryer_2_pass') && (
            <path d="M 280,245 L 280,305 L 305,305" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" strokeLinejoin="round" />
          )}

          {/* Dryer 1 Outlet Core after DRY-01 */}
          <path d="M 385,185 L 425,185 L 425,245" fill="none" className={getPipeColors('dryer_1_pass').core} strokeWidth="3" strokeLinejoin="round" />
          {checkSectionState('dryer_1_pass') && (
            <path d="M 385,185 L 425,185 L 425,245" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" strokeLinejoin="round" />
          )}

          {/* Dryer 2 Outlet Core after DRY-02 */}
          <path d="M 385,305 L 425,305 L 425,245" fill="none" className={getPipeColors('dryer_2_pass').core} strokeWidth="3" strokeLinejoin="round" />
          {checkSectionState('dryer_2_pass') && (
            <path d="M 385,305 L 425,305 L 425,245" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" strokeLinejoin="round" />
          )}

          {/* Merge into TK-101 inlet core */}
          <path d="M 425,245 L 470,245" fill="none" className={getPipeColors('tank_inlet').core} strokeWidth="3" />
          <line x1="425" y1="245" x2="470" y2="245" strokeDasharray="6,10" strokeWidth="2.5" className={getPipeColors('tank_inlet').dashClass} />

          {/* Main Air Header Core after tank (before separation) */}
          <path d="M 540,185 L 740,185" fill="none" className={getPipeColors('main_header_isolated').core} strokeWidth="3" />
          {/* Main header dashes depends on if XV-101 is open */}
          {checkSectionState('main_header_out') ? (
            <path d="M 540,185 L 740,185" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" />
          ) : checkSectionState('main_header_isolated') ? (
            <path d="M 540,185 L 600,185" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" />
          ) : null}

          {/* Weaving Branch Core splitting up */}
          <path d="M 740,185 L 740,115 L 1000,115" fill="none" className={getPipeColors('weaving_branch').core} strokeWidth="3" strokeLinejoin="round" />
          {checkSectionState('weaving_branch') && (
            <path d="M 740,185 L 740,115 L 1000,115" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" strokeLinejoin="round" />
          )}

          {/* Spinning Branch Core splitting down */}
          <path d="M 740,185 L 740,365 L 1000,365" fill="none" className={getPipeColors('spinning_branch').core} strokeWidth="3" strokeLinejoin="round" />
          {checkSectionState('spinning_branch') && (
            <path d="M 740,185 L 740,365 L 1000,365" fill="none" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" strokeLinejoin="round" />
          )}



          {/* FLOW BUBBLES IN THE PIPES (Subtle moving dots for direction of arrows) */}
          {/* Weaving Branch terminal arrow */}
          <polygon points="995,111 1005,115 995,119" className={checkSectionState('weaving_branch') ? 'fill-[#00B8FF] dark:fill-cyan-400' : 'fill-[#D8E1EA] dark:fill-slate-800'} />
          {/* Spinning Branch terminal arrow */}
          <polygon points="995,361 1005,365 995,369" className={checkSectionState('spinning_branch') ? 'fill-[#00B8FF] dark:fill-cyan-400' : 'fill-[#D8E1EA] dark:fill-slate-800'} />

          {/* Boiler -> Header Boiler Core */}
          <path d="M 240,640 L 240,600 L 450,600" fill="none" className="stroke-[#59C7F9] dark:stroke-cyan-500" strokeWidth="3" strokeLinejoin="round" />
          <line x1="240" y1="640" x2="240" y2="600" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" />
          <line x1="240" y1="600" x2="450" y2="600" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" />

          {/* Header Boiler -> End Core */}
          <path d="M 550,600 L 950,600" fill="none" className={flowMeters['FT-HB'] ? "stroke-[#59C7F9] dark:stroke-cyan-500" : "stroke-[#D8E1EA] dark:stroke-slate-800"} strokeWidth="3" strokeLinejoin="round" />
          {flowMeters['FT-HB'] && (
            <line x1="550" y1="600" x2="950" y2="600" strokeDasharray="6,10" strokeWidth="2.5" className="stroke-[#00B8FF] dark:stroke-cyan-300 animate-flow" />
          )}
          
          <polygon points="945,596 955,600 945,604" className={flowMeters['FT-HB'] ? "fill-[#00B8FF] dark:fill-cyan-400" : "fill-[#D8E1EA] dark:fill-slate-800"} />


          {/* 3. RECEIVER TANK DESIGN (TK-101) */}
          <g transform="translate(465, 140)" onClick={() => toggleAnomaly('TK-101')} className="cursor-pointer group">
            {/* Shadow and glow behind the tank */}
            <rect x="0" y="0" width="70" height="180" rx="35" className="fill-slate-300 dark:fill-[#020617]" opacity="0.6" filter="url(#glow-heavy)" />
            
            {/* Outer tank case */}
            <rect x="0" y="0" width="70" height="180" rx="35" className={simulatedAnomalies['TK-101'] ? "fill-[#FFF0F1] dark:fill-rose-950/30 stroke-red-500 animate-pulse transition-all" : "fill-[url(#gradient-tank-light)] dark:fill-[url(#gradient-tank-dark)] stroke-slate-400 dark:stroke-[#475569] transition-all"} strokeWidth="2.5" />
            
            {/* Metal trim rings */}
            <line x1="0" y1="50" x2="70" y2="50" className="stroke-slate-400 dark:stroke-[#334155]" strokeWidth="1.5" />
            <line x1="0" y1="130" x2="70" y2="130" className="stroke-slate-400 dark:stroke-[#334155]" strokeWidth="1.5" />

            {/* Simulated Water Window inside tank */}
            <rect x="25" y="40" width="20" height="100" rx="4" className="fill-slate-800 dark:fill-[#090d16] stroke-slate-500 dark:stroke-[#1e293b]" />
            
            {/* Moisture condensate water itself inside window */}
            <rect
              x="25"
              y={40 + (100 - telemetry.tank.condensateLevel)}
              width="20"
              height={telemetry.tank.condensateLevel}
              rx="2"
              fill="url(#gradient-water)"
              className="transition-all duration-300 shadow-[0_0_8px_rgba(56,189,248,0.4)]"
            />

            {/* Condensate grid tick marks */}
            <line x1="21" y1="50" x2="25" y2="50" stroke="#475569" strokeWidth="1" />
            <line x1="21" y1="90" x2="25" y2="90" stroke="#475569" strokeWidth="1" />
            <line x1="21" y1="130" x2="25" y2="130" stroke="#475569" strokeWidth="1" />

            {/* Tank tag text */}
            <text x="35" y="28" fill="#94a3b8" className="font-mono text-[10px] font-extrabold tracking-widest uppercase text-center group-hover:fill-[#00B8FF] transition-colors" textAnchor="middle">TK-101</text>
            <text x="35" y="162" className={`font-mono text-[10.5px] font-bold text-center ${simulatedAnomalies['TK-101'] ? 'fill-red-500' : 'fill-[#38bdf8]'}`} textAnchor="middle">{pt101.toFixed(2)} bar</text>
          </g>



          {/* ========================================================= */}
          {/* BOILER SYSTEM GRAPHICS */}
          {/* ========================================================= */}
          
          {/* 1. BOILER (Vertical Dome Furnace with Water Fill) */}
          <g transform="translate(180, 640)">
            {/* Shadow and glow behind the boiler */}
            <path d="M 0 160 L 120 160 L 120 60 A 60 60 0 0 0 0 60 Z" className="fill-slate-300 dark:fill-[#020617]" opacity="0.6" filter="url(#glow-heavy)" />
            
            {/* Outer boiler case */}
            <path id="boiler-dome-shape" d="M 0 160 L 120 160 L 120 60 A 60 60 0 0 0 0 60 Z" className="fill-[url(#gradient-tank-light)] dark:fill-[url(#gradient-tank-dark)] stroke-slate-400 dark:stroke-[#475569]" strokeWidth="2.5" />
            

            {/* Boiler tag text */}
            <text x="60" y="35" fill="#94a3b8" className="font-mono text-[12px] font-extrabold tracking-widest text-center uppercase" textAnchor="middle">BOILER</text>

            {/* Simulated Water Window inside tank */}
            <rect x="40" y="55" width="40" height="65" rx="20" className="fill-slate-800 dark:fill-[#090d16] stroke-slate-500 dark:stroke-[#1e293b]" strokeWidth="1.5" />
            
            {/* Water Fill inside Window with Wave Animation */}
            <clipPath id="boiler-window-clip">
              <rect x="40" y="55" width="40" height="65" rx="20" />
            </clipPath>
            <g clipPath="url(#boiler-window-clip)">
              <rect x="40" y="55" width="40" height="65" className="fill-slate-800 dark:fill-[#090d16]" />
              <path fill="url(#gradient-water)" opacity="0.9">
                <animate attributeName="d" 
                  values="M0,80 Q30,70 60,80 T120,80 L120,130 L0,130 Z; M0,80 Q30,90 60,80 T120,80 L120,130 L0,130 Z; M0,80 Q30,70 60,80 T120,80 L120,130 L0,130 Z" 
                  dur="3s" repeatCount="indefinite" />
              </path>
              <path fill="#0284c7" opacity="0.6" className="mix-blend-multiply dark:opacity-60">
                <animate attributeName="d" 
                  values="M0,83 Q30,93 60,83 T120,83 L120,130 L0,130 Z; M0,83 Q30,73 60,83 T120,83 L120,130 L0,130 Z; M0,83 Q30,93 60,83 T120,83 L120,130 L0,130 Z" 
                  dur="4s" repeatCount="indefinite" />
              </path>
            </g>

            {/* Window glass reflection */}
            <rect x="43" y="58" width="8" height="59" rx="4" fill="#ffffff" opacity="0.1" />

            {/* Glowing Heating Coils at the bottom */}
            <g transform="translate(30, 130)">
              {/* Burner Window / Coil Housing */}
              <rect x="0" y="0" width="60" height="20" rx="10" className="fill-[#1a0f00] stroke-slate-500 dark:stroke-[#334155]" strokeWidth="1.5" />
              
              {/* The Coils */}
              <g className="animate-pulse">
                <path d="M 10,6 L 50,6 M 10,10 L 50,10 M 10,14 L 50,14" className="stroke-[#ea580c] blur-[2px]" strokeWidth="5" strokeLinecap="round" />
                <path d="M 10,6 L 50,6 M 10,10 L 50,10 M 10,14 L 50,14" className="stroke-[#f97316] blur-[1px]" strokeWidth="3" strokeLinecap="round" />
                <path d="M 10,6 L 50,6 M 10,10 L 50,10 M 10,14 L 50,14" className="stroke-[#fed7aa]" strokeWidth="1.5" strokeLinecap="round" />
              </g>
            </g>
          </g>

          {/* 2. HEADER BOILER (Horizontal Tank with Gauges and Hatch) */}
          <g transform="translate(450, 584)">
            {/* Shadow and glow behind the header boiler */}
            <rect x="0" y="0" width="100" height="32" rx="16" className="fill-slate-300 dark:fill-[#020617]" opacity="0.6" filter="url(#glow-heavy)" />
            
            {/* Feet */}
            <rect x="20" y="28" width="8" height="12" className="fill-slate-600 dark:fill-slate-800 stroke-slate-800 dark:stroke-[#334155]" strokeWidth="1" />
            <rect x="72" y="28" width="8" height="12" className="fill-slate-600 dark:fill-slate-800 stroke-slate-800 dark:stroke-[#334155]" strokeWidth="1" />

            {/* Main Body Horizontal Pill Tank */}
            <rect x="0" y="0" width="100" height="32" rx="16" className="fill-[url(#gradient-tank-light)] dark:fill-[url(#gradient-tank-dark)] stroke-slate-400 dark:stroke-[#475569]" strokeWidth="2.5" />
            
            {/* Metal trim rings (Vertical for horizontal tank) */}
            <line x1="22" y1="0" x2="22" y2="32" className="stroke-slate-400 dark:stroke-[#334155]" strokeWidth="1.5" />
            <line x1="78" y1="0" x2="78" y2="32" className="stroke-slate-400 dark:stroke-[#334155]" strokeWidth="1.5" />

            {/* Center Circular Hatch */}
            <circle cx="50" cy="16" r="10" className="fill-slate-200 dark:fill-slate-700 stroke-slate-500 dark:stroke-[#475569]" strokeWidth="1.5" />
            <circle cx="50" cy="16" r="3.5" className="fill-slate-300 dark:fill-slate-800 stroke-slate-500 dark:stroke-[#475569]" strokeWidth="1" />
            
            {/* Bolts */}
            {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
              const rad = (angle * Math.PI) / 180;
              const bx = 50 + 7 * Math.cos(rad);
              const by = 16 + 7 * Math.sin(rad);
              return <circle key={angle} cx={bx} cy={by} r="0.5" className="fill-slate-500 dark:fill-slate-400" />;
            })}

            {/* Header Boiler text label below */}
            <text x="50" y="55" fill="#94a3b8" className="font-mono text-[10px] font-extrabold tracking-widest text-center uppercase pointer-events-none" textAnchor="middle">HEADER BOILER</text>
          </g>

          {/* 3. FLOW METER EXISTING (Inline Symbol) removed to be replaced by HTML badge on pipe */}

          {/* VALVE P&ID BLOCK RENDERING GRAPHICS */}
          {/* Main Line Valve XV-101 */}
          <g transform="translate(605, 185)">
            <polygon
              points="0,0 12,5 12,-5"
              className={`${telemetry.valves['XV-101'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-[#D8E1EA] dark:stroke-[#1e293b]`}
            />
            <polygon
              points="24,0 12,5 12,-5"
              className={`${telemetry.valves['XV-101'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-[#D8E1EA] dark:stroke-[#1e293b]`}
            />
            <circle
              cx="12"
              cy="-6"
              r="4.5"
              className={`${telemetry.valves['XV-101'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-white dark:stroke-slate-900`}
              strokeWidth="1.5"
            />
            <text x="12" y="22" fill="#94a3b8" className="font-mono text-[9px] font-bold tracking-widest text-center" textAnchor="middle">XV-101</text>
          </g>

          {/* Weaving Branch Valve XV-201 */}
          <g transform="translate(805, 115)">
            <polygon
              points="0,0 12,5 12,-5"
              className={`${telemetry.valves['XV-201'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-[#D8E1EA] dark:stroke-[#1e293b]`}
            />
            <polygon
              points="24,0 12,5 12,-5"
              className={`${telemetry.valves['XV-201'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-[#D8E1EA] dark:stroke-[#1e293b]`}
            />
            <circle
              cx="12"
              cy="-6"
              r="4.5"
              className={`${telemetry.valves['XV-201'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-white dark:stroke-slate-900`}
              strokeWidth="1.5"
            />
            <text x="12" y="22" fill="#94a3b8" className="font-mono text-[9px] font-bold tracking-widest text-center" textAnchor="middle">XV-201</text>
          </g>

          {/* Spinning Branch Valve XV-202 */}
          <g transform="translate(805, 365)">
            <polygon
              points="0,0 12,5 12,-5"
              className={`${telemetry.valves['XV-202'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-[#D8E1EA] dark:stroke-[#1e293b]`}
            />
            <polygon
              points="24,0 12,5 12,-5"
              className={`${telemetry.valves['XV-202'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-[#D8E1EA] dark:stroke-[#1e293b]`}
            />
            <circle
              cx="12"
              cy="-6"
              r="4.5"
              className={`${telemetry.valves['XV-202'].open ? 'fill-[#16C784]' : 'fill-[#FF5A5F]'} stroke-white dark:stroke-slate-900`}
              strokeWidth="1.5"
            />
            <text x="12" y="22" fill="#94a3b8" className="font-mono text-[9px] font-bold tracking-widest text-center" textAnchor="middle">XV-202</text>
          </g>



          {/* ========================================================= */}
          {/* SMART INSTRUMENT LEADER LINES (AUTO NODE COLLISION FIX) */}
          {/* ========================================================= */}
          <g className="stroke-[#94a3b8] dark:stroke-slate-600 opacity-60" strokeWidth="1" strokeDasharray="3,3" fill="none">
            {/* DPT-101 Leader: orthongal from badge to pipe */}
            <path d="M 405,125 L 430,125 L 430,185" strokeLinejoin="round" />
            <circle cx="430" cy="185" r="2" className="fill-[#94a3b8] stroke-none" />

            {/* TT-101 Leader */}
            <path d="M 405,70 L 445,70 L 445,185" strokeLinejoin="round" />
            <circle cx="445" cy="185" r="2" className="fill-[#94a3b8] stroke-none" />

            {/* PT-102 Leader */}
            <path d="M 585,115 L 585,185" strokeLinejoin="round" />
            <circle cx="585" cy="185" r="2" className="fill-[#94a3b8] stroke-none" />

            {/* Boiler System Leaders */}
            <g className="stroke-slate-400 dark:stroke-slate-500 stroke-dasharray-4" strokeWidth="1" fill="none">
              {/* PT-HB Leader */}
              <path d="M 500,550 L 500,584" strokeLinejoin="round" />
              <circle cx="500" cy="584" r="2" className="fill-[#94a3b8] stroke-none" />

              {/* TT-HB Leader */}
              <path d="M 590,550 L 590,600" strokeLinejoin="round" />
              <circle cx="590" cy="600" r="2" className="fill-[#94a3b8] stroke-none" />
            </g>
          </g>
        </svg>

        {/* ========================================================= */}
        {/* HTML INTERACTIVE DEVICE PLACEMENT OVERLAYS (Sleek cards) */}
        {/* ========================================================= */}

        {/* 1. COMPRESSOR ROOM MODULES */}
        <div className="absolute left-[20px] top-[45px] flex flex-col gap-5">
          {telemetry.compressors.map((comp) => {
            const isRun = comp.status === 'RUN';
            const isFault = comp.status === 'FAULT';

            return (
              <div
                key={comp.id}
                className={`relative w-[140px] bg-white dark:bg-slate-900 border ${
                  isFault
                    ? 'border-l-2 border-[#FF5A5F] bg-[#FFF0F1] dark:bg-rose-950/20 shadow-[0_0_8px_rgba(255,90,95,0.1)]'
                    : isRun
                    ? 'border-l-2 border-[#16C784] bg-white dark:bg-slate-900/90'
                    : 'border-l-2 border-[#D8E1EA] dark:border-slate-750 bg-slate-50 dark:bg-slate-900/40'
                } rounded-none p-2 flex flex-col transition-all duration-300 text-xs`}
              >
                {/* Compressor title block */}
                <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="font-mono font-black text-[10px] text-slate-500 dark:text-slate-400 tracking-wider">
                    {comp.tag}
                  </span>
                  
                  {/* Rotating fan status */}
                  <div className="flex items-center gap-1">
                    {isRun ? (
                      <Fan className="w-3.5 h-3.5 text-[#16C784] dark:text-emerald-400 animate-spin" style={{ animationDuration: '0.8s' }} />
                    ) : isFault ? (
                      <div className="w-2 h-2 rounded-full bg-[#FF5A5F] animate-ping" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-[#D8E1EA] dark:bg-slate-700" />
                    )}
                    <span
                      className={`text-[9px] font-mono font-black ${
                        isFault ? 'text-[#FF5A5F] dark:text-rose-400' : isRun ? 'text-[#16C784] dark:text-emerald-400' : 'text-slate-400'
                      }`}
                    >
                      {comp.status}
                    </span>
                  </div>
                </div>

                {/* Internal metrics */}
                <div className="space-y-0.5 font-mono text-[10px] text-slate-700 dark:text-slate-300 mb-2">
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Speed:</span>
                    <span className="text-slate-900 dark:text-white font-bold">{isRun ? comp.loadPercent : 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Power:</span>
                    <span className="text-[#FFB020] dark:text-yellow-400 font-medium">
                      {(isRun ? comp.powerkW * (comp.loadPercent / 100) : 0).toFixed(0)} kW
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Temp:</span>
                    <span className={isFault ? 'text-[#FF5A5F] dark:text-rose-400' : isRun ? 'text-slate-700 dark:text-slate-300' : 'text-slate-400'}>
                      {(isRun ? comp.dischargeTemp : 22).toFixed(1)}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">Flow:</span>
                    <span className="text-[#00B8FF] dark:text-sky-400 font-semibold">
                      {isRun ? ((comp.loadPercent / 100) * 800).toFixed(0) : 0} Nm³
                    </span>
                  </div>
                </div>

                {/* Compressor operations action buttons */}
                <div className="flex items-center gap-1 mt-1">
                  <button
                    onClick={() => toggleCompressor(comp.id)}
                    className={`flex-1 py-1 rounded-none font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all ${
                      isRun
                        ? 'bg-[#F0FAF5] dark:bg-slate-950 border-[#16C784]/30 dark:border-emerald-800/50 text-[#16C784] dark:text-emerald-400 hover:bg-[#E1F6EB] dark:hover:bg-emerald-900/40'
                        : 'bg-white dark:bg-slate-950 border-[#D8E1EA] dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-[#F5F7FA] dark:hover:bg-slate-800'
                    }`}
                  >
                    <Power className={`w-2.5 h-2.5 ${isRun ? 'text-[#16C784] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
                    {isRun ? 'Stop' : 'Run'}
                  </button>

                  <button
                    onClick={() => toggleFault(comp.id)}
                    className={`p-1 rounded-none font-mono font-bold text-[9px] flex items-center justify-center border transition-all ${
                      isFault
                        ? 'bg-[#FFF0F1] dark:bg-slate-950 border-[#FF5A5F]/30 dark:border-rose-800 text-[#FF5A5F] dark:text-rose-400 hover:bg-[#FFE5E6] dark:hover:bg-rose-950/40'
                        : 'bg-white dark:bg-slate-950 border-[#D8E1EA] dark:border-slate-800 text-slate-400 hover:text-[#FF5A5F] dark:hover:text-rose-400 hover:bg-[#F5F7FA] dark:hover:bg-slate-800'
                    }`}
                  >
                    <RotateCw className={`w-2.5 h-2.5 ${isFault ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* 2. AIR DRYER MODULES */}
        <div className="absolute left-[300px] top-[140px] flex flex-col gap-10">
          {telemetry.dryers.map((dryer) => {
            const isRun = dryer.status === 'RUN';
            const isFault = dryer.status === 'FAULT';

            return (
              <div
                key={dryer.id}
                className={`w-[95px] bg-white dark:bg-slate-900 border ${
                  isFault
                    ? 'border-l-2 border-[#FF5A5F] bg-[#FFF0F1] dark:bg-rose-950/20'
                    : isRun
                    ? 'border-l-2 border-[#59C7F9] bg-white dark:bg-slate-900/95'
                    : 'border-l-2 border-[#D8E1EA] dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40'
                } rounded-none p-2 flex flex-col text-xs font-mono transition`}
              >
                <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-[9px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider">
                    {dryer.tag}
                  </span>
                  <div className="flex items-center gap-0.5">
                    <Droplets className={`w-3 h-3 ${isRun ? 'text-[#00B8FF] dark:text-cyan-400 animate-bounce' : 'text-slate-300 dark:text-slate-600'}`} />
                  </div>
                </div>

                <div className="space-y-0.5 text-[9px] text-slate-500 dark:text-slate-300 mb-1.5 font-bold uppercase tracking-wide">
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[8px]">Dew Pt:</span>
                    <span className={dryer.dewPoint > 0 ? 'text-[#FF5A5F] dark:text-rose-400 font-extrabold' : 'text-[#00B8FF] dark:text-violet-400'}>
                      {isRun ? dryer.dewPoint.toFixed(1) : 'Ambient'}°C
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400 text-[8px]">Outlet:</span>
                    <span className="text-slate-700 dark:text-slate-300">{isRun ? dryer.outletTemp.toFixed(1) : 22}°C</span>
                  </div>
                </div>

                <button
                  onClick={() => onToggleDryerStatus(dryer.id)}
                  className={`w-full py-0.5 rounded-none text-[8px] uppercase font-bold tracking-wider border text-center transition ${
                    isRun
                      ? 'bg-[#F0F9FF] dark:bg-slate-950 border-[#59C7F9]/40 dark:border-cyan-800 text-[#00B8FF] dark:text-cyan-400 hover:bg-[#E0F2FE] dark:hover:bg-cyan-900/30'
                      : 'bg-white dark:bg-slate-950 border-[#D8E1EA] dark:border-slate-700 text-slate-400 hover:bg-[#F5F7FA] dark:hover:bg-slate-800 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  {isRun ? 'ONLINE' : 'BYPASS'}
                </button>
              </div>
            );
          })}
        </div>




        {/* ========================================================= */}
        {/* HTML INTERACTIVE LABELS & BADGES (Collision Avoided Grid) */}
        {/* ========================================================= */}

        {/* --- BOILER SYSTEM TAGS --- */}
        {/* PT-HB (Header Boiler Pressure) */}
        <div
          id="badge-pt-hb"
          onClick={() => toggleAnomaly('PT-HB')}
          className="absolute left-[460px] top-[520px] px-2 py-0.5 rounded border border-[#59C7F9] bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer z-10 w-[80px] flex flex-col items-center"
        >
          <div className="text-[8px] text-slate-500 font-mono font-black leading-none mb-0.5">PT-HB</div>
          <span className="text-[10px] font-mono font-bold text-[#00B8FF]">
            <NumberFlow value={pt_hb} format={(v) => v.toFixed(2)} /> bar
          </span>
        </div>

        {/* TT-HB (Header Boiler Temp) */}
        <div
          id="badge-tt-hb"
          onClick={() => toggleAnomaly('TT-HB')}
          className="absolute left-[550px] top-[520px] px-2 py-0.5 rounded border border-[#59C7F9] bg-white dark:bg-slate-900 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer z-10 w-[80px] flex flex-col items-center"
        >
          <div className="text-[8px] text-slate-500 font-mono font-black leading-none mb-0.5">TT-HB</div>
          <span className="text-[10px] font-mono font-bold text-[#00B8FF]">
            <NumberFlow value={tt_hb} format={(v) => v.toFixed(1)} /> °C
          </span>
        </div>

        {/* FT-HB (Flow Meter - Dry-02 Style) */}
        <div
          id="badge-ft-hb"
          className={`absolute left-[752px] top-[560px] w-[96px] bg-white dark:bg-slate-900 border ${
            getFlowMeterStyle(flowMeters['FT-HB'], !!simulatedAnomalies['FT-HB']).wrapper
          } rounded-none p-1.5 flex flex-col transition-all duration-300 z-10 hover:-translate-y-0.5 hover:shadow-md`}
        >
          <div className="flex items-start justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="font-mono font-black text-[9px] text-slate-500 tracking-wider leading-tight">FT-HB</span>
              <span className="text-[6.5px] font-bold text-slate-400 tracking-widest uppercase">Flow Meter</span>
            </div>
            <Activity className={`w-3 h-3 ${getFlowMeterStyle(flowMeters['FT-HB'], !!simulatedAnomalies['FT-HB']).icon}`} />
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-1 bg-slate-50 dark:bg-slate-900/50 py-1.5 rounded">
            <div className={`text-[12px] font-mono font-bold leading-none ${getFlowMeterStyle(flowMeters['FT-HB'], !!simulatedAnomalies['FT-HB']).valueText}`}>
              <NumberFlow value={ft_hb} format={(v) => v.toFixed(0)} />
            </div>
            <span className="text-[7.5px] font-bold text-slate-400">Nm³/h</span>
          </div>
          <button
            onClick={() => toggleFlowMeter('FT-HB')}
            className={`w-full py-1 rounded-none font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all ${
              flowMeters['FT-HB']
                ? 'bg-[#F0FAF5] dark:bg-slate-950 border-[#16C784]/30 dark:border-emerald-800/50 text-[#16C784] dark:text-emerald-400 hover:bg-[#E1F6EB] dark:hover:bg-emerald-900/40'
                : 'bg-white dark:bg-slate-950 border-[#D8E1EA] dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-[#F5F7FA] dark:hover:bg-slate-800'
            }`}
          >
            <Power className={`w-2.5 h-2.5 ${flowMeters['FT-HB'] ? 'text-[#16C784] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
            {flowMeters['FT-HB'] ? 'Stop' : 'Start'}
          </button>
        </div>

        {/* --- DRYER SENSORS (Grouped for secondary hide) --- */}
        <div className="absolute left-[360px] top-[55px] flex flex-col gap-[30px] z-10 group">
          {/* --- DEW POINT SENSOR DPT-101 (Primary) --- */}
          <div
            id="badge-dpt-101"
            onClick={() => toggleAnomaly('DPT-101')}
            className={`px-2 py-0.5 rounded border text-center ${
              getSensorStyles('DPT-101', dpt101, 'dewpoint').border
            } ${getSensorStyles('DPT-101', dpt101, 'dewpoint').bg} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer w-[90px]`}
          >
            <div className="text-[8px] text-slate-500 font-mono font-black select-none leading-none mb-0.5">DPT-101</div>
            <div className="flex items-center justify-center gap-0.5">
              <Droplets className={`w-3 h-3 ${getSensorStyles('DPT-101', dpt101, 'dewpoint').iconColor}`} />
              <span className={`text-[10.5px] font-mono font-bold leading-none ${getSensorStyles('DPT-101', dpt101, 'dewpoint').text}`}>
                <NumberFlow value={dpt101} format={(v) => v.toFixed(1)} />°C
              </span>
            </div>
          </div>
        </div>

        {/* --- MAIN PRESSURE PT-102 (At main header, downstream of Tank) --- */}
        <div
          id="badge-pt-102"
          onClick={() => toggleAnomaly('PT-102')}
          className={`absolute left-[540px] top-[95px] px-2 py-0.5 rounded border ${
            getSensorStyles('PT-102', pt102, 'pressure').border
          } ${getSensorStyles('PT-102', pt102, 'pressure').bg} transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md cursor-pointer z-10 w-[90px]`}
        >
          <div className="text-[8px] text-slate-500 font-mono font-black select-none leading-none mb-0.5 text-center">PT-102</div>
          <div className="flex items-center justify-center gap-1">
            <Gauge className={`w-3 h-3 ${getSensorStyles('PT-102', pt102, 'pressure').iconColor}`} />
            <span className={`text-[11px] font-mono font-bold ${getSensorStyles('PT-102', pt102, 'pressure').text}`}>
              <NumberFlow value={pt102} format={(v) => v.toFixed(2)} /> bar
            </span>
          </div>
        </div>

        {/* --- MAIN DISCHARGE FLOW FT-101 (Across distribution header) --- */}
        <div
          id="badge-ft-101"
          className={`absolute left-[637px] top-[145px] w-[96px] bg-white dark:bg-slate-900 border ${
            getFlowMeterStyle(flowMeters['FT-101'], !!simulatedAnomalies['FT-101']).wrapper
          } rounded-none p-1.5 flex flex-col transition-all duration-300 z-10 hover:-translate-y-0.5 hover:shadow-md`}
        >
          <div className="flex items-start justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
            <div className="flex flex-col">
              <span className="font-mono font-black text-[9px] text-slate-500 tracking-wider leading-tight">FT-101</span>
              <span className="text-[6.5px] font-bold text-slate-400 tracking-widest uppercase">Flow Meter</span>
            </div>
            <Activity className={`w-3 h-3 ${getFlowMeterStyle(flowMeters['FT-101'], !!simulatedAnomalies['FT-101']).icon}`} />
          </div>
          <div className="flex items-baseline justify-center gap-1 mb-1 bg-slate-50 dark:bg-slate-900/50 py-1.5 rounded">
            <div className={`text-[12px] font-mono font-bold leading-none ${getFlowMeterStyle(flowMeters['FT-101'], !!simulatedAnomalies['FT-101']).valueText}`}>
              <NumberFlow value={ft101} format={(v) => v.toFixed(0)} />
            </div>
            <span className="text-[7.5px] font-bold text-slate-400">Nm³/h</span>
          </div>
          <button
            onClick={() => toggleFlowMeter('FT-101')}
            className={`w-full py-1 rounded-none font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all ${
              flowMeters['FT-101']
                ? 'bg-[#F0FAF5] dark:bg-slate-950 border-[#16C784]/30 dark:border-emerald-800/50 text-[#16C784] dark:text-emerald-400 hover:bg-[#E1F6EB] dark:hover:bg-emerald-900/40'
                : 'bg-white dark:bg-slate-950 border-[#D8E1EA] dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-[#F5F7FA] dark:hover:bg-slate-800'
            }`}
          >
            <Power className={`w-2.5 h-2.5 ${flowMeters['FT-101'] ? 'text-[#16C784] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
            {flowMeters['FT-101'] ? 'Stop' : 'Start'}
          </button>
        </div>


        {/* ========================================================= */}
        {/* 5. WEAVING BRANCH SENSORS & VALVES */}
        {/* ========================================================= */}

        {/* VALVES CAN BE HOVERED/CLICKED TO SHIFT FLOWS ON THE P&ID */}
        <button
          id="click-valve-xv-101"
          onClick={() => onToggleValve('XV-101')}
          className="absolute left-[605px] top-[180px] w-[30px] h-[35px] cursor-pointer z-10"
        />

        {/* WEAVING INTERACTIVE VALVES ACTION CLICKER */}
        <button
          id="click-valve-xv-201"
          onClick={() => onToggleValve('XV-201')}
          className="absolute left-[805px] top-[112px] w-[30px] h-[35px] cursor-pointer"
        />

        {/* --- WEAVING BRANCH SENSORS (Grouped for secondary hide) --- */}
        <div className="absolute left-[752px] top-[75px] flex items-start gap-[5px] z-10 group">
          {/* --- WEAVING FLOW METER FT-201 (Primary) --- */}
          <div
            id="badge-ft-201"
            className={`w-[96px] bg-white dark:bg-slate-900 border ${
              getFlowMeterStyle(flowMeters['FT-201'], !!simulatedAnomalies['FT-201']).wrapper
            } rounded-none p-1.5 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="font-mono font-black text-[9px] text-slate-500 tracking-wider leading-tight">FT-201</span>
                <span className="text-[6.5px] font-bold text-slate-400 tracking-widest uppercase">Flow Meter</span>
              </div>
              <Activity className={`w-3 h-3 ${getFlowMeterStyle(flowMeters['FT-201'], !!simulatedAnomalies['FT-201']).icon}`} />
            </div>
            <div className="flex items-baseline justify-center gap-1 mb-1 bg-slate-50 dark:bg-slate-900/50 py-1.5 rounded">
              <div className={`text-[12px] font-mono font-bold leading-none ${getFlowMeterStyle(flowMeters['FT-201'], !!simulatedAnomalies['FT-201']).valueText}`}>
                <NumberFlow value={ft201} format={(v) => v.toFixed(0)} />
              </div>
              <span className="text-[7.5px] font-bold text-slate-400">Nm³/h</span>
            </div>
            <button
              onClick={() => toggleFlowMeter('FT-201')}
              className={`w-full py-1 rounded-none font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all ${
                flowMeters['FT-201']
                  ? 'bg-[#F0FAF5] dark:bg-slate-950 border-[#16C784]/30 dark:border-emerald-800/50 text-[#16C784] dark:text-emerald-400 hover:bg-[#E1F6EB] dark:hover:bg-emerald-900/40'
                  : 'bg-white dark:bg-slate-950 border-[#D8E1EA] dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-[#F5F7FA] dark:hover:bg-slate-800'
              }`}
            >
              <Power className={`w-2.5 h-2.5 ${flowMeters['FT-201'] ? 'text-[#16C784] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              {flowMeters['FT-201'] ? 'Stop' : 'Start'}
            </button>
          </div>

        </div>

        {/* WEAVING CONSUMER ENDNODE CARD */}
        <div className={`absolute left-[1000px] top-[85px] w-[95px] bg-white dark:bg-slate-900 border ${
          checkSectionState('weaving_branch') ? 'border-l-2 border-[#16C784]' : 'border-l-2 border-[#D8E1EA] dark:border-slate-700'
        } rounded-none p-1.5 text-center`}>
          <div className="text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300 tracking-wider">
            WEAVING AREA
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            LOAD: {(telemetry.branches.weaving.demandFactor * 100).toFixed(0)}%
          </div>
          <div
            className={`h-1.5 w-1.5 rounded-full mx-auto mt-1 ${
              checkSectionState('weaving_branch') ? 'bg-[#16C784] animate-ping' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        </div>


        {/* ========================================================= */}
        {/* 6. SPINNING BRANCH SENSORS & VALVES */}
        {/* ========================================================= */}

        {/* SPINNING VALVE ACTUATOR BUTTON OVERLAY */}
        <button
          id="click-valve-xv-202"
          onClick={() => onToggleValve('XV-202')}
          className="absolute left-[805px] top-[348px] w-[30px] h-[35px] cursor-pointer"
        />

        {/* --- SPINNING BRANCH SENSORS (Grouped for secondary hide) --- */}
        <div className="absolute left-[752px] top-[325px] flex items-start gap-[5px] z-10 group">
          {/* --- SPINNING FLOW METER FT-202 (Primary) --- */}
          <div
            id="badge-ft-202"
            className={`w-[96px] bg-white dark:bg-slate-900 border ${
              getFlowMeterStyle(flowMeters['FT-202'], !!simulatedAnomalies['FT-202']).wrapper
            } rounded-none p-1.5 flex flex-col transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md`}
          >
            <div className="flex items-start justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col">
                <span className="font-mono font-black text-[9px] text-slate-500 tracking-wider leading-tight">FT-202</span>
                <span className="text-[6.5px] font-bold text-slate-400 tracking-widest uppercase">Flow Meter</span>
              </div>
              <Activity className={`w-3 h-3 ${getFlowMeterStyle(flowMeters['FT-202'], !!simulatedAnomalies['FT-202']).icon}`} />
            </div>
            <div className="flex items-baseline justify-center gap-1 mb-1 bg-slate-50 dark:bg-slate-900/50 py-1.5 rounded">
              <div className={`text-[12px] font-mono font-bold leading-none ${getFlowMeterStyle(flowMeters['FT-202'], !!simulatedAnomalies['FT-202']).valueText}`}>
                <NumberFlow value={ft202} format={(v) => v.toFixed(0)} />
              </div>
              <span className="text-[7.5px] font-bold text-slate-400">Nm³/h</span>
            </div>
            <button
              onClick={() => toggleFlowMeter('FT-202')}
              className={`w-full py-1 rounded-none font-mono font-bold text-[9px] uppercase tracking-wider flex items-center justify-center gap-1 border transition-all ${
                flowMeters['FT-202']
                  ? 'bg-[#F0FAF5] dark:bg-slate-950 border-[#16C784]/30 dark:border-emerald-800/50 text-[#16C784] dark:text-emerald-400 hover:bg-[#E1F6EB] dark:hover:bg-emerald-900/40'
                  : 'bg-white dark:bg-slate-950 border-[#D8E1EA] dark:border-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-[#F5F7FA] dark:hover:bg-slate-800'
              }`}
            >
              <Power className={`w-2.5 h-2.5 ${flowMeters['FT-202'] ? 'text-[#16C784] dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500'}`} />
              {flowMeters['FT-202'] ? 'Stop' : 'Start'}
            </button>
          </div>

        </div>

        {/* SPINNING CONSUMER ENDNODE CARD */}
        <div className={`absolute left-[1000px] top-[335px] w-[95px] bg-white dark:bg-slate-900 border ${
          checkSectionState('spinning_branch') ? 'border-l-2 border-[#16C784]' : 'border-l-2 border-[#D8E1EA] dark:border-slate-700'
        } rounded-none p-1.5 text-center`}>
          <div className="text-[10px] uppercase font-mono font-extrabold text-slate-600 dark:text-slate-300 tracking-wider">
            SPINNING AREA
          </div>
          <div className="text-[9px] font-mono text-slate-400 mt-0.5">
            LOAD: {(telemetry.branches.spinning.demandFactor * 100).toFixed(0)}%
          </div>
          <div
            className={`h-1.5 w-1.5 rounded-full mx-auto mt-1 ${
              checkSectionState('spinning_branch') ? 'bg-[#16C784] animate-ping' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          />
        </div>


        {/* ========================================================= */}
        {/* 7. GENERAL NOTIFICATIONS & QUICK SIMULATION TUNER */}
        {/* ========================================================= */}
        
            </div>
          </TransformComponent>
        </TransformWrapper>
      )}

      {/* Dynamic Warning bar directly in map */}
      {telemetry.alarms.filter((a) => !a.acknowledged && a.severity === 'CRITICAL').length > 0 && (
        <div className="absolute bottom-3 left-4 right-4 bg-rose-50 dark:bg-rose-950/90 border border-rose-500 text-rose-600 dark:text-rose-300 px-3 py-1.5 rounded-md flex items-center justify-between text-xs font-mono shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse z-10">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
            <span>
              <strong>CRITICAL INTERRUPT:</strong> Active safety alert in process queue. Silencing interlocks recommended.
            </span>
          </div>
          <span className="text-[10px] bg-rose-200 dark:bg-rose-900 px-1.5 py-0.5 rounded font-black uppercase text-rose-800 dark:text-rose-100">ACTIVE TRIP</span>
        </div>
      )}
    </div>
  );
}
