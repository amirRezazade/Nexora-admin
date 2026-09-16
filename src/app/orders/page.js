'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, SlidersHorizontal, Download, X, Eye, Printer, MoreHorizontal,
  ShoppingCart, Truck, PackageCheck, XCircle,
} from 'lucide-react';
import { cn, currency, dateShort, number, relativeTime, titleCase } from '@/lib/format';
import { useDebouncedValue } from '@/lib/hooks';
import { downloadCSV } from '@/lib/export';
import {
  fetchOrders, setFilter, setStatusTab, setPage, setPageSize, setSort,
  clearFilters, toggleRow, toggleAllRows, clearSelection, updateOrderStatus,
} from '@/store/slices/ordersSlice';
import { toast } from '@/store/slices/uiSlice';
import { useI18n } from '@/i18n/I18nProvider';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Checkbox from '@/components/ui/Checkbox';
import Avatar from '@/components/ui/Avatar';
import Tabs from '@/components/ui/Tabs';
import Pagination from '@/components/ui/Pagination';
import Drawer from '@/components/ui/Drawer';
import Dropdown, { MenuItem, MenuSeparator } from '@/components/ui/Dropdown';
import BulkBar from '@/components/ui/BulkBar';
import FilterChips from '@/components/ui/FilterChips';
import { StatusBadge, ORDER_STATUS, PAYMENT_STATUS } from '@/components/ui/Badge';
import { Table, TableWrap, TBody, TD, TH, THead, TR, stickyLeft, stickyRight } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    items, status, error, filters, sort, page, pageSize, total, totalPages, counts, selected,
  } = useSelector((s) => s.orders);

  const [searchInput, setSearchInput] = useState(filters.q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const debounced = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debounced !== filters.q) dispatch(setFilter({ key: 'q', value: debounced }));
  }, [debounced, filters.q, dispatch]);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch, filters, sort, page, pageSize]);

  useEffect(() => {
    if (filtersOpen) setDraft(filters);
  }, [filtersOpen, filters]);

  const activeTab = filters.status.length === 1 ? filters.status[0] : 'all';

  const tabs = STATUS_TABS.map((s) => ({
    value: s,
    label: s === 'all' ? t('common.all') : t(`status.${s}`),
    count: counts?.[s] ?? undefined,
  }));

  const chips = useMemo(() => {
    const out = [];
    filters.payment.forEach((v) =>
      out.push({ key: 'payment', value: v, label: 'Payment', display: PAYMENT_STATUS[v]?.label || v })
    );
    if (filters.from) out.push({ key: 'from', value: filters.from, label: 'From', display: filters.from });
    if (filters.to) out.push({ key: 'to', value: filters.to, label: 'To', display: filters.to });
    if (filters.minTotal) out.push({ key: 'minTotal', value: filters.minTotal, label: 'Min total', display: `$${filters.minTotal}` });
    return out;
  }, [filters]);

  const removeChip = (chip) => {
    if (chip.key === 'payment') {
      dispatch(setFilter({ key: 'payment', value: filters.payment.filter((v) => v !== chip.value) }));
    } else {
      dispatch(setFilter({ key: chip.key, value: '' }));
    }
  };

  const exportOrders = (rows, label) => {
    downloadCSV(`nova-orders-${new Date().toISOString().slice(0, 10)}.csv`, rows, [
      { header: 'Order ID', value: (r) => r.id },
      { header: 'Customer', value: (r) => r.customerName },
      { header: 'Email', value: (r) => r.customerEmail },
      { header: 'Date', value: (r) => r.placedAt.slice(0, 10) },
      { header: 'Items', value: (r) => r.itemCount },
      { header: 'Subtotal', value: (r) => r.subtotal.toFixed(2) },
      { header: 'Discount', value: (r) => r.discount.toFixed(2) },
      { header: 'Shipping', value: (r) => r.shipping.toFixed(2) },
      { header: 'Tax', value: (r) => r.tax.toFixed(2) },
      { header: 'Total', value: (r) => r.total.toFixed(2) },
      { header: 'Payment', value: (r) => PAYMENT_STATUS[r.paymentStatus]?.label },
      { header: 'Method', value: (r) => r.paymentMethod },
      { header: 'Status', value: (r) => ORDER_STATUS[r.status]?.label },
    ]);
    dispatch(toast.success('Export ready', `${rows.length} ${label} exported as CSV.`));
  };

  const setStatusFor = async (order, next) => {
    try {
      await dispatch(updateOrderStatus({ id: order.id, status: next })).unwrap();
      dispatch(toast.success('Order updated', `#${order.id} is now ${ORDER_STATUS[next].label.toLowerCase()}.`));
    } catch {
      dispatch(toast.error('We couldn’t update the order.', 'Please try again.'));
    }
  };

  const allSelected = items.length > 0 && items.every((i) => selected.includes(i.id));
  const someSelected = items.some((i) => selected.includes(i.id));
  const hasFilters = chips.length > 0 || Boolean(filters.q);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('ordersPage.title')}
        description={t('ordersPage.description')}
        actions={
          <Button variant="secondary" icon={Download} onClick={() => exportOrders(items, 'orders')}>
            {t('common.export')}
          </Button>
        }
      />

      <Card className="flex flex-col">
        <div className="px-4 sm:px-5">
          <Tabs
            tabs={tabs}
            value={activeTab}
            ariaLabel="Filter orders by status"
            onChange={(v) => dispatch(setStatusTab(v))}
          />
        </div>

        {selected.length > 0 ? (
          <BulkBar count={selected.length} itemLabel="order" onClear={() => dispatch(clearSelection())}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => exportOrders(items.filter((i) => selected.includes(i.id)), 'selected orders')}
            >
              Export
            </Button>
            <Dropdown
              menuLabel="Update status"
              trigger={<Button size="sm" variant="secondary">{t('ordersPage.updateStatus')}</Button>}
            >
              {({ close }) =>
                ['processing', 'shipped', 'delivered'].map((s) => (
                  <MenuItem
                    key={s}
                    onClick={async () => {
                      close();
                      await Promise.all(
                        items.filter((i) => selected.includes(i.id)).map((o) => dispatch(updateOrderStatus({ id: o.id, status: s })))
                      );
                      dispatch(clearSelection());
                      dispatch(toast.success(`${selected.length} order${selected.length === 1 ? '' : 's'} marked as ${ORDER_STATUS[s].label.toLowerCase()}.`));
                    }}
                  >
                    Mark as {ORDER_STATUS[s].label.toLowerCase()}
                  </MenuItem>
                ))
              }
            </Dropdown>
            <Button size="sm" variant="secondary" icon={Printer} onClick={() => dispatch(toast.info('Printing is not available in this demo.'))}>
              Print
            </Button>
          </BulkBar>
        ) : (
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Input
                type="search"
                icon={Search}
                placeholder={t('ordersPage.search')}
                aria-label={t('ordersPage.search')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-8"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label={t('common.clear')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X aria-hidden className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Button size="sm" variant="secondary" icon={SlidersHorizontal} onClick={() => setFiltersOpen(true)}>
              {t('common.filters')}
              {chips.length > 0 && (
                <span className="ml-0.5 rounded-pill bg-brand px-1.5 text-[10px] font-bold leading-4 text-white">
                  {chips.length}
                </span>
              )}
            </Button>
            <Button size="sm" variant="ghost" icon={Download} className="ml-auto" onClick={() => exportOrders(items, 'orders')}>
              Export
            </Button>
          </div>
        )}

        {chips.length > 0 && (
          <FilterChips
            chips={chips}
            onRemove={removeChip}
            onClearAll={() => { dispatch(clearFilters()); setSearchInput(''); }}
            className="border-b border-line px-4 py-2.5 sm:px-5"
          />
        )}

        {status === 'failed' ? (
          <ErrorState
            title={t('ordersPage.loadError')}
            description={t('common.tryAgain')}
            onRetry={() => dispatch(fetchOrders())}
          />
        ) : status === 'loading' && items.length === 0 ? (
          <SkeletonTable rows={8} columns={7} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title={hasFilters ? t('ordersPage.noneFound') : t('ordersPage.empty')}
            description={
              hasFilters
                ? t('ordersPage.noneFoundHint')
                : t('ordersPage.emptyHint')
            }
            action={
              hasFilters && (
                <Button variant="secondary" onClick={() => { dispatch(clearFilters()); setSearchInput(''); }}>
                  Clear filters
                </Button>
              )
            }
          />
        ) : (
          <TableWrap className={cn(status === 'loading' && 'pointer-events-none opacity-60')}>
            <Table>
              <caption className="sr-only">Customer orders. Sort with the column headers, select rows for bulk actions.</caption>
              <THead>
                <tr>
                  <TH width="44px" className={cn(stickyLeft, 'bg-surface-2')}>
                    <Checkbox
                      checked={allSelected}
                      indeterminate={!allSelected && someSelected}
                      onChange={() => dispatch(toggleAllRows())}
                      aria-label="Select all orders on this page"
                    />
                  </TH>
                  <TH sortable sortKey="id" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('ordersPage.colId')}</TH>
                  <TH sortable sortKey="customerName" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className="min-w-[200px]">{t('ordersPage.colCustomer')}</TH>
                  <TH sortable sortKey="placedAt" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('ordersPage.colDate')}</TH>
                  <TH align="right" sortable sortKey="itemCount" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('ordersPage.colItems')}</TH>
                  <TH align="right" sortable sortKey="total" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('ordersPage.colTotal')}</TH>
                  <TH>{t('ordersPage.colPayment')}</TH>
                  <TH>{t('ordersPage.colStatus')}</TH>
                  <TH width="60px" align="right" className={cn(stickyRight, 'bg-surface-2')}>
                    <span className="sr-only">Actions</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {items.map((o) => {
                  const isSelected = selected.includes(o.id);
                  return (
                    <TR key={o.id} selected={isSelected}>
                      <TD className={stickyLeft}>
                        <Checkbox
                          checked={isSelected}
                          onChange={() => dispatch(toggleRow(o.id))}
                          aria-label={`Select order ${o.id}`}
                        />
                      </TD>
                      <TD>
                        <Link
                          href={`/orders/${o.id}`}
                          className="font-mono text-caption font-semibold text-ink underline-offset-4 transition-colors hover:text-brand-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          #{o.id}
                        </Link>
                      </TD>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <Avatar name={o.customerName} size="sm" tone="neutral" />
                          <div className="min-w-0">
                            <Link
                              href={`/customers/${o.customerId}`}
                              className="block truncate text-body-sm font-medium text-ink underline-offset-4 hover:text-brand-text hover:underline"
                            >
                              {o.customerName}
                            </Link>
                            <p className="truncate text-caption text-ink-3">{o.customerEmail}</p>
                          </div>
                        </div>
                      </TD>
                      <TD numeric>
                        <span className="text-ink-2">{dateShort(o.placedAt)}</span>
                        <span className="block text-caption text-ink-3">{relativeTime(o.placedAt)}</span>
                      </TD>
                      <TD align="right" numeric>{number(o.itemCount)}</TD>
                      <TD align="right" numeric strong>{currency(o.total)}</TD>
                      <TD>
                        <StatusBadge map={PAYMENT_STATUS} value={o.paymentStatus} size="sm" />
                      </TD>
                      <TD>
                        <StatusBadge map={ORDER_STATUS} value={o.status} size="sm" />
                      </TD>
                      <TD align="right" className={stickyRight}>
                        <Dropdown
                          menuLabel={`Actions for order ${o.id}`}
                          trigger={<IconButton icon={MoreHorizontal} size="sm" label={`Actions for order ${o.id}`} />}
                        >
                          {({ close }) => (
                            <>
                              <MenuItem icon={Eye} onClick={() => { close(); router.push(`/orders/${o.id}`); }}>
                                {t('common.viewDetails')}
                              </MenuItem>
                              <MenuItem icon={Printer} onClick={() => { close(); dispatch(toast.info('Printing is not available in this demo.')); }}>
                                {t('common.printInvoice')}
                              </MenuItem>
                              <MenuSeparator />
                              {o.status !== 'processing' && (
                                <MenuItem icon={PackageCheck} onClick={() => { close(); setStatusFor(o, 'processing'); }}>
                                  {t('ordersPage.markProcessing')}
                                </MenuItem>
                              )}
                              {o.status !== 'shipped' && (
                                <MenuItem icon={Truck} onClick={() => { close(); setStatusFor(o, 'shipped'); }}>
                                  {t('ordersPage.markShipped')}
                                </MenuItem>
                              )}
                              {o.status !== 'delivered' && (
                                <MenuItem icon={PackageCheck} onClick={() => { close(); setStatusFor(o, 'delivered'); }}>
                                  {t('ordersPage.markDelivered')}
                                </MenuItem>
                              )}
                              <MenuSeparator />
                              <MenuItem icon={XCircle} destructive onClick={() => { close(); setStatusFor(o, 'cancelled'); }}>
                                {t('ordersPage.cancelOrder')}
                              </MenuItem>
                            </>
                          )}
                        </Dropdown>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          itemLabel={t('ordersPage.itemLabel')}
          onPageChange={(p) => dispatch(setPage(p))}
          onPageSizeChange={(s) => dispatch(setPageSize(s))}
        />
      </Card>

      <Drawer
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        title={t('filters.title')}
        description={t('ordersPage.refine')}
        footer={
          <>
            <Button variant="ghost" onClick={() => { dispatch(clearFilters()); setFiltersOpen(false); }}>
              {t('common.clearAll')}
            </Button>
            <Button
              variant="primary"
              className="ml-auto"
              onClick={() => {
                Object.entries(draft).forEach(([key, value]) => {
                  if (key !== 'status') dispatch(setFilter({ key, value }));
                });
                setFiltersOpen(false);
              }}
            >
              {t('common.apply')}
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-7">
          <fieldset className="border-0 p-0">
            <legend className="mb-2.5 text-h4 text-ink">{t('ordersPage.paymentStatus')}</legend>
            <div className="flex flex-col gap-2.5">
              {Object.entries(PAYMENT_STATUS).map(([value, cfg]) => (
                <Checkbox
                  key={value}
                  label={cfg.label}
                  checked={draft.payment.includes(value)}
                  onChange={() =>
                    setDraft((d) => ({
                      ...d,
                      payment: d.payment.includes(value)
                        ? d.payment.filter((v) => v !== value)
                        : [...d.payment, value],
                    }))
                  }
                />
              ))}
            </div>
          </fieldset>

          <fieldset className="border-0 p-0">
            <legend className="mb-2.5 text-h4 text-ink">{t('ordersPage.datePlaced')}</legend>
            <div className="flex flex-col gap-3">
              <Input type="date" label={t('ordersPage.from')} value={draft.from} onChange={(e) => setDraft((d) => ({ ...d, from: e.target.value }))} />
              <Input type="date" label={t('ordersPage.to')} value={draft.to} onChange={(e) => setDraft((d) => ({ ...d, to: e.target.value }))} />
            </div>
          </fieldset>

          <fieldset className="border-0 p-0">
            <legend className="mb-2.5 text-h4 text-ink">{t('ordersPage.orderValue')}</legend>
            <Input
              type="number"
              min="0"
              label={t('ordersPage.minTotal')}
              prefix="$"
              className="pl-7"
              placeholder="0.00"
              value={draft.minTotal}
              onChange={(e) => setDraft((d) => ({ ...d, minTotal: e.target.value }))}
            />
          </fieldset>
        </div>
      </Drawer>
    </div>
  );
}
