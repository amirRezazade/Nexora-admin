'use client';

import { useMemo } from 'react';
import {
  Bar, BarChart, CartesianGrid, Line, ComposedChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { number } from '@/lib/format';
import useChartColors from './useChartColors';
import ChartTooltip from './ChartTooltip';

const fmtDay = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Orders and units side by side. Bars because these are discrete counts. */
export default function SalesChart({ data = [], granularity = 'day', height = 288, showUnits = true }) {
  const c = useChartColors();

  const rows = useMemo(
    () => data.map((d) => ({ ...d, label: granularity === 'month' ? d.label : fmtDay(d.date) })),
    [data, granularity]
  );

  const interval = rows.length > 60 ? Math.floor(rows.length / 8) : rows.length > 20 ? Math.floor(rows.length / 7) : 0;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
          <CartesianGrid stroke={c.grid} vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={interval}
            minTickGap={12}
            dy={6}
          />
          <YAxis
            yAxisId="orders"
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={36}
            allowDecimals={false}
          />
          {showUnits && (
            <YAxis
              yAxisId="units"
              orientation="right"
              tick={{ fill: c.axis, fontSize: 11 }}
              tickLine={false}
              axisLine={false}
              width={32}
              allowDecimals={false}
            />
          )}
          <Tooltip
            cursor={{ fill: c.grid, fillOpacity: 0.5 }}
            content={<ChartTooltip formatter={(v) => number(v)} />}
          />
          <Bar
            yAxisId="orders"
            dataKey="orders"
            name="Orders"
            fill={c.chart2}
            fillOpacity={0.85}
            radius={[3, 3, 0, 0]}
            maxBarSize={26}
          />
          {showUnits && (
            <Line
              yAxisId="units"
              type="monotone"
              dataKey="units"
              name="Units sold"
              stroke={c.chart1}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: c.surface }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
