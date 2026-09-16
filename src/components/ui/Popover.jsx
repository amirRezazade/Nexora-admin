'use client';

import { cloneElement, useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/format';
import { useEscape, useOnClickOutside } from '@/lib/hooks';

/** Non-menu floating surface: filter panels, column pickers, notification list. */
export default function Popover({ trigger, children, align = 'end', className, width = 'w-72' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const close = useCallback(() => setOpen(false), []);
  useOnClickOutside(ref, close, open);
  useEscape(close, open);

  return (
    <div ref={ref} className="relative inline-flex">
      {cloneElement(trigger, {
        onClick: (e) => {
          trigger.props.onClick?.(e);
          setOpen((v) => !v);
        },
        'aria-haspopup': 'dialog',
        'aria-expanded': open,
      })}
      {open && (
        <div
          className={cn(
            'absolute top-full z-40 mt-1.5 animate-pop-in rounded-card-lg border border-line bg-surface shadow-lg',
            align === 'end' ? 'right-0' : align === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0',
            width,
            className
          )}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>
      )}
    </div>
  );
}
