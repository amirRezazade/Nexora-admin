'use client';

import { useCallback, useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  DollarSign, ShoppingCart, Receipt, Users, Repeat, Package, Download, Globe, Clock,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, currency, currencyCompact, number, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { downloadCSV } from '@/lib/export';
import { toast } from '@/store/slices/uiSlice';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import StatCard from '@/components/ui/StatCard';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';
import { SegmentedControl } from '@/components/ui/Tabs';
import { SkeletonStatCard, SkeletonChart } from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import RevenueChart from '@/components/charts/RevenueChart';
import SalesChart from '@/components/charts/SalesChart';
import CategoryChart from '@/components/charts/CategoryChart';
import CustomerGrowthChart from '@/components/charts/CustomerGrowthChart';
import ProductPerformanceChart from '@/components/charts/ProductPerformanceChart';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import ProductThumb from '@/components/ui/ProductThumb';

const RANGES = [
  { value: '7d', label: '7D' },
  { value: '30d', label: '30D' },
  { value: '90d', label: '90D' },
  { value: '12m', label: '12M' },
];

const RANGE_NAME_KEYS = {
  '7d': 'analyticsPage.last7',
  '30d': 'analyticsPage.last30',
  '90d': 'analyticsPage.last90',
  '12m': 'analyticsPage.last12',
};

const COMPARISON = {
  '7d': 'vs previous 7 days',
  '30d': 'vs previous 30 days',
  '90d': 'vs previous 90 days',
  '12m': 'vs previous year',
};

export default function AnalyticsPage() {
  const dispatch = useDispatch();
  const { t, locale } = useI18n();
  const [range, setRange] = useState('30d');
  const [compare, setCompare] = useState(true);
  const [data, setData] = useState(null);
  const [status, setStatus] = useState('loading');

  const load = useCallback(async () => {
    setStatus('loading');
    try {
      setData(await api(`/api/analytics?range=${range}`));
      setStatus('succeeded');
    } catch {
      setStatus('failed');
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const loading = status === 'loading';
  const k = data?.kpis;

  const exportReport = () => {
    downloadCSV(`nexora-analytics-${range}-${new Date().toISOString().slice(0, 10)}.csv`, data.series, [
      { header: 'Date', value: (r) => r.date },
      { header: 'Revenue', value: (r) => r.revenue.toFixed(2) },
      { header: 'Orders', value: (r) => r.orders },
      { header: 'Units', value: (r) => r.units },
    ]);
    dispatch(toast.success(t('toast.exportReady'), t('toast.exportedCsv', { n: data.series.length, label: t('analyticsPage.title') })));
  };

  const peakHour = data?.hourly?.reduce((a, b) => (b.orders > a.orders ? b : a), { hour: 0, orders: 0 });

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t('analyticsPage.title')}
        description={t('analyticsPage.description')}
        actions={
          <>
            <div className="flex items-center gap-3 rounded-control border border-line bg-surface px-3 py-1.5">
              <Switch checked={compare} onChange={setCompare} label={t('analyticsPage.compare')} id="compare-toggle" />
            </div>
            <Button variant="secondary" icon={Download} onClick={exportReport} disabled={loading}>
              {t('common.export')}
            </Button>
          </>
        }
      >
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <Select
            size="sm"
            aria-label="Date range"
            options={RANGES.map((r) => ({ value: r.value, label: t(RANGE_NAME_KEYS[r.value]) }))}
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="w-44"
          />
          <SegmentedControl options={RANGES} value={range} onChange={setRange} ariaLabel="Quick date range" />
        </div>
      </PageHeader>

      {status === 'failed' ? (
        <Card>
          <ErrorState
            title={t('analyticsPage.loadError')}
            description="The reporting service didn’t respond. Please try again."
            onRetry={load}
          />
        </Card>
      ) : (
        <>
          {/* Primary metrics */}
          <section aria-label="Headline metrics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
            {loading || !k ? (
              Array.from({ length: 6 }).map((_, i) => <SkeletonStatCard key={i} />)
            ) : (
              <>
                <StatCard
                  label={t('analyticsPage.revenue')}
                  value={currency(k.revenue.current, { decimals: 0 })}
                  change={compare ? k.revenue.change : null}
                  comparison={compare ? COMPARISON[range] : null}
                  spark={data.series.slice(-14).map((d) => d.revenue)}
                  icon={DollarSign}
                  tone="brand"
                  hint={compare ? `Previously ${currency(k.revenue.previous, { decimals: 0 })}` : null}
                />
                <StatCard
                  label={t('analyticsPage.orders')}
                  value={number(k.orders.current)}
                  change={compare ? k.orders.change : null}
                  comparison={compare ? COMPARISON[range] : null}
                  spark={data.series.slice(-14).map((d) => d.orders)}
                  icon={ShoppingCart}
                  tone="info"
                  hint={compare ? `Previously ${number(k.orders.previous)}` : null}
                />
                <StatCard
                  label={t('analyticsPage.aov')}
                  value={currency(k.aov.current)}
                  change={compare ? k.aov.change : null}
                  comparison={compare ? COMPARISON[range] : null}
                  icon={Receipt}
                  tone="success"
                  hint={compare ? `Previously ${currency(k.aov.previous)}` : null}
                />
                <StatCard
                  label={t('analyticsPage.buyers')}
                  value={number(k.customers.current)}
                  change={compare ? k.customers.change : null}
                  comparison={compare ? COMPARISON[range] : null}
                  icon={Users}
                  tone="warning"
                  hint="Unique buyers in this period"
                />
                <StatCard
                  label={t('analyticsPage.repeat')}
                  value={`${k.repeatRate.current}%`}
                  icon={Repeat}
                  tone="info"
                  hint="Buyers with more than one order"
                />
                <StatCard
                  label={t('analyticsPage.units')}
                  value={number(k.units.current)}
                  change={compare ? k.units.change : null}
                  comparison={compare ? COMPARISON[range] : null}
                  spark={data.series.slice(-14).map((d) => d.units)}
                  icon={Package}
                  tone="brand"
                />
              </>
            )}
          </section>

          {/* Sales trend — the single most important chart, given full width */}
          <Card>
            <CardHeader
              title={t('analyticsPage.salesTrend')}
              description={loading ? t('common.loading') : t(RANGE_NAME_KEYS[range])}
            />
            <div className="px-2 py-5 sm:px-4">
              {loading ? <SkeletonChart height="h-80" /> : <RevenueChart data={data.series} granularity={data.granularity} height={320} />}
            </div>
          </Card>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title={t('analyticsPage.ordersUnits')} description="Volume alongside basket size" />
              <div className="px-2 py-5 sm:px-4">
                {loading ? <SkeletonChart /> : <SalesChart data={data.series} granularity={data.granularity} />}
              </div>
            </Card>

            <Card>
              <CardHeader title={t('analyticsPage.byCategory')} description="Share of revenue in this period" />
              <CardBody>
                {loading ? <SkeletonChart height="h-56" /> : <CategoryChart data={data.categories} />}
              </CardBody>
            </Card>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title={t('analyticsPage.growth')} description="New versus returning buyers each month" />
              <div className="px-2 py-5 sm:px-4">
                {loading ? <SkeletonChart /> : <CustomerGrowthChart data={data.customerGrowth} />}
              </div>
            </Card>

            <Card>
              <CardHeader title={t('analyticsPage.performance')} description="Top products by revenue" />
              <div className="px-2 py-5 sm:px-4">
                {loading ? <SkeletonChart height="h-72" /> : <ProductPerformanceChart data={data.products} />}
              </div>
            </Card>
          </div>

          {/* Detail tables */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <Card>
              <CardHeader title={t('analyticsPage.topProducts')} description="Revenue, units and order frequency" />
              {loading ? (
                <div className="p-5"><SkeletonChart height="h-48" /></div>
              ) : (
                <TableWrap>
                  <Table>
                    <THead>
                      <tr>
                        <TH className="min-w-[220px]">{t('analyticsPage.colProduct')}</TH>
                        <TH align="right">{t('analyticsPage.colUnits')}</TH>
                        <TH align="right">{t('analyticsPage.colOrders')}</TH>
                        <TH align="right">{t('analyticsPage.colRevenue')}</TH>
                        <TH align="right" className="hidden sm:table-cell">{t('analyticsPage.colShare')}</TH>
                      </tr>
                    </THead>
                    <TBody>
                      {data.products.map((p) => {
                        const totalRev = data.products.reduce((s, x) => s + x.revenue, 0);
                        const share = totalRev ? (p.revenue / totalRev) * 100 : 0;
                        return (
                          <TR key={p.productId}>
                            <TD>
                              <div className="flex items-center gap-3">
                                <ProductThumb name={localized(p, 'name', locale)} seed={p.productId} src={p.image} size="sm" />
                                <div className="min-w-0">
                                  <p className="truncate text-body-sm font-medium text-ink">{localized(p, 'name', locale)}</p>
                                  <p className="truncate font-mono text-caption text-ink-3">{p.sku}</p>
                                </div>
                              </div>
                            </TD>
                            <TD align="right" numeric>{number(p.units)}</TD>
                            <TD align="right" numeric muted>{number(p.orders)}</TD>
                            <TD align="right" numeric strong>{currency(p.revenue, { decimals: 0 })}</TD>
                            <TD align="right" className="hidden sm:table-cell">
                              <span className="flex items-center justify-end gap-2">
                                <span className="h-1.5 w-14 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                                  <span className="block h-full rounded-pill bg-brand" style={{ width: `${share}%` }} />
                                </span>
                                <span className="w-10 text-right tabular-nums text-ink-2">{share.toFixed(1)}%</span>
                              </span>
                            </TD>
                          </TR>
                        );
                      })}
                    </TBody>
                  </Table>
                </TableWrap>
              )}
            </Card>

            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader title={t('analyticsPage.byCountry')} icon={Globe} description="Where your orders come from" />
                {loading ? (
                  <div className="p-5"><SkeletonChart height="h-40" /></div>
                ) : (
                  <ul className="px-5 py-4 sm:px-6">
                    {data.geography.map((g) => {
                      const max = Math.max(...data.geography.map((x) => x.revenue), 1);
                      return (
                        <li key={g.country} className="flex items-center gap-3 py-1.5">
                          <span className="w-32 shrink-0 truncate text-body-sm text-ink">{g.country}</span>
                          <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                            <span
                              className="block h-full rounded-pill bg-brand transition-[width] duration-500"
                              style={{ width: `${(g.revenue / max) * 100}%` }}
                            />
                          </span>
                          <span className="w-16 shrink-0 text-right text-body-sm font-medium tabular-nums text-ink">
                            {currencyCompact(g.revenue)}
                          </span>
                          <span className="hidden w-10 shrink-0 text-right text-caption tabular-nums text-ink-3 sm:block">
                            {g.orders}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </Card>

              <Card>
                <CardHeader
                  title={t('analyticsPage.byHour')}
                  icon={Clock}
                  description={peakHour ? `Peak trading at ${String(peakHour.hour).padStart(2, '0')}:00 UTC` : 'Loading…'}
                />
                <CardBody>
                  {loading ? (
                    <SkeletonChart height="h-24" />
                  ) : (
                    <div className="flex h-24 items-end gap-[3px]" role="img" aria-label="Order volume by hour of day">
                      {data.hourly.map((h) => {
                        const max = Math.max(...data.hourly.map((x) => x.orders), 1);
                        const isPeak = h.orders === max;
                        return (
                          <span
                            key={h.hour}
                            title={`${String(h.hour).padStart(2, '0')}:00 — ${h.orders} orders`}
                            className={cn(
                              'flex-1 rounded-t-[3px] transition-colors',
                              isPeak ? 'bg-brand' : 'bg-brand/25 hover:bg-brand/45'
                            )}
                            style={{ height: `${Math.max(4, (h.orders / max) * 100)}%` }}
                          />
                        );
                      })}
                    </div>
                  )}
                  <div className="mt-2 flex justify-between text-caption text-ink-3">
                    <span>00:00</span>
                    <span>12:00</span>
                    <span>23:00</span>
                  </div>
                </CardBody>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
