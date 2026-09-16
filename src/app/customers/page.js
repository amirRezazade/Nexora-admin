'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Search, Download, X, Users, Eye, Mail, Ban, MoreHorizontal, UserPlus, Crown, DollarSign,
} from 'lucide-react';
import { cn, currency, dateShort, number, relativeTime } from '@/lib/format';
import { useDebouncedValue } from '@/lib/hooks';
import { downloadCSV } from '@/lib/export';
import {
  fetchCustomers, setFilter, setSort, setPage, setPageSize, clearFilters,
} from '@/store/slices/customersSlice';
import { toast } from '@/store/slices/uiSlice';
import { useI18n } from '@/i18n/I18nProvider';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Avatar from '@/components/ui/Avatar';
import Badge, { StatusBadge, CUSTOMER_STATUS } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Dropdown, { MenuItem, MenuSeparator } from '@/components/ui/Dropdown';
import StatCard from '@/components/ui/StatCard';
import { Table, TableWrap, TBody, TD, TH, THead, TR, stickyLeft, stickyRight } from '@/components/ui/Table';
import { SkeletonTable, SkeletonStatCard } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

const SEGMENT_TONES = { VIP: 'brand', Returning: 'info', New: 'success' };

export default function CustomersPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const router = useRouter();
  const { items, status, filters, sort, page, pageSize, total, totalPages, summary } =
    useSelector((s) => s.customers);

  const [searchInput, setSearchInput] = useState(filters.q);
  const debounced = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    if (debounced !== filters.q) dispatch(setFilter({ key: 'q', value: debounced }));
  }, [debounced, filters.q, dispatch]);

  useEffect(() => {
    dispatch(fetchCustomers());
  }, [dispatch, filters, sort, page, pageSize]);

  const exportCustomers = () => {
    downloadCSV(`nova-customers-${new Date().toISOString().slice(0, 10)}.csv`, items, [
      { header: 'Name', value: (r) => r.name },
      { header: 'Email', value: (r) => r.email },
      { header: 'Phone', value: (r) => r.phone },
      { header: 'City', value: (r) => r.city },
      { header: 'Country', value: (r) => r.country },
      { header: 'Segment', value: (r) => r.segment },
      { header: 'Orders', value: (r) => r.orders },
      { header: 'Total spent', value: (r) => r.totalSpent.toFixed(2) },
      { header: 'Average order', value: (r) => r.avgOrder.toFixed(2) },
      { header: 'Last order', value: (r) => (r.lastOrder ? r.lastOrder.slice(0, 10) : '') },
      { header: 'Status', value: (r) => CUSTOMER_STATUS[r.status]?.label },
    ]);
    dispatch(toast.success('Export ready', `${items.length} customers exported as CSV.`));
  };

  const hasFilters = Boolean(filters.q) || filters.status.length > 0 || filters.segment.length > 0;
  const loading = status === 'loading';

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('customersPage.title')}
        description={t('customersPage.description')}
        actions={
          <Button variant="secondary" icon={Download} onClick={exportCustomers}>
            {t('common.export')}
          </Button>
        }
      />

      <section aria-label="Customer summary" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {loading && !summary ? (
          Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
        ) : (
          <>
            <StatCard label={t('customersPage.total')} value={number(summary?.total)} icon={Users} tone="brand" hint="All registered accounts" />
            <StatCard label={t('customersPage.active')} value={number(summary?.active)} icon={UserPlus} tone="success" hint={`${summary?.new || 0} joined recently`} />
            <StatCard label={t('customersPage.vip')} value={number(summary?.vip)} icon={Crown} tone="warning" hint="Highest lifetime value" />
            <StatCard label={t('customersPage.ltv')} value={currency(summary?.lifetimeValue, { decimals: 0 })} icon={DollarSign} tone="info" hint="Revenue from all customers" />
          </>
        )}
      </section>

      <Card className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Input
              type="search"
              icon={Search}
              placeholder={t('customersPage.search')}
              aria-label={t('customersPage.search')}
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

          <Select
            size="sm"
            aria-label="Filter by segment"
            options={[
              { value: '', label: t('customersPage.allSegments') },
              { value: 'VIP', label: t('status.vip') },
              { value: 'Returning', label: t('status.returning') },
              { value: 'New', label: t('status.new') },
            ]}
            value={filters.segment[0] || ''}
            onChange={(e) => dispatch(setFilter({ key: 'segment', value: e.target.value ? [e.target.value] : [] }))}
            className="w-36"
          />

          <Select
            size="sm"
            aria-label="Filter by status"
            options={[
              { value: '', label: t('filters.allStatuses') },
              ...Object.entries(CUSTOMER_STATUS).map(([value]) => ({ value, label: t(`status.${value}`) })),
            ]}
            value={filters.status[0] || ''}
            onChange={(e) => dispatch(setFilter({ key: 'status', value: e.target.value ? [e.target.value] : [] }))}
            className="w-36"
          />

          {hasFilters && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => { dispatch(clearFilters()); setSearchInput(''); }}
            >
              {t('common.clear')}
            </Button>
          )}

          <Button size="sm" variant="ghost" icon={Download} className="ml-auto hidden lg:inline-flex" onClick={exportCustomers}>
            {t('common.export')}
          </Button>
        </div>

        {status === 'failed' ? (
          <ErrorState title={t('customersPage.loadError')} description="Please try again." onRetry={() => dispatch(fetchCustomers())} />
        ) : loading && items.length === 0 ? (
          <SkeletonTable rows={8} columns={6} checkbox={false} />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Users}
            title={hasFilters ? t('customersPage.noneFound') : t('customersPage.empty')}
            description={
              hasFilters
                ? 'No customers match your current filters.'
                : 'Customers appear here after their first order.'
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
          <TableWrap className={cn(loading && 'pointer-events-none opacity-60')}>
            <Table>
              <caption className="sr-only">Customer directory, sortable by any column.</caption>
              <THead>
                <tr>
                  <TH sortable sortKey="name" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className={cn(stickyLeft, 'bg-surface-2 min-w-[220px]')}>
                    {t('customersPage.colCustomer')}
                  </TH>
                  <TH className="hidden md:table-cell">{t('customersPage.colLocation')}</TH>
                  <TH>{t('customersPage.colSegment')}</TH>
                  <TH align="right" sortable sortKey="orders" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('customersPage.colOrders')}</TH>
                  <TH align="right" sortable sortKey="totalSpent" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('customersPage.colSpent')}</TH>
                  <TH align="right" sortable sortKey="avgOrder" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className="hidden lg:table-cell">{t('customersPage.colAvg')}</TH>
                  <TH sortable sortKey="lastOrder" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>{t('customersPage.colLast')}</TH>
                  <TH>{t('customersPage.colStatus')}</TH>
                  <TH width="60px" align="right" className={cn(stickyRight, 'bg-surface-2')}>
                    <span className="sr-only">Actions</span>
                  </TH>
                </tr>
              </THead>
              <TBody>
                {items.map((c) => (
                  <TR key={c.id}>
                    <TD className={stickyLeft}>
                      <div className="flex items-center gap-3">
                        <Avatar name={c.name} tone={c.avatarTone} size="md" />
                        <div className="min-w-0">
                          <Link
                            href={`/customers/${c.id}`}
                            className="block truncate text-body-sm font-semibold text-ink underline-offset-4 transition-colors hover:text-brand-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                          >
                            {c.name}
                          </Link>
                          <p className="truncate text-caption text-ink-3">{c.email}</p>
                        </div>
                      </div>
                    </TD>
                    <TD muted className="hidden md:table-cell">
                      {c.city}, {c.country}
                    </TD>
                    <TD>
                      <Badge tone={SEGMENT_TONES[c.segment] || 'neutral'} size="sm">
                        {c.segment}
                      </Badge>
                    </TD>
                    <TD align="right" numeric>{number(c.orders)}</TD>
                    <TD align="right" numeric strong>{currency(c.totalSpent, { decimals: 0 })}</TD>
                    <TD align="right" numeric className="hidden lg:table-cell">{currency(c.avgOrder, { decimals: 0 })}</TD>
                    <TD numeric muted>
                      {c.lastOrder ? (
                        <>
                          {dateShort(c.lastOrder)}
                          <span className="block text-caption text-ink-3">{relativeTime(c.lastOrder)}</span>
                        </>
                      ) : (
                        <span className="text-ink-3">{t('common.never')}</span>
                      )}
                    </TD>
                    <TD>
                      <StatusBadge map={CUSTOMER_STATUS} value={c.status} size="sm" />
                    </TD>
                    <TD align="right" className={stickyRight}>
                      <Dropdown
                        menuLabel={`Actions for ${c.name}`}
                        trigger={<IconButton icon={MoreHorizontal} size="sm" label={`Actions for ${c.name}`} />}
                      >
                        {({ close }) => (
                          <>
                            <MenuItem icon={Eye} onClick={() => { close(); router.push(`/customers/${c.id}`); }}>
                              {t('common.viewProfile')}
                            </MenuItem>
                            <MenuItem icon={Mail} as="a" href={`mailto:${c.email}`} onClick={close}>
                              {t('common.sendEmail')}
                            </MenuItem>
                            <MenuSeparator />
                            <MenuItem icon={Ban} destructive onClick={() => { close(); dispatch(toast.warning('Blocking is not available in this demo.')); }}>
                              {t('customersPage.block')}
                            </MenuItem>
                          </>
                        )}
                      </Dropdown>
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
          itemLabel={t('customersPage.itemLabel')}
          onPageChange={(p) => dispatch(setPage(p))}
          onPageSizeChange={(s) => dispatch(setPageSize(s))}
        />
      </Card>
    </div>
  );
}
