'use client';

import React from 'react';
import {
  Trash2, Copy, X, Palette,
} from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import type { EditorNodeData, EditorEdgeData, EquipmentType, EquipmentStatus } from '@/types/editor';
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
          <Section title="Data Binding">
            <Field label="OPC Tag">
              <input value={d.opcTag} onChange={(e) => update({ opcTag: e.target.value })} placeholder="ns=2;s=..." className="input-field" />
            </Field>
            <Field label="MQTT Topic">
              <input value={d.mqttTopic} onChange={(e) => update({ mqttTopic: e.target.value })} placeholder="plant/comp/01" className="input-field" />
            </Field>
            <Field label="API Endpoint">
              <input value={d.apiEndpoint} onChange={(e) => update({ apiEndpoint: e.target.value })} placeholder="/api/v1/..." className="input-field" />
            </Field>
            <Field label="Static Value">
              <input value={d.staticValue} onChange={(e) => update({ staticValue: e.target.value })} placeholder="7.2 bar" className="input-field" />
            </Field>
          </Section>

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
