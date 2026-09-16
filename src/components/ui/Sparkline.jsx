'use client';

import { useId } from 'react';
import { cn } from '@/lib/format';

/**
 * Dependency-free trend line. Deliberately unlabelled — it conveys shape only,
 * the precise figure lives above it.
 */
export default function Sparkline({ data = [], className, tone = 'brand', strokeWidth = 1.75 }) {
  const id = useId();
  if (data.length < 2) return null;

  const w = 100;
  const h = 32;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);

  const points = data.map((v, i) => [i * step, h - 2 - ((v - min) / range) * (h - 6)]);
  const line = points.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x.toFixed(2)},${y.toFixed(2)}`).join(' ');
  const area = `${line} L${w},${h} L0,${h} Z`;

  const strokes = {
    brand: 'rgb(var(--c-brand))',
    success: 'rgb(var(--c-success))',
    danger: 'rgb(var(--c-danger))',
    info: 'rgb(var(--c-info))',
  };
  const stroke = strokes[tone] || strokes.brand;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      aria-hidden
      focusable="false"
      className={cn('overflow-visible', className)}
    >
      <defs>
        <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity="0.18" />
          <stop offset="100%" stopColor={stroke} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={area} fill={`url(#spark-${id})`} />
      <path
        d={line}
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
