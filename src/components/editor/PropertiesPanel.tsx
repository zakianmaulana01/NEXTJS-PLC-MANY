'use client';

import React from 'react';
import {
  Trash2, Copy, X, Palette, Plus,
} from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import type { EditorNodeData, EditorEdgeData, EquipmentType, EquipmentStatus, NodeMetric } from '@/types/editor';
import { FLOW_COLOR_PRESETS } from '@/types/editor';

/* -- Equipment Type Options ------------------------- */

const EQUIPMENT_TYPES: { value: EquipmentType; label: string }[] = [
  { value: 'compressor', label: 'Compressor' },
  { value: 'dryer', label: 'Air Dryer' },
  { value: 'buffer-tank', label: 'Buffer Tank' },
  { value: 'receiver-tank', label: 'Receiver Tank' },
  { value: 'valve', label: 'Valve' },
  { value: 'flow-meter', label: 'Flow Meter' },
  { value: 'pressure-transmitter', label: 'Pressure TX' },
  { value: 'temperature-sensor', label: 'Temp Sensor' },
  { value: 'boiler', label: 'Boiler' },
  { value: 'consumer-area', label: 'Consumer Area' },
  { value: 'custom', label: 'Custom' },
];

const STATUS_OPTIONS: EquipmentStatus[] = ['RUN', 'STOP', 'FAULT', 'OFFLINE'];

/* -- Component -------------------------------------- */

export default function PropertiesPanel() {
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedEdgeId = useEditorStore((s) => s.selectedEdgeId);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);
  const updateEdgeData = useEditorStore((s) => s.updateEdgeData);
  const removeNode = useEditorStore((s) => s.removeNode);
  const removeEdge = useEditorStore((s) => s.removeEdge);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const setSelectedNode = useEditorStore((s) => s.setSelectedNode);
  const setSelectedEdge = useEditorStore((s) => s.setSelectedEdge);

  const selectedNode = selectedNodeId ? nodes.find((n) => n.id === selectedNodeId) : null;
  const selectedEdge = selectedEdgeId ? edges.find((e) => e.id === selectedEdgeId) : null;

  if (!selectedNode && !selectedEdge) {
    return (
      <aside className="w-[260px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center px-6">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-900 flex items-center justify-center mx-auto mb-3">
            <Palette className="w-5 h-5 text-slate-400" />
          </div>
          <p className="text-[11px] font-mono font-bold text-slate-400 uppercase tracking-wider">No Selection</p>
          <p className="text-[9px] text-slate-400 mt-1">Click a node or edge to edit properties</p>
        </div>
      </aside>
    );
  }

  /* -- Node Properties ------------------------------ */

  if (selectedNode) {
    const d = selectedNode.data;

    const update = (partial: Partial<EditorNodeData>) => {
      updateNodeData(selectedNode.id, partial);
    };

    return (
      <aside className="w-[260px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col select-none">
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div>
            <h3 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
              Node Properties
            </h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">{d.tagName}</p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => duplicateNode(selectedNode.id)} title="Duplicate" className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 transition">
              <Copy className="w-3 h-3" />
            </button>
            <button onClick={() => { removeNode(selectedNode.id); }} title="Delete" className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition">
              <Trash2 className="w-3 h-3" />
            </button>
            <button onClick={() => setSelectedNode(null)} title="Close" className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 transition">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Equipment Section */}
          <Section title="Equipment">
            <Field label="Tag Name">
              <input value={d.tagName} onChange={(e) => update({ tagName: e.target.value })} className="input-field" />
            </Field>
            <Field label="Display Name">
              <input value={d.displayName} onChange={(e) => update({ displayName: e.target.value })} className="input-field" />
            </Field>
            <Field label="Type">
              <select value={d.equipmentType} onChange={(e) => update({ equipmentType: e.target.value as EquipmentType })} className="input-field">
                {EQUIPMENT_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </Field>
            <Field label="Status">
              <div className="flex gap-1">
                {STATUS_OPTIONS.map((s) => (
                  <button key={s} onClick={() => update({ status: s })}
                    className={`flex-1 py-1 rounded text-[8px] font-mono font-bold uppercase tracking-wider border transition ${
                      d.status === s
                        ? s === 'RUN' ? 'bg-emerald-50 border-emerald-300 text-emerald-600 dark:bg-emerald-950 dark:border-emerald-700 dark:text-emerald-400'
                        : s === 'FAULT' ? 'bg-rose-50 border-rose-300 text-rose-600 dark:bg-rose-950 dark:border-rose-700 dark:text-rose-400'
                        : 'bg-slate-100 border-slate-300 text-slate-600 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >{s}</button>
                ))}
              </div>
            </Field>
          </Section>

          {/* Data Binding Section */}
          <Section title="Data Binding (API)">
            <Field label="API Endpoint">
              <input value={d.apiEndpoint} onChange={(e) => update({ apiEndpoint: e.target.value })} placeholder="/api/telemetry" className="input-field" />
            </Field>
            <Field label="Data Source Key">
              <input value={d.dataSourceKey || ''} onChange={(e) => update({ dataSourceKey: e.target.value })} placeholder="COMP-01" className="input-field" />
            </Field>
            <Field label="OPC Tag (optional)">
              <input value={d.opcTag} onChange={(e) => update({ opcTag: e.target.value })} placeholder="ns=2;s=..." className="input-field" />
            </Field>
            <Field label="MQTT Topic (optional)">
              <input value={d.mqttTopic} onChange={(e) => update({ mqttTopic: e.target.value })} placeholder="plant/comp/01" className="input-field" />
            </Field>
            <Field label="Static Value">
              <input value={d.staticValue} onChange={(e) => update({ staticValue: e.target.value })} placeholder="7.2 bar" className="input-field" />
            </Field>
          </Section>

          {/* Custom Metrics Section */}
          <MetricsEditor metrics={d.metrics || []} onChange={(metrics) => update({ metrics })} />

          {/* Styling Section */}
          <Section title="Styling">
            <Field label="Width">
              <input type="number" value={d.width} onChange={(e) => update({ width: Number(e.target.value) })} min={60} max={400} className="input-field" />
            </Field>
            <Field label="Height">
              <input type="number" value={d.height} onChange={(e) => update({ height: Number(e.target.value) })} min={40} max={300} className="input-field" />
            </Field>
            <Field label="Color">
              <div className="flex items-center gap-2">
                <input type="color" value={d.color} onChange={(e) => update({ color: e.target.value })} className="w-8 h-7 rounded border border-slate-200 dark:border-slate-700 cursor-pointer" />
                <input value={d.color} onChange={(e) => update({ color: e.target.value })} className="input-field flex-1" />
              </div>
            </Field>
            <Field label="Border Color">
              <div className="flex items-center gap-2">
                <input type="color" value={d.borderColor} onChange={(e) => update({ borderColor: e.target.value })} className="w-8 h-7 rounded border border-slate-200 dark:border-slate-700 cursor-pointer" />
                <input value={d.borderColor} onChange={(e) => update({ borderColor: e.target.value })} className="input-field flex-1" />
              </div>
            </Field>
            <Field label="Glow Effect">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={d.glowEffect} onChange={(e) => update({ glowEffect: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-blue-500" />
                <span className="text-[10px] font-mono text-slate-500">{d.glowEffect ? 'Enabled' : 'Disabled'}</span>
              </label>
            </Field>
          </Section>
        </div>
      </aside>
    );
  }

  /* -- Edge Properties ------------------------------ */

  if (selectedEdge) {
    const d = selectedEdge.data!;

    const update = (partial: Partial<EditorEdgeData>) => {
      updateEdgeData(selectedEdge.id, partial);
    };

    return (
      <aside className="w-[260px] shrink-0 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 flex flex-col select-none">
        <div className="flex items-center justify-between px-3 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900">
          <div>
            <h3 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
              Pipe Properties
            </h3>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 mt-0.5">
              {selectedEdge.source} → {selectedEdge.target}
            </p>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => { removeEdge(selectedEdge.id); }} title="Delete" className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 transition">
              <Trash2 className="w-3 h-3" />
            </button>
            <button onClick={() => setSelectedEdge(null)} title="Close" className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 transition">
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <Section title="Flow">
            <Field label="Animated">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={d.flowAnimated} onChange={(e) => update({ flowAnimated: e.target.checked })}
                  className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-blue-500 focus:ring-blue-500" />
                <span className="text-[10px] font-mono text-slate-500">{d.flowAnimated ? 'ON' : 'OFF'}</span>
              </label>
            </Field>
            <Field label="Flow Color">
              <div className="flex flex-wrap gap-1.5">
                {FLOW_COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => update({ flowColor: preset.color })}
                    title={preset.label}
                    className={`w-6 h-6 rounded-sm border-2 transition-all ${
                      d.flowColor === preset.color
                        ? 'border-slate-800 dark:border-white scale-110 shadow-sm'
                        : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                    style={{ backgroundColor: preset.color }}
                  />
                ))}
              </div>
            </Field>
            <Field label="Thickness">
              <input type="range" min={1} max={8} step={0.5} value={d.pipeThickness}
                onChange={(e) => update({ pipeThickness: Number(e.target.value) })}
                className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500" />
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">{d.pipeThickness}px</span>
            </Field>
            <Field label="Direction">
              <div className="flex gap-1">
                {(['forward', 'reverse'] as const).map((dir) => (
                  <button key={dir} onClick={() => update({ flowDirection: dir })}
                    className={`flex-1 py-1.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider border transition ${
                      d.flowDirection === dir
                        ? 'bg-blue-50 border-blue-300 text-blue-600 dark:bg-blue-950 dark:border-blue-700 dark:text-blue-400'
                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                    }`}
                  >{dir === 'forward' ? '→ Forward' : '← Reverse'}</button>
                ))}
              </div>
            </Field>
            <Field label="Label">
              <input value={d.label || ''} onChange={(e) => update({ label: e.target.value })} placeholder="e.g. Main Header" className="input-field" />
            </Field>
          </Section>
        </div>
      </aside>
    );
  }

  return null;
}

/* -- Shared Sub-Components -------------------------- */

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-3 space-y-2.5">
      <h4 className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400">{title}</h4>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[9px] font-mono font-bold text-slate-500 uppercase tracking-wider">{label}</label>
      {children}
    </div>
  );
}

function MetricsEditor({ metrics, onChange }: { metrics: NodeMetric[]; onChange: (m: NodeMetric[]) => void }) {
  const add = () => {
    onChange([
      ...metrics,
      { id: `m-${Date.now()}`, label: 'NEW', valueKey: '', unit: '', fallback: '0', color: 'text-slate-700 dark:text-slate-300' },
    ]);
  };
  const update = (id: string, partial: Partial<NodeMetric>) => {
    onChange(metrics.map((m) => (m.id === id ? { ...m, ...partial } : m)));
  };
  const remove = (id: string) => onChange(metrics.filter((m) => m.id !== id));

  return (
    <div className="border-b border-slate-100 dark:border-slate-800 px-3 py-3 space-y-2.5">
      <div className="flex items-center justify-between">
        <h4 className="text-[9px] font-mono font-extrabold uppercase tracking-widest text-slate-400">Custom Metrics</h4>
        <button onClick={add} className="p-1 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-blue-500 transition" title="Add metric row">
          <Plus className="w-3 h-3" />
        </button>
      </div>
      {metrics.length === 0 && (
        <p className="text-[9px] text-slate-400 leading-relaxed">
          No custom rows. Default metrics are shown. Add rows to map API fields (e.g. label SPEED, key <code>loadPercent</code>, unit %).
        </p>
      )}
      {metrics.map((m) => (
        <div key={m.id} className="border border-slate-100 dark:border-slate-800 rounded p-2 space-y-1.5">
          <div className="flex items-center gap-1.5">
            <input value={m.label} onChange={(e) => update(m.id, { label: e.target.value })} placeholder="LABEL" className="input-field flex-1 !text-[10px]" />
            <button onClick={() => remove(m.id)} className="p-1 text-slate-400 hover:text-rose-500" title="Remove">
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
          <div className="flex items-center gap-1.5">
            <input value={m.valueKey} onChange={(e) => update(m.id, { valueKey: e.target.value })} placeholder="apiKey" className="input-field flex-1 !text-[10px]" />
            <input value={m.unit} onChange={(e) => update(m.id, { unit: e.target.value })} placeholder="unit" className="input-field w-14 !text-[10px]" />
          </div>
          <input value={m.fallback} onChange={(e) => update(m.id, { fallback: e.target.value })} placeholder="fallback value" className="input-field !text-[10px]" />
        </div>
      ))}
    </div>
  );
}
