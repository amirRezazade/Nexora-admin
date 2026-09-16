'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/format';
import { dismissToast } from '@/store/slices/uiSlice';
import IconButton from './IconButton';

const config = {
  success: { icon: CheckCircle2, className: 'text-success', role: 'status' },
  error: { icon: AlertCircle, className: 'text-danger', role: 'alert' },
  warning: { icon: AlertTriangle, className: 'text-warning', role: 'status' },
  info: { icon: Info, className: 'text-info', role: 'status' },
};

function Toast({ toast }) {
  const dispatch = useDispatch();
  const { icon: Icon, className, role } = config[toast.variant] || config.info;

  useEffect(() => {
    if (!toast.duration) return;
    const t = setTimeout(() => dispatch(dismissToast(toast.id)), toast.duration);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, dispatch]);

  return (
    <div
      role={role}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
      className="pointer-events-auto flex w-full animate-toast-in items-start gap-3 rounded-card border border-line bg-surface p-3.5 shadow-lg sm:w-[380px]"
    >
      <Icon aria-hidden className={cn('mt-0.5 h-4.5 w-4.5 shrink-0', className)} />
      <div className="min-w-0 flex-1">
        <p className="text-body-sm font-medium text-ink">{toast.title}</p>
        {toast.description && <p className="mt-0.5 text-caption leading-relaxed text-ink-2">{toast.description}</p>}
      </div>
      <IconButton
        icon={X}
        size="xs"
        label="Dismiss notification"
        onClick={() => dispatch(dismissToast(toast.id))}
        className="-mr-1 -mt-0.5"
      />
    </div>
  );
}

export default function Toaster() {
  const toasts = useSelector((s) => s.ui.toasts);
  if (!toasts.length) return null;
  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[80] flex flex-col gap-2.5 sm:bottom-6 sm:right-6" style={{ maxWidth: 'calc(100vw - 2rem)' }}>
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} />
      ))}
    </div>
  );
}
