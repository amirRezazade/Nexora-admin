"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { DollarSign, ShoppingCart, Users, Package, Plus, Download } from "lucide-react";
import { api } from "@/lib/api";
import { currency, number } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import PageHeader from "@/components/ui/PageHeader";
import Button from "@/components/ui/Button";
import Card, { CardHeader } from "@/components/ui/Card";
import StatCard from "@/components/ui/StatCard";
import { SegmentedControl } from "@/components/ui/Tabs";
import { SkeletonStatCard, SkeletonChart } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import RevenueChart from "@/components/charts/RevenueChart";
import SalesChart from "@/components/charts/SalesChart";
import RecentOrders from "@/components/dashboard/RecentOrders";
import TopProducts from "@/components/dashboard/TopProducts";
import LowStockWidget from "@/components/dashboard/LowStockWidget";
import ActivityTimeline from "@/components/dashboard/ActivityTimeline";

const RANGES = [
  { value: "7d", label: "7D" },
  { value: "30d", label: "30D" },
  { value: "90d", label: "90D" },
  { value: "12m", label: "12M" },
];

/* i18n keys for the selected range (labels live in messages.js → dashboard.*). */
const VS_KEY = { "7d": "dashboard.vs7", "30d": "dashboard.vs30", "90d": "dashboard.vs90", "12m": "dashboard.vs12" };
const PERIOD_KEY = { "7d": "dashboard.last7", "30d": "dashboard.last30", "90d": "dashboard.last90", "12m": "dashboard.last12" };

export default function DashboardPage() {
  const { t } = useI18n();
  const [range, setRange] = useState("30d");
  const [data, setData] = useState(null);
  const [status, setStatus] = useState("loading");

  const load = useCallback(async () => {
    setStatus("loading");
    try {
      const res = await api(`/api/dashboard?range=${range}`);
      setData(res);
      setStatus("succeeded");
    } catch {
      setStatus("failed");
    }
  }, [range]);

  useEffect(() => {
    load();
  }, [load]);

  const loading = status === "loading";
  const k = data?.kpis;

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        title={t("dashboard.title")}
        description={t("dashboard.description")}
        actions={
          <>
            <Button variant="secondary" icon={Download} className="hidden sm:inline-flex">
              {t("dashboard.export")}
            </Button>
            <Button as={Link} href="/products/new" variant="primary" icon={Plus}>
              {t("dashboard.addProduct")}
            </Button>
          </>
        }
      />

      {status === "failed" ? (
        <Card>
          <ErrorState title={t("dashboard.loadError")} description={t("dashboard.loadErrorHint")} onRetry={load} />
        </Card>
      ) : (
        <>
          {/* KPI row */}
          <section aria-label="Key performance indicators" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
            {loading || !k ? (
              Array.from({ length: 4 }).map((_, i) => <SkeletonStatCard key={i} />)
            ) : (
              <>
                <StatCard label={t("dashboard.revenue")} value={currency(k.revenue.current, { decimals: 0 })} change={k.revenue.change} comparison={t(VS_KEY[range])} spark={k.revenue.spark} icon={DollarSign} tone="brand" />
                <StatCard label={t("dashboard.orders")} value={number(k.orders.current)} change={k.orders.change} comparison={t(VS_KEY[range])} spark={k.orders.spark} icon={ShoppingCart} tone="info" />
                <StatCard label={t("dashboard.customers")} value={number(k.customers.current)} change={k.customers.change} comparison={t(VS_KEY[range])} spark={k.customers.spark} icon={Users} tone="success" hint={t("dashboard.newInPeriod", { n: number(k.customers.newInPeriod) })} />
                <StatCard
                  label={t("dashboard.products")}
                  value={number(k.products.current)}
                  spark={k.products.spark}
                  icon={Package}
                  tone="warning"
                  hint={t("dashboard.stockHint", { low: number(k.products.lowStock), out: number(k.products.outOfStock) })}
                  footer={
                    (k.products.lowStock > 0 || k.products.outOfStock > 0) && (
                      <Link href="/inventory?status=low_stock" className="mt-1 inline-block text-caption font-medium text-brand-text underline-offset-4 hover:underline">
                        {t("dashboard.reviewInventory")}
                      </Link>
                    )
                  }
                />
              </>
            )}
          </section>

          {/* Charts */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <Card>
              <CardHeader title={t("dashboard.revenueOverview")} description={loading || !k ? t("common.loading") : t("dashboard.earned", { amount: currency(k.revenue.current, { decimals: 0 }), period: t(`dashboard.last${range === "12m" ? "12" : range.replace("d", "")}`) })} action={<SegmentedControl options={RANGES} value={range} onChange={setRange} ariaLabel={t("dashboard.rangeAria")} />} />
              <div className="px-2 py-5 sm:px-4">{loading ? <SkeletonChart /> : <RevenueChart data={data.series} granularity={data.granularity} />}</div>
            </Card>

            <Card>
              <CardHeader title={t("dashboard.salesOrders")} description={loading || !k ? t("common.loading") : t("dashboard.ordersUnits", { orders: number(k.orders.current), units: number(k.units.current) })} />
              <div className="px-2 py-5 sm:px-4">{loading ? <SkeletonChart /> : <SalesChart data={data.series} granularity={data.granularity} />}</div>
            </Card>
          </section>

          {/* Lists */}
          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <RecentOrders orders={data?.recentOrders} loading={loading} />
            <TopProducts products={data?.topProducts} loading={loading} periodLabel={t(PERIOD_KEY[range])} />
          </section>

          <section className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            <LowStockWidget items={data?.lowStockItems} loading={loading} />
            <ActivityTimeline items={data?.activity} loading={loading} />
          </section>
        </>
      )}
    </div>
  );
}
