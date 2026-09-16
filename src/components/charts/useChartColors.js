'use client';

import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';

const KEYS = [
  'c-chart-1', 'c-chart-2', 'c-chart-3', 'c-chart-4', 'c-chart-5', 'c-chart-6',
  'c-chart-grid', 'c-chart-axis', 'c-brand', 'c-ink', 'c-ink-2', 'c-ink-3',
  'c-surface', 'c-line', 'c-success', 'c-danger', 'c-info', 'c-warning',
];

const FALLBACK = {
  chart1: '#ea580c', chart2: '#2563eb', chart3: '#168f5c', chart4: '#9333ea',
  chart5: '#ca8a04', chart6: '#0891b2', grid: '#e9ecef', axis: '#828995',
  brand: '#ea580c', ink: '#16181d', ink2: '#525864', ink3: '#828995',
  surface: '#ffffff', line: '#e5e7eb', success: '#168f5c', danger: '#d0302f',
  info: '#2563eb', warning: '#ca8a04',
};

/**
 * Recharts needs literal colour values, so we read the resolved CSS custom
 * properties and re-read them whenever the theme flips.
 */
export default function useChartColors() {
  const resolved = useSelector((s) => s.theme.resolved);
  const [colors, setColors] = useState(FALLBACK);

  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const read = (k) => {
      const v = cs.getPropertyValue(`--${k}`).trim();
      return v ? `rgb(${v})` : null;
    };
    const next = {};
    KEYS.forEach((k) => {
      const v = read(k);
      if (v) next[k] = v;
    });
    setColors({
      chart1: next['c-chart-1'] || FALLBACK.chart1,
      chart2: next['c-chart-2'] || FALLBACK.chart2,
      chart3: next['c-chart-3'] || FALLBACK.chart3,
      chart4: next['c-chart-4'] || FALLBACK.chart4,
      chart5: next['c-chart-5'] || FALLBACK.chart5,
      chart6: next['c-chart-6'] || FALLBACK.chart6,
      grid: next['c-chart-grid'] || FALLBACK.grid,
      axis: next['c-chart-axis'] || FALLBACK.axis,
      brand: next['c-brand'] || FALLBACK.brand,
      ink: next['c-ink'] || FALLBACK.ink,
      ink2: next['c-ink-2'] || FALLBACK.ink2,
      ink3: next['c-ink-3'] || FALLBACK.ink3,
      surface: next['c-surface'] || FALLBACK.surface,
      line: next['c-line'] || FALLBACK.line,
      success: next['c-success'] || FALLBACK.success,
      danger: next['c-danger'] || FALLBACK.danger,
      info: next['c-info'] || FALLBACK.info,
      warning: next['c-warning'] || FALLBACK.warning,
    });
  }, [resolved]);

  return colors;
}

export const CHART_SERIES = (c) => [c.chart1, c.chart2, c.chart3, c.chart4, c.chart5, c.chart6];
