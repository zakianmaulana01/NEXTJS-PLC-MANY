"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
} from '@xyflow/react';
import { DeviceNodeData } from '@/components/flow-nodes/DeviceNode';

export type AppNode = Node<DeviceNodeData>;

const initialNodes: AppNode[] = [
  {
    id: 'c1',
    type: 'deviceNode',
    position: { x: 50, y: 100 },
    data: { type: 'compressor', tag: 'COMP-01', label: 'Rotary Screw A', value: '75 kW' },
  },
  {
    id: 'd1',
    type: 'deviceNode',
    position: { x: 300, y: 100 },
    data: { type: 'dryer', tag: 'DRY-01', label: 'Refrig. Dryer A', value: 'Dew: -40°C' },
  },
  {
    id: 't1',
    type: 'deviceNode',
    position: { x: 550, y: 150 },
    data: { type: 'tank', tag: 'TK-101', label: 'Receiver Tank', value: '7.2 bar' },
  },
  {
    id: 'v1',
    type: 'deviceNode',
    position: { x: 800, y: 150 },
    data: { type: 'valve', tag: 'XV-101', label: 'Isolation Valve', value: 'OPEN' },
  },
  {
    id: 'f1',
    type: 'deviceNode',
    position: { x: 1050, y: 150 },
    data: { type: 'flowmeter', tag: 'FT-101', label: 'Main Flow', value: '850 Nm³/h' },
  },
];

const initialEdges: Edge[] = [
  { id: 'e-c1-d1', source: 'c1', target: 'd1', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e-d1-t1', source: 'd1', target: 't1', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e-t1-v1', source: 't1', target: 'v1', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
  { id: 'e-v1-f1', source: 'v1', target: 'f1', animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } },
];

interface FlowState {
  nodes: AppNode[];
  edges: Edge[];
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (node: AppNode) => void;
  updateNode: (id: string, data: Partial<DeviceNodeData>) => void;
  deleteNode: (id: string) => void;
}

export const useFlowStore = create<FlowState>()(
  persist(
    (set, get) => ({
      nodes: initialNodes,
      edges: initialEdges,
      onNodesChange: (changes: NodeChange<AppNode>[]) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) });
      },
      onEdgesChange: (changes: EdgeChange[]) => {
        set({ edges: applyEdgeChanges(changes, get().edges) });
      },
      onConnect: (connection: Connection) => {
        set({ edges: addEdge({ ...connection, animated: true, style: { stroke: '#06b6d4', strokeWidth: 2 } }, get().edges) });
      },
      addNode: (node) => set({ nodes: [...get().nodes, node] }),
      updateNode: (id, data) => set({
        nodes: get().nodes.map(n => n.id === id ? { ...n, data: { ...n.data, ...data } } : n)
      }),
      deleteNode: (id) => set({
        nodes: get().nodes.filter(n => n.id !== id),
        edges: get().edges.filter(e => e.source !== id && e.target !== id)
      }),
    }),
    {
      name: 'scada-flow-storage',
    }
  )
);