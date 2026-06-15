'use client';

import { create } from 'zustand';
import type { Node, Edge, Viewport, OnNodesChange, OnEdgesChange, Connection, OnReconnect } from '@xyflow/react';
import { applyNodeChanges, applyEdgeChanges, addEdge, reconnectEdge } from '@xyflow/react';
import type { EditorNodeData, EditorEdgeData, SavedLayout, PipeWaypoint } from '@/types/editor';
import { LAYOUT_STORAGE_KEY } from '@/types/editor';
import { DEFAULT_TEMPLATE } from '@/lib/default-template';

/* -- Types ------------------------------------------ */

export type EditorNode = Node<EditorNodeData, 'equipment'>;
export type EditorEdge = Edge<EditorEdgeData>;

interface EditorState {
  nodes: EditorNode[];
  edges: EditorEdge[];
  viewport: Viewport;
  selectedNodeId: string | null;
  selectedEdgeId: string | null;
  connecting: boolean;
  // History
  undoStack: { nodes: EditorNode[]; edges: EditorEdge[] }[];
  redoStack: { nodes: EditorNode[]; edges: EditorEdge[] }[];
  // Actions
  onNodesChange: OnNodesChange<EditorNode>;
  onEdgesChange: OnEdgesChange<EditorEdge>;
  onConnect: (connection: Connection) => void;
  onReconnect: OnReconnect<EditorEdge>;
  setViewport: (viewport: Viewport) => void;
  // Node operations
  addNode: (node: EditorNode) => void;
  removeNode: (nodeId: string) => void;
  duplicateNode: (nodeId: string) => void;
  updateNodeData: (nodeId: string, data: Partial<EditorNodeData>) => void;
  // Edge operations
  removeEdge: (edgeId: string) => void;
  updateEdgeData: (edgeId: string, data: Partial<EditorEdgeData>) => void;
  // Waypoint operations
  addWaypoint: (edgeId: string, waypoint: PipeWaypoint) => void;
  moveWaypoint: (edgeId: string, waypointId: string, x: number, y: number) => void;
  removeWaypoint: (edgeId: string, waypointId: string) => void;
  // Selection
  setSelectedNode: (nodeId: string | null) => void;
  setSelectedEdge: (edgeId: string | null) => void;
  setConnecting: (connecting: boolean) => void;
  // Persistence
  saveLayout: () => void;
  loadLayout: () => boolean;
  clearLayout: () => void;
  resetToTemplate: () => void;
  // History
  pushHistory: () => void;
  undo: () => void;
  redo: () => void;
}

/* -- Store ------------------------------------------ */

export const useEditorStore = create<EditorState>((set, get) => ({
  nodes: [],
  edges: [],
  viewport: { x: 0, y: 0, zoom: 1 },
  selectedNodeId: null,
  selectedEdgeId: null,
  connecting: false,
  undoStack: [],
  redoStack: [],

  /* -- React Flow Callbacks ------------------------- */

  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },

  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },

  onConnect: (connection) => {
    get().pushHistory();
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          type: 'animatedPipe',
          data: {
            flowAnimated: true,
            flowColor: '#3B82F6',
            pipeThickness: 3,
            flowDirection: 'forward' as const,
            waypoints: [],
            label: '',
          },
        },
        state.edges,
      ),
    }));
  },

  onReconnect: (oldEdge, newConnection) => {
    get().pushHistory();
    set((state) => ({
      edges: reconnectEdge(oldEdge, newConnection, state.edges),
    }));
  },

  setViewport: (viewport) => set({ viewport }),

  /* -- Node Operations ------------------------------ */

  addNode: (node) => {
    get().pushHistory();
    set((state) => ({ nodes: [...state.nodes, node] }));
  },

  removeNode: (nodeId) => {
    get().pushHistory();
    set((state) => ({
      nodes: state.nodes.filter((n) => n.id !== nodeId),
      edges: state.edges.filter((e) => e.source !== nodeId && e.target !== nodeId),
      selectedNodeId: state.selectedNodeId === nodeId ? null : state.selectedNodeId,
    }));
  },

  duplicateNode: (nodeId) => {
    const state = get();
    const node = state.nodes.find((n) => n.id === nodeId);
    if (!node) return;
    get().pushHistory();
    const newId = `${node.id}-copy-${Date.now()}`;
    const newNode: EditorNode = {
      ...node,
      id: newId,
      position: { x: node.position.x + 30, y: node.position.y + 30 },
      data: { ...node.data, tagName: `${node.data.tagName}-COPY` },
      selected: false,
    };
    set((state) => ({ nodes: [...state.nodes, newNode] }));
  },

  updateNodeData: (nodeId, data) => {
    set((state) => ({
      nodes: state.nodes.map((n) =>
        n.id === nodeId ? { ...n, data: { ...n.data, ...data } } : n,
      ),
    }));
  },

  /* -- Edge Operations ------------------------------ */

  removeEdge: (edgeId) => {
    get().pushHistory();
    set((state) => ({
      edges: state.edges.filter((e) => e.id !== edgeId),
      selectedEdgeId: state.selectedEdgeId === edgeId ? null : state.selectedEdgeId,
    }));
  },

  updateEdgeData: (edgeId, data) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId ? { ...e, data: { ...e.data, ...data } as EditorEdgeData } : e,
      ),
    }));
  },

  /* -- Waypoint Operations -------------------------- */

  addWaypoint: (edgeId, waypoint) => {
    get().pushHistory();
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId
          ? { ...e, data: { ...e.data, waypoints: [...(e.data?.waypoints || []), waypoint] } as EditorEdgeData }
          : e,
      ),
    }));
  },

  moveWaypoint: (edgeId, waypointId, x, y) => {
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              data: {
                ...e.data,
                waypoints: (e.data?.waypoints || []).map((w) =>
                  w.id === waypointId ? { ...w, x, y } : w,
                ),
              } as EditorEdgeData,
            }
          : e,
      ),
    }));
  },

  removeWaypoint: (edgeId, waypointId) => {
    get().pushHistory();
    set((state) => ({
      edges: state.edges.map((e) =>
        e.id === edgeId
          ? {
              ...e,
              data: {
                ...e.data,
                waypoints: (e.data?.waypoints || []).filter((w) => w.id !== waypointId),
              } as EditorEdgeData,
            }
          : e,
      ),
    }));
  },

  /* -- Selection ------------------------------------ */

  setSelectedNode: (nodeId) => set({ selectedNodeId: nodeId, selectedEdgeId: null }),
  setConnecting: (connecting) => set({ connecting }),
  setSelectedEdge: (edgeId) => set({ selectedEdgeId: edgeId, selectedNodeId: null }),

  /* -- Persistence ---------------------------------- */

  saveLayout: () => {
    const state = get();
    const layout: SavedLayout = {
      version: 1,
      nodes: state.nodes.map((n) => ({
        id: n.id,
        type: n.type || 'equipment',
        position: n.position,
        data: n.data,
        width: n.measured?.width ?? n.data.width,
        height: n.measured?.height ?? n.data.height,
      })),
      edges: state.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type || 'animatedPipe',
        data: e.data!,
      })),
      viewport: state.viewport,
      savedAt: new Date().toISOString(),
    };
    try {
      localStorage.setItem(LAYOUT_STORAGE_KEY, JSON.stringify(layout));
    } catch {
      // quota exceeded
    }
  },

  loadLayout: () => {
    try {
      const raw = localStorage.getItem(LAYOUT_STORAGE_KEY);
      // Option B: do NOT auto-load template. Only load what the user saved.
      // Empty canvas will show a "Load Template" button instead.
      if (!raw) {
        set({ nodes: [], edges: [], undoStack: [], redoStack: [] });
        return false;
      }
      const layout = JSON.parse(raw) as SavedLayout;
      set({
        nodes: layout.nodes.map((n) => ({
          id: n.id,
          type: n.type || 'equipment',
          position: n.position,
          data: n.data,
        })),
        edges: layout.edges.map((e) => ({
          id: e.id,
          source: e.source,
          target: e.target,
          sourceHandle: e.sourceHandle,
          targetHandle: e.targetHandle,
          type: e.type || 'animatedPipe',
          data: e.data,
        })),
        viewport: layout.viewport,
        undoStack: [],
        redoStack: [],
      });
      return true;
    } catch {
      return false;
    }
  },

  clearLayout: () => {
    try {
      localStorage.removeItem(LAYOUT_STORAGE_KEY);
    } catch {
      // ignore
    }
    set({ nodes: [], edges: [], undoStack: [], redoStack: [] });
  },

  resetToTemplate: () => {
    get().pushHistory();
    set({
      nodes: DEFAULT_TEMPLATE.nodes.map((n) => ({
        id: n.id,
        type: n.type || 'equipment',
        position: n.position,
        data: n.data,
      })),
      edges: DEFAULT_TEMPLATE.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        sourceHandle: e.sourceHandle,
        targetHandle: e.targetHandle,
        type: e.type || 'animatedPipe',
        data: e.data,
      })),
      viewport: DEFAULT_TEMPLATE.viewport,
    });
  },

  /* -- History -------------------------------------- */

  pushHistory: () => {
    const state = get();
    set({
      undoStack: [
        ...state.undoStack.slice(-29),
        { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)) },
      ],
      redoStack: [],
    });
  },

  undo: () => {
    const state = get();
    if (state.undoStack.length === 0) return;
    const prev = state.undoStack[state.undoStack.length - 1];
    set({
      undoStack: state.undoStack.slice(0, -1),
      redoStack: [
        ...state.redoStack,
        { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)) },
      ],
      nodes: prev.nodes,
      edges: prev.edges,
    });
  },

  redo: () => {
    const state = get();
    if (state.redoStack.length === 0) return;
    const next = state.redoStack[state.redoStack.length - 1];
    set({
      redoStack: state.redoStack.slice(0, -1),
      undoStack: [
        ...state.undoStack,
        { nodes: JSON.parse(JSON.stringify(state.nodes)), edges: JSON.parse(JSON.stringify(state.edges)) },
      ],
      nodes: next.nodes,
      edges: next.edges,
    });
  },
}));
