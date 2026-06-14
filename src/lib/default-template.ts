import type { SavedLayout } from '@/types/editor';

/**
 * Default template layout that matches the route / SCADA SVG map.
 * Pre-loaded when no custom layout exists in localStorage.
 */
export const DEFAULT_TEMPLATE: SavedLayout = {
  version: 1,
  nodes: [
    // Section Labels
    { id: 'lbl-comp', type: 'sectionLabel', position: { x: 20, y: 20 }, data: { label: 'COMPRESSOR ROOM', fontSize: 12, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },
    { id: 'lbl-dryer', type: 'sectionLabel', position: { x: 280, y: 20 }, data: { label: 'DRYER STATION', fontSize: 12, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },
    { id: 'lbl-tank', type: 'sectionLabel', position: { x: 500, y: 20 }, data: { label: 'BUFFER TANK', fontSize: 12, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },
    { id: 'lbl-dist', type: 'sectionLabel', position: { x: 700, y: 20 }, data: { label: 'DISTRIBUTION HEADER', fontSize: 12, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },
    { id: 'lbl-plant', type: 'sectionLabel', position: { x: 980, y: 20 }, data: { label: 'PLANT CONSUMERS', fontSize: 12, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },
    { id: 'lbl-steam', type: 'sectionLabel', position: { x: 400, y: 480 }, data: { label: 'STEAM GENERATION PLANT', fontSize: 11, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },
    { id: 'lbl-boiler', type: 'sectionLabel', position: { x: 100, y: 510 }, data: { label: 'BOILER PLANT', fontSize: 12, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },
    { id: 'lbl-steamcons', type: 'sectionLabel', position: { x: 900, y: 510 }, data: { label: 'STEAM CONSUMERS', fontSize: 12, tagName: '', displayName: '', equipmentType: 'section-label', status: 'STOP', icon: 'Type', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 200, height: 30, color: 'transparent', borderColor: 'transparent', glowEffect: false } },

    // Compressors
    { id: 'comp-01', type: 'equipment', position: { x: 20, y: 60 }, data: { tagName: 'COMP-01', displayName: 'Rotary Screw A', equipmentType: 'compressor', status: 'RUN', icon: 'Fan', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'COMP-01', staticValue: '', metrics: [
      { id: 'm1', label: 'SPEED', valueKey: 'loadPercent', unit: '%', fallback: '70', color: 'text-slate-700 dark:text-slate-300' },
      { id: 'm2', label: 'POWER', valueKey: 'powerkW', unit: 'kW', fallback: '75', color: 'text-yellow-500' },
      { id: 'm3', label: 'TEMP', valueKey: 'dischargeTemp', unit: '°C', fallback: '76.5', color: 'text-slate-700 dark:text-slate-300' },
      { id: 'm4', label: 'FLOW', valueKey: 'flow', unit: 'Nm³', fallback: '595', color: 'text-cyan-500' },
    ], width: 170, height: 140, color: '#E0F7FA', borderColor: '#00ACC1', glowEffect: true } },
    { id: 'comp-02', type: 'equipment', position: { x: 20, y: 220 }, data: { tagName: 'COMP-02', displayName: 'Rotary Screw B', equipmentType: 'compressor', status: 'STOP', icon: 'Fan', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'COMP-02', staticValue: '', width: 170, height: 140, color: '#E0F7FA', borderColor: '#00ACC1', glowEffect: false } },
    { id: 'comp-03', type: 'equipment', position: { x: 20, y: 380 }, data: { tagName: 'COMP-03', displayName: 'Rotary Screw C', equipmentType: 'compressor', status: 'STOP', icon: 'Fan', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'COMP-03', staticValue: '', width: 170, height: 140, color: '#E0F7FA', borderColor: '#00ACC1', glowEffect: false } },

    // Dryers
    { id: 'dry-01', type: 'equipment', position: { x: 280, y: 100 }, data: { tagName: 'DRY-01', displayName: 'Refrigerated Dryer A', equipmentType: 'dryer', status: 'RUN', icon: 'Droplets', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'DRY-01', staticValue: '', width: 150, height: 100, color: '#E8F5E9', borderColor: '#43A047', glowEffect: false } },
    { id: 'dry-02', type: 'equipment', position: { x: 280, y: 280 }, data: { tagName: 'DRY-02', displayName: 'Refrigerated Dryer B', equipmentType: 'dryer', status: 'STOP', icon: 'Droplets', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'DRY-02', staticValue: '', width: 150, height: 100, color: '#E8F5E9', borderColor: '#43A047', glowEffect: false } },

    // Tank
    { id: 'tk-101', type: 'equipment', position: { x: 510, y: 100 }, data: { tagName: 'TK-101', displayName: 'Receiver Tank', equipmentType: 'receiver-tank', status: 'RUN', icon: 'Container', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'TK-101', staticValue: '7.25 bar', width: 90, height: 160, color: '#E8EAF6', borderColor: '#3949AB', glowEffect: false } },

    // Valve
    { id: 'xv-101', type: 'equipment', position: { x: 660, y: 170 }, data: { tagName: 'XV-101', displayName: 'Primary Isolation', equipmentType: 'valve', status: 'RUN', icon: 'Zap', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'XV-101', staticValue: '', width: 60, height: 50, color: '#FFFDE7', borderColor: '#F9A825', glowEffect: false } },

    // Sensors
    { id: 'dpt-101', type: 'equipment', position: { x: 350, y: 55 }, data: { tagName: 'DPT-101', displayName: 'Dew Point', equipmentType: 'pressure-transmitter', status: 'RUN', icon: 'Gauge', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'DPT-101', staticValue: '-40.0°C', width: 110, height: 50, color: '#FBE9E7', borderColor: '#D84315', glowEffect: false } },
    { id: 'pt-102', type: 'equipment', position: { x: 650, y: 80 }, data: { tagName: 'PT-102', displayName: 'Header Pressure', equipmentType: 'pressure-transmitter', status: 'RUN', icon: 'Gauge', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'PT-102', staticValue: '7.15 bar', width: 110, height: 50, color: '#FBE9E7', borderColor: '#D84315', glowEffect: false } },

    // Flow Meters
    { id: 'ft-101', type: 'equipment', position: { x: 750, y: 120 }, data: { tagName: 'FT-101', displayName: 'Main Flow', equipmentType: 'flow-meter', status: 'RUN', icon: 'Activity', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'FT-101', staticValue: '850', width: 130, height: 120, color: '#E1F5FE', borderColor: '#0288D1', glowEffect: false } },
    { id: 'ft-201', type: 'equipment', position: { x: 920, y: 60 }, data: { tagName: 'FT-201', displayName: 'Weaving Flow', equipmentType: 'flow-meter', status: 'RUN', icon: 'Activity', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'FT-201', staticValue: '450', width: 130, height: 120, color: '#E1F5FE', borderColor: '#0288D1', glowEffect: false } },
    { id: 'ft-202', type: 'equipment', position: { x: 920, y: 300 }, data: { tagName: 'FT-202', displayName: 'Spinning Flow', equipmentType: 'flow-meter', status: 'RUN', icon: 'Activity', opcTag: '', mqttTopic: '', apiEndpoint: '/api/telemetry', dataSourceKey: 'FT-202', staticValue: '400', width: 130, height: 120, color: '#E1F5FE', borderColor: '#0288D1', glowEffect: false } },

    // Consumer Areas
    { id: 'weaving', type: 'equipment', position: { x: 1100, y: 80 }, data: { tagName: 'WEAVE', displayName: 'WEAVING AREA', equipmentType: 'consumer-area', status: 'RUN', icon: 'Factory', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 140, height: 80, color: '#E0E0E0', borderColor: '#616161', glowEffect: false } },
    { id: 'spinning', type: 'equipment', position: { x: 1100, y: 320 }, data: { tagName: 'SPIN', displayName: 'SPINNING AREA', equipmentType: 'consumer-area', status: 'RUN', icon: 'Factory', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 140, height: 80, color: '#E0E0E0', borderColor: '#616161', glowEffect: false } },

    // Boiler section
    { id: 'boiler-01', type: 'equipment', position: { x: 100, y: 550 }, data: { tagName: 'BOILER-01', displayName: 'Boiler', equipmentType: 'boiler', status: 'RUN', icon: 'Flame', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '', width: 120, height: 160, color: '#FFF3E0', borderColor: '#EF6C00', glowEffect: false } },
    { id: 'ft-hb', type: 'equipment', position: { x: 750, y: 550 }, data: { tagName: 'FT-HB', displayName: 'Steam Flow', equipmentType: 'flow-meter', status: 'RUN', icon: 'Activity', opcTag: '', mqttTopic: '', apiEndpoint: '', staticValue: '3400', width: 130, height: 120, color: '#E1F5FE', borderColor: '#0288D1', glowEffect: false } },
  ],
  edges: [
    // Compressors → Dryer 1
    { id: 'e-c1-d1', source: 'comp-01', target: 'dry-01', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    { id: 'e-c2-d1', source: 'comp-02', target: 'dry-01', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: false, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    { id: 'e-c3-d2', source: 'comp-03', target: 'dry-02', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: false, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    // Dryers → Tank
    { id: 'e-d1-tk', source: 'dry-01', target: 'tk-101', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    { id: 'e-d2-tk', source: 'dry-02', target: 'tk-101', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: false, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    // Tank → Valve
    { id: 'e-tk-v', source: 'tk-101', target: 'xv-101', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    // Valve → FT-101
    { id: 'e-v-ft', source: 'xv-101', target: 'ft-101', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    // FT-101 → Branch Flow Meters
    { id: 'e-ft-201', source: 'ft-101', target: 'ft-201', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    { id: 'e-ft-202', source: 'ft-101', target: 'ft-202', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    // Flow Meters → Consumer Areas
    { id: 'e-201-weave', source: 'ft-201', target: 'weaving', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    { id: 'e-202-spin', source: 'ft-202', target: 'spinning', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#06B6D4', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
    // Boiler → Steam Flow
    { id: 'e-boiler-ft', source: 'boiler-01', target: 'ft-hb', sourceHandle: 'right', targetHandle: 'left', type: 'animatedPipe', data: { flowAnimated: true, flowColor: '#22C55E', pipeThickness: 3, flowDirection: 'forward', waypoints: [], label: '' } },
  ],
  viewport: { x: 0, y: 0, zoom: 0.85 },
  savedAt: '',
};
