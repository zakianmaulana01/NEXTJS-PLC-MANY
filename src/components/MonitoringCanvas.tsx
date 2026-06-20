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
  type Node,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { calculateFlowPropagation } from '@/lib/utils';

import { EquipmentNode } from '@/components/editor/nodes/EquipmentNode';
import { SectionLabelNode } from '@/components/editor/nodes/SectionLabelNode';
import { AnimatedPipeEdge } from '@/components/editor/edges/AnimatedPipeEdge';
import { useLayoutPersistence } from '@/hooks/useLayoutPersistence';
import MonitoringMap from '@/components/MonitoringMap';
import type { SystemTelemetry } from '@/types/monitoring';
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
  onSelectionChange?: (hasSelection: boolean) => void;
}

/* ── Component ────────────────────────────────────── */

export default function MonitoringCanvas(props: MonitoringCanvasProps) {
  const { hasCustomLayout, getSavedLayout, isLoading } = useLayoutPersistence();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Delay the state update to avoid cascading render error in React 19
    setTimeout(() => {
      setMounted(true);
    }, 0);
  }, []);

  if (!mounted || isLoading) return null;

  if (hasCustomLayout()) {
    const layout = getSavedLayout();
    // Only use custom layout if it actually contains nodes
    if (layout && layout.nodes && layout.nodes.length > 0) {
      return (
        <ReactFlowProvider>
          <CustomCanvas layout={layout} telemetry={props.telemetry} onSelectionChange={props.onSelectionChange} />
        </ReactFlowProvider>
      );
    }
  }

  // Fallback to default SVG map
  return <MonitoringMap {...props} />;
}

/* ── Custom Canvas (React Flow) ───────────────────── */

function CustomCanvas({ layout, telemetry, onSelectionChange }: { layout: SavedLayout; telemetry: SystemTelemetry; onSelectionChange?: (hasSelection: boolean) => void; }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Map real telemetry data to the saved nodes, matched by tagName
  const rawNodes = useMemo(() => {
    return layout.nodes.map((node) => {
      const data = { ...node.data };
      const tag = data.tagName;

      if (data.equipmentType === 'compressor') {
        const comp = telemetry.compressors.find((c) => c.tag === tag) || telemetry.compressors[0];
        if (comp) {
          data.status = comp.status;
          data.staticValue = `${comp.dischargePressure.toFixed(1)} bar`;
          data.liveSpeed = `${comp.loadPercent}%`;
          data.livePower = `${comp.powerkW} kW`;
          data.liveTemp = `${comp.dischargeTemp.toFixed(1)}°C`;
          data.liveFlow = `${Math.round(8.5 * comp.loadPercent)} Nm³`;
        }
      } else if (data.equipmentType === 'dryer') {
        const dryer = telemetry.dryers.find((dd) => dd.tag === tag) || telemetry.dryers[0];
        if (dryer) {
          data.status = dryer.status;
          data.staticValue = `${dryer.dewPoint.toFixed(1)} °C`;
          data.liveDewPoint = `${dryer.dewPoint.toFixed(1)}°C`;
          data.liveOutletTemp = `${dryer.outletTemp.toFixed(1)}°C`;
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
        let flow = telemetry.header.flow;
        if (tag === 'FT-201') flow = telemetry.branches.weaving.flow;
        else if (tag === 'FT-202') flow = telemetry.branches.spinning.flow;
        data.status = flow > 0 ? 'RUN' : 'STOP';
        data.staticValue = `${flow.toFixed(0)}`;
      } else if (data.equipmentType === 'pressure-transmitter' || data.equipmentType === 'temperature-sensor') {
        data.status = 'RUN';
        data.staticValue = `${telemetry.header.pressure.toFixed(2)} bar`;
      }

      return { ...node, data };
    });
  }, [layout.nodes, telemetry]);

  const flowingNodes = useMemo(() => {
    return calculateFlowPropagation(rawNodes, layout.edges);
  }, [rawNodes, layout.edges]);

  const nodes = useMemo(() => {
    return rawNodes.map((node) => ({
      ...node,
      selected: node.id === selectedNodeId,
      data: { ...node.data, isEditor: false }
    }));
  }, [rawNodes, selectedNodeId]);

  // Edges grey + static when no flow reaches them
  const edges = useMemo(() => {
    return layout.edges.map((edge) => {
      const flowing = flowingNodes.has(edge.source);
      return {
        ...edge,
        animated: flowing,
        selectable: false,
        interactionWidth: 0,
        data: {
          ...edge.data,
          flowAnimated: flowing,
          flowColor: flowing ? (edge.data?.flowColor || '#06B6D4') : '#94a3b8',
        },
      };
    });
  }, [layout.edges, flowingNodes]);

  // Disabling manual start/stop from the dashboard viewer as requested.
  // The layout editor can still test animations via double click.

  const handleNodeClick = React.useCallback((_: React.MouseEvent, node: Node) => {
    setSelectedNodeId(node.id);
    if (onSelectionChange) onSelectionChange(true);
  }, [onSelectionChange]);

  const handlePaneClick = React.useCallback(() => {
    setSelectedNodeId(null);
    if (onSelectionChange) onSelectionChange(false);
  }, [onSelectionChange]);

  return (
    <div className="flex-1 h-full w-full relative bg-[#F5F7FA] dark:bg-slate-950">
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
        onPaneClick={handlePaneClick}
        proOptions={{ hideAttribution: true }}
        minZoom={0.5}
        maxZoom={2.0}
        fitView
        fitViewOptions={{ padding: 0.1, minZoom: 0.5, maxZoom: 1 }}
        translateExtent={[[-200, -100], [1500, 1000]]}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={34}
          size={0.9}
          color={isDark ? '#233042' : '#d7dee8'}
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
