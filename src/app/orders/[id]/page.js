'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  ArrowLeft, Printer, MoreHorizontal, Mail, Copy, XCircle, Truck, PackageCheck,
  CreditCard, MapPin, Receipt, ShoppingCart, CheckCircle2, Clock, RotateCcw,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, currency, dateTime, dateShort, number, relativeTime, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { toast, setPageTitle } from '@/store/slices/uiSlice';

import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge, { StatusBadge, ORDER_STATUS, PAYMENT_STATUS } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import ProductThumb from '@/components/ui/ProductThumb';
import Timeline, { TimelineItem } from '@/components/ui/Timeline';
import Dropdown, { MenuItem, MenuSeparator } from '@/components/ui/Dropdown';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import { ConfirmDialog } from '@/components/ui/Modal';

const STEP_ICONS = {
  placed: ShoppingCart,
  payment: CreditCard,
  processing: PackageCheck,
  shipped: Truck,
  delivered: CheckCircle2,
  cancelled: XCircle,
  refunded: RotateCcw,
};

const STEP_KEYS = {
  placed: 'orderDetail.stepPlaced',
  payment: 'orderDetail.stepPayment',
  processing: 'status.processing',
  shipped: 'status.shipped',
  delivered: 'status.delivered',
  cancelled: 'status.cancelled',
  refunded: 'status.refunded',
};

const METHOD_KEYS = {
  'standard shipping': 'settingsPages.std',
  'express shipping': 'settingsPages.exp',
  'international': 'settingsPages.intl',
  'local pickup': 'settingsPages.pickup',
  'free': 'orderDetail.free',
  'credit card': 'orderDetail.payCard',
  'debit card': 'orderDetail.payDebit',
  'paypal': 'orderDetail.payPaypal',
  'apple pay': 'orderDetail.payApple',
  'google pay': 'orderDetail.payGoogle',
  'bank transfer': 'orderDetail.payBank',
  'cash on delivery': 'orderDetail.payCod',
  'stripe': 'orderDetail.payStripe',
  'visa': 'orderDetail.payCard',
  'mastercard': 'orderDetail.payCard',
};

function stepTitle(t, step) {
  const key = STEP_KEYS[step.key];
  return key ? t(key) : (step.label || step.key);
}

function methodLabel(t, value) {
  if (!value) return '—';
  const key = METHOD_KEYS[String(value).trim().toLowerCase()];
  return key ? t(key) : value;
}

function fallbackTimeline(order) {
  const status = order.status;
  if (status === 'cancelled' || status === 'refunded') {
    return [
      { key: 'placed', done: true, at: order.placedAt },
      { key: status, done: true, at: order.placedAt, tone: 'danger' },
    ];
  }
  const seq = ['placed', 'payment', 'processing', 'shipped', 'delivered'];
  const idx = seq.indexOf(status);
  return seq.map((key, i) => ({
    key,
    done: idx >= 0 ? i <= idx : key === 'placed',
    at: i === 0 ? order.placedAt : null,
  }));
}

function Address({ address, empty }) {
  if (!address) return <p className="text-body-sm text-ink-3">{empty}</p>;
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
  const [state, setState] = useState({ status: 'loading', data: null });
  const [confirmCancel, setConfirmCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null });
    try {
      const res = await api(`/api/orders/${id}`);
      setState({ status: 'succeeded', data: res });
    } catch (e) {
      setState({ status: e.status === 404 ? 'notfound' : 'failed', data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (state.data?.data?.id) dispatch(setPageTitle(t('orderDetail.title', { id: state.data.data.id })));
  }, [state.data, dispatch, t]);

  const changeStatus = async (next) => {
    try {
      const res = await api(`/api/orders/${id}`, { method: 'PATCH', body: { status: next } });
      setState((s) => ({ ...s, data: { ...s.data, data: res.data } }));
      dispatch(toast.success(t('toast.orderUpdated'), t('toast.orderNow', { id, status: t(`status.${next}`) })));
    } catch {
      dispatch(toast.error(t('toast.orderUpdateError'), t('common.tryAgain')));
    }
  };

  if (state.status === 'loading') {
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
          <div className="card p-6"><SkeletonText lines={8} /></div>
          <div className="card p-6"><SkeletonText lines={6} /></div>
        </div>
      </div>
    );
  }

  if (state.status === 'notfound') {
    return (
      <Card>
        <EmptyState
          icon={ShoppingCart}
          title={t('orderDetail.notFound')}
          description={t('orderDetail.notFoundHint')}
          action={<Button as={Link} href="/orders" variant="primary">{t('orderDetail.back')}</Button>}
        />
      </Card>
    );
  }

  if (state.status === 'failed') {
    return (
      <Card>
        <ErrorState title={t('orderDetail.loadError')} description={t('common.tryAgain')} onRetry={load} />
      </Card>
    );
  }

  const { data: o, customer, history } = state.data;
  const timeline = Array.isArray(o.timeline) && o.timeline.length ? o.timeline : fallbackTimeline(o);
  const terminal = ['cancelled', 'refunded'].includes(o.status);
  const payMethod = methodLabel(t, o.paymentMethod);
  const shipMethod = methodLabel(t, o.shippingMethod);
  const itemsLabel = o.itemCount === 1
    ? t('orderDetail.itemsCountOne')
    : t('orderDetail.itemsCount', { n: number(o.itemCount) });

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <IconButton
            icon={ArrowLeft}
            label={t('orderDetail.back')}
            variant="secondary"
            onClick={() => router.push('/orders')}
            className="mt-1 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-h1 text-ink">{t('orderDetail.title', { id: o.id })}</h1>
            <p className="mt-1 text-body text-ink-2">
              {t('orderDetail.placedAt', { date: dateTime(o.placedAt), relative: relativeTime(o.placedAt) })}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <StatusBadge map={ORDER_STATUS} value={o.status} />
              <StatusBadge map={PAYMENT_STATUS} value={o.paymentStatus} />
              {o.couponCode && <Badge tone="brand">{o.couponCode}</Badge>}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" icon={Printer} onClick={() => dispatch(toast.info(t('toast.printDemo')))}>
            {t('common.print')}
          </Button>
          <Dropdown
            menuLabel={t('orderDetail.moreActions')}
            trigger={<IconButton icon={MoreHorizontal} label={t('orderDetail.moreActions')} variant="secondary" size="lg" />}
          >
            {({ close }) => (
              <>
                <MenuItem icon={Mail} onClick={() => { close(); dispatch(toast.success(t('toast.confirmResent'), t('toast.confirmResentHint', { email: o.customerEmail }))); }}>
                  {t('orderDetail.resendConfirm')}
                </MenuItem>
                <MenuItem
                  icon={Copy}
                  onClick={() => {
                    close();
                    navigator.clipboard?.writeText(o.id);
                    dispatch(toast.success(t('toast.copiedId')));
                  }}
                >
                  {t('orderDetail.copyId')}
                </MenuItem>
                <MenuSeparator />
                {!terminal && o.status !== 'processing' && (
                  <MenuItem icon={PackageCheck} onClick={() => { close(); changeStatus('processing'); }}>
                    {t('ordersPage.markProcessing')}
                  </MenuItem>
                )}
                {!terminal && o.status !== 'shipped' && (
                  <MenuItem icon={Truck} onClick={() => { close(); changeStatus('shipped'); }}>
                    {t('ordersPage.markShipped')}
                  </MenuItem>
                )}
                {!terminal && o.status !== 'delivered' && (
                  <MenuItem icon={CheckCircle2} onClick={() => { close(); changeStatus('delivered'); }}>
                    {t('ordersPage.markDelivered')}
                  </MenuItem>
                )}
                <MenuSeparator />
                <MenuItem icon={XCircle} destructive disabled={terminal} onClick={() => { close(); setConfirmCancel(true); }}>
                  {t('ordersPage.cancelOrder')}
                </MenuItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {/* Status timeline — horizontal on desktop, vertical on mobile */}
      <Card>
        <CardHeader
          title={t('orderDetail.status')}
          description={o.trackingNumber ? t('orderDetail.tracking', { n: o.trackingNumber }) : t('orderDetail.notDispatched')}
        />
        <CardBody>
          <ol className="hidden items-start md:flex">
            {timeline.map((step, i) => {
              const Icon = STEP_ICONS[step.key] || Clock;
              const isLast = i === timeline.length - 1;
              const tone = step.tone;
              return (
                <li key={step.key} className="flex flex-1 items-start last:flex-none">
                  <div className="flex min-w-0 flex-col items-center gap-2 px-1 text-center">
                    <span
                      aria-hidden
                      className={cn(
                        'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                        tone === 'danger'
                          ? 'border-danger bg-danger text-white'
                          : tone === 'warning'
                          ? 'border-warning bg-warning text-white'
                          : step.done
                          ? 'border-brand bg-brand text-white'
                          : 'border-line-strong bg-surface text-ink-3'
                      )}
                    >
                      <Icon className="h-4 w-4" strokeWidth={2.4} />
                    </span>
                    <span className={cn('text-caption font-medium', step.done ? 'text-ink' : 'text-ink-3')}>
                      {stepTitle(t, step)}
                    </span>
                    <span className="text-[11px] leading-4 text-ink-3">
                      {step.at ? dateShort(step.at) : '—'}
                    </span>
                    <span className="sr-only">{step.done ? t('orderDetail.completed') : t('orderDetail.notReached')}</span>
                  </div>
                  {!isLast && (
                    <span
                      aria-hidden
                      className={cn(
                        'mt-[18px] h-0.5 min-w-6 flex-1 rounded-pill',
                        timeline[i + 1]?.done ? 'bg-brand' : 'bg-line'
                      )}
                    />
                  )}
                </li>
              );
            })}
          </ol>

          <Timeline className="md:hidden">
            {timeline.map((step, i) => (
              <TimelineItem
                key={step.key}
                icon={STEP_ICONS[step.key] || Clock}
                tone={step.tone === 'danger' ? 'danger' : step.tone === 'warning' ? 'warning' : step.done ? 'brand' : 'muted'}
                last={i === timeline.length - 1}
                title={stepTitle(t, step)}
                meta={step.at ? dateShort(step.at) : '—'}
                description={step.done ? t('orderDetail.completed') : t('status.pending')}
              />
            ))}
          </Timeline>
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Left: items + activity */}
        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t('orderDetail.items')} description={itemsLabel} />
            <ul>
              {o.items.map((item, i) => (
                <li key={`${item.sku}-${i}`} className="flex items-center gap-3 border-b border-line px-5 py-4 last:border-0 sm:px-6">
                  <ProductThumb name={localized(item, 'name', locale)} seed={item.productId || item.sku} src={item.image} size="md" />
                  <div className="min-w-0 flex-1">
                    {item.productId ? (
                    <Link
                      href={`/products/${item.productId}`}
                      className="block truncate text-body-sm font-medium text-ink underline-offset-4 hover:text-brand-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                    >
                      {localized(item, 'name', locale)}
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
              <CardHeader title={t('orderDetail.customerNote')} />
              <CardBody>
                <p className="text-body-sm leading-relaxed text-ink-2">“{o.note}”</p>
              </CardBody>
            </Card>
          )}

          <Card>
            <CardHeader title={t('orderDetail.activity')} description={t('orderDetail.activityHint')} />
            <CardBody>
              <Timeline>
                {[...o.timeline].filter((s) => s.done).reverse().map((step, i, arr) => (
                  <TimelineItem
                    key={step.key}
                    icon={STEP_ICONS[step.key] || Clock}
                    tone={step.tone === 'danger' ? 'danger' : step.tone === 'warning' ? 'warning' : 'brand'}
                    last={i === arr.length - 1}
                    title={stepTitle(t, step)}
                    description={
                      step.key === 'placed'
                        ? t('orderDetail.placedBy', { name: o.customerName })
                        : step.key === 'payment'
                        ? t('orderDetail.chargedTo', { amount: currency(o.total), method: payMethod })
                        : step.key === 'shipped' && o.trackingNumber
                        ? t('orderDetail.dispatchedVia', { method: shipMethod, tracking: o.trackingNumber })
                        : t('orderDetail.updatedByTeam')
                    }
                    meta={step.at ? relativeTime(step.at) : ''}
                  />
                ))}
              </Timeline>
            </CardBody>
          </Card>
        </div>

        {/* Right: summary + customer */}
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t('orderDetail.summary')} icon={Receipt} />
            <CardBody>
              <dl className="space-y-2 text-body-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t('orderDetail.subtotal')}</dt>
                  <dd className="tabular-nums text-ink">{currency(o.subtotal)}</dd>
                </div>
                {o.discount > 0 && (
                  <div className="flex justify-between gap-3">
                    <dt className="text-ink-2">
                      {t('orderDetail.discount')} {o.couponCode && <span className="text-caption text-brand-text">({o.couponCode})</span>}
                    </dt>
                    <dd className="tabular-nums text-success-text">−{currency(o.discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t('orderDetail.shipping')}</dt>
                  <dd className="tabular-nums text-ink">
                    {o.shipping === 0 ? <span className="text-success-text">{t('orderDetail.free')}</span> : currency(o.shipping)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t('orderDetail.tax')}</dt>
                  <dd className="tabular-nums text-ink">{currency(o.tax)}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-3 border-t border-line pt-3">
                  <dt className="text-h4 text-ink">{t('orderDetail.total')}</dt>
                  <dd className="text-h2 tabular-nums text-ink">{currency(o.total)}</dd>
                </div>
              </dl>
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title={t('orderDetail.customer')}
              action={
                <Button as={Link} href={`/customers/${o.customerId}`} variant="ghost" size="sm">
                  {t('common.viewProfile')}
                </Button>
              }
            />
            <CardBody className="flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <Avatar name={o.customerName} size="lg" tone={customer?.avatarTone || 'neutral'} />
                <div className="min-w-0">
                  <p className="truncate text-body-sm font-semibold text-ink">{o.customerName}</p>
                  <a
                    href={`mailto:${o.customerEmail}`}
                    className="block truncate text-caption text-brand-text underline-offset-4 hover:underline"
                  >
                    {o.customerEmail}
                  </a>
                </div>
              </div>
              {customer && (
                <dl className="grid grid-cols-2 gap-3 border-t border-line pt-3 text-body-sm">
                  <div>
                    <dt className="text-caption text-ink-3">{t('customerDetail.totalOrders')}</dt>
                    <dd className="font-semibold tabular-nums text-ink">{number(customer.orders)}</dd>
                  </div>
                  <div>
                    <dt className="text-caption text-ink-3">{t('customerDetail.totalSpent')}</dt>
                    <dd className="font-semibold tabular-nums text-ink">{currency(customer.totalSpent, { decimals: 0 })}</dd>
                  </div>
                </dl>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('orderDetail.shipping')} icon={MapPin} />
            <CardBody className="flex flex-col gap-3">
              <Address address={o.shippingAddress} empty={t('orderDetail.noAddress')} />
              <div className="border-t border-line pt-3">
                <p className="text-caption text-ink-3">{t('orderDetail.method')}</p>
                <p className="text-body-sm font-medium text-ink">{shipMethod}</p>
                {o.trackingNumber && (
                  <p className="mt-1 font-mono text-caption text-ink-2">{o.trackingNumber}</p>
                )}
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('orderDetail.payment')} icon={CreditCard} />
            <CardBody>
              <dl className="space-y-2 text-body-sm">
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t('orderDetail.method')}</dt>
                  <dd className="font-medium text-ink">{payMethod}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-2">{t('form.status')}</dt>
                  <dd><StatusBadge map={PAYMENT_STATUS} value={o.paymentStatus} size="sm" /></dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt className="text-ink-2">{t('orderDetail.amount')}</dt>
                  <dd className="font-semibold tabular-nums text-ink">{currency(o.total)}</dd>
                </div>
              </dl>
              <p className="mt-3 border-t border-line pt-3 text-caption leading-relaxed text-ink-3">
                {t('orderDetail.paymentHint')}
              </p>
            </CardBody>
          </Card>

          {history.length > 0 && (
            <Card>
              <CardHeader title={t('orderDetail.otherOrders')} description={t('orderDetail.otherFrom', { name: o.customerName })} />
              <ul>
                {history.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/orders/${h.id}`}
                      className="flex items-center justify-between gap-3 border-b border-line px-5 py-2.5 text-body-sm transition-colors last:border-0 hover:bg-surface-2 sm:px-6"
                    >
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
          await changeStatus('cancelled');
          setCancelling(false);
          setConfirmCancel(false);
        }}
        loading={cancelling}
        title={t('confirm.cancelOrder')}
        message={t('confirm.cancelOrderMsg', { id: o.id })}
        confirmLabel={t('orderDetail.cancelConfirm')}
        cancelLabel={t('confirm.keepOrder')}
      />
    </div>
  );
}
