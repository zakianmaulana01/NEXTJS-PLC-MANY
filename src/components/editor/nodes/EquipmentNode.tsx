"use client";

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { Fan, Droplets, Activity, Gauge, Flame, Wind, Power, RotateCw } from 'lucide-react';
import type { EditorNodeData } from '@/types/editor';

type EquipmentNodeType = Node<EditorNodeData, 'equipment'>;

function EquipmentNodeInner(props: NodeProps<EquipmentNodeType>) {
  const data = props.data;
  const selected = props.selected;

  const isRun = data.status === 'RUN';
  const isFault = data.status === 'FAULT';

  // Render based on equipment type
  switch (data.equipmentType) {
    case 'compressor':
      return <CompressorCard data={data} selected={selected} />;
    case 'dryer':
      return <DryerCard data={data} selected={selected} />;
    case 'buffer-tank':
    case 'receiver-tank':
      return <TankCard data={data} selected={selected} />;
    case 'valve':
      return <ValveCard data={data} selected={selected} />;
    case 'flow-meter':
      return <FlowMeterCard data={data} selected={selected} />;
    case 'boiler':
      return <BoilerCard data={data} selected={selected} />;
    case 'pressure-transmitter':
    case 'temperature-sensor':
      return <SensorBadge data={data} selected={selected} />;
    case 'consumer-area':
      return <ConsumerCard data={data} selected={selected} />;
    default:
      return <GenericCard data={data} selected={selected} />;
  }
}

// ========== COMPRESSOR ==========
function CompressorCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  const isRun = data.status === 'RUN';
  const isFault = data.status === 'FAULT';
  const hasCustom = data.metrics && data.metrics.length > 0;
  return (
    <div className={`w-[170px] bg-white dark:bg-slate-900 border rounded-none p-2 flex flex-col text-xs font-mono transition-all
      ${isFault ? 'border-l-2 border-rose-500 bg-rose-50 dark:bg-rose-950/20' : isRun ? 'border-l-2 border-emerald-500' : 'border-l-2 border-slate-300 dark:border-slate-700'}
      ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handles />
      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
        <span className="font-mono font-black text-[10px] text-slate-500 tracking-wider">{data.tagName}</span>
        <div className="flex items-center gap-1">
          {isRun ? <Fan className="w-3.5 h-3.5 text-emerald-500 animate-spin" style={{ animationDuration: '0.8s' }} /> : isFault ? <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-700" />}
          <span className={`text-[9px] font-black ${isFault ? 'text-rose-500' : isRun ? 'text-emerald-500' : 'text-slate-400'}`}>{data.status}</span>
        </div>
      </div>
      <div className="space-y-0.5 text-[10px] text-slate-700 dark:text-slate-300 mb-2">
        {hasCustom ? (
          data.metrics!.map((m) => (
            <Row key={m.id} label={`${m.label}:`} value={isRun ? `${m.fallback}${m.unit ? ' ' + m.unit : ''}` : `0${m.unit ? ' ' + m.unit : ''}`} color={m.color} />
          ))
        ) : (
          <>
            <Row label="SPEED:" value={isRun ? '70%' : '0%'} />
            <Row label="POWER:" value={isRun ? '75 kW' : '0 kW'} color="text-yellow-500" />
            <Row label="TEMP:" value={isRun ? '76.5°C' : '22.0°C'} />
            <Row label="FLOW:" value={isRun ? '595 Nm³' : '0 Nm³'} color="text-cyan-500" />
          </>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button className={`flex-1 py-1 font-mono font-bold text-[9px] uppercase border text-center transition ${isRun ? 'border-emerald-300 dark:border-emerald-800 text-emerald-500' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
          <Power className="w-2.5 h-2.5 inline mr-1" />{isRun ? 'STOP' : 'RUN'}
        </button>
        <button className="p-1 border border-slate-200 dark:border-slate-800 text-slate-400">
          <RotateCw className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
}

// ========== DRYER ==========
function DryerCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  const isRun = data.status === 'RUN';
  const isFault = data.status === 'FAULT';
  return (
    <div className={`w-[150px] bg-white dark:bg-slate-900 border rounded-none p-2 flex flex-col text-xs font-mono transition-all
      ${isFault ? 'border-l-2 border-rose-500' : isRun ? 'border-l-2 border-cyan-500' : 'border-l-2 border-slate-300 dark:border-slate-700'}
      ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handles />
      <div className="flex items-center justify-between mb-1 pb-1 border-b border-slate-100 dark:border-slate-800">
        <span className="text-[9px] font-extrabold text-slate-500 tracking-wider">{data.tagName}</span>
        <Droplets className={`w-3 h-3 ${isRun ? 'text-cyan-500 animate-bounce' : 'text-slate-300'}`} />
      </div>
      <div className="space-y-0.5 text-[9px] text-slate-500 mb-1.5">
        <Row label="DEW PT:" value={isRun ? '-40.0°C' : 'AMBIENT°C'} color={isRun ? 'text-cyan-500' : 'text-rose-500'} />
        <Row label="OUTLET:" value={isRun ? '19.8°C' : '22°C'} />
      </div>
      <button className={`w-full py-0.5 text-[8px] uppercase font-bold border text-center transition ${isRun ? 'border-cyan-300 dark:border-cyan-800 text-cyan-500' : 'border-slate-200 dark:border-slate-700 text-slate-400'}`}>
        {isRun ? 'ONLINE' : 'BYPASS'}
      </button>
    </div>
  );
}

// ========== TANK ==========
function TankCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  return (
    <div className={`w-[90px] flex flex-col items-center ${selected ? 'ring-2 ring-blue-500 rounded' : ''}`}>
      <Handles />
      <div className="w-[60px] h-[140px] rounded-[30px] border-2 border-slate-400 dark:border-slate-600 bg-gradient-to-b from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 relative overflow-hidden flex flex-col items-center justify-center">
        <span className="text-[9px] font-mono font-extrabold text-slate-400 tracking-widest absolute top-3">{data.tagName}</span>
        {/* Water fill */}
        <div className="absolute bottom-0 left-0 right-0 h-[25%] bg-gradient-to-t from-sky-500/80 to-sky-400/60" />
        <span className="text-[10px] font-mono font-bold text-sky-400 relative z-10 mt-12">{data.staticValue || '7.2 bar'}</span>
      </div>
    </div>
  );
}

// ========== VALVE ==========
function ValveCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  const isOpen = data.status === 'RUN';
  return (
    <div className={`flex flex-col items-center gap-1 ${selected ? 'ring-2 ring-blue-500 rounded p-1' : 'p-1'}`}>
      <Handles />
      <svg width="28" height="16" viewBox="0 0 28 16">
        <polygon points="0,0 14,6 14,-6" transform="translate(0,8)" className={isOpen ? 'fill-emerald-500' : 'fill-rose-500'} />
        <polygon points="28,0 14,6 14,-6" transform="translate(0,8)" className={isOpen ? 'fill-emerald-500' : 'fill-rose-500'} />
        <circle cx="14" cy="3" r="4" className={`${isOpen ? 'fill-emerald-500' : 'fill-rose-500'} stroke-white dark:stroke-slate-900`} strokeWidth="1.5" />
      </svg>
      <span className="text-[8px] font-mono font-bold text-slate-400 tracking-widest">{data.tagName}</span>
    </div>
  );
}

// ========== FLOW METER ==========
function FlowMeterCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  const isRun = data.status === 'RUN';
  return (
    <div className={`w-[130px] bg-white dark:bg-slate-900 border-l-2 border-cyan-500 border rounded-none p-2 flex flex-col text-xs font-mono transition-all shadow-[0_0_10px_rgba(89,199,249,0.15)]
      ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handles />
      <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-slate-100 dark:border-slate-800">
        <span className="font-mono font-black text-[9px] text-slate-500 tracking-wider">{data.tagName}</span>
        <Activity className="w-3 h-3 text-cyan-500" />
      </div>
      <div className="text-center mb-1.5">
        <span className="text-[9px] text-slate-400 uppercase tracking-widest font-bold">FLOW METER</span>
      </div>
      <div className="flex items-baseline justify-center gap-1 mb-1.5 bg-slate-50 dark:bg-slate-900/50 py-1.5 rounded">
        <span className={`text-lg font-bold leading-none ${isRun ? 'text-cyan-500' : 'text-slate-400'}`}>{isRun ? (data.staticValue || '850') : '0'}</span>
        <span className="text-[8px] text-slate-400 font-bold">Nm³/h</span>
      </div>
      <button className={`w-full py-1 font-mono font-bold text-[9px] uppercase border text-center transition flex items-center justify-center gap-1
        ${isRun ? 'border-emerald-300 dark:border-emerald-800 text-emerald-500' : 'border-slate-200 dark:border-slate-800 text-slate-400'}`}>
        <Power className="w-2.5 h-2.5" /> {isRun ? 'STOP' : 'START'}
      </button>
    </div>
  );
}

// ========== BOILER ==========
function BoilerCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  return (
    <div className={`w-[120px] flex flex-col items-center gap-1 ${selected ? 'ring-2 ring-blue-500 rounded p-1' : 'p-1'}`}>
      <Handles />
      <div className="w-[100px] h-[130px] relative">
        <svg viewBox="0 0 120 160" className="w-full h-full">
          <path d="M 0 160 L 120 160 L 120 60 A 60 60 0 0 0 0 60 Z" className="fill-slate-200 dark:fill-slate-800 stroke-slate-400 dark:stroke-slate-600" strokeWidth="2.5" />
          <rect x="40" y="55" width="40" height="65" rx="20" className="fill-slate-800 dark:fill-slate-950 stroke-slate-500" strokeWidth="1.5" />
          <rect x="40" y="80" width="40" height="40" rx="10" className="fill-sky-500/70" />
          <g transform="translate(30, 130)">
            <rect x="0" y="0" width="60" height="20" rx="10" className="fill-slate-900 stroke-slate-500" strokeWidth="1.5" />
            <path d="M 10,6 L 50,6 M 10,10 L 50,10 M 10,14 L 50,14" className="stroke-orange-400" strokeWidth="2" strokeLinecap="round" />
          </g>
        </svg>
      </div>
      <span className="text-[10px] font-mono font-extrabold text-slate-400 uppercase tracking-widest">{data.displayName || 'BOILER'}</span>
    </div>
  );
}

// ========== SENSOR BADGE ==========
function SensorBadge({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  const icon = data.equipmentType === 'pressure-transmitter' ? <Gauge className="w-3 h-3 text-cyan-500" /> : <Wind className="w-3 h-3 text-cyan-500" />;
  return (
    <div className={`px-2.5 py-1 border border-cyan-500 bg-white dark:bg-slate-900 rounded flex flex-col items-center gap-0.5
      ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handles />
      <span className="text-[8px] text-slate-500 font-mono font-black">{data.tagName}</span>
      <div className="flex items-center gap-1">
        {icon}
        <span className="text-[10px] font-mono font-bold text-cyan-500">{data.staticValue || '7.15 bar'}</span>
      </div>
    </div>
  );
}

// ========== CONSUMER AREA ==========
function ConsumerCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  return (
    <div className={`w-[140px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-none p-2 text-center font-mono
      ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handles />
      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">{data.displayName || 'CONSUMER AREA'}</span>
      <div className="text-[9px] text-slate-400 mt-0.5">LOAD: 100%</div>
      <div className="flex justify-end mt-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /></div>
    </div>
  );
}

// ========== GENERIC FALLBACK ==========
function GenericCard({ data, selected }: { data: EditorNodeData; selected?: boolean }) {
  return (
    <div className={`w-[120px] border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 rounded p-2 text-center font-mono
      ${selected ? 'ring-2 ring-blue-500' : ''}`}>
      <Handles />
      <span className="text-[10px] font-bold text-slate-500">{data.tagName}</span>
      <div className="text-[9px] text-slate-400">{data.displayName}</div>
    </div>
  );
}

// ========== SHARED HELPERS ==========
function Handles() {
  const handleStyle = "!w-2.5 !h-2.5 !bg-slate-400 hover:!bg-cyan-500 !border-2 !border-white dark:!border-slate-900 !rounded-full opacity-0 group-hover:opacity-100 transition-opacity";
  return (
    <>
      <Handle type="target" position={Position.Top} id="target-top" className={`${handleStyle} !-top-1.5`} />
      <Handle type="source" position={Position.Top} id="source-top" className={`${handleStyle} !-top-1.5`} />

      <Handle type="target" position={Position.Bottom} id="target-bottom" className={`${handleStyle} !-bottom-1.5`} />
      <Handle type="source" position={Position.Bottom} id="source-bottom" className={`${handleStyle} !-bottom-1.5`} />

      <Handle type="target" position={Position.Left} id="target-left" className={`${handleStyle} !-left-1.5`} />
      <Handle type="source" position={Position.Left} id="source-left" className={`${handleStyle} !-left-1.5`} />

      <Handle type="target" position={Position.Right} id="target-right" className={`${handleStyle} !-right-1.5`} />
      <Handle type="source" position={Position.Right} id="source-right" className={`${handleStyle} !-right-1.5`} />
    </>
  );
}

function Row({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider">{label}</span>
      <span className={`font-bold ${color || 'text-slate-700 dark:text-slate-300'}`}>{value}</span>
    </div>
  );
}

export const EquipmentNode = memo(EquipmentNodeInner);
