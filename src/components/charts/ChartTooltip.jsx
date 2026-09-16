'use client';

import { cn } from '@/lib/format';

/**
 * One tooltip for every chart in Nova, so the reading experience is identical
 * whether you're on the dashboard or deep in analytics.
 */
export default function ChartTooltip({ active, payload, label, formatter, labelFormatter, showTotal = false }) {
  if (!active || !payload?.length) return null;

  const rows = payload.filter((p) => p.value != null && p.dataKey !== '__ignore');
  const total = rows.reduce((s, r) => s + (Number(r.value) || 0), 0);

  return (
    <div className="pointer-events-none min-w-[168px] animate-pop-in rounded-card border border-line bg-surface p-3 shadow-lg">
      {label != null && (
        <p className="mb-2 border-b border-line pb-1.5 text-caption font-semibold text-ink">
          {labelFormatter ? labelFormatter(label) : label}
        </p>
      )}
      <ul className="flex flex-col gap-1.5">
        {rows.map((row, i) => (
          <li key={`${row.dataKey}-${i}`} className="flex items-center justify-between gap-4 text-caption">
            <span className="flex min-w-0 items-center gap-1.5 text-ink-2">
              <span
                aria-hidden
                className="h-2 w-2 shrink-0 rounded-[3px]"
                style={{ backgroundColor: row.color || row.stroke || row.fill }}
              />
              <span className="truncate">{row.name}</span>
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-ink">
              {formatter ? formatter(row.value, row.dataKey, row) : row.value}
            </span>
          </li>
        ))}
      </ul>
      {showTotal && rows.length > 1 && (
        <div className="mt-2 flex items-center justify-between gap-4 border-t border-line pt-1.5 text-caption">
          <span className="text-ink-2">Total</span>
          <span className="font-semibold tabular-nums text-ink">
            {formatter ? formatter(total, 'total', {}) : total}
          </span>
        </div>
      )}
    </div>
  );
}

export function ChartLegend({ items, className }) {
  return (
    <ul className={cn('flex flex-wrap items-center gap-x-4 gap-y-1.5', className)}>
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-1.5 text-caption text-ink-2">
          <span
            aria-hidden
            className={cn('h-2 w-2 shrink-0', item.shape === 'line' ? 'h-0.5 w-3 rounded-pill' : 'rounded-[3px]')}
            style={{ backgroundColor: item.color }}
          />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
