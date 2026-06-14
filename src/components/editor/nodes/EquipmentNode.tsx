'use client';

import React, { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import {
  Fan, Droplets, Container, Activity, Gauge, Zap, Flame, Factory, Box, Thermometer,
} from 'lucide-react';
import type { EditorNodeData } from '@/types/editor';

/* -- Icon Registry ---------------------------------- */

const ICON_MAP: Record<string, React.ElementType> = {
  Fan, Droplets, Container, Activity, Gauge, Zap, Flame, Factory, Box, Thermometer,
};

/* -- Status Colors ---------------------------------- */

const STATUS_COLORS: Record<string, { dot: string; text: string; glow: string }> = {
  RUN:     { dot: 'bg-emerald-400', text: 'text-emerald-600 dark:text-emerald-400', glow: 'shadow-[0_0_8px_rgba(52,211,153,0.5)]' },
  STOP:    { dot: 'bg-slate-300 dark:bg-slate-600', text: 'text-slate-400', glow: '' },
  FAULT:   { dot: 'bg-rose-500 animate-ping', text: 'text-rose-500', glow: 'shadow-[0_0_12px_rgba(244,63,94,0.4)]' },
  OFFLINE: { dot: 'bg-slate-400', text: 'text-slate-500', glow: '' },
};

/* -- Node type alias -------------------------------- */

type EquipmentNodeType = Node<EditorNodeData, 'equipment'>;

/* -- Component -------------------------------------- */

function EquipmentNodeInner(props: NodeProps<EquipmentNodeType>) {
  const data = props.data;
  const selected = props.selected;
  const Icon = ICON_MAP[data.icon] || Box;
  const statusStyle = STATUS_COLORS[data.status] || STATUS_COLORS.STOP;

  return (
    <div
      className={`
        group relative bg-white dark:bg-slate-900 border-2 rounded-lg
        font-mono transition-all duration-200 cursor-grab active:cursor-grabbing
        ${selected ? 'ring-2 ring-blue-500 ring-offset-1 dark:ring-offset-slate-950' : ''}
        ${data.glowEffect && data.status === 'RUN' ? statusStyle.glow : ''}
      `}
      style={{
        borderColor: data.borderColor,
        minWidth: data.width,
        minHeight: data.height,
      }}
    >
      {/* Connection Handles */}
      <Handle type="target" position={Position.Top} id="top"
        className="!w-3 !h-3 !bg-slate-400 hover:!bg-blue-500 !border-2 !border-white dark:!border-slate-900 !rounded-full transition-colors !-top-1.5" />
      <Handle type="source" position={Position.Bottom} id="bottom"
        className="!w-3 !h-3 !bg-slate-400 hover:!bg-blue-500 !border-2 !border-white dark:!border-slate-900 !rounded-full transition-colors !-bottom-1.5" />
      <Handle type="target" position={Position.Left} id="left"
        className="!w-3 !h-3 !bg-slate-400 hover:!bg-blue-500 !border-2 !border-white dark:!border-slate-900 !rounded-full transition-colors !-left-1.5" />
      <Handle type="source" position={Position.Right} id="right"
        className="!w-3 !h-3 !bg-slate-400 hover:!bg-blue-500 !border-2 !border-white dark:!border-slate-900 !rounded-full transition-colors !-right-1.5" />

      {/* Header Strip */}
      <div
        className="flex items-center justify-between px-3 py-1.5 rounded-t-[5px] border-b"
        style={{ backgroundColor: data.color, borderColor: data.borderColor + '40' }}
      >
        <div className="flex items-center gap-1.5">
          <Icon
            className="w-4 h-4"
            style={{ color: data.borderColor }}
          />
          <span className="text-[10px] font-extrabold tracking-wider uppercase" style={{ color: data.borderColor }}>
            {data.tagName}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <span className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
          <span className={`text-[8px] font-bold uppercase ${statusStyle.text}`}>
            {data.status}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-3 py-2">
        <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 truncate">
          {data.displayName}
        </div>
        <div className="text-[9px] text-slate-400 mt-0.5 uppercase tracking-wider">
          {data.equipmentType.replace('-', ' ')}
        </div>
        {data.staticValue && (
          <div className="mt-1.5 flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-800 dark:text-white leading-none">{data.staticValue}</span>
          </div>
        )}
      </div>

      {/* Resize indicator (visual only — React Flow handles resize) */}
      {selected && (
        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-blue-500 rounded-br-lg opacity-60" />
      )}
    </div>
  );
}

export const EquipmentNode = memo(EquipmentNodeInner);
