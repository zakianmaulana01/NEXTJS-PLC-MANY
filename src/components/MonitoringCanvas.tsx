'use client';

import React, { useMemo, useEffect, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { EquipmentNode } from '@/components/editor/nodes/EquipmentNode';
import { SectionLabelNode } from '@/components/editor/nodes/SectionLabelNode';
import { AnimatedPipeEdge } from '@/components/editor/edges/AnimatedPipeEdge';
import { useLayoutPersistence } from '@/hooks/useLayoutPersistence';
import ScadaMap from '@/components/ScadaMap';
import type { SystemTelemetry } from '@/types/scada';
import { useTheme } from '@/context/ThemeContext';
import type { EditorNodeData, SavedLayout } from '@/types/editor';

/* ── Node & Edge type registries ──────────────────── */

const nodeTypes: NodeTypes = {
  equipment: EquipmentNode,
  sectionLabel: SectionLabelNode,
};

const edgeTypes: EdgeTypes = {
  animatedPipe: AnimatedPipeEdge,
};

/* ── Props ────────────────────────────────────────── */

interface MonitoringCanvasProps {
  telemetry: SystemTelemetry;
  onToggleCompressor: (id: string) => void;
  onSetCompressorFault: (id: string) => void;
  onToggleValve: (id: string) => void;
  onToggleDryerStatus: (id: string) => void;
}

/* ── Component ────────────────────────────────────── */

export default function MonitoringCanvas(props: MonitoringCanvasProps) {
  const { hasCustomLayout, getSavedLayout } = useLayoutPersistence();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  if (hasCustomLayout()) {
    const layout = getSavedLayout();
    // Only use custom layout if it actually contains nodes
    if (layout && layout.nodes && layout.nodes.length > 0) {
      return (
        <ReactFlowProvider>
          <CustomCanvas layout={layout} telemetry={props.telemetry} onToggleCompressor={props.onToggleCompressor} onSetCompressorFault={props.onSetCompressorFault} onToggleValve={props.onToggleValve} onToggleDryerStatus={props.onToggleDryerStatus} />
        </ReactFlowProvider>
      );
    }
  }

  // Fallback to default SVG map
  return <ScadaMap {...props} />;
}

/* ── Custom Canvas (React Flow) ───────────────────── */

function CustomCanvas({ layout, telemetry, onToggleCompressor, onSetCompressorFault, onToggleValve, onToggleDryerStatus }: { layout: SavedLayout; telemetry: SystemTelemetry, onToggleCompressor: (id: string) => void; onSetCompressorFault: (id: string) => void; onToggleValve: (id: string) => void; onToggleDryerStatus: (id: string) => void; }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Map real telemetry data to the saved nodes, matched by tagName
  const nodes = useMemo(() => {
    return layout.nodes.map((node) => {
      const data = { ...node.data };
      const tag = data.tagName;

      if (data.equipmentType === 'compressor') {
        const comp = telemetry.compressors.find((c) => c.tag === tag) || telemetry.compressors[0];
        if (comp) {
          data.status = comp.status;
          data.staticValue = `${comp.dischargePressure.toFixed(1)} bar`;
        }
      } else if (data.equipmentType === 'dryer') {
        const dryer = telemetry.dryers.find((dd) => dd.tag === tag) || telemetry.dryers[0];
        if (dryer) {
          data.status = dryer.status;
          data.staticValue = `${dryer.dewPoint.toFixed(1)} °C`;
        }
      } else if (data.equipmentType === 'buffer-tank' || data.equipmentType === 'receiver-tank') {
        data.status = 'RUN';
        data.staticValue = `${telemetry.tank.pressure.toFixed(1)} bar`;
      } else if (data.equipmentType === 'valve') {
        const valveKey = Object.keys(telemetry.valves).find((k) => telemetry.valves[k].tag === tag) || Object.keys(telemetry.valves)[0];
        if (valveKey) {
          data.status = telemetry.valves[valveKey].open ? 'RUN' : 'STOP';
        }
      } else if (data.equipmentType === 'flow-meter') {
        // Map by tag: FT-201 weaving, FT-202 spinning, else header
        let flow = telemetry.header.flow;
        if (tag === 'FT-201') flow = telemetry.branches.weaving.flow;
        else if (tag === 'FT-202') flow = telemetry.branches.spinning.flow;
        data.status = flow > 0 ? 'RUN' : 'STOP';
        data.staticValue = `${flow.toFixed(0)}`;
      } else if (data.equipmentType === 'pressure-transmitter') {
        data.status = 'RUN';
        data.staticValue = `${telemetry.header.pressure.toFixed(2)} bar`;
      }

      return { ...node, data };
    });
  }, [layout.nodes, telemetry]);

  // Edges grey + static when source is not RUN
  const edges = useMemo(() => {
    const statusById = new Map(nodes.map((n) => [n.id, n.data.status]));
    return layout.edges.map((edge) => {
      const sourceStatus = statusById.get(edge.source);
      const flowing = sourceStatus === 'RUN';
      return {
        ...edge,
        animated: flowing,
        data: {
          ...edge.data,
          flowAnimated: flowing,
          flowColor: flowing ? (edge.data?.flowColor || '#06B6D4') : '#94a3b8',
        },
      };
    });
  }, [layout.edges, nodes]);

  const handleNodeClick = (_event: React.MouseEvent, node: import('@xyflow/react').Node) => {
    const data = node.data as unknown as EditorNodeData;
    const { equipmentType, tagName } = data;
    if (equipmentType === 'compressor') {
      const comp = telemetry.compressors.find(c => c.tag === tagName) || telemetry.compressors[0];
      if (comp) onToggleCompressor(comp.id);
    } else if (equipmentType === 'dryer') {
      const dryer = telemetry.dryers.find(d => d.tag === tagName) || telemetry.dryers[0];
      if (dryer) onToggleDryerStatus(dryer.id);
    } else if (equipmentType === 'valve') {
      const valveKey = Object.keys(telemetry.valves).find(k => telemetry.valves[k].tag === tagName) || Object.keys(telemetry.valves)[0];
      if (valveKey) onToggleValve(valveKey);
    }
  };

  return (
    <div className="flex-1 h-full w-full relative bg-slate-50 dark:bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={layout.viewport}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
        onNodeClick={handleNodeClick}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDark ? '#1e293b' : '#e2e8f0'}
        />
        <Controls
          className="!border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !shadow-sm"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as EditorNodeData;
            return data?.borderColor || '#94a3b8';
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
          className="!border-slate-200 dark:!border-slate-700 !bg-white/80 dark:!bg-slate-900/80 !rounded-lg"
        />
      </ReactFlow>
    </div>
  );
}
