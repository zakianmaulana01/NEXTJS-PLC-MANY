"use client";

import React, { useMemo } from 'react';

interface SparklineProps {
  data: number[];
  min: number;
  max: number;
  unit?: string;
  color?: string;
}

export default function Sparkline({ data, min, max, color = '#00B8FF' }: SparklineProps) {
  const points = useMemo(() => {
    if (data.length === 0) return "";
    const width = 100;
    const height = 30;
    const step = width / (data.length - 1);
    
    return data.map((val, i) => {
      const x = i * step;
      const normalizedVal = (val - min) / (max - min);
      const y = height - (normalizedVal * height);
      return `${x},${y}`;
    }).join(' ');
  }, [data, min, max]);

  return (
    <div className="w-full h-8 flex items-end">
      <svg viewBox="0 0 100 30" className="w-full h-full preserve-3d" preserveAspectRatio="none">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    </div>
  );
}
