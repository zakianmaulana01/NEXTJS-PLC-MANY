/**
 * Canvas state types for the editable HMI dashboard.
 */

export interface CanvasNodeConfig {
  id: string;
  tag: string;
  label: string;
  type: 'compressor' | 'dryer' | 'tank' | 'flowmeter' | 'sensor' | 'valve' | 'consumer' | 'boiler' | 'header_boiler';
  visible: boolean;
}

export interface PipeSegmentConfig {
  id: string;
  label: string;
  colorId: string; // references PIPE_COLOR_PRESETS
}

export interface CanvasConfig {
  nodes: CanvasNodeConfig[];
  pipes: PipeSegmentConfig[];
}

export const PIPE_COLOR_PRESETS = {
  cyan:   { label: 'Cyan',   core: '#59C7F9', dash: '#00B8FF', fill: '#00B8FF' },
  green:  { label: 'Green',  core: '#4ade80', dash: '#22c55e', fill: '#16a34a' },
  blue:   { label: 'Blue',   core: '#60a5fa', dash: '#3b82f6', fill: '#2563eb' },
  orange: { label: 'Orange', core: '#fb923c', dash: '#f97316', fill: '#ea580c' },
  purple: { label: 'Purple', core: '#c084fc', dash: '#a855f7', fill: '#9333ea' },
  red:    { label: 'Red',    core: '#f87171', dash: '#ef4444', fill: '#dc2626' },
  slate:  { label: 'Slate',  core: '#94a3b8', dash: '#64748b', fill: '#475569' },
} as const;

export type PipeColorId = keyof typeof PIPE_COLOR_PRESETS;
