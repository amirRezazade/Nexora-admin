'use client';

import { useId } from 'react';
import { cn } from '@/lib/format';

export function Radio({ label, description, className, id, ...props }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="relative mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center">
        <input
          id={fieldId}
          type="radio"
          className="peer h-4 w-4 cursor-pointer appearance-none rounded-full border border-line-strong bg-surface transition-colors checked:border-[5px] checked:border-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
          {...props}
        />
      </span>
      <label htmlFor={fieldId} className="cursor-pointer select-none">
        <span className="block text-body text-ink">{label}</span>
        {description && <span className="block text-caption text-ink-3">{description}</span>}
      </label>
    </div>
  );
}

/** Card-style radio group used in Settings → Appearance. */
export function RadioCards({ name, value, onChange, options, className }) {
  return (
    <div role="radiogroup" aria-label={name} className={cn('grid gap-3 sm:grid-cols-3', className)}>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              'group relative flex cursor-pointer flex-col gap-2 rounded-card border p-4 text-start transition-all duration-150',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
              selected
                ? 'border-brand bg-brand-softer ring-1 ring-brand'
                : 'border-line bg-surface hover:border-line-strong hover:bg-surface-2'
            )}
          >
            {o.preview}
            <span className="flex items-center justify-between">
              <span className={cn('text-body font-medium', selected ? 'text-brand-text' : 'text-ink')}>
                {o.label}
              </span>
              <span
                aria-hidden
                className={cn(
                  'flex h-4 w-4 items-center justify-center rounded-full border transition-colors',
                  selected ? 'border-[5px] border-brand' : 'border-line-strong'
                )}
              />
            </span>
            {o.description && <span className="text-caption text-ink-3">{o.description}</span>}
          </button>
        );
      })}
    </div>
  );
}

export default Radio;
