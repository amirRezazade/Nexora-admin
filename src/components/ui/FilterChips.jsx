'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/format';

/** Active filters as removable chips — always visible, never hidden in a panel. */
export default function FilterChips({ chips, onRemove, onClearAll, className }) {
  if (!chips.length) return null;
  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      <span className="text-caption text-ink-3">Filters</span>
      {chips.map((chip) => (
        <span
          key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1 rounded-pill border border-brand-line bg-brand-softer py-0.5 pl-2.5 pr-1 text-caption font-medium text-brand-text"
        >
          <span className="text-ink-3">{chip.label}</span>
          {chip.display}
          <button
            type="button"
            onClick={() => onRemove(chip)}
            aria-label={`Remove ${chip.label} filter ${chip.display}`}
            className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-brand/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <X aria-hidden className="h-3 w-3" />
          </button>
        </span>
      ))}
      {chips.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="rounded px-1 text-caption font-medium text-ink-3 underline-offset-2 transition-colors hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          Clear all
        </button>
      )}
    </div>
  );
}
