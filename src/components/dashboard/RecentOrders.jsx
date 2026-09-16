'use client';

import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { currency, dateShort, relativeTime } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import Card, { CardHeader } from '@/components/ui/Card';
import { StatusBadge, ORDER_STATUS } from '@/components/ui/Badge';
import Avatar from '@/components/ui/Avatar';
import Button from '@/components/ui/Button';
import EmptyState from '@/components/ui/EmptyState';
import { SkeletonList } from '@/components/ui/Skeleton';
import { ShoppingCart } from 'lucide-react';

export default function RecentOrders({ orders = [], loading }) {
  const { t } = useI18n();
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title={t('widgets.recentOrders')}
        description={t('widgets.recentOrdersHint')}
        action={
          <Button as={Link} href="/orders" variant="ghost" size="sm" iconRight={ArrowUpRight}>
            {t('common.viewAll')}
          </Button>
        }
      />
      {loading ? (
        <SkeletonList rows={5} />
      ) : orders.length === 0 ? (
        <EmptyState
          compact
          icon={ShoppingCart}
          title="No orders yet"
          description="New orders will appear here as soon as customers check out."
        />
      ) : (
        <ul className="flex-1">
          {orders.map((o) => (
            <li key={o.id}>
              <Link
                href={`/orders/${o.id}`}
                className="flex items-center gap-3 border-b border-line px-5 py-3 transition-colors last:border-0 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand sm:px-6"
              >
                <Avatar name={o.customerName} size="md" tone="neutral" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-body-sm font-medium text-ink">{o.customerName}</p>
                    <span className="shrink-0 font-mono text-caption text-ink-3">#{o.id}</span>
                  </div>
                  <p className="mt-0.5 truncate text-caption text-ink-3">
                    {o.itemCount} item{o.itemCount === 1 ? '' : 's'} · {relativeTime(o.placedAt)}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-body-sm font-semibold tabular-nums text-ink">{currency(o.total)}</span>
                  <StatusBadge map={ORDER_STATUS} value={o.status} size="sm" />
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}
