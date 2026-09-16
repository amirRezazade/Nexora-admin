'use client';

import { cloneElement, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/format';
import { useEscape } from '@/lib/hooks';

/**
 * Menu surface. Rendered in a portal with position:fixed so table overflow
 * never clips it, and it flips above the trigger when there isn’t room below.
 */
export default function Dropdown({ trigger, children, align = 'end', width = 'w-56', className, menuLabel }) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState({ top: 0, left: 0, transformOrigin: 'top right' });
  const triggerWrapRef = useRef(null);
  const menuRef = useRef(null);

  const close = useCallback(() => setOpen(false), []);
  useEscape(close, open);

  const place = useCallback(() => {
    const wrap = triggerWrapRef.current;
    const menu = menuRef.current;
    if (!wrap) return;
    const r = wrap.getBoundingClientRect();
    const menuW = menu?.offsetWidth || 224;
    const menuH = menu?.offsetHeight || 240;
    const gap = 6;
    const spaceBelow = window.innerHeight - r.bottom;
    const openUp = spaceBelow < Math.min(menuH + 12, 240) && r.top > spaceBelow;
    let left = align === 'start' ? r.left : align === 'center' ? r.left + r.width / 2 - menuW / 2 : r.right - menuW;
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    const top = openUp ? r.top - menuH - gap : r.bottom + gap;
    setCoords({
      top: Math.max(8, top),
      left,
      transformOrigin: openUp ? (align === 'start' ? 'bottom left' : 'bottom right') : align === 'start' ? 'top left' : 'top right',
    });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e) => {
      if (triggerWrapRef.current?.contains(e.target)) return;
      if (menuRef.current?.contains(e.target)) return;
      close();
    };
    const onReposition = () => place();
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('touchstart', onDoc);
    window.addEventListener('resize', onReposition);
    window.addEventListener('scroll', onReposition, true);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('touchstart', onDoc);
      window.removeEventListener('resize', onReposition);
      window.removeEventListener('scroll', onReposition, true);
    };
  }, [open, close, place]);

  useEffect(() => {
    if (!open || !menuRef.current) return;
    const items = menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])');
    items[0]?.focus();
  }, [open]);

  const onKeyDown = (e) => {
    if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(e.key)) return;
    e.preventDefault();
    const items = [...menuRef.current.querySelectorAll('[role="menuitem"]:not([disabled])')];
    const idx = items.indexOf(document.activeElement);
    let next = idx;
    if (e.key === 'ArrowDown') next = (idx + 1) % items.length;
    if (e.key === 'ArrowUp') next = (idx - 1 + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    items[next]?.focus();
  };

  const menu = open && typeof document !== 'undefined'
    ? createPortal(
        <div
          ref={menuRef}
          role="menu"
          aria-label={menuLabel}
          onKeyDown={onKeyDown}
          style={{ position: 'fixed', top: coords.top, left: coords.left, transformOrigin: coords.transformOrigin }}
          className={cn(
            'z-[80] max-h-[min(320px,calc(100vh-16px))] overflow-y-auto rounded-card border border-line bg-surface p-1 shadow-lg animate-pop-in',
            width,
            className
          )}
        >
          {typeof children === 'function' ? children({ close }) : children}
        </div>,
        document.body
      )
    : null;

  return (
    <div ref={triggerWrapRef} className="relative inline-flex">
      {cloneElement(trigger, {
        onClick: (e) => {
          trigger.props.onClick?.(e);
          setOpen((v) => !v);
        },
        'aria-haspopup': 'menu',
        'aria-expanded': open,
      })}
      {menu}
    </div>
  );
}

export function MenuItem({ icon: Icon, children, onClick, destructive, disabled, shortcut, className, as: Tag = 'button', ...props }) {
  return (
    <Tag
      role="menuitem"
      tabIndex={-1}
      disabled={Tag === 'button' ? disabled : undefined}
      onClick={onClick}
      className={cn(
        'flex w-full items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 text-start text-body-sm transition-colors',
        'focus:outline-none focus-visible:bg-surface-3',
        destructive
          ? 'text-danger-text hover:bg-danger-soft focus-visible:bg-danger-soft'
          : 'text-ink-2 hover:bg-surface-3 hover:text-ink',
        disabled && 'pointer-events-none opacity-45',
        className
      )}
      {...props}
    >
      {Icon && <Icon aria-hidden className="h-4 w-4 shrink-0 opacity-80" />}
      <span className="flex-1 truncate">{children}</span>
      {shortcut && <kbd className="text-[11px] font-medium text-ink-3">{shortcut}</kbd>}
    </Tag>
  );
}

export function MenuSeparator({ className }) {
  return <div role="separator" className={cn('my-1 h-px bg-line', className)} />;
}

export function MenuLabel({ children }) {
  return (
    <div className="px-2.5 pb-1 pt-2 text-micro uppercase tracking-wide text-ink-3">{children}</div>
  );
}
