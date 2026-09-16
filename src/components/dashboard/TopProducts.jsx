'use client';

import Link from 'next/link';
import { ArrowUpRight, Package } from 'lucide-react';
import { currency, number, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import Card, { CardHeader } from '@/components/ui/Card';
import ProductThumb from '@/components/ui/ProductThumb';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';

export default function TopProducts({ products = [], loading, periodLabel = 'last 30 days' }) {
  const { t, locale } = useI18n();
  const max = Math.max(...products.map((p) => p.revenue), 1);

  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('widgets.topProducts')}
        description={t('widgets.topProductsHint', { period: periodLabel })}
        action={
          <Button as={Link} href="/products" variant="ghost" size="sm" iconRight={ArrowUpRight}>
            {t('common.viewAll')}
          </Button>
        }
      />
      {loading ? (
        <SkeletonList rows={5} />
      ) : products.length === 0 ? (
        <EmptyState compact icon={Package} title="No sales in this period" description="Try widening the date range." />
      ) : (
        <ol className="flex-1">
          {products.map((p, i) => (
            <li key={p.productId}>
              <Link
                href={`/products/${p.productId}`}
                className="flex items-center gap-3 border-b border-line px-5 py-3 transition-colors last:border-0 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:px-6"
              >
                <span className="w-3 shrink-0 text-caption font-semibold tabular-nums text-ink-3">{i + 1}</span>
                <ProductThumb name={p.name} seed={p.productId} src={p.image} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm font-medium text-ink">{p.name}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1 flex-1 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                      <div
                        className="h-full rounded-pill bg-brand transition-[width] duration-500 ease-out"
                        style={{ width: `${(p.revenue / max) * 100}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-caption tabular-nums text-ink-3">{number(p.units)} sold</span>
                  </div>
                </div>
                <span className="shrink-0 text-body-sm font-semibold tabular-nums text-ink">
                  {currency(p.revenue, { decimals: 0 })}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </Card>
  );
}
