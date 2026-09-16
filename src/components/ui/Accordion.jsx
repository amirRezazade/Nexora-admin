'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { cn } from '@/lib/format';

export default function Accordion({
  title, description, children, defaultOpen = false, className, badge, icon: Icon, id,
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = `${id || title}-panel`.replace(/\s+/g, '-').toLowerCase();

  return (
    <div className={cn('overflow-hidden rounded-card border border-line bg-surface', className)}>
      <h3>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand"
        >
          {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />}
          <span className="min-w-0 flex-1">
            <span className="block text-h4 text-ink">{title}</span>
            {description && <span className="mt-0.5 block text-caption text-ink-3">{description}</span>}
          </span>
          {badge}
          <ChevronDown
            aria-hidden
            className={cn('h-4 w-4 shrink-0 text-ink-3 transition-transform duration-200 ease-out', open && 'rotate-180')}
          />
        </button>
      </h3>
      <div
        id={panelId}
        hidden={!open}
        className="border-t border-line px-5 py-5"
      >
        {children}
      </div>
    </div>
  );
}
