'use client';

import { useRef } from 'react';
import { cn } from '@/lib/format';

/**
 * Underline tabs with an animated indicator and arrow-key navigation.
 * Counts are optional and render as a muted pill.
 */
export default function Tabs({ tabs, value, onChange, className, size = 'md', ariaLabel = 'Views' }) {
  const listRef = useRef(null);

  const onKeyDown = (e) => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const idx = tabs.findIndex((t) => t.value === value);
    let next = idx;
    if (e.key === 'ArrowRight') next = (idx + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (idx - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    onChange(tabs[next].value);
    listRef.current?.querySelectorAll('[role="tab"]')[next]?.focus();
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={ariaLabel}
      onKeyDown={onKeyDown}
      className={cn('-mb-px flex min-w-full gap-1 overflow-x-auto border-b border-line', className)}
      style={{ scrollbarWidth: 'none' }}
    >
      {tabs.map((tab) => {
        const active = tab.value === value;
        return (
          <button
            key={tab.value}
            role="tab"
            type="button"
            aria-selected={active}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.value)}
            className={cn(
              'relative flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 font-medium transition-colors duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
              size === 'sm' ? 'px-3 py-2 text-body-sm' : 'px-3.5 py-2.5 text-body',
              active
                ? 'border-brand text-brand-text'
                : 'border-transparent text-ink-2 hover:border-line-strong hover:text-ink'
            )}
          >
            {tab.icon && <tab.icon aria-hidden className="h-4 w-4" />}
            {tab.label}
            {tab.count != null && (
              <span
                className={cn(
                  'rounded-pill px-1.5 py-px text-[11px] font-semibold tabular-nums',
                  active ? 'bg-brand-soft text-brand-text' : 'bg-surface-3 text-ink-3'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/** Compact pill switcher for chart ranges: 7D / 30D / 90D / 12M. */
export function SegmentedControl({ options, value, onChange, className, ariaLabel = 'Range' }) {
  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn('inline-flex items-center gap-0.5 rounded-control-lg border border-line bg-surface-2 p-0.5', className)}
    >
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-[7px] px-2.5 py-1 text-caption font-semibold transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              active
                ? 'bg-surface text-ink shadow-xs ring-1 ring-line'
                : 'text-ink-3 hover:text-ink-2'
            )}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
