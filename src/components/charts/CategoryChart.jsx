'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { currency, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import useChartColors, { CHART_SERIES } from './useChartColors';
import ChartTooltip from './ChartTooltip';

/** Share of revenue by category. A donut is appropriate here — parts of a
 *  known whole, and there are few enough slices to read. */
export default function CategoryChart({ data = [], height = 232 }) {
  const { locale, t } = useI18n();
  const c = useChartColors();
  const palette = CHART_SERIES(c);
  const rows = data.map((d) => ({
    ...d,
    label: localized(d, 'name', locale) || d.name || t('form.uncategorised'),
  }));
  const total = rows.reduce((s, d) => s + d.revenue, 0);

  return (
    <div className="flex flex-col items-center gap-5 sm:flex-row">
      <div style={{ height, width: height }} className="relative shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={rows}
              dataKey="revenue"
              nameKey="label"
              innerRadius="62%"
              outerRadius="94%"
              paddingAngle={2}
              stroke={c.surface}
              strokeWidth={2}
            >
              {rows.map((entry, i) => (
                <Cell key={entry.categoryId} fill={palette[i % palette.length]} />
              ))}
            </Pie>
            <Tooltip content={<ChartTooltip formatter={(v) => currency(v, { decimals: 0 })} />} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-caption text-ink-3">{t('orderDetail.total')}</span>
          <span className="text-h3 tabular-nums text-ink">{currency(total, { decimals: 0 })}</span>
        </div>
      </div>

      <ul className="w-full min-w-0 flex-1 space-y-2.5">
        {rows.map((d, i) => {
          const share = total ? (d.revenue / total) * 100 : 0;
          return (
            <li key={d.categoryId} className="flex items-center gap-2.5">
              <span
                aria-hidden
                className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
                style={{ backgroundColor: palette[i % palette.length] }}
              />
              <span className="min-w-0 flex-1 truncate text-body-sm text-ink">{d.label}</span>
              <span className="shrink-0 text-body-sm font-medium tabular-nums text-ink">
                {currency(d.revenue, { decimals: 0 })}
              </span>
              <span className="w-11 shrink-0 text-right text-caption tabular-nums text-ink-3">
                {share.toFixed(1)}%
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
