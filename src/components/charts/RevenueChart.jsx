'use client';

import { useMemo } from 'react';
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { currency, currencyCompact } from '@/lib/format';
import useChartColors from './useChartColors';
import ChartTooltip from './ChartTooltip';

const fmtDay = (d) =>
  new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });

/** Revenue over time. Area chart because the value is cumulative-feeling and
 *  the shape of the trend matters more than individual points. */
export default function RevenueChart({ data = [], granularity = 'day', height = 288 }) {
  const c = useChartColors();

  const rows = useMemo(
    () => data.map((d) => ({ ...d, label: granularity === 'month' ? d.label : fmtDay(d.date) })),
    [data, granularity]
  );

  // Keep the x-axis readable at any window size.
  const interval = rows.length > 60 ? Math.floor(rows.length / 8) : rows.length > 20 ? Math.floor(rows.length / 7) : 0;

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={c.chart1} stopOpacity={0.22} />
              <stop offset="100%" stopColor={c.chart1} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={c.grid} strokeDasharray="0" vertical={false} />
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
            tick={{ fill: c.axis, fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={54}
            tickFormatter={currencyCompact}
          />
          <Tooltip
            cursor={{ stroke: c.chart1, strokeWidth: 1, strokeDasharray: '4 4' }}
            content={<ChartTooltip formatter={(v) => currency(v, { decimals: 0 })} />}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            name="Revenue"
            stroke={c.chart1}
            strokeWidth={2}
            fill="url(#revenueFill)"
            activeDot={{ r: 4, strokeWidth: 2, stroke: c.surface }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
