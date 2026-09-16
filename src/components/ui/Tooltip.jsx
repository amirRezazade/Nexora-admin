'use client';

import { useId, useState } from 'react';
import { cn } from '@/lib/format';

/** Lightweight CSS-positioned tooltip. Shows on hover and on keyboard focus. */
export default function Tooltip({ content, side = 'top', children, className, delay = 200 }) {
  const [open, setOpen] = useState(false);
  const [timer, setTimer] = useState(null);
  const id = useId();

  const show = () => {
    const t = setTimeout(() => setOpen(true), delay);
    setTimer(t);
  };
  const hide = () => {
    if (timer) clearTimeout(timer);
    setOpen(false);
  };

  if (!content) return children;

  const sideClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <span
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={() => setOpen(true)}
      onBlur={hide}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          id={id}
          className={cn(
            'pointer-events-none absolute z-50 animate-pop-in whitespace-nowrap rounded-control bg-overlay px-2 py-1 text-caption font-medium text-white shadow-lg',
            'dark:bg-surface-3 dark:text-ink dark:ring-1 dark:ring-line',
            sideClasses[side]
          )}
        >
          {content}
        </span>
      )}
    </span>
  );
}
