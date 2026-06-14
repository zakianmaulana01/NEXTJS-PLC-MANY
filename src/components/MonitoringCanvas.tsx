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
import { AnimatedPipeEdge } from '@/components/editor/edges/AnimatedPipeEdge';
import { useLayoutPersistence } from '@/hooks/useLayoutPersistence';
import ScadaMap from '@/components/ScadaMap';
import type { SystemTelemetry } from '@/types/scada';
import { useTheme } from '@/context/ThemeContext';
import type { EditorNodeData, SavedLayout } from '@/types/editor';

/* ── Node & Edge type registries ──────────────────── */

const nodeTypes: NodeTypes = {
  equipment: EquipmentNode,
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
    if (layout) {
      return (
        <ReactFlowProvider>
          <CustomCanvas layout={layout} telemetry={props.telemetry} />
        </ReactFlowProvider>
      );
    }
  }

  // Fallback to default SVG map
  return <ScadaMap {...props} />;
}

/* ── Custom Canvas (React Flow) ───────────────────── */

function CustomCanvas({ layout, telemetry }: { layout: SavedLayout; telemetry: SystemTelemetry }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Map real telemetry data to the saved nodes
  // We match by equipmentType, or just assign random "live" looks.
  // For a true SCADA, we would match by `opcTag` or `tagName`.
  const nodes = useMemo(() => {
    return layout.nodes.map((node) => {
      const data = { ...node.data };
      
      // Basic dynamic binding based on equipmentType
      if (data.equipmentType === 'compressor') {
        const comp = telemetry.compressors[0]; // Just use first for demo
        if (comp) {
          data.status = comp.status;
          data.staticValue = `${comp.dischargePressure.toFixed(1)} bar`;
        }
      } else if (data.equipmentType === 'dryer') {
        const dryer = telemetry.dryers[0];
        if (dryer) {
          data.status = dryer.status;
          data.staticValue = `${dryer.dewPoint.toFixed(1)} °C`;
        }
      } else if (data.equipmentType === 'buffer-tank' || data.equipmentType === 'receiver-tank') {
        data.staticValue = `${telemetry.tank.pressure.toFixed(1)} bar`;
      } else if (data.equipmentType === 'valve') {
        const valveKey = Object.keys(telemetry.valves)[0];
        if (valveKey) {
          const valve = telemetry.valves[valveKey];
          data.status = valve.open ? 'RUN' : 'STOP';
        }
      } else if (data.equipmentType === 'flow-meter') {
        data.staticValue = `${telemetry.branches[0]?.flow.toFixed(0)} Nm³/h`;
      }

      return {
        ...node,
        data,
      };
    });
  }, [layout.nodes, telemetry]);

  return (
    <div className="flex-1 h-full w-full relative bg-slate-50 dark:bg-slate-950">
      <ReactFlow
        nodes={nodes}
        edges={layout.edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultViewport={layout.viewport}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true}
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
