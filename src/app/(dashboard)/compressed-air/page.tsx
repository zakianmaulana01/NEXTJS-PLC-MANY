'use client';

import React, { useState } from 'react';
import { ReactFlowProvider, useReactFlow } from '@xyflow/react';
import EquipmentPalette from '@/components/editor/EquipmentPalette';
import CanvasEditor from '@/components/editor/CanvasEditor';
import PropertiesPanel from '@/components/editor/PropertiesPanel';
import EditorToolbar from '@/components/editor/EditorToolbar';
import { useTheme } from '@/context/ThemeContext';

/**
 * Visual Canvas Editor for designing SCADA/HMI plant layouts.
 * Drag equipment from the left palette onto the canvas,
 * connect them with flow pipes, and configure properties on the right.
 * Save persists to localStorage and redirects to the monitoring dashboard.
 */
export default function CanvasEditorPage() {
  return (
    <ReactFlowProvider>
      <CanvasEditorInner />
    </ReactFlowProvider>
  );
}

function CanvasEditorInner() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [snapToGrid, setSnapToGrid] = useState(true);
  const reactFlow = useReactFlow();

  return (
    <div className={`w-full h-full flex flex-col overflow-hidden transition-colors ${
      isDark ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'
    }`}>
      {/* Toolbar */}
      <EditorToolbar
        snapToGrid={snapToGrid}
        onToggleSnap={() => setSnapToGrid(!snapToGrid)}
        onZoomIn={() => reactFlow.zoomIn()}
        onZoomOut={() => reactFlow.zoomOut()}
        onFitView={() => reactFlow.fitView({ padding: 0.2 })}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Equipment Palette */}
        <EquipmentPalette />

        {/* Center: Canvas */}
        <CanvasEditor snapToGrid={snapToGrid} />

        {/* Right: Properties Panel */}
        <PropertiesPanel />
      </div>
    </div>
  );
}
