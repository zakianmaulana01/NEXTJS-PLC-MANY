'use client';

import React, { useCallback } from 'react';
import {
  BaseEdge,
  getSmoothStepPath,
  useReactFlow,
  type EdgeProps,
  type Edge,
} from '@xyflow/react';
import type { EditorEdgeData, PipeWaypoint } from '@/types/editor';
import { useEditorStore } from '@/hooks/useEditorStore';

type AnimatedPipeEdgeType = Edge<EditorEdgeData, 'animatedPipe'>;

/**
 * Animated pipe edge with draggable waypoints.
 * - Double-click on the pipe to add a bend point.
 * - Drag a bend point (white dot) to reroute the pipe.
 * - Double-click a bend point to remove it.
 */
export function AnimatedPipeEdge(props: EdgeProps<AnimatedPipeEdgeType>) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, selected, markerEnd,
  } = props;

  const { screenToFlowPosition } = useReactFlow();
  const addWaypoint = useEditorStore((s) => s.addWaypoint);
  const moveWaypoint = useEditorStore((s) => s.moveWaypoint);
  const removeWaypoint = useEditorStore((s) => s.removeWaypoint);

  const flowColor = data?.flowColor || '#3B82F6';
  const thickness = data?.pipeThickness || 3;
  const animated = data?.flowAnimated ?? true;
  const direction = data?.flowDirection || 'forward';
  const waypoints: PipeWaypoint[] = data?.waypoints || [];

  // Build path: if waypoints exist, draw straight segments through them; else smoothstep
  let edgePath: string;
  if (waypoints.length > 0) {
    const pts = [
      { x: sourceX, y: sourceY },
      ...waypoints,
      { x: targetX, y: targetY },
    ];
    edgePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
  } else {
    [edgePath] = getSmoothStepPath({
      sourceX, sourceY, sourcePosition, targetX, targetY, targetPosition, borderRadius: 12,
    });
  }

  // Add a waypoint where the user double-clicks on the pipe
  const onPathDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      addWaypoint(id, { id: `wp-${Date.now()}`, x: pos.x, y: pos.y });
    },
    [id, screenToFlowPosition, addWaypoint],
  );

  // Drag a waypoint
  const onWaypointPointerDown = useCallback(
    (e: React.PointerEvent, wpId: string) => {
      e.stopPropagation();
      (e.target as Element).setPointerCapture?.(e.pointerId);

      const handleMove = (moveEvent: PointerEvent) => {
        const pos = screenToFlowPosition({ x: moveEvent.clientX, y: moveEvent.clientY });
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

  return (
    <>
      {/* Background pipe (thick, faded) */}
      <BaseEdge
        id={`${id}-bg`}
        path={edgePath}
        style={{ stroke: flowColor + '25', strokeWidth: thickness + 6, strokeLinecap: 'round' }}
      />
      {/* Main pipe */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{ stroke: flowColor, strokeWidth: thickness, strokeLinecap: 'round' }}
      />
      {/* Invisible wide hit-area for double-click to add waypoint */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={16}
        style={{ cursor: 'copy', pointerEvents: 'stroke' }}
        onDoubleClick={onPathDoubleClick}
      />
      {/* Animated flow overlay */}
      {animated && (
        <path
          d={edgePath}
          fill="none"
          stroke="white"
          strokeWidth={thickness > 2 ? 1.5 : 1}
          strokeDasharray="6 8"
          strokeLinecap="round"
          opacity={0.6}
          style={{ animation: `flowDash 1.2s linear infinite${direction === 'reverse' ? ' reverse' : ''}`, pointerEvents: 'none' }}
        />
      )}
      {/* Selection highlight */}
      {selected && (
        <path d={edgePath} fill="none" stroke="#3B82F6" strokeWidth={thickness + 10} strokeLinecap="round" opacity={0.12} style={{ pointerEvents: 'none' }} />
      )}
      {/* Draggable waypoint handles (visible when selected) */}
      {selected && waypoints.map((wp) => (
        <circle
          key={wp.id}
          cx={wp.x}
          cy={wp.y}
          r={6}
          fill="white"
          stroke="#3B82F6"
          strokeWidth={2}
          style={{ cursor: 'grab', pointerEvents: 'all' }}
          onPointerDown={(e) => onWaypointPointerDown(e, wp.id)}
          onDoubleClick={(e) => { e.stopPropagation(); removeWaypoint(id, wp.id); }}
        />
      ))}
      {/* Edge label */}
      {data?.label && (
        <foreignObject
          width={100}
          height={24}
          x={(sourceX + targetX) / 2 - 50}
          y={(sourceY + targetY) / 2 - 12}
          className="pointer-events-none"
        >
          <div className="flex items-center justify-center h-full">
            <span className="text-[8px] font-mono font-bold uppercase tracking-wider bg-white/90 dark:bg-slate-900/90 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700">
              {data.label}
            </span>
          </div>
        </foreignObject>
      )}
    </>
  );
}
