'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Package, ShoppingCart, User, FileText, CornerDownLeft, ArrowUp, ArrowDown, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { api } from '@/lib/api';
import { setSearchOpen } from '@/store/slices/uiSlice';
import { useDebouncedValue, useEscape, useHotkey, useScrollLock } from '@/lib/hooks';
import { StatusBadge, PRODUCT_STATUS, ORDER_STATUS, STOCK_STATUS } from '@/components/ui/Badge';

const GROUPS = [
  { key: 'products', label: 'Products', icon: Package },
  { key: 'orders', label: 'Orders', icon: ShoppingCart },
  { key: 'customers', label: 'Customers', icon: User },
  { key: 'pages', label: 'Pages', icon: FileText },
];

const QUICK = [
  { title: 'Add Product', href: '/products/new', hint: 'Create a new catalog entry', type: 'page' },
  { title: 'View today’s orders', href: '/orders', hint: 'Track and fulfil orders', type: 'page' },
  { title: 'Low stock report', href: '/inventory?status=low_stock', hint: 'Items below threshold', type: 'page' },
  { title: 'Revenue analytics', href: '/analytics', hint: 'Deep performance breakdown', type: 'page' },
];

/**
 * Command-palette style search. Opens on ⌘K / Ctrl+K, filters across four
 * entity types, and is fully drivable from the keyboard.
 */
export default function GlobalSearch() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const router = useRouter();
  const open = useSelector((s) => s.ui.searchOpen);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cursor, setCursor] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const debounced = useDebouncedValue(query, 180);

  const close = useCallback(() => {
    dispatch(setSearchOpen(false));
    setQuery('');
    setResults(null);
    setCursor(0);
  }, [dispatch]);

  useHotkey('k', () => dispatch(setSearchOpen(true)));
  useEscape(close, open);
  useScrollLock(open);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => inputRef.current?.focus(), 20);
      return () => clearTimeout(t);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    setLoading(true);
    api(`/api/search?q=${encodeURIComponent(debounced)}`)
      .then((d) => {
        if (cancelled) return;
        setResults(d);
        setCursor(0);
      })
      .catch(() => {
        if (!cancelled) setResults({ products: [], orders: [], customers: [], pages: [] });
      })
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [debounced, open]);

  // Flatten for keyboard traversal
  const flat = useMemo(() => {
    if (!query.trim()) return QUICK.map((q) => ({ ...q, group: 'Quick actions' }));
    if (!results) return [];
    return GROUPS.flatMap((g) =>
      (results[g.key] || []).map((item) => ({ ...item, group: g.label, groupKey: g.key }))
    );
  }, [results, query]);

  const go = useCallback(
    (item) => {
      if (!item) return;
      close();
      router.push(item.href);
    },
    [close, router]
  );

  const onKeyDown = (e) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => (c + 1) % Math.max(1, flat.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => (c - 1 + flat.length) % Math.max(1, flat.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(flat[cursor]);
    }
  };

  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-index="${cursor}"]`)
      ?.scrollIntoView({ block: 'nearest' });
  }, [cursor]);

  if (!open) return null;

  const hasQuery = query.trim().length > 0;
  const empty = hasQuery && !loading && flat.length === 0;

  const statusMapFor = (groupKey, status) => {
    if (groupKey === 'products') return STOCK_STATUS[status] ? STOCK_STATUS : PRODUCT_STATUS;
    if (groupKey === 'orders') return ORDER_STATUS;
    return null;
  };

  let runningIndex = -1;

  return (
    <div className="fixed inset-0 z-[75] flex items-start justify-center p-4 pt-[10vh] sm:pt-[14vh]">
      <div className="absolute inset-0 animate-fade-in bg-overlay/50 backdrop-blur-[3px]" onClick={close} aria-hidden />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search Nova"
        className="relative flex w-full max-w-xl animate-slide-up flex-col overflow-hidden rounded-card-lg border border-line bg-surface shadow-xl"
      >
        {/* Input */}
        <div className="flex items-center gap-3 border-b border-line px-4">
          {loading ? (
            <Loader2 aria-hidden className="h-4 w-4 shrink-0 animate-[spin_0.7s_linear_infinite] text-brand" />
          ) : (
            <Search aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />
          )}
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls="search-results"
            aria-autocomplete="list"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder={t('search.placeholder')}
            className="h-13 w-full bg-transparent py-4 text-body-lg text-ink placeholder:text-ink-3 focus:outline-none"
          />
          <kbd className="hidden shrink-0 rounded border border-line bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-ink-3 sm:block">
            Esc
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} id="search-results" role="listbox" className="max-h-[min(420px,50vh)] overflow-y-auto p-2">
          {empty && (
            <div className="px-4 py-10 text-center">
              <p className="text-body font-medium text-ink">No results for “{query}”</p>
              <p className="mt-1 text-body-sm text-ink-2">
                Try a product name, SKU, order ID or customer email.
              </p>
            </div>
          )}

          {!hasQuery && (
            <>
              <p className="px-2.5 pb-1 pt-2 text-micro uppercase tracking-wide text-ink-3">Quick actions</p>
              {QUICK.map((item, i) => {
                runningIndex += 1;
                const idx = runningIndex;
                return (
                  <ResultRow
                    key={item.href}
                    item={item}
                    index={idx}
                    active={cursor === idx}
                    icon={FileText}
                    onSelect={() => go(item)}
                    onHover={() => setCursor(idx)}
                  />
                );
              })}
            </>
          )}

          {hasQuery &&
            GROUPS.map((g) => {
              const items = results?.[g.key] || [];
              if (!items.length) return null;
              return (
                <div key={g.key} className="mb-1">
                  <p className="px-2.5 pb-1 pt-2 text-micro uppercase tracking-wide text-ink-3">{g.label}</p>
                  {items.map((item) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const map = statusMapFor(g.key, item.status);
                    return (
                      <ResultRow
                        key={`${g.key}-${item.id}`}
                        item={item}
                        index={idx}
                        active={cursor === idx}
                        icon={g.icon}
                        badge={map && item.status ? <StatusBadge map={map} value={item.status} size="sm" /> : null}
                        onSelect={() => go(item)}
                        onHover={() => setCursor(idx)}
                      />
                    );
                  })}
                </div>
              );
            })}
        </div>

        {/* Footer legend */}
        <div className="flex items-center gap-4 border-t border-line bg-surface-2 px-4 py-2">
          <Legend icon={ArrowUp} extraIcon={ArrowDown} label="Navigate" />
          <Legend icon={CornerDownLeft} label="Open" />
          <span className="ml-auto text-caption text-ink-3">
            Search products, orders, customers and pages
          </span>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ item, index, active, icon: Icon, badge, onSelect, onHover }) {
  const { locale } = useI18n();
  const title = locale === 'fa' && item.titleFa ? item.titleFa : item.title;
  return (
    <button
      type="button"
      role="option"
      aria-selected={active}
      data-index={index}
      onClick={onSelect}
      onMouseMove={onHover}
      className={cn(
        'flex w-full items-center gap-3 rounded-control px-2.5 py-2 text-left transition-colors',
        active ? 'bg-brand-soft' : 'hover:bg-surface-2'
      )}
    >
      <span
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center rounded-control border',
          active ? 'border-brand-line bg-surface text-brand-text' : 'border-line bg-surface-2 text-ink-3'
        )}
      >
        <Icon aria-hidden className="h-3.5 w-3.5" />
      </span>
      <span className="min-w-0 flex-1">
        <span className={cn('block truncate text-body-sm font-medium', active ? 'text-brand-text' : 'text-ink')}>
          {item.title}
        </span>
        {item.hint && <span className="block truncate text-caption text-ink-3">{item.hint}</span>}
      </span>
      {badge}
      {active && <CornerDownLeft aria-hidden className="h-3.5 w-3.5 shrink-0 text-brand-text" />}
    </button>
  );
}

function Legend({ icon: Icon, extraIcon: Extra, label }) {
  return (
    <span className="flex items-center gap-1.5 text-caption text-ink-3">
      <kbd className="flex h-5 w-5 items-center justify-center rounded border border-line bg-surface">
        <Icon aria-hidden className="h-3 w-3" />
      </kbd>
      {Extra && (
        <kbd className="flex h-5 w-5 items-center justify-center rounded border border-line bg-surface">
          <Extra aria-hidden className="h-3 w-3" />
        </kbd>
      )}
      {label}
    </span>
  );
}
