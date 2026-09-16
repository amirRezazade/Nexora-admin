'use client';

import { X } from 'lucide-react';
import { cn } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';

/** Appears only while rows are selected, replacing the normal toolbar row. */
export default function BulkBar({ count, itemLabel = 'product', onClear, children, className }) {
  const { t } = useI18n();
  if (!count) return null;
  return (
    <div
      role="region"
      aria-label={t('bulk.aria')}
      className={cn(
        'flex animate-slide-up flex-wrap items-center gap-3 border-b border-brand-line bg-brand-softer px-4 py-2.5 sm:px-5',
        className
      )}
    >
      <p className="text-body-sm font-medium text-brand-text">
        {t('bulk.nSelected', { n: count })}
      </p>
      <div className="flex flex-1 flex-wrap items-center gap-2">{children}</div>
      <button
        type="button"
        onClick={onClear}
        className="inline-flex items-center gap-1 rounded-control px-2 py-1 text-caption font-medium text-ink-2 transition-colors hover:bg-brand/10 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
      >
        <X aria-hidden className="h-3.5 w-3.5" />
        {t('bulk.clear')}
      </button>
    </div>
  );
}
