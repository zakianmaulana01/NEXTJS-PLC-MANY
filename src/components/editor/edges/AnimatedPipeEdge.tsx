'use client';

import React from 'react';
import { BaseEdge, getSmoothStepPath, type EdgeProps, type Edge } from '@xyflow/react';
import type { EditorEdgeData } from '@/types/editor';

type AnimatedPipeEdgeType = Edge<EditorEdgeData, 'animatedPipe'>;

/**
 * Custom animated pipe edge with flow direction dots.
 * Renders as a thick pipe with animated dashes.
 */
export function AnimatedPipeEdge(props: EdgeProps<AnimatedPipeEdgeType>) {
  const {
    id, sourceX, sourceY, targetX, targetY,
    sourcePosition, targetPosition, data, selected, markerEnd,
  } = props;
  const flowColor = data?.flowColor || '#3B82F6';
  const thickness = data?.pipeThickness || 3;
  const animated = data?.flowAnimated ?? true;
  const direction = data?.flowDirection || 'forward';

  const [edgePath] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 12,
  });

  return (
    <>
      {/* Background pipe (thick, faded) */}
      <BaseEdge
        id={`${id}-bg`}
        path={edgePath}
        style={{
          stroke: flowColor + '25',
          strokeWidth: thickness + 6,
          strokeLinecap: 'round',
        }}
      />
      {/* Main pipe */}
      <BaseEdge
        id={id}
        path={edgePath}
        markerEnd={markerEnd}
        style={{
          stroke: flowColor,
          strokeWidth: thickness,
          strokeLinecap: 'round',
        }}
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
          style={{
            animation: `flowDash 1.2s linear infinite${direction === 'reverse' ? ' reverse' : ''}`,
          }}
        />
      )}
      {/* Selection highlight */}
      {selected && (
        <path
          d={edgePath}
          fill="none"
          stroke="#3B82F6"
          strokeWidth={thickness + 10}
          strokeLinecap="round"
          opacity={0.12}
        />
      )}
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
