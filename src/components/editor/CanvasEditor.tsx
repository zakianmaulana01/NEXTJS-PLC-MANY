'use client';

import React, { useCallback, useRef, useEffect } from 'react';
import { LayoutTemplate } from 'lucide-react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  useReactFlow,
  type NodeTypes,
  type EdgeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useEditorStore, type EditorNode } from '@/hooks/useEditorStore';
import { EquipmentNode } from '@/components/editor/nodes/EquipmentNode';
import { SectionLabelNode } from '@/components/editor/nodes/SectionLabelNode';
import { AnimatedPipeEdge } from '@/components/editor/edges/AnimatedPipeEdge';
import type { EquipmentCatalogueItem, EditorNodeData } from '@/types/editor';
import { useTheme } from '@/context/ThemeContext';

/* -- Node & Edge type registries -------------------- */

const nodeTypes: NodeTypes = {
  equipment: EquipmentNode,
  sectionLabel: SectionLabelNode,
};

const edgeTypes: EdgeTypes = {
  animatedPipe: AnimatedPipeEdge,
};

/* -- Props ------------------------------------------ */

interface CanvasEditorProps {
  snapToGrid: boolean;
}

/* -- Component -------------------------------------- */

export default function CanvasEditor({ snapToGrid }: CanvasEditorProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const reactFlowInstance = useReactFlow();

  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);
  const onNodesChange = useEditorStore((s) => s.onNodesChange);
  const onEdgesChange = useEditorStore((s) => s.onEdgesChange);
  const onConnect = useEditorStore((s) => s.onConnect);
  const onReconnect = useEditorStore((s) => s.onReconnect);
  const addNode = useEditorStore((s) => s.addNode);
  const setSelectedNode = useEditorStore((s) => s.setSelectedNode);
  const setSelectedEdge = useEditorStore((s) => s.setSelectedEdge);
  const setConnecting = useEditorStore((s) => s.setConnecting);
  const setViewport = useEditorStore((s) => s.setViewport);
  const pushHistory = useEditorStore((s) => s.pushHistory);
  const loadLayout = useEditorStore((s) => s.loadLayout);
  const resetToTemplate = useEditorStore((s) => s.resetToTemplate);
  const updateNodeData = useEditorStore((s) => s.updateNodeData);

  // Load saved layout on mount
  useEffect(() => {
    loadLayout();
  }, [loadLayout]);

  /* -- Drop Handler --------------------------------- */

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow-type');
      const rawData = event.dataTransfer.getData('application/reactflow-data');
      if (!type || !rawData) return;

      const item: EquipmentCatalogueItem = JSON.parse(rawData);

      // In @xyflow/react v12+, screenToFlowPosition expects client coordinates directly
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const id = `${type}-${Date.now()}`;

      // Section labels use a different node type
      if (type === 'section-label') {
        const labelNode = {
          id,
          type: 'sectionLabel',
          position,
          data: {
            label: 'SECTION LABEL',
            fontSize: 12,
          },
        };
        pushHistory();
        addNode(labelNode as unknown as EditorNode);
        return;
      }

      const newNode: EditorNode = {
        id,
        type: 'equipment',
        position,
        data: {
          tagName: `${type.toUpperCase().replace(/-/g, '-')}-${String(Math.floor(Math.random() * 100)).padStart(2, '0')}`,
          displayName: item.label,
          equipmentType: item.type,
          status: 'STOP',
          icon: item.icon,
          opcTag: '',
          mqttTopic: '',
          apiEndpoint: '',
          staticValue: '',
          width: item.defaultWidth,
          height: item.defaultHeight,
          color: item.defaultColor,
          borderColor: item.defaultBorderColor,
          glowEffect: false,
        },
      };

      pushHistory();
      addNode(newNode);
    },
    [reactFlowInstance, addNode, pushHistory],
  );

  /* -- Selection Handlers --------------------------- */

  const onNodeClick = useCallback(
    (_event: React.MouseEvent, node: EditorNode) => {
      setSelectedNode(node.id);
    },
    [setSelectedNode],
  );

  // Double-click toggles RUN/STOP — quick simulate on/off of flow
  const onNodeDoubleClick = useCallback(
    (_event: React.MouseEvent, node: EditorNode) => {
      const data = node.data;
      if (data.equipmentType === 'section-label') return;
      const next = data.status === 'RUN' ? 'STOP' : 'RUN';
      pushHistory();
      updateNodeData(node.id, { status: next });
    },
    [pushHistory, updateNodeData],
  );

  const onEdgeClick = useCallback(
    (_event: React.MouseEvent, edge: { id: string }) => {
      setSelectedEdge(edge.id);
    },
    [setSelectedEdge],
  );

  const onPaneClick = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, [setSelectedNode, setSelectedEdge]);

  const onMoveEnd = useCallback(
    (_event: unknown, viewport: { x: number; y: number; zoom: number }) => {
      setViewport(viewport);
    },
    [setViewport],
  );

  const onNodeDragStop = useCallback(() => {
    pushHistory();
  }, [pushHistory]);

  /* -- Derived edges: grey + no animation when flow is stopped -- */
  const displayEdges = React.useMemo(() => {
    const statusById = new Map(nodes.map((n) => [n.id, n.data?.status]));
    return edges.map((edge) => {
      const sourceStatus = statusById.get(edge.source);
      const targetStatus = statusById.get(edge.target);
      const flowing = sourceStatus === 'RUN' && targetStatus !== 'OFFLINE';
      return {
        ...edge,
        data: {
          ...edge.data,
          flowAnimated: flowing ? (edge.data?.flowAnimated ?? true) : false,
          // grey when not flowing, original color when flowing
          flowColor: flowing ? (edge.data?.flowColor || '#06B6D4') : '#94a3b8',
        },
      };
    });
  }, [nodes, edges]);

  return (
    <div ref={reactFlowWrapper} className="flex-1 h-full">
      <ReactFlow
        nodes={nodes}
        edges={displayEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onConnectStart={() => setConnecting(true)}
        onConnectEnd={() => setConnecting(false)}
        onReconnect={onReconnect}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={onNodeClick}
        onNodeDoubleClick={onNodeDoubleClick}
        onEdgeClick={onEdgeClick}
        onPaneClick={onPaneClick}
        onMoveEnd={onMoveEnd}
        onNodeDragStop={onNodeDragStop}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        snapToGrid={snapToGrid}
        snapGrid={[15, 15]}
        fitView
        deleteKeyCode="Delete"
        multiSelectionKeyCode="Shift"
        connectionLineStyle={{ stroke: '#3B82F6', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: 'animatedPipe',
          data: {
            flowAnimated: true,
            flowColor: '#06B6D4',
            pipeThickness: 3,
            flowDirection: 'forward',
            waypoints: [],
            label: '',
          },
        }}
        proOptions={{ hideAttribution: true }}
        className="!bg-transparent"
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color={isDark ? '#1e293b' : '#e2e8f0'}
        />
        <Controls
          showZoom={false}
          showFitView={false}
          showInteractive={false}
          className="!border-slate-200 dark:!border-slate-700 !bg-white dark:!bg-slate-900 !rounded-lg !shadow-sm"
        />
        <MiniMap
          nodeColor={(node) => {
            const data = node.data as EditorNodeData;
            return data?.borderColor || '#94a3b8';
          }}
          maskColor={isDark ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.7)'}
          className="!border-slate-200 dark:!border-slate-700 !bg-white/80 dark:!bg-slate-900/80 !rounded-lg"
          pannable
          zoomable
        />
      </ReactFlow>

      {/* Empty State — Option B: user clicks to load template */}
      {nodes.length === 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="pointer-events-auto text-center bg-white/90 dark:bg-slate-900/90 backdrop-blur border border-slate-200 dark:border-slate-700 rounded-2xl px-10 py-8 shadow-xl">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-950 flex items-center justify-center mx-auto mb-4">
              <LayoutTemplate className="w-7 h-7 text-blue-500" />
            </div>
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-200">Canvas Kosong</h3>
            <p className="text-xs text-slate-400 mt-1 mb-5 max-w-[260px]">
              Mulai dari template default (mirip dashboard monitoring), atau drag equipment dari panel kiri.
            </p>
            <button
              onClick={() => resetToTemplate()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white text-xs font-mono font-bold uppercase tracking-wider transition"
            >
              <LayoutTemplate className="w-4 h-4" />
              Load Default Template
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
