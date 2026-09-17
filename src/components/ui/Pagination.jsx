'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn, number } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import IconButton from './IconButton';

function pageWindow(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 4) return [1, 2, 3, 4, 5, '…', total];
  if (current >= total - 3) return [1, '…', total - 4, total - 3, total - 2, total - 1, total];
  return [1, '…', current - 1, current, current + 1, '…', total];
}

export default function Pagination({
  page, totalPages, total, pageSize, onPageChange, onPageSizeChange, itemLabel = 'results', className,
}) {
  const { t } = useI18n();
  if (!total) return null;
  const from = (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <nav
      aria-label={t('pagination.aria')}
      className={cn(
        'flex flex-col-reverse items-center justify-between gap-3 border-t border-line px-4 py-3 sm:flex-row sm:px-5',
        className
      )}
    >
      <div className="flex items-center gap-4">
        <p className="text-caption text-ink-2">
          {t('pagination.showing', { from: number(from), to: number(to), total: number(total), items: itemLabel })}
        </p>
        {onPageSizeChange && (
          <label className="hidden items-center gap-1.5 text-caption text-ink-3 lg:flex">
            <span>{t('pagination.rows')}</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              className="h-7 cursor-pointer rounded-control border border-line-strong bg-surface px-1.5 text-caption text-ink focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/20"
              aria-label={t('pagination.rowsAria')}
            >
              {[10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
          </label>
        )}
      </div>

      <div className="flex items-center gap-1">
        <IconButton
          icon={ChevronLeft}
          label={t('pagination.prev')}
          variant="secondary"
          size="sm"
          className="rtl:rotate-180"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
        />
        <div className="flex items-center gap-0.5">
          {pageWindow(page, totalPages).map((p, i) =>
            p === '…' ? (
              <span key={`gap-${i}`} className="px-1.5 text-caption text-ink-3" aria-hidden>
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={p === page ? 'page' : undefined}
                aria-label={`Page ${p}`}
                className={cn(
                  'h-7 min-w-[28px] rounded-control px-1.5 text-caption font-medium tabular-nums transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-1 focus-visible:ring-offset-canvas',
                  p === page
                    ? 'bg-brand text-white'
                    : 'text-ink-2 hover:bg-surface-3 hover:text-ink'
                )}
              >
                {p}
              </button>
            )
          )}
        </div>
        <IconButton
          icon={ChevronRight}
          label={t('pagination.next')}
          variant="secondary"
          size="sm"
          className="rtl:rotate-180"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
        />
      </div>
    </nav>
  );
}
