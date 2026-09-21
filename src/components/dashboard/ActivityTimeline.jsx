'use client';

import Link from 'next/link';
import {
  ShoppingCart, Package, UserPlus, Star, AlertTriangle, Activity as ActivityIcon,
} from 'lucide-react';
import { currency, relativeTime } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import Card, { CardHeader } from '@/components/ui/Card';
import Timeline, { TimelineItem } from '@/components/ui/Timeline';
import EmptyState from '@/components/ui/EmptyState';
import Skeleton from '@/components/ui/Skeleton';

const TYPE_CONFIG = {
  order: { icon: ShoppingCart, tone: 'info' },
  product: { icon: Package, tone: 'brand' },
  inventory: { icon: AlertTriangle, tone: 'warning' },
  customer: { icon: UserPlus, tone: 'success' },
  review: { icon: Star, tone: 'muted' },
};

export default function ActivityTimeline({ items = [], loading, title, description }) {
  const { t } = useI18n();
  return (
    <Card className="flex h-full flex-col">
      <CardHeader title={title || t('widgets.activity')} description={description || t('widgets.activityHint')} />
      <div className="flex-1 px-5 py-5 sm:px-6">
        {loading ? (
          <div className="flex flex-col gap-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <Skeleton className="h-6 w-6 shrink-0 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-3/4" />
                  <Skeleton className="h-2.5 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : items.length === 0 ? (
          <EmptyState compact icon={ActivityIcon} title={t('widgets.noActivity')} description={t('widgets.activityHint')} />
        ) : (
          <Timeline>
            {items.map((item, i) => {
              const cfg = TYPE_CONFIG[item.type] || TYPE_CONFIG.product;
              const body = (
                <>
                  <span className="font-semibold text-ink">{item.actor}</span> {item.message}
                </>
              );
              return (
                <TimelineItem
                  key={item.id}
                  icon={cfg.icon}
                  tone={cfg.tone}
                  last={i === items.length - 1}
                  meta={relativeTime(item.at)}
                  title={
                    item.href ? (
                      <Link
                        href={item.href}
                        className="rounded underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                      >
                        {body}
                      </Link>
                    ) : (
                      body
                    )
                  }
                  description={item.amount ? `Order value ${currency(item.amount)}` : null}
                />
              );
            })}
          </Timeline>
        )}
      </div>
    </Card>
  );
}
