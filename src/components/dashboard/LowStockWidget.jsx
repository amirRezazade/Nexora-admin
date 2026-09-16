'use client';

import Link from 'next/link';
import { ArrowUpRight, PackageCheck } from 'lucide-react';
import { cn, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import Card, { CardHeader } from '@/components/ui/Card';
import ProductThumb from '@/components/ui/ProductThumb';
import Button from '@/components/ui/Button';
import Badge, { StatusBadge, STOCK_STATUS } from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';

export default function LowStockWidget({ items = [], loading }) {
  const { t, locale } = useI18n();
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('widgets.lowStock')}
        description={t('widgets.lowStockHint')}
        action={
          <Button as={Link} href="/inventory?status=low_stock" variant="ghost" size="sm" iconRight={ArrowUpRight}>
            {t('nav.inventory')}
          </Button>
        }
      />
      {loading ? (
        <SkeletonList rows={5} />
      ) : items.length === 0 ? (
        <EmptyState
          compact
          icon={PackageCheck}
          title="Everything is well stocked"
          description="No products are below their reorder threshold right now."
        />
      ) : (
        <ul className="flex-1">
          {items.map((item) => {
            const pct = Math.min(100, (item.stock / Math.max(item.threshold, 1)) * 100);
            return (
              <li key={item.id}>
                <Link
                  href={`/products/${item.id}`}
                  className="flex items-center gap-3 border-b border-line px-5 py-3 transition-colors last:border-0 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:px-6"
                >
                  <ProductThumb name={localized(item, 'name', locale)} seed={item.id} src={item.image} size="sm" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-body-sm font-medium text-ink">{localized(item, 'name', locale)}</p>
                    <div className="mt-1.5 flex items-center gap-2">
                      <div className="h-1 w-16 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                        <div
                          className={cn('h-full rounded-pill', item.stock === 0 ? 'bg-danger' : 'bg-warning')}
                          style={{ width: `${Math.max(pct, item.stock > 0 ? 8 : 0)}%` }}
                        />
                      </div>
                      <span className="text-caption tabular-nums text-ink-3">
                        {item.stock} / {item.threshold} threshold
                      </span>
                    </div>
                  </div>
                  <StatusBadge map={STOCK_STATUS} value={item.status} size="sm" />
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}
