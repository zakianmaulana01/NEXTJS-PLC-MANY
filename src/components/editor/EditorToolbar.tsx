'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Save, Undo2, Redo2, Trash2, Copy, Grid3X3, ArrowLeft, Sun, Moon, ZoomIn, ZoomOut, Maximize2, LayoutTemplate,
} from 'lucide-react';
import { useEditorStore } from '@/hooks/useEditorStore';
import { useTheme } from '@/context/ThemeContext';

/* -- Props ------------------------------------------ */

interface EditorToolbarProps {
  snapToGrid: boolean;
  onToggleSnap: () => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFitView: () => void;
}

/* -- Component -------------------------------------- */

export default function EditorToolbar({ snapToGrid, onToggleSnap, onZoomIn, onZoomOut, onFitView }: EditorToolbarProps) {
  const router = useRouter();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const saveLayout = useEditorStore((s) => s.saveLayout);
  const undo = useEditorStore((s) => s.undo);
  const redo = useEditorStore((s) => s.redo);
  const undoStack = useEditorStore((s) => s.undoStack);
  const redoStack = useEditorStore((s) => s.redoStack);
  const selectedNodeId = useEditorStore((s) => s.selectedNodeId);
  const selectedEdgeId = useEditorStore((s) => s.selectedEdgeId);
  const removeNode = useEditorStore((s) => s.removeNode);
  const removeEdge = useEditorStore((s) => s.removeEdge);
  const duplicateNode = useEditorStore((s) => s.duplicateNode);
  const resetToTemplate = useEditorStore((s) => s.resetToTemplate);
  const nodes = useEditorStore((s) => s.nodes);
  const edges = useEditorStore((s) => s.edges);

  const [saved, setSaved] = React.useState(false);

  const handleSave = async () => {
    await saveLayout();
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      router.replace('/');
    }, 600);
  };

  const handleDelete = () => {
    if (selectedNodeId) removeNode(selectedNodeId);
    else if (selectedEdgeId) removeEdge(selectedEdgeId);
  };

  const handleDuplicate = () => {
    if (selectedNodeId) duplicateNode(selectedNodeId);
  };

  return (
    <div className={`flex items-center justify-between h-11 px-3 border-b shrink-0 transition-colors ${
      isDark ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
    }`}>
      {/* Left: Back + Title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.replace('/')}
          className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-[9px] font-mono font-bold uppercase tracking-wider transition"
        >
          <ArrowLeft className="w-3 h-3" />
          Monitoring
        </button>
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700" />
        <div>
          <h1 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-500">
            Canvas Editor
          </h1>
          <p className="text-[8px] text-slate-400 font-mono">
            {nodes.length} nodes · {edges.length} connections
          </p>
        </div>
      </div>

      {/* Center: Actions */}
      <div className="flex items-center gap-1">
        <ToolbarButton icon={Undo2} label="Undo" onClick={undo} disabled={undoStack.length === 0} />
        <ToolbarButton icon={Redo2} label="Redo" onClick={redo} disabled={redoStack.length === 0} />
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <ToolbarButton icon={Copy} label="Duplicate" onClick={handleDuplicate} disabled={!selectedNodeId} />
        <ToolbarButton icon={Trash2} label="Delete" onClick={handleDelete} disabled={!selectedNodeId && !selectedEdgeId} danger />
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <ToolbarButton icon={LayoutTemplate} label="Load Default Template" onClick={resetToTemplate} />
        <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 mx-1" />
        <ToolbarButton icon={ZoomIn} label="Zoom In" onClick={onZoomIn} />
        <ToolbarButton icon={ZoomOut} label="Zoom Out" onClick={onZoomOut} />
        <ToolbarButton icon={Maximize2} label="Fit View" onClick={onFitView} />
        <ToolbarButton icon={Grid3X3} label="Snap" onClick={onToggleSnap} active={snapToGrid} />
      </div>

      {/* Right: Theme + Save */}
      <div className="flex items-center gap-2">
        <button
          onClick={toggle}
          className="p-1.5 rounded border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
          title="Toggle Theme"
        >
          {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
        </button>
        <button
          onClick={handleSave}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider transition-all ${
            saved
              ? 'bg-emerald-500 text-white border border-emerald-500'
              : 'bg-blue-500 hover:bg-blue-600 text-white border border-blue-500'
          }`}
        >
          <Save className="w-3 h-3" />
          {saved ? '✓ Saved' : 'Save & Exit'}
        </button>
      </div>
    </div>
  );
}

/* -- Toolbar Button --------------------------------- */

function ToolbarButton({
  icon: Icon,
  label,
  onClick,
  disabled,
  active,
  danger,
}: {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  active?: boolean;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={label}
      className={`p-1.5 rounded border transition-all ${
        disabled
          ? 'border-transparent text-slate-300 dark:text-slate-700 cursor-not-allowed'
          : active
          ? 'border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 text-blue-500'
          : danger
          ? 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-rose-500 hover:border-rose-300 dark:hover:border-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950'
          : 'border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
      }`}
    >
      <Icon className="w-3.5 h-3.5" />
    </button>
  );
}
