"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { ArrowLeft, Printer, MoreHorizontal, Mail, Copy, XCircle, Truck, PackageCheck, CreditCard, MapPin, User, Receipt, ShoppingCart, CheckCircle2, Clock, RotateCcw } from "lucide-react";
import { api } from "@/lib/api";
import { cn, currency, dateTime, dateShort, number, relativeTime, localized } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import { toast, setPageTitle } from "@/store/slices/uiSlice";

import Button from "@/components/ui/Button";
import IconButton from "@/components/ui/IconButton";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Badge, { StatusBadge, ORDER_STATUS, PAYMENT_STATUS } from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import ProductThumb from "@/components/ui/ProductThumb";
import Timeline, { TimelineItem } from "@/components/ui/Timeline";
import Dropdown, { MenuItem, MenuSeparator } from "@/components/ui/Dropdown";
import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";
import ErrorState from "@/components/ui/ErrorState";
import EmptyState from "@/components/ui/EmptyState";
import { ConfirmDialog } from "@/components/ui/Modal";

const STEP_ICONS = {
  placed: ShoppingCart,
  payment: CreditCard,
  processing: PackageCheck,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  refunded: RotateCcw,
};

function Address({ address }) {
  if (!address) return <p className="text-body-sm text-ink-3">No address on file.</p>;
  return (
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
  );
}

export default function OrderDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, locale } = useI18n();
  const [state, setState] = useState({ status: "loading", data: null });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setState({ status: "loading", data: null });
    try {
      const res = await api(`/api/orders/${id}`);
      setState({ status: "succeeded", data: res });
    } catch (e) {
      setState({ status: e.status === 404 ? "notfound" : "failed", data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (state.data?.data?.id) dispatch(setPageTitle(`Order #${state.data.data.id}`));
  }, [state.data, dispatch]);

  const changeStatus = async (next) => {
    try {
      const res = await api(`/api/orders/${id}`, { method: "PATCH", body: { status: next } });
      setState((s) => ({ ...s, data: { ...s.data, data: res.data } }));
      dispatch(toast.success("Order updated", `#${id} is now ${ORDER_STATUS[next].label.toLowerCase()}.`));
    } catch {
      dispatch(toast.error("We couldn’t update the order.", "Please try again."));
    }
  };

  if (state.status === "loading") {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-4 w-64" />
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-40" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-24 w-full rounded-card" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
          <div className="card p-6">
            <SkeletonText lines={8} />
          </div>
          <div className="card p-6">
            <SkeletonText lines={6} />
          </div>
        </div>
      </div>
    );
  }

  if (state.status === "notfound") {
    return (
      <Card>
        <EmptyState
          icon={ShoppingCart}
          title="Order not found"
          description="This order may have been removed or the link is incorrect."
          action={
            <Button as={Link} href="/orders" variant="primary">
              Back to Orders
            </Button>
          }
        />
      </Card>
    );
  }

  if (state.status === "failed") {
    return (
      <Card>
        <ErrorState title="We couldn’t load this order." description="Please try again." onRetry={load} />
      </Card>
    );
  }

  const { data: o, customer, history } = state.data;
  const terminal = ["cancelled", "refunded"].includes(o.status);

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <IconButton icon={ArrowLeft} label="Back to orders" variant="secondary" onClick={() => router.push("/orders")} className="mt-1 shrink-0" />
          <div className="min-w-0">
            <h1 className="text-h1 text-ink">
              {t("ordersPage.colId")} #{o.id}
            </h1>
            <p className="mt-1 text-body text-ink-2">
              Placed {dateTime(o.placedAt)} · {relativeTime(o.placedAt)}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge map={ORDER_STATUS} value={o.status} />
              <StatusBadge map={PAYMENT_STATUS} value={o.paymentStatus} />
              {o.couponCode && <Badge tone="brand">{o.couponCode}</Badge>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" icon={Printer} onClick={() => dispatch(toast.info("Printing is not available in this demo."))}>
            Print
          </Button>
          <Dropdown menuLabel="More order actions" trigger={<IconButton icon={MoreHorizontal} label="More order actions" variant="secondary" size="lg" />}>
            {({ close }) => (
              <>
                <MenuItem
                  icon={Mail}
                  onClick={() => {
                    close();
                    dispatch(toast.success("Confirmation resent", `Sent to ${o.customerEmail}.`));
                  }}
                >
                  Resend confirmation
                </MenuItem>
                <MenuItem
                  icon={Copy}
                  onClick={() => {
                    close();
                    navigator.clipboard?.writeText(o.id);
                    dispatch(toast.success("Order ID copied to clipboard."));
                  }}
                >
                  Copy order ID
                </MenuItem>
                <MenuSeparator />
                {!terminal && o.status !== "processing" && (
                  <MenuItem
                    icon={PackageCheck}
                    onClick={() => {
                      close();
                      changeStatus("processing");
                    }}
                  >
                    Mark as processing
                  </MenuItem>
                )}
                {!terminal && o.status !== "shipped" && (
                  <MenuItem
                    icon={Truck}
                    onClick={() => {
                      close();
                      changeStatus("shipped");
                    }}
                  >
                    Mark as shipped
                  </MenuItem>
                )}
                {!terminal && o.status !== "delivered" && (
                  <MenuItem
                    icon={CheckCircle2}
                    onClick={() => {
                      close();
                      changeStatus("delivered");
                    }}
                  >
                    Mark as delivered
                  </MenuItem>
                )}
                <MenuSeparator />
                <MenuItem
                  icon={XCircle}
                  destructive
                  disabled={terminal}
                  onClick={() => {
                    close();
                    setConfirmCancel(true);
                  }}
                >
                  Cancel order
                </MenuItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Status timeline — horizontal on desktop, vertical on mobile */}
      <Card>
        <CardHeader title="Order status" description={o.trackingNumber ? `Tracking ${o.trackingNumber}` : "Not yet dispatched"} />
        <CardBody>
          <ol className="hidden items-start md:flex">
            {o.timeline.map((step, i) => {
              const Icon = STEP_ICONS[step.key] || Clock;
              const isLast = i === o.timeline.length - 1;
              const tone = step.tone;
              return (
                <li key={step.key} className="flex flex-1 items-start last:flex-none">
                  <div className="flex min-w-0 flex-col items-center gap-2 px-1 text-center">
                    <span aria-hidden className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors", tone === "danger" ? "border-danger bg-danger text-white" : tone === "warning" ? "border-warning bg-warning text-white" : step.done ? "border-brand bg-brand text-white" : "border-line-strong bg-surface text-ink-3")}>
                      <Icon className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                    <span className={cn("text-caption font-medium", step.done ? "text-ink" : "text-ink-3")}>{step.label}</span>
                    <span className="text-[11px] leading-4 text-ink-3">{step.at ? dateShort(step.at) : "—"}</span>
                    <span className="sr-only">{step.done ? "Completed" : "Not yet reached"}</span>
                  </div>
                  {!isLast && <span aria-hidden className={cn("mt-[18px] h-0.5 min-w-6 flex-1 rounded-pill", o.timeline[i + 1]?.done ? "bg-brand" : "bg-line")} />}
                </li>
              );
            })}
          </ol>

          <Timeline className="md:hidden">
            {o.timeline.map((step, i) => (
              <TimelineItem key={step.key} icon={STEP_ICONS[step.key] || Clock} tone={step.tone === "danger" ? "danger" : step.tone === "warning" ? "warning" : step.done ? "brand" : "muted"} last={i === o.timeline.length - 1} title={step.label} meta={step.at ? dateShort(step.at) : "—"} description={step.done ? "Completed" : "Pending"} />
            ))}
          </Timeline>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: items + activity */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t("orderDetail.items")} description={`${number(o.itemCount)}`} />
            <ul>
              {o.items.map((item, i) => (
                <li key={`${item.sku}-${i}`} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0 sm:px-6">
                  <ProductThumb name={localized(item, "name", locale)} seed={item.productId || item.sku} src={item.image} size="md" />
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                      <Link href={`/products/${item.productId}`} className="block truncate text-body-sm font-medium text-ink underline-offset-4 hover:text-brand-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
                        {localized(item, "name", locale)}
                      </Link>
                    ) : (
                      <span className="block truncate text-body-sm font-medium text-ink">{item.name}</span>
                    )}
                    <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-caption text-ink-3">
                      <span className="font-mono">{item.sku}</span>
                      {item.variantLabel && (
                        <>
                          <span aria-hidden>·</span>
                          <span>{item.variantLabel}</span>
                        </>
                      )}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-body-sm tabular-nums text-ink-2">
                      {currency(item.unitPrice)} × {item.quantity}
                    </p>
                    <p className="text-body-sm font-semibold tabular-nums text-ink">{currency(item.total)}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>

          {o.note && (
            <Card>
              <CardHeader title="Customer note" />
              <CardBody>
                <p className="text-body-sm leading-relaxed text-ink-2">“{o.note}”</p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title="Activity" description="Everything that has happened to this order" />
            <CardBody>
              <Timeline>
                {[...o.timeline]
                  .filter((s) => s.done)
                  .reverse()
                  .map((step, i, arr) => (
                    <TimelineItem
                      key={step.key}
                      icon={STEP_ICONS[step.key] || Clock}
                      tone={step.tone === "danger" ? "danger" : step.tone === "warning" ? "warning" : "brand"}
                      last={i === arr.length - 1}
                      title={step.label}
                      description={step.key === "placed" ? `${o.customerName} placed the order` : step.key === "payment" ? `${currency(o.total)} charged to ${o.paymentMethod}` : step.key === "shipped" && o.trackingNumber ? `Dispatched via ${o.shippingMethod} — ${o.trackingNumber}` : "Updated by the fulfilment team"}
                      meta={step.at ? relativeTime(step.at) : ""}
                    />
                  ))}
              </Timeline>
            </CardBody>
          </Card>
        </div>

        {/* Right: summary + customer */}
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t("orderDetail.summary")} icon={Receipt} />
            <CardBody>
              <dl className="space-y-2 text-body-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t("orderDetail.subtotal")}</dt>
                  <dd className="tabular-nums text-ink">{currency(o.subtotal)}</dd>
                </div>
                {o.discount > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-2">
                      {t("orderDetail.discount")} {o.couponCode && <span className="text-caption text-brand-text">({o.couponCode})</span>}
                    </dt>
                    <dd className="tabular-nums text-success-text">−{currency(o.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t("orderDetail.shipping")}</dt>
                  <dd className="tabular-nums text-ink">{o.shipping === 0 ? <span className="text-success-text">Free</span> : currency(o.shipping)}</dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t("orderDetail.tax")}</dt>
                  <dd className="tabular-nums text-ink">{currency(o.tax)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                  <dt className="text-h4 text-ink">{t("orderDetail.total")}</dt>
                  <dd className="text-h2 tabular-nums text-ink">{currency(o.total)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t("orderDetail.customer")}
              action={
                <Button as={Link} href={`/customers/${o.customerId}`} variant="ghost" size="sm">
                  View profile
                </Button>
              }
            />
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={o.customerName} size="lg" tone={customer?.avatarTone || "neutral"} />
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold text-ink">{o.customerName}</p>
                  <a href={`mailto:${o.customerEmail}`} className="block truncate text-caption text-brand-text underline-offset-4 hover:underline">
                    {o.customerEmail}
                  </a>
                </div>
              </div>
              {customer && (
                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-body-sm">
                  <div>
                    <dt className="text-caption text-ink-3">Total orders</dt>
                    <dd className="font-semibold tabular-nums text-ink">{number(customer.orders)}</dd>
                  </div>
                  <div>
                    <dt className="text-caption text-ink-3">Total spent</dt>
                    <dd className="font-semibold tabular-nums text-ink">{currency(customer.totalSpent, { decimals: 0 })}</dd>
                  </div>
                </dl>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("orderDetail.shipping")} icon={MapPin} />
            <CardBody className="flex flex-col gap-3">
              <Address address={o.shippingAddress} />
              <div className="border-t border-line pt-3">
                <p className="text-caption text-ink-3">Method</p>
                <p className="text-body-sm font-medium text-ink">{o.shippingMethod}</p>
                {o.trackingNumber && <p className="mt-1 font-mono text-caption text-ink-2">{o.trackingNumber}</p>}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t("orderDetail.payment")} icon={CreditCard} />
            <CardBody>
              <dl className="space-y-2 text-body-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">Method</dt>
                  <dd className="font-medium text-ink">{o.paymentMethod}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-2">Status</dt>
                  <dd>
                    <StatusBadge map={PAYMENT_STATUS} value={o.paymentStatus} size="sm" />
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">Amount</dt>
                  <dd className="font-semibold tabular-nums text-ink">{currency(o.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-line pt-3 text-caption leading-relaxed text-ink-3">Payment details are illustrative. No real transactions are processed in this demo.</p>
            </CardBody>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader title="Other orders" description={`From ${o.customerName}`} />
              <ul>
                {history.map((h) => (
                  <li key={h.id}>
                    <Link href={`/orders/${h.id}`} className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 text-body-sm transition-colors last:border-0 hover:bg-surface-2 sm:px-6">
                      <span className="font-mono text-caption text-ink-2">#{h.id}</span>
                      <span className="text-caption text-ink-3">{dateShort(h.placedAt)}</span>
                      <span className="font-medium tabular-nums text-ink">{currency(h.total)}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </aside>
      </div>

      <ConfirmDialog
        open={confirmCancel}
        onClose={() => setConfirmCancel(false)}
        onConfirm={async () => {
          setCancelling(true);
          await changeStatus("cancelled");
          setCancelling(false);
          setConfirmCancel(false);
        }}
        loading={cancelling}
        title="Cancel order?"
        message={`Are you sure you want to cancel order #${o.id}? The customer will be notified and any payment will be voided. This action cannot be undone.`}
        confirmLabel="Cancel order"
        cancelLabel="Keep order"
      />
    </div>
  );
}
