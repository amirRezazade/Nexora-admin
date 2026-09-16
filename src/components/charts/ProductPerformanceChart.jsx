'use client';

import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { currency, currencyCompact } from '@/lib/format';
import useChartColors from './useChartColors';
import ChartTooltip from './ChartTooltip';

/** Horizontal bars — product names are long, and ranking reads better
 *  top-to-bottom. */
export default function ProductPerformanceChart({ data = [], height = 300 }) {
  const c = useChartColors();
  const rows = [...data].reverse();

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} layout="vertical" margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} horizontal={false} />
          <XAxis
            type="number"
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            tickFormatter={currencyCompact}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fill: c.ink2, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={148}
            tickFormatter={(v) => (v.length > 22 ? `${v.slice(0, 21)}…` : v)}
          />
          <Tooltip
            cursor={{ fill: c.grid, fillOpacity: 0.5 }}
            content={<ChartTooltip formatter={(v) => currency(v, { decimals: 0 })} />}
          />
          <Bar dataKey="revenue" name="Revenue" radius={[0, 3, 3, 0]} maxBarSize={18}>
            {rows.map((row, i) => (
              <Cell key={row.productId} fill={i === rows.length - 1 ? c.chart1 : c.chart2} fillOpacity={i === rows.length - 1 ? 1 : 0.75} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
