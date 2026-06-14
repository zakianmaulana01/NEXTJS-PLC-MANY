/**
 * Type definitions for the SCADA Visual Canvas Editor.
 * All layout data is persisted to localStorage as JSON.
 */

/* -- Equipment Types -------------------------------- */

export type EquipmentType =
  | 'compressor'
  | 'dryer'
  | 'buffer-tank'
  | 'receiver-tank'
  | 'valve'
  | 'flow-meter'
  | 'pressure-transmitter'
  | 'temperature-sensor'
  | 'boiler'
  | 'consumer-area'
  | 'custom';

export type EquipmentStatus = 'RUN' | 'STOP' | 'FAULT' | 'OFFLINE';

/* -- Node Data -------------------------------------- */

export interface EditorNodeData {
  [key: string]: unknown;
  tagName: string;
  displayName: string;
  equipmentType: EquipmentType;
  status: EquipmentStatus;
  icon: string;
  // Data binding (for future OPC/MQTT integration)
  opcTag: string;
  mqttTopic: string;
  apiEndpoint: string;
  staticValue: string;
  // Styling
  width: number;
  height: number;
  color: string;
  borderColor: string;
  glowEffect: boolean;
}

/* -- Edge / Pipe Data ------------------------------- */

export interface PipeWaypoint {
  id: string;
  x: number;
  y: number;
}

export interface EditorEdgeData {
  [key: string]: unknown;
  flowAnimated: boolean;
  flowColor: string;
  pipeThickness: number;
  flowDirection: 'forward' | 'reverse';
  waypoints: PipeWaypoint[];
  label: string;
}

/* -- Serialised Layout (saved to localStorage) ------ */

export interface SerializedNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: EditorNodeData;
  width?: number;
  height?: number;
}

export interface SerializedEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type: string;
  data: EditorEdgeData;
}

export interface SavedLayout {
  version: number;
  nodes: SerializedNode[];
  edges: SerializedEdge[];
  viewport: { x: number; y: number; zoom: number };
  savedAt: string;
}

/* -- Equipment Catalogue ---------------------------- */

export interface EquipmentCatalogueItem {
  type: EquipmentType;
  label: string;
  icon: string;
  category: 'generation' | 'treatment' | 'storage' | 'distribution' | 'sensing' | 'custom';
  defaultWidth: number;
  defaultHeight: number;
  defaultColor: string;
  defaultBorderColor: string;
}

export const EQUIPMENT_CATALOGUE: EquipmentCatalogueItem[] = [
  // Generation
  { type: 'compressor', label: 'Compressor', icon: 'Fan', category: 'generation', defaultWidth: 160, defaultHeight: 100, defaultColor: '#E0F7FA', defaultBorderColor: '#00ACC1' },
  { type: 'boiler', label: 'Boiler', icon: 'Flame', category: 'generation', defaultWidth: 160, defaultHeight: 100, defaultColor: '#FFF3E0', defaultBorderColor: '#EF6C00' },
  // Treatment
  { type: 'dryer', label: 'Air Dryer', icon: 'Droplets', category: 'treatment', defaultWidth: 140, defaultHeight: 90, defaultColor: '#E8F5E9', defaultBorderColor: '#43A047' },
  // Storage
  { type: 'buffer-tank', label: 'Buffer Tank', icon: 'Container', category: 'storage', defaultWidth: 120, defaultHeight: 110, defaultColor: '#F3E5F5', defaultBorderColor: '#8E24AA' },
  { type: 'receiver-tank', label: 'Receiver Tank', icon: 'Container', category: 'storage', defaultWidth: 120, defaultHeight: 110, defaultColor: '#E8EAF6', defaultBorderColor: '#3949AB' },
  // Distribution
  { type: 'valve', label: 'Valve', icon: 'Zap', category: 'distribution', defaultWidth: 100, defaultHeight: 70, defaultColor: '#FFFDE7', defaultBorderColor: '#F9A825' },
  { type: 'flow-meter', label: 'Flow Meter', icon: 'Activity', category: 'distribution', defaultWidth: 120, defaultHeight: 80, defaultColor: '#E1F5FE', defaultBorderColor: '#0288D1' },
  // Sensing
  { type: 'pressure-transmitter', label: 'Pressure TX', icon: 'Gauge', category: 'sensing', defaultWidth: 110, defaultHeight: 70, defaultColor: '#FBE9E7', defaultBorderColor: '#D84315' },
  { type: 'temperature-sensor', label: 'Temp Sensor', icon: 'Thermometer', category: 'sensing', defaultWidth: 110, defaultHeight: 70, defaultColor: '#ECEFF1', defaultBorderColor: '#546E7A' },
  // Output
  { type: 'consumer-area', label: 'Consumer Area', icon: 'Factory', category: 'custom', defaultWidth: 180, defaultHeight: 100, defaultColor: '#E0E0E0', defaultBorderColor: '#616161' },
  { type: 'custom', label: 'Custom Equipment', icon: 'Box', category: 'custom', defaultWidth: 140, defaultHeight: 90, defaultColor: '#F5F5F5', defaultBorderColor: '#9E9E9E' },
];

/* -- Flow Color Presets ----------------------------- */

export const FLOW_COLOR_PRESETS: { id: string; label: string; color: string }[] = [
  { id: 'blue', label: 'Compressed Air', color: '#3B82F6' },
  { id: 'cyan', label: 'Instrument Air', color: '#06B6D4' },
  { id: 'green', label: 'Steam', color: '#22C55E' },
  { id: 'yellow', label: 'Gas', color: '#EAB308' },
  { id: 'orange', label: 'Hot Water', color: '#F97316' },
  { id: 'red', label: 'High Pressure', color: '#EF4444' },
  { id: 'purple', label: 'Cooling Water', color: '#A855F7' },
  { id: 'slate', label: 'Exhaust', color: '#64748B' },
];

/* -- localStorage Key ------------------------------- */

export const LAYOUT_STORAGE_KEY = 'scada-editor-layout';
