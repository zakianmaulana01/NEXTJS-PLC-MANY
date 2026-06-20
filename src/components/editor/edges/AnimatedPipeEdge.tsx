'use client';

import React, { useCallback } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import type { EditorNodeData } from '@/types/editor';
import type { EditorEdgeData, PipeWaypoint } from '@/types/editor';
import { useEditorStore } from '@/hooks/useEditorStore';

type AnimatedPipeEdgeType = Edge<EditorEdgeData, 'animatedPipe'>;

/**
 * Animated pipe edge.
 * - Drag the SOURCE or TARGET handle (circle at end of pipe) to reconnect to a new node.
 * - Double-click the pipe body to add a bend waypoint.
 * - Drag the white waypoint dot to reroute the pipe.
 * - Double-click a waypoint dot to remove it.
 */
export function AnimatedPipeEdge(props: EdgeProps<AnimatedPipeEdgeType>) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, selected,
  } = props;

  const { screenToFlowPosition } = useReactFlow();
  const addWaypoint = useEditorStore((s) => s.addWaypoint);
  const moveWaypoint = useEditorStore((s) => s.moveWaypoint);
  const removeWaypoint = useEditorStore((s) => s.removeWaypoint);

  const flowColor = data?.flowColor || '#06B6D4';
  const thickness = data?.pipeThickness || 3;
  const animated = data?.flowAnimated ?? true;
  const direction = data?.flowDirection || 'forward';
  const waypoints: PipeWaypoint[] = data?.waypoints || [];

  // Check if source node is an instrument/sensor (no run/stop button) - use signal line style
  const { getNodes } = useReactFlow();
  const sourceNode = getNodes().find((n) => n.id === props.source);
  const equipmentType = (sourceNode?.data as EditorNodeData)?.equipmentType;
  const isInstrumentLine = sourceNode && ['pressure-transmitter', 'temperature-sensor'].includes(equipmentType || '');

  // Path: segments through waypoints, else smoothstep
  let edgePath: string;
  const overlap = 14; // Push points deeper inside the node to perfectly stick
  
  let sx = sourceX;
  let sy = sourceY;
  let tx = targetX;
  let ty = targetY;

  // Only apply overlap for thick flow pipes, not instrumentation lines
  if (!isInstrumentLine) {
    if (sourcePosition === 'right') sx -= overlap;
    else if (sourcePosition === 'left') sx += overlap;
    else if (sourcePosition === 'top') sy += overlap;
    else if (sourcePosition === 'bottom') sy -= overlap;

    if (targetPosition === 'right') tx -= overlap;
    else if (targetPosition === 'left') tx += overlap;
    else if (targetPosition === 'top') ty += overlap;
    else if (targetPosition === 'bottom') ty -= overlap;
  }

  if (waypoints.length > 0) {
    const pts = [
      { x: sx, y: sy },
      ...waypoints,
      { x: tx, y: ty },
    ];
    edgePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  } else {
    [edgePath] = getSmoothStepPath({
      sourceX: sx, sourceY: sy, sourcePosition, targetX: tx, targetY: ty, targetPosition, borderRadius: 12,
    });
  }

  // Add waypoint at double-click position on pipe
  const onPathDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addWaypoint(id, { id: `wp-${Date.now()}`, x: pos.x, y: pos.y });
    },
    [id, screenToFlowPosition, addWaypoint],
  );

  // Drag waypoint
  const onWaypointPointerDown = useCallback(
    (e: React.PointerEvent, wpId: string) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);
      const handleMove = (me: PointerEvent) => {
        const pos = screenToFlowPosition({ x: me.clientX, y: me.clientY });
        moveWaypoint(id, wpId, pos.x, pos.y);
      };
      const handleUp = () => {
        window.removeEventListener('pointermove', handleMove);
        window.removeEventListener('pointerup', handleUp);
      };
      window.addEventListener('pointermove', handleMove);
      window.addEventListener('pointerup', handleUp);
    },
    [id, screenToFlowPosition, moveWaypoint],
  );

  const midX = (sourceX + targetX) / 2;
  const midY = (sourceY + targetY) / 2;

  const instrumentStyle = { stroke: '#94a3b8', strokeWidth: 1.5, strokeDasharray: '4 4' };
  const instrumentMarker = 'url(#instrument-arrow)';

  return (
    <>
      {isInstrumentLine && (
        <defs>
          <marker
            id="instrument-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path d="M 0 0 L 10 5 L 0 10 z" fill="#94a3b8" />
          </marker>
        </defs>
      )}

      {/* Background glow - hidden for instrument lines */}
      {!isInstrumentLine && (
        <BaseEdge
          id={`${id}-bg`}
          path={edgePath}
          style={{ stroke: flowColor + '28', strokeWidth: thickness + 8, strokeLinecap: 'round' }}
        />
      )}
      
      {/* Main pipe / Instrument line */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={isInstrumentLine ? instrumentMarker : undefined}
        markerStart={undefined}
        style={isInstrumentLine ? instrumentStyle : { stroke: flowColor, strokeWidth: thickness, strokeLinecap: 'round' }}
      />
      
      {/* Wide transparent hit area — double-click to add waypoint */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'crosshair', pointerEvents: 'stroke' }}
        onDoubleClick={onPathDoubleClick}
      />
      
      {/* Flow animation - hidden for instrument lines */}
      {animated && !isInstrumentLine && (
        <path
          d={edgePath}
          fill="none"
          stroke="rgba(255,255,255,0.65)"
          strokeWidth={thickness > 2 ? 1.5 : 1}
          strokeDasharray="6 8"
          strokeLinecap="round"
          style={{
            animation: `flowDash 1.2s linear infinite${direction === 'reverse' ? ' reverse' : ''}`,
            pointerEvents: 'none',
          }}
        />
      )}
      {/* Selection highlight */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={thickness + 12}
          strokeLinecap="round"
          opacity={0.1}
          style={{ pointerEvents: 'none' }}
        />
      )}
      {/* Waypoint drag handles */}
      {selected && waypoints.map((wp) => (
        <circle
          key={wp.id}
          cx={wp.x}
          cy={wp.y}
          r={7}
          fill="white"
          stroke="#3B82F6"
          strokeWidth={2}
          style={{ cursor: 'grab', pointerEvents: 'all' }}
          onPointerDown={(e) => onWaypointPointerDown(e, wp.id)}
          onDoubleClick={(e) => { e.stopPropagation(); removeWaypoint(id, wp.id); }}
        />
      ))}
      {/* Label */}
      {data?.label && (
        <EdgeLabelRenderer>
          <div
            style={{ transform: `translate(-50%, -50%) translate(${midX}px, ${midY}px)` }}
            className="absolute pointer-events-none px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 text-[8px] font-mono font-bold uppercase tracking-wider text-slate-500"
          >
            {data.label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}

