'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Download, X, Boxes, AlertTriangle, PackageX, DollarSign, Pencil, Check,
} from 'lucide-react';
import { cn, currency, dateShort, number, relativeTime, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { useDebouncedValue } from '@/lib/hooks';
import { downloadCSV } from '@/lib/export';
import {
  fetchInventory, setFilter, setSort, setPage, setPageSize, clearFilters, adjustStock,
} from '@/store/slices/inventorySlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { toast } from '@/store/slices/uiSlice';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card from '@/components/ui/Card';
import Input, { numberFocusGuards } from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import StatCard from '@/components/ui/StatCard';
import Pagination from '@/components/ui/Pagination';
import ProductThumb from '@/components/ui/ProductThumb';
import { StatusBadge, STOCK_STATUS } from '@/components/ui/Badge';
import { Table, TableWrap, TBody, TD, TH, THead, TR, stickyLeft } from '@/components/ui/Table';
import { SkeletonTable, SkeletonStatCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

/** Inline stock editing keeps the operational loop tight — no page hop
 *  required to correct a count. */
function StockEditor({ row }) {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const inputRef = useRef(null);
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(row.available);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (editing) inputRef.current?.focus({ preventScroll: true });
  }, [editing]);

  const save = async () => {
    const next = parseInt(value, 10);
    if (Number.isNaN(next) || next < 0 || next === row.available) {
      setEditing(false);
      setValue(row.available);
      return;
    }
    setSaving(true);
    try {
      await dispatch(adjustStock({ id: row.id, available: next })).unwrap();
      dispatch(toast.success(t('toast.stockUpdated'), t('toast.stockUpdatedHint', { name: row.name, n: next })));
      setEditing(false);
    } catch {
      dispatch(toast.error(t('toast.stockError'), t('common.tryAgain')));
    } finally {
      setSaving(false);
    }
  };

  if (!editing) {
    return (
      <button
        type="button"
        onClick={() => setEditing(true)}
        aria-label={`Edit available stock for ${row.name}, currently ${row.available}`}
        className={cn(
          'group/edit inline-flex items-center gap-1.5 rounded-control px-1.5 py-0.5 font-medium tabular-nums transition-colors hover:bg-surface-3',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand',
          row.status === 'out_of_stock' ? 'text-danger-text' : row.status === 'low_stock' ? 'text-warning-text' : 'text-ink'
        )}
      >
        {number(row.available)}
        <Pencil aria-hidden className="h-3 w-3 opacity-0 transition-opacity group-hover/edit:opacity-60" />
      </button>
    );
  }

  return (
    <span className="inline-flex items-center gap-1">
      <input
        ref={inputRef}
        type="number"
        min="0"
        value={value}
        disabled={saving}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') save();
          if (e.key === 'Escape') { setEditing(false); setValue(row.available); }
        }}
        onBlur={save}
        aria-label={`Available stock for ${row.name}`}
        className="h-7 w-20 rounded-control border border-brand bg-surface px-2 text-right text-body-sm tabular-nums focus:outline-none focus:ring-[3px] focus:ring-brand/20"
        {...numberFocusGuards()}
      />
      <IconButton icon={Check} size="xs" label="Save stock level" variant="brand" onClick={save} disabled={saving} />
    </span>
  );
}

export default function InventoryPage() {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();
  const searchParams = useSearchParams();
  const { items, status, filters, sort, page, pageSize, total, totalPages, summary } =
    useSelector((s) => s.inventory);
  const categories = useSelector((s) => s.categories.all);

  const [searchInput, setSearchInput] = useState(filters.q);
  const debounced = useDebouncedValue(searchInput, 300);

  // Deep link from the dashboard: /inventory?status=low_stock
  useEffect(() => {
    const s = searchParams.get('status');
    if (s && !filters.status.includes(s)) dispatch(setFilter({ key: 'status', value: [s] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (debounced !== filters.q) dispatch(setFilter({ key: 'q', value: debounced }));
  }, [debounced, filters.q, dispatch]);

  useEffect(() => {
    dispatch(fetchInventory());
  }, [dispatch, filters, sort, page, pageSize]);

  const catName = (id) => {
    const c = categories.find((x) => x.id === id);
    return c ? localized(c, 'name', locale) : '—';
  };

  const exportInventory = () => {
    downloadCSV(`nexora-inventory-${new Date().toISOString().slice(0, 10)}.csv`, items, [
      { header: 'Product', value: (r) => r.name },
      { header: 'SKU', value: (r) => r.sku },
      { header: 'Category', value: (r) => catName(r.categoryId) },
      { header: 'Available', value: (r) => r.available },
      { header: 'Reserved', value: (r) => r.reserved },
      { header: 'On hand', value: (r) => r.onHand },
      { header: 'Low-stock threshold', value: (r) => r.threshold },
      { header: 'Status', value: (r) => STOCK_STATUS[r.status]?.label },
      { header: 'Unit cost', value: (r) => r.cost.toFixed(2) },
      { header: 'Stock value', value: (r) => r.value.toFixed(2) },
      { header: 'Supplier', value: (r) => r.supplier },
      { header: 'Location', value: (r) => r.location },
      { header: 'Last updated', value: (r) => r.updatedAt },
    ]);
    dispatch(toast.success(t('toast.exportReady'), t('toast.exportedCsv', { n: items.length, label: t('inventoryPage.itemLabel') })));
  };

  const hasFilters = Boolean(filters.q) || filters.status.length > 0 || filters.category.length > 0;
  const loading = status === 'loading';

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('inventoryPage.title')}
        description={t('inventoryPage.description')}
        actions={
          <Button variant="secondary" icon={Download} onClick={exportInventory}>
            {t('common.export')}
          </Button>
        }
      />

      <section aria-label="Inventory summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {loading && !summary ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard label={t('inventoryPage.totalItems')} value={number(summary?.totalItems)} icon={Boxes} tone="brand" hint={`${summary?.skus || 0} SKUs tracked`} />
            <StatCard
              label={t('inventoryPage.lowStock')}
              value={number(summary?.lowStock)}
              icon={AlertTriangle}
              tone="warning"
              hint="At or below threshold"
              footer={
                summary?.lowStock > 0 && (
                  <button
                    type="button"
                    onClick={() => dispatch(setFilter({ key: 'status', value: ['low_stock'] }))}
                    className="mt-1 text-caption font-medium text-brand-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Show these items
                  </button>
                )
              }
            />
            <StatCard label={t('inventoryPage.outOfStock')} value={number(summary?.outOfStock)} icon={PackageX} tone="warning" hint="Unavailable to buy" />
            <StatCard label={t('inventoryPage.value')} value={currency(summary?.value, { decimals: 0 })} icon={DollarSign} tone="success" hint="At cost price" />
          </>
        )}
      </section>

      <Card className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Input
              type="search"
              icon={Search}
              placeholder={t('inventoryPage.search')}
              aria-label={t('inventoryPage.search')}
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="h-8"
            />
            {searchInput && (
              <button
                type="button"
                onClick={() => setSearchInput('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          <Select
            size="sm"
            aria-label="Filter by stock status"
            options={[
              { value: '', label: t('inventoryPage.allStock') },
              ...Object.entries(STOCK_STATUS).map(([value]) => ({ value, label: t(`status.${value}`) })),
            ]}
            value={filters.status[0] || ''}
            onChange={(e) => dispatch(setFilter({ key: 'status', value: e.target.value ? [e.target.value] : [] }))}
            className="w-40"
          />

          <Select
            size="sm"
            aria-label="Filter by category"
            options={[{ value: '', label: t('inventoryPage.allCategories') }, ...categories.map((c) => ({ value: c.id, label: c.name }))]}
            value={filters.category[0] || ''}
            onChange={(e) => dispatch(setFilter({ key: 'category', value: e.target.value ? [e.target.value] : [] }))}
            className="w-40"
          />

          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={() => { dispatch(clearFilters()); setSearchInput(''); }}>
              Clear
            </Button>
          )}

          <Button size="sm" variant="ghost" icon={Download} className="ml-auto hidden lg:inline-flex" onClick={exportInventory}>
            {t('common.export')}
          </Button>
        </div>

        {status === 'failed' ? (
          <ErrorState title={t('inventoryPage.loadError')} description="Please try again." onRetry={() => dispatch(fetchInventory())} />
        ) : loading && items.length === 0 ? (
          <SkeletonTable rows={8} columns={6} checkbox={false} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Boxes}
            title={hasFilters ? t('inventoryPage.noneFound') : t('inventoryPage.empty')}
            description={hasFilters ? 'No items match your current filters.' : 'Add products to start tracking stock.'}
            action={
              hasFilters ? (
                <Button variant="secondary" onClick={() => { dispatch(clearFilters()); setSearchInput(''); }}>
                  Clear filters
                </Button>
              ) : (
                <Button as={Link} href="/products/new" variant="primary">
                  Add Product
                </Button>
              )
            }
          />
        ) : (
          <TableWrap className={cn(loading && 'pointer-events-none opacity-60')}>
            <Table>
              <caption className="sr-only">
                Inventory levels. Available quantities can be edited inline.
              </caption>
              <THead>
                <tr>
                  <TH sortable sortKey="name" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className={cn(stickyLeft, 'bg-surface-2 min-w-[240px]')}>
                    {t('inventoryPage.colProduct')}
                  </TH>
                  <TH>{t('inventoryPage.colSku')}</TH>
                  <TH align="right" sortable sortKey="available" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('inventoryPage.colAvailable')}</TH>
                  <TH align="right" className="hidden md:table-cell">{t('inventoryPage.colReserved')}</TH>
                  <TH align="right" sortable sortKey="threshold" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className="hidden lg:table-cell">
                    Threshold
                  </TH>
                  <TH align="right" sortable sortKey="value" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className="hidden xl:table-cell">
                    Value
                  </TH>
                  <TH>{t('inventoryPage.colStatus')}</TH>
                  <TH sortable sortKey="updatedAt" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className="hidden lg:table-cell">
                    {t('inventoryPage.colUpdated')}
                  </TH>
                </tr>
              </THead>
              <TBody>
                {items.map((row) => (
                  <TR key={row.id}>
                    <TD className={stickyLeft}>
                      <div className="flex items-center gap-3">
                        <ProductThumb name={localized(row, 'name', locale)} seed={row.id} src={row.image || row.primaryImage} size="sm" />
                        <div className="min-w-0">
                          <Link
                            href={`/products/${row.productId}`}
                            className="block truncate text-body-sm font-semibold text-ink underline-offset-4 transition-colors hover:text-brand-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            {localized(row, 'name', locale)}
                          </Link>
                          <p className="truncate text-caption text-ink-3">
                            {catName(row.categoryId)} · {row.location}
                          </p>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <span className="font-mono text-caption text-ink-2">{row.sku}</span>
                    </TD>
                    <TD align="right">
                      <StockEditor row={row} />
                    </TD>
                    <TD align="right" numeric muted className="hidden md:table-cell">{number(row.reserved)}</TD>
                    <TD align="right" numeric muted className="hidden lg:table-cell">{number(row.threshold)}</TD>
                    <TD align="right" numeric strong className="hidden xl:table-cell">{currency(row.value, { decimals: 0 })}</TD>
                    <TD>
                      <StatusBadge map={STOCK_STATUS} value={row.status} size="sm" />
                    </TD>
                    <TD numeric muted className="hidden lg:table-cell">
                      {dateShort(row.updatedAt)}
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </TableWrap>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          itemLabel={t('inventoryPage.itemLabel')}
          onPageChange={(p) => dispatch(setPage(p))}
          onPageSizeChange={(s) => dispatch(setPageSize(s))}
        />
      </Card>
    </div>
  );
}
