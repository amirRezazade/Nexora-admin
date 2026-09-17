'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  Bell, ShoppingCart, Package, Star, Server, CheckCheck, Circle, CircleDot, Inbox,
} from 'lucide-react';
import { cn, relativeTime, dateTime } from '@/lib/format';
import { fetchNotifications, markAllRead, toggleRead } from '@/store/slices/notificationsSlice';
import { toast } from '@/store/slices/uiSlice';
import { useI18n } from '@/i18n/I18nProvider';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card from '@/components/ui/Card';
import Tabs from '@/components/ui/Tabs';
import Badge from '@/components/ui/Badge';
import { SkeletonList } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

const CATEGORY_META = {
  orders: { label: 'Orders', icon: ShoppingCart },
  inventory: { label: 'Inventory', icon: Package },
  reviews: { label: 'Reviews', icon: Star },
  system: { label: 'System', icon: Server },
};

const TONES = {
  danger: 'bg-danger-soft text-danger-text',
  warning: 'bg-warning-soft text-warning-text',
  success: 'bg-success-soft text-success-text',
  info: 'bg-info-soft text-info-text',
  neutral: 'bg-surface-3 text-ink-2',
};

export default function NotificationsPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const { items, counts, unread, status } = useSelector((s) => s.notifications);
  const [tab, setTab] = useState('all');
  const [unreadOnly, setUnreadOnly] = useState(false);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const filtered = useMemo(() => {
    let out = tab === 'all' ? items : items.filter((n) => n.category === tab);
    if (unreadOnly) out = out.filter((n) => !n.read);
    return out;
  }, [items, tab, unreadOnly]);

  const tabs = [
    { value: 'all', label: t('common.all'), count: counts?.all },
    ...Object.entries(CATEGORY_META).map(([value, meta]) => ({
      value,
      label: t(`nav.${value}`),
      icon: meta.icon,
      count: counts?.[value],
    })),
  ];

  /* Group by day so a long list stays scannable. */
  const groups = useMemo(() => {
    const map = new Map();
    filtered.forEach((n) => {
      const d = new Date(n.createdAt);
      const key = d.toISOString().slice(0, 10);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(n);
    });
    return [...map.entries()];
  }, [filtered]);

  const today = new Date('2026-08-21T12:00:00Z').toISOString().slice(0, 10);
  const yesterday = new Date('2026-08-20T12:00:00Z').toISOString().slice(0, 10);
  const dayLabel = (key) =>
    key === today ? t('common.today') : key === yesterday ? t('common.yesterday') : new Date(key).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('notificationsPage.title')}
        description={unread > 0 ? t('notificationsPage.descriptionUnread', { n: unread }) : t('notificationsPage.caughtUp')}
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => setUnreadOnly((v) => !v)}
              icon={unreadOnly ? CircleDot : Circle}
            >
              {unreadOnly ? t('notificationsPage.showingUnread') : t('notificationsPage.showUnread')}
            </Button>
            <Button
              variant="primary"
              icon={CheckCheck}
              disabled={unread === 0}
              onClick={() => {
                dispatch(markAllRead());
                dispatch(toast.success(t('toast.markedRead')));
              }}
            >
              {t('notificationsPage.markAll')}
            </Button>
          </>
        }
      />

      <Card className="flex flex-col">
        <div className="px-4 sm:px-5">
          <Tabs tabs={tabs} value={tab} ariaLabel="Filter notifications by category" onChange={setTab} />
        </div>

        {status === 'failed' ? (
          <ErrorState title={t('notificationsPage.loadError')} description="Please try again." onRetry={() => dispatch(fetchNotifications())} />
        ) : status === 'loading' && items.length === 0 ? (
          <SkeletonList rows={6} />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={unreadOnly ? t('notificationsPage.nothingUnread') : t('notificationsPage.empty')}
            description={
              unreadOnly
                ? 'You’ve read everything in this category.'
                : 'Store activity, stock alerts and new orders will appear here.'
            }
            action={
              unreadOnly && (
                <Button variant="secondary" onClick={() => setUnreadOnly(false)}>
                  Show all notifications
                </Button>
              )
            }
          />
        ) : (
          <div>
            {groups.map(([day, group]) => (
              <section key={day}>
                <h2 className="sticky top-14 z-10 border-y border-line bg-surface-2 px-5 py-1.5 text-micro uppercase tracking-wide text-ink-3 sm:px-6">
                  {dayLabel(day)}
                </h2>
                <ul>
                  {group.map((n) => {
                    const meta = CATEGORY_META[n.category] || { icon: Bell, label: 'General' };
                    const Icon = meta.icon;
                    return (
                      <li key={n.id} className={cn('border-b border-line last:border-0', !n.read && 'bg-brand-softer/50')}>
                        <div className="flex items-start gap-3 px-5 py-4 transition-colors hover:bg-surface-2 sm:px-6">
                          <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-control', TONES[n.tone] || TONES.neutral)}>
                            <Icon aria-hidden className="h-4 w-4" />
                          </span>

                          <Link href={n.href} className="min-w-0 flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand rounded">
                            <span className="flex flex-wrap items-center gap-2">
                              <span className="text-body-sm font-semibold text-ink">{n.title}</span>
                              <Badge tone="outline" size="sm">{meta.label}</Badge>
                              {!n.read && (
                                <span className="inline-flex items-center gap-1 text-caption font-medium text-brand-text">
                                  <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-brand" />
                                  {t('notificationsPage.unread')}
                                </span>
                              )}
                            </span>
                            <span className="mt-1 block text-body-sm leading-relaxed text-ink-2">{n.body}</span>
                            <span className="mt-1 block text-caption text-ink-3" title={dateTime(n.createdAt)}>
                              {relativeTime(n.createdAt)}
                            </span>
                          </Link>

                          <IconButton
                            icon={n.read ? Circle : CheckCheck}
                            size="sm"
                            label={n.read ? `Mark “${n.title}” as unread` : `Mark “${n.title}” as read`}
                            onClick={() => dispatch(toggleRead(n.id))}
                          />
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
