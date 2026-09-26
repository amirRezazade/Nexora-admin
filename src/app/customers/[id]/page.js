"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart, DollarSign, Receipt, Clock, MoreHorizontal, Ban, Users, UserPlus, Package } from "lucide-react";
import { api } from "@/lib/api";
import { currency, dateShort, dateTime, number, relativeTime, localized } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import { toast, setPageTitle } from "@/store/slices/uiSlice";

import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Badge, { StatusBadge, CUSTOMER_STATUS, ORDER_STATUS } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import StatCard from "@/components/ui/StatCard";
import Timeline, { TimelineItem } from "@/components/ui/Timeline";
import Dropdown, { MenuItem, MenuSeparator } from "@/components/ui/Dropdown";
import Skeleton, { SkeletonText, SkeletonStatCard } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import ProductThumb from "@/components/ui/ProductThumb";
import { Table, TableWrap, TBody, TD, TH, THead, TR } from "@/components/ui/Table";

const SEGMENT_TONES = { VIP: "brand", Returning: "info", New: "success" };

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, locale } = useI18n();
  const [state, setState] = useState({ status: "loading", data: null });

  const load = useCallback(async () => {
    setState({ status: "loading", data: null });
    try {
      const res = await api(`/api/customers/${id}`);
      setState({ status: "succeeded", data: res });
    } catch (e) {
      setState({ status: e.status === 404 ? "notfound" : "failed", data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (state.data?.data?.name) dispatch(setPageTitle(state.data.data.name));
  }, [state.data, dispatch]);

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-64" />
        <div className="card flex items-center gap-4 p-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-56" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonStatCard key={i} />
          ))}
        </div>
        <div className="card p-6">
          <SkeletonText lines={8} />
        </div>
      </div>
    );
  }

  if (state.status === "notfound") {
    return (
      <Card>
        <EmptyState
          icon={Users}
          title={t("customerDetail.notFound")}
          description="This customer may have been removed or the link is incorrect."
          action={
            <Button as={Link} href="/customers" variant="primary">
              {t("customerDetail.back")}
            </Button>
          }
        />
      </Card>
    );
  }

  if (state.status === "failed") {
    return (
      <Card>
        <ErrorState title={t("customerDetail.loadError")} description="Please try again." onRetry={load} />
      </Card>
    );
  }

  const { data: c, address, orders, orderCount, favourites, activity } = state.data;

  return (
    <div className="flex flex-col gap-5">
      {/* Profile header */}
      <Card padded>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <IconButton icon={ArrowLeft} label="Back to customers" variant="secondary" onClick={() => router.push("/customers")} className="shrink-0 self-start" />
          <Avatar name={c.name} tone={c.avatarTone} size="xl" className="shrink-0" />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h1 className="text-h1 text-ink">{c.name}</h1>
              <Badge tone={SEGMENT_TONES[c.segment] || "neutral"}>{c.segment}</Badge>
              <StatusBadge map={CUSTOMER_STATUS} value={c.status} />
            </div>
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-body-sm">
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Email</dt>
                <Mail aria-hidden className="h-3.5 w-3.5 text-ink-3" />
                <dd>
                  <a href={`mailto:${c.email}`} className="text-brand-text underline-offset-4 hover:underline">
                    {c.email}
                  </a>
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Phone</dt>
                <Phone aria-hidden className="h-3.5 w-3.5 text-ink-3" />
                <dd className="tabular-nums text-ink-2">{c.phone}</dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Location</dt>
                <MapPin aria-hidden className="h-3.5 w-3.5 text-ink-3" />
                <dd className="text-ink-2">
                  {c.city}, {c.country}
                </dd>
              </div>
              <div className="flex items-center gap-1.5">
                <dt className="sr-only">Customer since</dt>
                <UserPlus aria-hidden className="h-3.5 w-3.5 text-ink-3" />
                <dd className="text-ink-2">Customer since {dateShort(c.joinedAt)}</dd>
              </div>
            </dl>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Button as="a" href={`mailto:${c.email}`} variant="secondary" icon={Mail}>
              Email
            </Button>
            <Dropdown menuLabel="More customer actions" trigger={<IconButton icon={MoreHorizontal} label="More customer actions" variant="secondary" size="lg" />}>
              {({ close }) => (
                <>
                  <MenuItem
                    icon={ShoppingCart}
                    onClick={() => {
                      close();
                      router.push(`/orders?q=${encodeURIComponent(c.name)}`);
                    }}
                  >
                    {t("common.viewAll")} {t("common.orders")}
                  </MenuItem>
                  <MenuSeparator />
                  <MenuItem
                    icon={Ban}
                    destructive
                    onClick={() => {
                      close();
                      dispatch(toast.warning(t("toast.blockDemo")));
                    }}
                  >
                    {t("customersPage.block")}
                  </MenuItem>
                </>
              )}
            </Dropdown>
          </div>
        </div>
      </Card>

      {/* Stats */}
      <section aria-label="Customer statistics" className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <StatCard label={t("customerDetail.totalOrders")} value={number(c.orders)} icon={ShoppingCart} tone="info" hint="Lifetime" />
        <StatCard label={t("customerDetail.totalSpent")} value={currency(c.totalSpent, { decimals: 0 })} icon={DollarSign} tone="brand" hint="Lifetime revenue" />
        <StatCard label={t("customerDetail.avgOrder")} value={currency(c.avgOrder, { decimals: 0 })} icon={Receipt} tone="success" hint="Across all orders" />
        <StatCard label={t("customerDetail.lastOrder")} value={c.lastOrder ? relativeTime(c.lastOrder) : "Never"} icon={Clock} tone="warning" hint={c.lastOrder ? dateShort(c.lastOrder) : "No orders placed"} />
      </section>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader
              title={t("customerDetail.recentOrders")}
              description={`${number(orderCount)} order${orderCount === 1 ? "" : "s"} in total`}
              action={
                <Button as={Link} href={`/orders?q=${encodeURIComponent(c.name)}`} variant="ghost" size="sm">
                  {t("common.viewAll")}
                </Button>
              }
            />
            {orders.length === 0 ? (
              <EmptyState compact icon={ShoppingCart} title="No orders yet" description="This customer hasn’t placed an order." />
            ) : (
              <TableWrap>
                <Table>
                  <THead>
                    <tr>
                      <TH>Order</TH>
                      <TH>Date</TH>
                      <TH align="right">Items</TH>
                      <TH align="right">Total</TH>
                      <TH>Status</TH>
                    </tr>
                  </THead>
                  <TBody>
                    {orders.map((o) => (
                      <TR key={o.id}>
                        <TD>
                          <Link href={`/orders/${o.id}`} className="font-mono text-caption font-semibold text-ink underline-offset-4 hover:text-brand-text hover:underline">
                            #{o.id}
                          </Link>
                        </TD>
                        <TD numeric muted>
                          {dateShort(o.placedAt)}
                        </TD>
                        <TD align="right" numeric>
                          {o.itemCount}
                        </TD>
                        <TD align="right" numeric strong>
                          {currency(o.total)}
                        </TD>
                        <TD>
                          <StatusBadge map={ORDER_STATUS} value={o.status} size="sm" />
                        </TD>
                      </TR>
                    ))}
                  </TBody>
                </Table>
              </TableWrap>
            )}
          </Card>

          {favourites.length > 0 && (
            <Card>
              <CardHeader title={t("customerDetail.mostPurchased")} description="What this customer buys again and again" />
              <CardBody className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                {favourites.map((f) => (
                  <Link key={f.productId} href={`/products/${f.productId}`} className="group flex flex-col gap-2 rounded-card border border-line p-3 transition-all hover:border-line-strong hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                    <ProductThumb name={localized(f, "name", locale)} seed={f.productId} src={f.image} size="fill" />
                    <span className="line-clamp-2 text-caption font-medium text-ink group-hover:text-brand-text">{localized(f, "name", locale)}</span>
                    <span className="text-caption tabular-nums text-ink-3">
                      {f.units} units · {currency(f.revenue, { decimals: 0 })}
                    </span>
                  </Link>
                ))}
              </CardBody>
            </Card>
          )}
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t("customerDetail.contact")} />
            <CardBody>
              <dl className="space-y-3 text-body-sm">
                <div>
                  <dt className="text-caption text-ink-3">Email</dt>
                  <dd>
                    <a href={`mailto:${c.email}`} className="break-all text-brand-text underline-offset-4 hover:underline">
                      {c.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-caption text-ink-3">Phone</dt>
                  <dd className="tabular-nums text-ink">{c.phone}</dd>
                </div>
                <div>
                  <dt className="text-caption text-ink-3">Customer since</dt>
                  <dd className="text-ink">{dateShort(c.joinedAt)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("customerDetail.addresses")} />
            <CardBody>
              {address ? (
                <div className="rounded-card border border-line bg-surface-2 p-3.5">
                  <div className="mb-1.5 flex items-center gap-2">
                    <Badge tone="brand" size="sm">
                      Default
                    </Badge>
                    <span className="text-caption text-ink-3">Shipping & billing</span>
                  </div>
                  <address className="not-italic text-body-sm leading-relaxed text-ink-2">
                    {address.line1}
                    <br />
                    {address.line2 && (
                      <>
                        {address.line2}
                        <br />
                      </>
                    )}
                    {address.postcode} {address.city}
                    <br />
                    {address.country}
                  </address>
                </div>
              ) : (
                <p className="text-body-sm text-ink-3">No address on file.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("customerDetail.activity")} />
            <CardBody>
              <Timeline>
                {activity.slice(0, 8).map((a, i, arr) => (
                  <TimelineItem
                    key={a.id}
                    icon={a.type === "order" ? ShoppingCart : UserPlus}
                    tone={a.type === "order" ? "info" : "success"}
                    last={i === arr.length - 1}
                    title={
                      a.href ? (
                        <Link href={a.href} className="underline-offset-4 hover:underline">
                          {a.message}
                        </Link>
                      ) : (
                        a.message
                      )
                    }
                    description={a.amount ? currency(a.amount) : null}
                    meta={relativeTime(a.at)}
                  />
                ))}
              </Timeline>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
