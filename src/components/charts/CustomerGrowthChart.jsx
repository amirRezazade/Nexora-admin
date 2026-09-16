'use client';

import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { number } from '@/lib/format';
import useChartColors from './useChartColors';
import ChartTooltip from './ChartTooltip';

/** New vs returning buyers per month — stacked because they sum to the
 *  month's total active customers. */
export default function CustomerGrowthChart({ data = [], height = 260 }) {
  const c = useChartColors();
  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis dataKey="label" tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} dy={6} />
          <YAxis tick={{ fill: c.axis, fontSize: 11 }} tickLine={false} axisLine={false} width={36} allowDecimals={false} />
          <Tooltip
            cursor={{ fill: c.grid, fillOpacity: 0.5 }}
            content={<ChartTooltip formatter={(v) => number(v)} showTotal />}
          />
          <Bar dataKey="returning" name="Returning" stackId="a" fill={c.chart2} maxBarSize={34} />
          <Bar dataKey="new" name="New" stackId="a" fill={c.chart1} radius={[3, 3, 0, 0]} maxBarSize={34} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
