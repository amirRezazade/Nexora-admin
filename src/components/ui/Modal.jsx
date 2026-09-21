'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { useEscape, useFocusTrap, useScrollLock } from '@/lib/hooks';
import IconButton from './IconButton';
import Button from './Button';

const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ open, onClose, title, description, children, footer, size = 'md', closeOnOverlay = true }) {
  const { t } = useI18n();
  const panelRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  useScrollLock(open);
  useEscape(onClose, open);
  useFocusTrap(panelRef, open);

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-6">
      <div
        className="absolute inset-0 animate-fade-in bg-overlay/45 backdrop-blur-[2px]"
        onClick={closeOnOverlay ? onClose : undefined}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby={description ? 'modal-description' : undefined}
        className={cn(
          'relative max-h-[calc(100dvh-1.5rem)] w-full animate-slide-up overflow-y-auto rounded-t-container border border-line bg-surface shadow-xl sm:rounded-card-lg',
          widths[size]
        )}
      >
        <div className="flex items-start justify-between gap-4 px-5 pb-3 pt-5 sm:px-6">
          <div className="min-w-0">
            <h2 id="modal-title" className="text-h3 text-ink">
              {title}
            </h2>
            {description && (
              <p id="modal-description" className="mt-1 text-body-sm text-ink-2">
                {description}
              </p>
            )}
          </div>
          <IconButton icon={X} label={t('confirm.close')} onClick={onClose} className="-mr-1 -mt-1" />
        </div>
        {children && <div className="px-5 pb-2 sm:px-6">{children}</div>}
        {footer && (
          <div className="mt-2 flex flex-col-reverse gap-2 border-t border-line px-5 py-4 sm:flex-row sm:justify-end sm:px-6">
            {footer}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

/** Destructive confirmation. Copy is explicit about what disappears. */
export function ConfirmDialog({
  open, onClose, onConfirm, title, message, confirmLabel, cancelLabel,
  loading = false, tone = 'danger',
}) {
  const { t } = useI18n();
  return (
    <Modal
      open={open}
      onClose={loading ? () => {} : onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={loading} className="sm:w-auto">
            {cancelLabel || t('common.cancel')}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={onConfirm}
            loading={loading}
            data-autofocus
            className="sm:w-auto"
          >
            {loading ? t('confirm.working') : (confirmLabel || t('common.delete'))}
          </Button>
        </>
      }
    >
      <div className="flex gap-3 pb-2">
        {tone === 'danger' && (
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-danger-soft">
            <AlertTriangle aria-hidden className="h-4.5 w-4.5 text-danger-text" />
          </span>
        )}
        <p className="text-body leading-relaxed text-ink-2">{message}</p>
      </div>
    </Modal>
  );
}
