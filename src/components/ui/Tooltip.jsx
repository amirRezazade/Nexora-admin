'use client';

import { useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/format';

/**
 * Portaled tooltip so collapsed-sidebar labels aren’t clipped, and `side="end"`
 * opens toward inline-end (right in LTR, left in RTL).
 */
export default function Tooltip({ content, side = 'top', children, className, delay = 200 }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState(null);
  const timerRef = useRef(null);
  const wrapRef = useRef(null);
  const tipRef = useRef(null);
  const id = useId();

  const place = () => {
    const el = wrapRef.current;
    const tip = tipRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const rtl = document.documentElement.dir === 'rtl';
    const tipW = tip?.offsetWidth || 0;
    const tipH = tip?.offsetHeight || 0;
    const gap = 8;
    const pad = 8;
    let top = 0;
    let left = 0;

    const towardEnd = side === 'right' || side === 'end';
    const towardStart = side === 'left' || side === 'start';

    if (towardEnd || towardStart) {
      top = r.top + r.height / 2 - tipH / 2;
      /* Prefer the requested side, but never cover the trigger or clip off
         screen — flip to whichever side actually has room for the tooltip. */
      let goRight = rtl ? towardStart : towardEnd;
      const roomRight = window.innerWidth - r.right;
      const roomLeft = r.left;
      if (goRight && roomRight < tipW + gap + pad) goRight = false;
      else if (!goRight && roomLeft < tipW + gap + pad) goRight = true;
      left = goRight ? r.right + gap : r.left - gap - tipW;
    } else if (side === 'bottom') {
      top = r.bottom + gap;
      left = r.left + r.width / 2 - tipW / 2;
    } else {
      top = r.top - gap - tipH;
      left = r.left + r.width / 2 - tipW / 2;
    }

    left = Math.max(pad, Math.min(left, window.innerWidth - (tipW || 0) - pad));
    top = Math.max(pad, Math.min(top, window.innerHeight - (tipH || 0) - pad));
    setCoords({ top, left });
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const raf = requestAnimationFrame(place); /* width settles after first paint */
    const onReposition = () => place();
    window.addEventListener('scroll', onReposition, true);
    window.addEventListener('resize', onReposition);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onReposition, true);
      window.removeEventListener('resize', onReposition);
    };
  }, [open, side, content]);

  const show = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  };
  const hide = () => {
    clearTimeout(timerRef.current);
    setOpen(false);
  };

  if (!content) return children;

  const tip =
    open && typeof document !== 'undefined'
      ? createPortal(
          <span
            ref={tipRef}
            role="tooltip"
            id={id}
            style={{ position: 'fixed', top: coords?.top ?? -9999, left: coords?.left ?? -9999 }}
            className={cn(
              'pointer-events-none z-[90] max-w-[240px] animate-pop-in rounded-control bg-overlay px-2 py-1 text-caption font-medium text-white shadow-lg',
              'dark:bg-surface-3 dark:text-ink dark:ring-1 dark:ring-line'
            )}
          >
            {content}
          </span>,
          document.body
        )
      : null;

  return (
    <span
      ref={wrapRef}
      className={cn('relative inline-flex', className)}
      onMouseEnter={show}
      onMouseLeave={hide}
      onFocus={show}
      onBlur={hide}
    >
      <span aria-describedby={open ? id : undefined} className="inline-flex">
        {children}
      </span>
      {tip}
    </span>
  );
}
