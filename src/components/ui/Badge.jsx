'use client';

import { cn } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';

const tones = {
  neutral: 'bg-neutral-soft text-neutral-text border-transparent',
  success: 'bg-success-soft text-success-text border-transparent',
  warning: 'bg-warning-soft text-warning-text border-transparent',
  danger: 'bg-danger-soft text-danger-text border-transparent',
  info: 'bg-info-soft text-info-text border-transparent',
  brand: 'bg-brand-soft text-brand-text border-transparent',
  outline: 'bg-transparent text-ink-2 border-line-strong',
};

const dotTones = {
  neutral: 'bg-ink-3',
  success: 'bg-success',
  warning: 'bg-warning',
  danger: 'bg-danger',
  info: 'bg-info',
  brand: 'bg-brand',
  outline: 'bg-ink-3',
};

/**
 * Status is never colour-only: when `dot` is set the label always travels
 * with it, so the meaning survives greyscale and colour-blindness.
 */
export default function Badge({ tone = 'neutral', dot = false, size = 'md', className, children, ...props }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-pill border font-medium',
        size === 'sm' ? 'px-1.5 py-0.5 text-[11px] leading-4' : 'px-2 py-0.5 text-caption',
        tones[tone],
        className
      )}
      {...props}
    >
      {dot && <span aria-hidden className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dotTones[tone])} />}
      {children}
    </span>
  );
}

/* Shared status vocabularies so every table speaks the same language. */
export const PRODUCT_STATUS = {
  active: { label: 'Active', tone: 'success' },
  draft: { label: 'Draft', tone: 'neutral' },
  archived: { label: 'Archived', tone: 'outline' },
};

export const STOCK_STATUS = {
  in_stock: { label: 'In stock', tone: 'success' },
  low_stock: { label: 'Low stock', tone: 'warning' },
  out_of_stock: { label: 'Out of stock', tone: 'danger' },
};

export const ORDER_STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  processing: { label: 'Processing', tone: 'info' },
  shipped: { label: 'Shipped', tone: 'brand' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

export const PAYMENT_STATUS = {
  paid: { label: 'Paid', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  failed: { label: 'Failed', tone: 'danger' },
  refunded: { label: 'Refunded', tone: 'neutral' },
};

export const CUSTOMER_STATUS = {
  active: { label: 'Active', tone: 'success' },
  inactive: { label: 'Inactive', tone: 'neutral' },
  blocked: { label: 'Blocked', tone: 'danger' },
};

export const REVIEW_STATUS = {
  published: { label: 'Published', tone: 'success' },
  pending: { label: 'Pending', tone: 'warning' },
  hidden: { label: 'Hidden', tone: 'neutral' },
};

export const COUPON_STATUS = {
  active: { label: 'Active', tone: 'success' },
  scheduled: { label: 'Scheduled', tone: 'info' },
  expired: { label: 'Expired', tone: 'neutral' },
  disabled: { label: 'Disabled', tone: 'outline' },
};

export function StatusBadge({ map, value, size }) {
  const { t } = useI18n();
  const cfg = map[value] || { label: value, tone: 'neutral' };
  return (
    <Badge tone={cfg.tone} dot size={size}>
      {t(`status.${value}`)}
    </Badge>
  );
}
