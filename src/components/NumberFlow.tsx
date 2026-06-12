"use client";

import { useEffect, useRef, useState } from "react";

interface NumberFlowProps {
  value: number;
  format?: (value: number) => string;
}

export default function NumberFlow({ value, format = (v) => String(Math.round(v)) }: NumberFlowProps) {
  const [displayValue, setDisplayValue] = useState(value);
  const previousValue = useRef(value);

  useEffect(() => {
    const startValue = previousValue.current;
    const endValue = value;
    const duration = 350;
    const startTime = performance.now();

    const animate = (currentTime: number) => {
      const progress = Math.min((currentTime - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const nextValue = startValue + (endValue - startValue) * eased;
      setDisplayValue(nextValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        previousValue.current = endValue;
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  return <>{format(displayValue)}</>;
}
