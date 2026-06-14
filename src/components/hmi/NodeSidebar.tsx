'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  Trash2,
  Eye,
  EyeOff,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Palette,
  Fan,
  Droplets,
  Container,
  Activity,
  Gauge,
  Zap,
  Flame,
  Factory,
  Save,
  Sun,
  Moon,
  Plus,
} from 'lucide-react';
import type { CanvasNodeConfig, PipeSegmentConfig, PipeColorId } from '@/types/canvas';
import { PIPE_COLOR_PRESETS } from '@/types/canvas';
import { useTheme } from '@/context/ThemeContext';

/* ── Props ─────────────────────────────────────────── */
interface NodeSidebarProps {
  title: string;
  nodes: CanvasNodeConfig[];
  pipes: PipeSegmentConfig[];
  onToggleNode: (nodeId: string) => void;
  onDeleteNode: (nodeId: string) => void;
  onRestoreAll: () => void;
  onChangePipeColor: (pipeId: string, colorId: PipeColorId) => void;
  onAddNode?: (node: CanvasNodeConfig) => void;
  onAddPipe?: (pipe: PipeSegmentConfig) => void;
  hiddenCount: number;
}

/* ── Icon Mapping ──────────────────────────────────── */
const TYPE_ICONS: Record<string, React.ElementType> = {
  compressor: Fan,
  dryer: Droplets,
  tank: Container,
  flowmeter: Activity,
  sensor: Gauge,
  valve: Zap,
  consumer: Factory,
  boiler: Flame,
  header_boiler: Container,
};

const TYPE_LABELS: Record<string, string> = {
  compressor: 'Compressors',
  dryer: 'Dryers',
  tank: 'Tanks',
  flowmeter: 'Flow Meters',
  sensor: 'Sensors',
  valve: 'Valves',
  consumer: 'Consumers',
  boiler: 'Boilers',
  header_boiler: 'Headers',
};

/* ── Color Swatch ──────────────────────────────────── */
function ColorSwatch({ colorId, selected, onClick }: { colorId: PipeColorId; selected: boolean; onClick: () => void }) {
  const preset = PIPE_COLOR_PRESETS[colorId];
  return (
    <button
      onClick={onClick}
      title={preset.label}
      className={`w-5 h-5 rounded-sm border-2 transition-all ${
        selected
          ? 'border-slate-900 dark:border-white scale-110 shadow-sm'
          : 'border-transparent hover:border-slate-300 dark:hover:border-slate-600'
      }`}
      style={{ backgroundColor: preset.core }}
    />
  );
}

/* ── Main Component ────────────────────────────────── */
export default function NodeSidebar({
  title,
  nodes,
  pipes,
  onToggleNode,
  onDeleteNode,
  onRestoreAll,
  onChangePipeColor,
  onAddNode,
  onAddPipe,
  hiddenCount,
}: NodeSidebarProps) {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  const [nodesOpen, setNodesOpen] = React.useState(true);
  const [pipesOpen, setPipesOpen] = React.useState(true);
  const router = useRouter();
  const [savedFeedback, setSavedFeedback] = React.useState(false);

  // Group nodes by type
  const grouped = React.useMemo(() => {
    const map = new Map<string, CanvasNodeConfig[]>();
    nodes.forEach((n) => {
      const arr = map.get(n.type) || [];
      arr.push(n);
      map.set(n.type, arr);
    });
    return map;
  }, [nodes]);

  const handleSave = () => {
    // State is already auto-saved to localStorage by the hook
    setSavedFeedback(true);
    setTimeout(() => {
      setSavedFeedback(false);
      router.push('/');
    }, 500);
  };

  const handleAddNode = () => {
    const id = window.prompt("Enter Node ID (e.g., NEW-NODE):");
    if (!id) return;
    const label = window.prompt("Enter Node Label:");
    if (!label) return;
    if (onAddNode) onAddNode({ id, tag: id, label, type: 'sensor', visible: true });
  };

  const handleAddPipe = () => {
    const id = window.prompt("Enter Pipe ID (must match SVG path code):");
    if (!id) return;
    const label = window.prompt("Enter Pipe Label:");
    if (!label) return;
    if (onAddPipe) onAddPipe({ id, label, colorId: 'cyan' });
  };

  return (
    <aside className="flex h-full w-[240px] shrink-0 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 select-none">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-3 py-3 bg-slate-50 dark:bg-slate-900">
        <div>
          <h2 className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
            Canvas Editor
          </h2>
          <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
            {title}
          </p>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={toggle}
            className="p-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-all"
            title="Toggle Theme"
          >
            {isDark ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
          </button>
          <button
            onClick={handleSave}
            title="Save (auto-saved)"
            className={`p-1.5 rounded border text-[9px] font-mono font-bold uppercase tracking-wider transition-all flex items-center gap-1 ${
              savedFeedback
                ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            <Save className="w-3 h-3" />
            {savedFeedback ? '✓' : ''}
          </button>
        </div>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto">
        {/* ── Node Section ──────────────────────────── */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setNodesOpen(!nodesOpen)}
            className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              {nodesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Nodes
              <span className="text-slate-300 dark:text-slate-600 font-normal">({nodes.length})</span>
            </span>
            {hiddenCount > 0 && (
              <span className="text-[9px] font-mono font-bold bg-rose-50 dark:bg-rose-950 text-rose-500 px-1.5 py-0.5 rounded">
                {hiddenCount} hidden
              </span>
            )}
          </button>

          {nodesOpen && (
            <div className="px-2 pb-2 space-y-2">
              {Array.from(grouped.entries()).map(([type, typeNodes]) => {
                const Icon = TYPE_ICONS[type] || Activity;
                const label = TYPE_LABELS[type] || type;

                return (
                  <div key={type}>
                    <div className="flex items-center gap-1.5 px-1 py-1">
                      <Icon className="w-3 h-3 text-slate-400" />
                      <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-slate-400">
                        {label}
                      </span>
                    </div>
                    <div className="space-y-0.5">
                      {typeNodes.map((node) => (
                        <div
                          key={node.id}
                          className={`flex items-center justify-between gap-1 px-2 py-1.5 rounded transition-all ${
                            node.visible
                              ? 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800'
                              : 'bg-slate-100 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 opacity-50'
                          }`}
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span
                              className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                                node.visible ? 'bg-emerald-400' : 'bg-slate-300 dark:bg-slate-600'
                              }`}
                            />
                            <div className="min-w-0">
                              <div className="text-[9px] font-mono font-extrabold text-slate-600 dark:text-slate-300 tracking-wider truncate">
                                {node.tag}
                              </div>
                              <div className="text-[8px] text-slate-400 truncate">{node.label}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-0.5 shrink-0">
                            <button
                              onClick={() => onToggleNode(node.id)}
                              title={node.visible ? 'Hide' : 'Show'}
                              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition"
                            >
                              {node.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                            </button>
                            {node.visible && (
                              <button
                                onClick={() => onDeleteNode(node.id)}
                                title="Remove from canvas"
                                className="p-1 rounded hover:bg-rose-50 dark:hover:bg-rose-950 text-slate-400 hover:text-rose-500 transition"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
              {onAddNode && (
                <div className="px-2 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <button onClick={handleAddNode} className="w-full py-1.5 rounded border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider transition">
                    <Plus className="w-3 h-3" /> Add Node
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── Pipe Colors Section ───────────────────── */}
        <div className="border-b border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setPipesOpen(!pipesOpen)}
            className="flex w-full items-center justify-between px-3 py-2.5 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
          >
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              {pipesOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              <Palette className="w-3 h-3" />
              Pipe Colors
            </span>
          </button>

          {pipesOpen && (
            <div className="px-3 pb-3 space-y-2.5">
              {pipes.map((pipe) => {
                const currentPreset = PIPE_COLOR_PRESETS[pipe.colorId as PipeColorId] || PIPE_COLOR_PRESETS.cyan;
                return (
                  <div key={pipe.id} className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-1 rounded-full shrink-0"
                        style={{ backgroundColor: currentPreset.core }}
                      />
                      <span className="text-[9px] font-mono font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">
                        {pipe.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 pl-5">
                      {(Object.keys(PIPE_COLOR_PRESETS) as PipeColorId[]).map((cid) => (
                        <ColorSwatch
                          key={cid}
                          colorId={cid}
                          selected={pipe.colorId === cid}
                          onClick={() => onChangePipeColor(pipe.id, cid)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
              {onAddPipe && (
                <div className="px-3 pt-2 pb-1 border-t border-slate-100 dark:border-slate-800 mt-2">
                  <button onClick={handleAddPipe} className="w-full py-1.5 rounded border border-dashed border-slate-300 dark:border-slate-700 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-center gap-1 text-[9px] font-mono font-bold uppercase tracking-wider transition">
                    <Plus className="w-3 h-3" /> Add Pipe
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-200 dark:border-slate-800 px-3 py-2.5 bg-slate-50 dark:bg-slate-900">
        <button
          onClick={onRestoreAll}
          disabled={hiddenCount === 0 && pipes.every((p) => p.colorId === 'cyan')}
          className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 font-mono text-[9px] font-bold uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <RotateCcw className="w-3 h-3" />
          Restore Defaults
        </button>
      </div>
    </aside>
  );
}
