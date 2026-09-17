'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  ArrowLeft, Pencil, Copy, Archive, Trash2, MoreHorizontal, ExternalLink,
  DollarSign, Boxes, Layers, FileText, Search as SearchIcon, Star, History,
  TrendingUp, Package, AlertTriangle, Plus, Minus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, currency, dateShort, dateTime, number, relativeTime, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { toast, setPageTitle } from '@/store/slices/uiSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';

import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Badge, { StatusBadge, PRODUCT_STATUS, STOCK_STATUS, REVIEW_STATUS } from '@/components/ui/Badge';
import Dropdown, { MenuItem, MenuSeparator } from '@/components/ui/Dropdown';
import Skeleton, { SkeletonText } from '@/components/ui/Skeleton';
import ErrorState from '@/components/ui/ErrorState';
import EmptyState from '@/components/ui/EmptyState';
import Accordion from '@/components/ui/Accordion';
import Rating from '@/components/ui/Rating';
import Avatar from '@/components/ui/Avatar';
import Timeline, { TimelineItem } from '@/components/ui/Timeline';
import { ConfirmDialog } from '@/components/ui/Modal';
import ProductThumb from '@/components/ui/ProductThumb';
import ProductGallery from '@/components/products/ProductGallery';
import ProductVariants from '@/components/products/ProductVariants';

const ACTIVITY_ICONS = {
  created: Plus,
  published: Package,
  price: DollarSign,
  stock: Boxes,
  alert: AlertTriangle,
  edit: Pencil,
};
const ACTIVITY_TONES = {
  created: 'success',
  published: 'brand',
  price: 'info',
  stock: 'muted',
  alert: 'warning',
  edit: 'muted',
};

function DetailRow({ label, children, className }) {
  return (
    <div className={cn('flex items-baseline justify-between gap-4 py-2', className)}>
      <dt className="shrink-0 text-body-sm text-ink-2">{label}</dt>
      <dd className="min-w-0 text-right text-body-sm font-medium text-ink">{children}</dd>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-5">
      <Skeleton className="h-4 w-64" />
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-8 w-80" />
          <Skeleton className="h-4 w-48" />
        </div>
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Skeleton className="aspect-square w-full rounded-card-lg" />
        <div className="card space-y-4 p-6">
          <SkeletonText lines={6} />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}

export default function ProductDetailsPage() {
  const { id } = useParams();
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, locale } = useI18n();
  const categories = useSelector((s) => s.categories.all);

  const [state, setState] = useState({ status: 'loading', data: null });
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = useCallback(async () => {
    setState({ status: 'loading', data: null });
    try {
      const res = await api(`/api/products/${id}`);
      setState({ status: 'succeeded', data: res });
    } catch (e) {
      setState({ status: e.status === 404 ? 'notfound' : 'failed', data: null });
    }
  }, [id]);

  useEffect(() => {
    load();
    dispatch(fetchCategories());
  }, [load, dispatch]);

  useEffect(() => {
    if (state.data?.data) dispatch(setPageTitle(localized(state.data.data, 'name', locale)));
  }, [state.data, dispatch]);

  if (state.status === 'loading') return <LoadingSkeleton />;

  if (state.status === 'notfound') {
    return (
      <Card>
        <EmptyState
          icon={Package}
          title={t('productDetail.notFound')}
          description="This product may have been deleted or the link is incorrect."
          action={
            <Button as={Link} href="/products" variant="primary">
              {t('productDetail.backToProducts')}
            </Button>
          }
        />
      </Card>
    );
  }

  if (state.status === 'failed') {
    return (
      <Card>
        <ErrorState
          title="We couldn’t load this product."
          description="Please try again."
          onRetry={load}
        />
      </Card>
    );
  }

  const { data: p, activity, reviews, ratingBreakdown, related } = state.data;
  const category = categories.find((c) => c.id === p.categoryId);
  const margin = p.price > 0 ? ((p.price - p.cost) / p.price) * 100 : 0;
  const totalReviews = ratingBreakdown.reduce((s, r) => s + r.count, 0);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api(`/api/products/${p.id}`, { method: 'DELETE' });
      dispatch(toast.success(t('toast.productDeleted'), t('toast.productDeletedHint', { name: p.name })));
      router.push('/products');
    } catch {
      dispatch(toast.error(t('toast.productDeleteError'), t('common.tryAgain')));
      setDeleting(false);
    }
  };

  const duplicate = async () => {
    try {
      const res = await api(`/api/products/${p.id}`, { method: 'POST' });
      dispatch(toast.success(t('toast.productDuplicated'), t('toast.productDuplicatedHint', { name: res.data.name })));
      router.push(`/products/${res.data.id}`);
    } catch {
      dispatch(toast.error(t('toast.productDuplicateError')));
    }
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Title bar */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <IconButton
            icon={ArrowLeft}
            label="Back to products"
            variant="secondary"
            onClick={() => router.push('/products')}
            className="mt-1 shrink-0"
          />
          <div className="min-w-0">
            <h1 className="text-h1 text-ink">{localized(p, 'name', locale)}</h1>
            <div className="mt-1.5 flex flex-wrap items-center gap-2">
              <StatusBadge map={PRODUCT_STATUS} value={p.status} />
              <StatusBadge map={STOCK_STATUS} value={p.stockStatus} />
              <span className="font-mono text-caption text-ink-3">{p.sku}</span>
              <span aria-hidden className="text-ink-3">·</span>
              <span className="text-caption text-ink-3">Updated {relativeTime(`${p.updatedAt}T12:00:00Z`)}</span>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button as={Link} href={`/products/${p.id}/edit`} variant="primary" icon={Pencil}>
            {t('productDetail.edit')}
          </Button>
          <Dropdown
            menuLabel="More product actions"
            trigger={<IconButton icon={MoreHorizontal} label="More product actions" variant="secondary" size="lg" />}
          >
            {({ close }) => (
              <>
                <MenuItem icon={ExternalLink} onClick={close}>
                  {t('form.storefront')}
                </MenuItem>
                <MenuItem icon={Copy} onClick={() => { close(); duplicate(); }}>
                  {t('form.duplicate')}
                </MenuItem>
                <MenuSeparator />
                <MenuItem icon={Archive} onClick={close}>
                  {p.status === 'archived' ? t('form.restore') : t('form.archive')}
                </MenuItem>
                <MenuItem icon={Trash2} destructive onClick={() => { close(); setConfirmDelete(true); }}>
                  {t('common.delete')}
                </MenuItem>
              </>
            )}
          </Dropdown>
        </div>
      </div>

      {p.stockStatus !== 'in_stock' && (
        <div
          role="status"
          className={cn(
            'flex items-start gap-3 rounded-card border p-3.5',
            p.stock === 0 ? 'border-danger/25 bg-danger-soft' : 'border-warning/25 bg-warning-soft'
          )}
        >
          <AlertTriangle
            aria-hidden
            className={cn('mt-0.5 h-4 w-4 shrink-0', p.stock === 0 ? 'text-danger' : 'text-warning')}
          />
          <div className="min-w-0 flex-1">
            <p className={cn('text-body-sm font-semibold', p.stock === 0 ? 'text-danger-text' : 'text-warning-text')}>
              {p.stock === 0 ? t('form.outOfStock') : t('form.runningLow')}
            </p>
            <p className="mt-0.5 text-body-sm text-ink-2">
              {p.stock === 0
                ? 'Customers can’t buy it until you restock. Update the quantity in Inventory.'
                : `${p.stock} units remain, at or below the reorder threshold of ${p.threshold}.`}
            </p>
          </div>
          <Button as={Link} href="/inventory" size="sm" variant="secondary" className="shrink-0">
            {t('form.manageStock')}
          </Button>
        </div>
      )}

      {/* Overview: gallery + information */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)]">
        <Card padded className="self-start">
          <ProductGallery productId={p.id} name={localized(p, 'name', locale)} images={p.images} />
        </Card>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t('productDetail.information')} />
            <CardBody>
              <dl className="divide-y divide-line">
                <DetailRow label={t('form.name')}>{localized(p, 'name', locale)}</DetailRow>
                <DetailRow label={t('form.sku')}>
                  <span className="font-mono text-caption">{p.sku}</span>
                </DetailRow>
                <DetailRow label={t('form.category')}>
                  {category ? (
                    <Link href="/categories" className="text-brand-text underline-offset-4 hover:underline">
                      {localized(category, 'name', locale)}
                    </Link>
                  ) : (
                    t('form.uncategorised')
                  )}
                </DetailRow>
                <DetailRow label={t('form.brand')}>{p.brand}</DetailRow>
                <DetailRow label={t('form.supplier')}>{p.supplier}</DetailRow>
                <DetailRow label={t('form.status')}>
                  <StatusBadge map={PRODUCT_STATUS} value={p.status} />
                </DetailRow>
                <DetailRow label={t('form.created')}>{dateShort(p.createdAt)}</DetailRow>
                <DetailRow label={t('form.tags')}>
                  <span className="flex flex-wrap justify-end gap-1">
                    {p.tags.length ? (
                      p.tags.map((t) => (
                        <Badge key={t} tone="outline" size="sm">
                          {t}
                        </Badge>
                      ))
                    ) : (
                      <span className="text-ink-3">{t('form.none')}</span>
                    )}
                  </span>
                </DetailRow>
              </dl>
            </CardBody>
          </Card>

          {/* Pricing + Inventory side by side */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card>
              <CardHeader title={t('productDetail.pricing')} />
              <CardBody>
                <p className="text-[26px] font-bold leading-8 tabular-nums text-ink">{currency(p.price)}</p>
                {p.compareAt && (
                  <p className="mt-1 flex items-center gap-2 text-body-sm">
                    <span className="text-ink-3 line-through tabular-nums">{currency(p.compareAt)}</span>
                    <Badge tone="brand" size="sm">
                      {Math.round((1 - p.price / p.compareAt) * 100)}% off
                    </Badge>
                  </p>
                )}
                <dl className="mt-4 divide-y divide-line border-t border-line">
                  <DetailRow label={t('form.cost')}>{currency(p.cost)}</DetailRow>
                  <DetailRow label={t('form.profit')}>{currency(p.price - p.cost)}</DetailRow>
                  <DetailRow label={t('form.margin')}>
                    <span className={margin > 50 ? 'text-success-text' : 'text-ink'}>{margin.toFixed(1)}%</span>
                  </DetailRow>
                  <DetailRow label={t('form.tax')}>{t('form.taxStandard')}</DetailRow>
                </dl>
              </CardBody>
            </Card>

            <Card>
              <CardHeader title={t('productDetail.inventory')} />
              <CardBody>
                <p className="text-[26px] font-bold leading-8 tabular-nums text-ink">{number(p.stock)}</p>
                <p className="mt-1 text-body-sm text-ink-2">{t('form.unitsAvailable')}</p>
                <dl className="mt-4 divide-y divide-line border-t border-line">
                  <DetailRow label={t('form.reserved')}>{number(p.reserved || 0)}</DetailRow>
                  <DetailRow label={t('form.onHand')}>{number(p.stock + (p.reserved || 0))}</DetailRow>
                  <DetailRow label={t('form.threshold')}>{number(p.threshold)}</DetailRow>
                  <DetailRow label={t('form.status')}>
                    <StatusBadge map={STOCK_STATUS} value={p.stockStatus} />
                  </DetailRow>
                </dl>
              </CardBody>
            </Card>
          </div>
        </div>
      </div>

      {/* Variants */}
      <Card>
        <CardHeader
          title={t('form.variants')}
          description={`${p.variants.length} option${p.variants.length === 1 ? '' : 's'} across size and colour`}
          action={
            <Button as={Link} href={`/products/${p.id}/edit`} variant="ghost" size="sm" icon={Layers}>
              {t('form.manageVariants')}
            </Button>
          }
        />
        <ProductVariants variants={p.variants} basePrice={p.price} threshold={Math.ceil(p.threshold / p.variants.length) || 3} />
      </Card>

      {/* Description + SEO */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader title={t('productDetail.description')} />
          <CardBody>
            <p className="text-body leading-relaxed text-ink-2">{localized(p, 'description', locale) || p.description}</p>
          </CardBody>
        </Card>

        <div className="flex flex-col gap-4">
          <Accordion title="SEO" description="How this product appears in search results" icon={SearchIcon} id="seo">
            {/* SERP preview makes the abstract fields concrete */}
            <div className="rounded-card border border-line bg-surface-2 p-4">
              <p className="truncate text-caption text-success-text">
                nexora.com › products › {p.slug}
              </p>
              <p className="mt-1 truncate text-body-lg text-info-text">{p.seoTitle}</p>
              <p className="mt-1 line-clamp-2 text-body-sm text-ink-2">{p.metaDescription}</p>
            </div>
            <dl className="mt-4 divide-y divide-line">
              <DetailRow label="SEO title">{p.seoTitle}</DetailRow>
              <DetailRow label="URL slug">
                <span className="font-mono text-caption">{p.slug}</span>
              </DetailRow>
              <DetailRow label="Meta description">
                <span className="text-caption font-normal text-ink-2">{p.metaDescription}</span>
              </DetailRow>
            </dl>
          </Accordion>

          <Card>
            <CardHeader title="Performance" />
            <CardBody className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-caption text-ink-2">{t('form.rating')}</p>
                <div className="mt-1">
                  <Rating value={p.rating} count={p.reviewCount} size="md" />
                </div>
              </div>
              <div>
                <p className="text-caption text-ink-2">{t('form.margin')}</p>
                <p className="mt-1 flex items-center gap-1.5 text-h3 tabular-nums text-ink">
                  <TrendingUp aria-hidden className="h-4 w-4 text-success" />
                  {margin.toFixed(0)}%
                </p>
              </div>
            </CardBody>
          </Card>
        </div>
      </div>

      {/* Reviews + Activity */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader
            title={t('productDetail.reviews')}
            description={`${number(p.reviewCount)} customer reviews`}
            action={
              <Button as={Link} href="/reviews" variant="ghost" size="sm">
                {t('form.moderate')}
              </Button>
            }
          />
          <CardBody className="border-b border-line">
            <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
              <div className="shrink-0 text-center sm:w-32">
                <p className="text-display leading-10 tabular-nums text-ink">{p.rating.toFixed(1)}</p>
                <Rating value={p.rating} showValue={false} size="md" className="mt-1 justify-center" />
                <p className="mt-1 text-caption text-ink-3">{number(p.reviewCount)} reviews</p>
              </div>
              <ul className="min-w-0 flex-1 space-y-1.5">
                {ratingBreakdown.map((row) => {
                  const pct = totalReviews ? (row.count / totalReviews) * 100 : 0;
                  return (
                    <li key={row.star} className="flex items-center gap-2.5 text-caption">
                      <span className="w-8 shrink-0 tabular-nums text-ink-2">{row.star} ★</span>
                      <span className="h-1.5 flex-1 overflow-hidden rounded-pill bg-surface-3">
                        <span className="block h-full rounded-pill bg-warning" style={{ width: `${pct}%` }} />
                      </span>
                      <span className="w-6 shrink-0 text-right tabular-nums text-ink-3">{row.count}</span>
                    </li>
                  );
                })}
              </ul>
            </div>
          </CardBody>

          {reviews.length === 0 ? (
            <EmptyState compact icon={Star} title="No reviews yet" description="Reviews appear here once customers leave feedback." />
          ) : (
            <ul>
              {reviews.slice(0, 4).map((r) => (
                <li key={r.id} className="border-b border-line px-5 py-4 last:border-0 sm:px-6">
                  <div className="flex items-start gap-3">
                    <Avatar name={r.customerName} size="md" tone="neutral" />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-body-sm font-medium text-ink">{r.customerName}</span>
                        {r.verified && <Badge tone="success" size="sm">Verified</Badge>}
                        <StatusBadge map={REVIEW_STATUS} value={r.status} size="sm" />
                        <span className="ml-auto text-caption text-ink-3">{relativeTime(r.createdAt)}</span>
                      </div>
                      <Rating value={r.rating} showValue={false} className="mt-1.5" />
                      <p className="mt-1.5 text-body-sm font-medium text-ink">{r.title}</p>
                      <p className="mt-0.5 text-body-sm leading-relaxed text-ink-2">{r.body}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title={t('productDetail.activity')} />
          <CardBody>
            <Timeline>
              {activity.map((a, i) => (
                <TimelineItem
                  key={`${a.type}-${i}`}
                  icon={ACTIVITY_ICONS[a.type] || History}
                  tone={ACTIVITY_TONES[a.type] || 'muted'}
                  last={i === activity.length - 1}
                  title={a.message}
                  description={`by ${a.actor}`}
                  meta={relativeTime(a.at)}
                />
              ))}
            </Timeline>
          </CardBody>
        </Card>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <Card>
          <CardHeader title={t('productDetail.moreInCategory')} description={category ? localized(category, 'name', locale) : ''} />
          <CardBody className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((r) => (
              <Link
                key={r.id}
                href={`/products/${r.id}`}
                className="group flex flex-col gap-2 rounded-card border border-line p-3 transition-all hover:border-line-strong hover:shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <ProductThumb name={localized(r, 'name', locale)} seed={r.id} src={r.image} size="fill" />
                <span className="line-clamp-2 text-body-sm font-medium text-ink group-hover:text-brand-text">
                  {localized(r, 'name', locale)}
                </span>
                <span className="flex items-center justify-between gap-2">
                  <span className="text-body-sm font-semibold tabular-nums text-ink">{currency(r.price)}</span>
                  <StatusBadge map={STOCK_STATUS} value={r.stockStatus} size="sm" />
                </span>
              </Link>
            ))}
          </CardBody>
        </Card>
      )}

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={doDelete}
        loading={deleting}
        title={t('confirm.deleteProduct')}
        message={t('confirm.deleteProductMsg', { name: localized(p, 'name', locale) })}
        confirmLabel={t('products.deleteConfirm')}
      />
    </div>
  );
}
