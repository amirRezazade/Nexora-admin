'use client';

import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { cn } from '@/lib/format';

/**
 * Table primitives. Numeric columns use logical `end` alignment so RTL and LTR
 * keep figures under their headers. Borders are horizontal rules only.
 */

export function TableWrap({ children, className }) {
  return (
    <div className={cn('w-full overflow-x-auto overscroll-x-contain', className)}>
      <div className="inline-block min-w-full align-middle">{children}</div>
    </div>
  );
}

export function Table({ children, className, ...props }) {
  return (
    <table className={cn('w-full table-auto border-collapse text-body-sm', className)} {...props}>
      {children}
    </table>
  );
}

export function THead({ children, className }) {
  return (
    <thead className={cn('bg-surface-2', className)}>
      {children}
    </thead>
  );
}

export function TH({
  children, className, align = 'start', sortable, sortKey, currentSort, onSort, width, sr,
}) {
  const active = Boolean(sortKey) && currentSort?.key === sortKey;
  const dir = active ? currentSort.dir : null;
  const Icon = !active ? ChevronsUpDown : dir === 'asc' ? ArrowUp : ArrowDown;
  const end = align === 'right' || align === 'end';

  const content = sortable ? (
    <button
      type="button"
      onClick={() => onSort(sortKey)}
      className={cn(
        'inline-flex w-full items-center gap-1 rounded px-0 py-0.5 uppercase tracking-wide transition-colors hover:text-ink',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
        end ? 'justify-end' : 'justify-start',
        active && 'text-ink'
      )}
    >
      {children}
      <Icon
        aria-hidden
        className={cn(
          'h-3 w-3 shrink-0 transition-opacity',
          active ? 'text-brand opacity-100' : 'opacity-0 group-hover:opacity-60'
        )}
      />
    </button>
  ) : (
    children
  );

  return (
    <th
      scope="col"
      style={width ? { width } : undefined}
      aria-sort={active ? (dir === 'asc' ? 'ascending' : 'descending') : sortable ? 'none' : undefined}
      className={cn(
        'whitespace-nowrap border-b border-line px-4 py-2.5 text-micro uppercase tracking-wide text-ink-3',
        end ? 'text-end' : align === 'center' ? 'text-center' : 'text-start',
        sr && 'sr-only',
        className
      )}
    >
      {content}
    </th>
  );
}

export function TBody({ children, className }) {
  return <tbody className={className}>{children}</tbody>;
}

export function TR({ children, className, selected, onClick, ...props }) {
  return (
    <tr
      onClick={onClick}
      data-selected={selected || undefined}
      className={cn(
        'group border-b border-line transition-colors duration-100 last:border-b-0',
        selected ? 'bg-brand-softer' : 'hover:bg-surface-2',
        onClick && 'cursor-pointer',
        className
      )}
      {...props}
    >
      {children}
    </tr>
  );
}

export function TD({ children, className, align = 'start', numeric, muted, strong, ...props }) {
  const end = align === 'right' || align === 'end' || numeric;
  return (
    <td
      className={cn(
        'px-4 py-3 align-middle',
        end ? 'text-end' : align === 'center' ? 'text-center' : 'text-start',
        numeric && 'tabular-nums',
        muted && 'text-ink-2',
        strong && 'font-medium text-ink',
        !muted && !strong && 'text-ink-2',
        className
      )}
      {...props}
    >
      {children}
    </td>
  );
}

/** Sticky identity / actions — logical start/end so RTL doesn’t overlap columns. */
export const stickyLeft =
  'sticky start-0 z-10 bg-surface group-hover:bg-surface-2 group-data-[selected]:bg-brand-softer';
export const stickyRight =
  'sticky end-0 z-[11] bg-surface group-hover:bg-surface-2 group-data-[selected]:bg-brand-softer';
