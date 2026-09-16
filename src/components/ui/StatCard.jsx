'use client';

import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/format';
import Sparkline from './Sparkline';

/**
 * KPI card: primary figure, signed change against the comparison period, and
 * a mini trend. Direction is stated in text as well as colour.
 */
export default function StatCard({
  label, value, change, comparison, spark, icon: Icon, tone = 'brand', footer, invertTrend = false, hint,
}) {
  const hasChange = change != null && Number.isFinite(change);
  const positive = hasChange && change > 0;
  const negative = hasChange && change < 0;
  const good = invertTrend ? negative : positive;
  const bad = invertTrend ? positive : negative;
  const TrendIcon = positive ? TrendingUp : negative ? TrendingDown : Minus;

  const iconTones = {
    brand: 'bg-brand-soft text-brand-text',
    info: 'bg-info-soft text-info-text',
    success: 'bg-success-soft text-success-text',
    warning: 'bg-warning-soft text-warning-text',
  };

  return (
    <div className="card group relative p-4 transition-shadow duration-200 hover:shadow-sm sm:p-5">
      <div className="flex items-start justify-between gap-2">
        <p className="text-body-sm font-medium leading-5 text-ink-2">{label}</p>
        {Icon && (
          <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-control sm:h-8 sm:w-8', iconTones[tone])}>
            <Icon aria-hidden className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </span>
        )}
      </div>

      <p className="mt-2 text-[22px] font-bold leading-7 tracking-[-0.02em] tabular-nums text-ink sm:mt-3 sm:text-[28px] sm:leading-9">
        {value}
      </p>

      <div className="mt-2 flex items-end justify-between gap-3 sm:mt-3">
        <div className="min-w-0">
          {hasChange && (
            <p className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5 text-caption">
              <span
                className={cn(
                  'inline-flex items-center gap-0.5 font-semibold tabular-nums',
                  good ? 'text-success-text' : bad ? 'text-danger-text' : 'text-ink-3'
                )}
              >
                <TrendIcon aria-hidden className="h-3.5 w-3.5" />
                {change > 0 ? '+' : ''}
                {change.toFixed(1)}%
              </span>
              {comparison && <span className="hidden text-ink-3 sm:inline">{comparison}</span>}
            </p>
          )}
          {hint && <p className="mt-0.5 text-caption text-ink-3">{hint}</p>}
          {footer}
        </div>
        {spark?.length > 1 && (
          <Sparkline data={spark} className="hidden h-8 w-20 shrink-0 sm:block" tone="brand" />
        )}
      </div>
    </div>
  );
}
