"use client";

import React, { memo } from 'react';
import { type NodeProps, type Node } from '@xyflow/react';

interface SectionLabelData {
  [key: string]: unknown;
  label: string;
  fontSize?: number;
}

type SectionLabelNodeType = Node<SectionLabelData, 'sectionLabel'>;

function SectionLabelInner(props: NodeProps<SectionLabelNodeType>) {
  const data = props.data;
  const selected = props.selected;

  return (
    <div className={`px-2 py-1 select-none cursor-grab active:cursor-grabbing ${selected ? 'ring-1 ring-blue-500 rounded' : ''}`}>
      <span
        className="font-mono font-extrabold uppercase tracking-[0.2em] text-slate-400 dark:text-slate-500 whitespace-nowrap"
        style={{ fontSize: data.fontSize || 12 }}
      >
        {data.label || 'SECTION LABEL'}
      </span>
    </div>
  );
}

export const SectionLabelNode = memo(SectionLabelInner);
