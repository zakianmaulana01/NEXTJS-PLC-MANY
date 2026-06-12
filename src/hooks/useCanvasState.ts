'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CanvasConfig, CanvasNodeConfig, PipeSegmentConfig, PipeColorId } from '@/types/canvas';

/**
 * Custom hook for managing editable canvas state with localStorage persistence.
 */
export function useCanvasState(
  storageKey: string,
  defaultNodes: CanvasNodeConfig[],
  defaultPipes: PipeSegmentConfig[],
) {
  const [config, setConfig] = useState<CanvasConfig>(() => {
    if (typeof window === 'undefined') return { nodes: defaultNodes, pipes: defaultPipes };
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as CanvasConfig;
        // Merge with defaults to handle new nodes/pipes added in code
        const mergedNodes = defaultNodes.map((dn) => {
          const saved = parsed.nodes.find((n) => n.id === dn.id);
          return saved ? { ...dn, visible: saved.visible } : dn;
        });
        const mergedPipes = defaultPipes.map((dp) => {
          const saved = parsed.pipes.find((p) => p.id === dp.id);
          return saved ? { ...dp, colorId: saved.colorId } : dp;
        });
        return { nodes: mergedNodes, pipes: mergedPipes };
      }
    } catch {
      // fallback to defaults
    }
    return { nodes: defaultNodes, pipes: defaultPipes };
  });

  // Persist to localStorage on every change
  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(config));
    } catch {
      // quota exceeded, ignore
    }
  }, [storageKey, config]);

  const isNodeVisible = useCallback(
    (nodeId: string) => {
      const node = config.nodes.find((n) => n.id === nodeId);
      return node?.visible ?? true;
    },
    [config.nodes],
  );

  const toggleNodeVisibility = useCallback((nodeId: string) => {
    setConfig((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, visible: !n.visible } : n,
      ),
    }));
  }, []);

  const deleteNode = useCallback((nodeId: string) => {
    setConfig((prev) => ({
      ...prev,
      nodes: prev.nodes.map((n) =>
        n.id === nodeId ? { ...n, visible: false } : n,
      ),
    }));
  }, []);

  const getPipeColor = useCallback(
    (pipeId: string): PipeColorId => {
      const pipe = config.pipes.find((p) => p.id === pipeId);
      return (pipe?.colorId ?? 'cyan') as PipeColorId;
    },
    [config.pipes],
  );

  const setPipeColor = useCallback((pipeId: string, colorId: PipeColorId) => {
    setConfig((prev) => ({
      ...prev,
      pipes: prev.pipes.map((p) =>
        p.id === pipeId ? { ...p, colorId } : p,
      ),
    }));
  }, []);

  const addNode = useCallback((node: CanvasNodeConfig) => {
    setConfig((prev) => {
      if (prev.nodes.find(n => n.id === node.id)) return prev;
      return { ...prev, nodes: [...prev.nodes, node] };
    });
  }, []);

  const addPipe = useCallback((pipe: PipeSegmentConfig) => {
    setConfig((prev) => {
      if (prev.pipes.find(p => p.id === pipe.id)) return prev;
      return { ...prev, pipes: [...prev.pipes, pipe] };
    });
  }, []);

  const restoreAll = useCallback(() => {
    setConfig({ nodes: defaultNodes, pipes: defaultPipes });
    try {
      localStorage.removeItem(storageKey);
    } catch {
      // ignore
    }
  }, [defaultNodes, defaultPipes, storageKey]);

  const hiddenCount = config.nodes.filter((n) => !n.visible).length;

  return {
    config,
    isNodeVisible,
    toggleNodeVisibility,
    deleteNode,
    getPipeColor,
    setPipeColor,
    addNode,
    addPipe,
    restoreAll,
    hiddenCount,
  };
}
