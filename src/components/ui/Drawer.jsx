'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { cn } from '@/lib/format';
import { useEscape, useFocusTrap, useScrollLock } from '@/lib/hooks';
import IconButton from './IconButton';

/**
 * Side sheet on desktop, bottom sheet on mobile — used for filters and the
 * mobile navigation.
 */
export default function Drawer({
  open, onClose, title, description, children, footer, side = 'right', width = 'sm:max-w-md', bottomOnMobile = true,
}) {
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useScrollLock(open);
  useEscape(onClose, open);
  useFocusTrap(panelRef, open);

  if (!mounted || !open) return null;

  const sideClass =
    side === 'right'
      ? 'sm:right-0 sm:animate-slide-in-right'
      : 'sm:left-0 sm:animate-slide-in-left';

  return createPortal(
    <div className="fixed inset-0 z-[70]">
      <div className="absolute inset-0 animate-fade-in bg-overlay/45 backdrop-blur-[2px]" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={cn(
          'absolute flex flex-col bg-surface shadow-xl',
          bottomOnMobile
            ? 'bottom-0 left-0 right-0 max-h-[88vh] animate-slide-up rounded-t-container sm:bottom-0 sm:top-0 sm:max-h-none sm:rounded-none sm:rounded-l-container'
            : 'bottom-0 left-0 top-0 animate-slide-in-left',
          side === 'left' && 'sm:rounded-l-none sm:rounded-r-container',
          sideClass,
          'w-full',
          width
        )}
      >
        {bottomOnMobile && (
          <div aria-hidden className="mx-auto mt-2 h-1 w-9 rounded-pill bg-line-strong sm:hidden" />
        )}
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id="drawer-title" className="text-h3 text-ink">
              {title}
            </h2>
            {description && <p className="mt-0.5 text-body-sm text-ink-2">{description}</p>}
          </div>
          <IconButton icon={X} label="Close panel" onClick={onClose} className="-mr-1" />
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5">{children}</div>
        {footer && (
          <div className="flex items-center gap-3 border-t border-line bg-surface-2 px-5 py-4">{footer}</div>
        )}
      </div>
    </div>,
    document.body
  );
}
