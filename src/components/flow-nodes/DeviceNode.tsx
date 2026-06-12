"use client";

import { Handle, Position, NodeProps } from '@xyflow/react';
import { Fan, Droplets, Cylinder, Activity, Flame, ToggleLeft, ToggleRight, Wind } from 'lucide-react';

const iconMap = {
  compressor: Fan,
  dryer: Droplets,
  tank: Cylinder,
  flowmeter: Activity,
  boiler: Flame,
  headerboiler: Wind,
  valve: ToggleLeft,
} as const;

const colorMap = {
  compressor: 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
  dryer: 'border-blue-500 bg-blue-50 dark:bg-blue-950/30',
  tank: 'border-slate-500 bg-slate-50 dark:bg-slate-800/30',
  flowmeter: 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
  boiler: 'border-orange-500 bg-orange-50 dark:bg-orange-950/30',
  headerboiler: 'border-rose-500 bg-rose-50 dark:bg-rose-950/30',
  valve: 'border-amber-500 bg-amber-50 dark:bg-amber-950/30',
} as const;

export type DeviceNodeType = keyof typeof iconMap;

export interface DeviceNodeData {
  type: DeviceNodeType;
  label: string;
  tag: string;
  value?: string;
  [key: string]: unknown;
}

export function DeviceNode({ data, selected }: NodeProps) {
  const nodeData = data as unknown as DeviceNodeData;
  const Icon = iconMap[nodeData.type] || Activity;
  const colorClass = colorMap[nodeData.type] || 'border-slate-500 bg-slate-50';
  
  const isValveOn = nodeData.type === 'valve' && nodeData.value === 'OPEN';
  const ValveIcon = isValveOn ? ToggleRight : ToggleLeft;

  return (
    <div
      className={`min-w-[140px] rounded-md border-2 p-3 shadow-sm transition-all ${colorClass} ${
        selected ? 'ring-2 ring-primary' : ''
      }`}
    >
      <Handle type="target" position={Position.Left} className="!bg-slate-400 !w-2 !h-2" />
      
      <div className="flex items-center gap-2 mb-1">
        {nodeData.type === 'valve' ? (
          <ValveIcon className={`w-4 h-4 ${isValveOn ? 'text-emerald-500' : 'text-slate-500'}`} />
        ) : (
          <Icon className="w-4 h-4 text-foreground" />
        )}
        <span className="text-[10px] font-mono font-bold tracking-wider text-muted-foreground uppercase">
          {nodeData.tag}
        </span>
      </div>
      
      <div className="text-sm font-semibold text-foreground leading-tight">
        {nodeData.label}
      </div>
      
      {nodeData.value && (
        <div className="text-xs font-mono text-muted-foreground mt-1">{nodeData.value}</div>
      )}
      
      <Handle type="source" position={Position.Right} className="!bg-slate-400 !w-2 !h-2" />
    </div>
  );
}
