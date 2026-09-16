'use client';

import { forwardRef } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/format';

const variants = {
  primary:
    'bg-brand text-white border border-transparent hover:bg-brand-hover active:bg-brand-press shadow-xs disabled:bg-brand/45',
  secondary:
    'bg-surface text-ink border border-line-strong hover:bg-surface-2 active:bg-surface-3 shadow-xs',
  ghost: 'bg-transparent text-ink-2 border border-transparent hover:bg-surface-3 hover:text-ink',
  subtle: 'bg-surface-3 text-ink border border-transparent hover:bg-line',
  danger:
    'bg-danger text-white border border-transparent hover:bg-danger-hover shadow-xs disabled:bg-danger/45',
  'danger-ghost':
    'bg-transparent text-danger-text border border-transparent hover:bg-danger-soft',
  link: 'bg-transparent text-brand-text border border-transparent hover:underline underline-offset-4 px-0 h-auto',
};

const sizes = {
  xs: 'h-7 px-2 text-caption gap-1 rounded-[6px]',
  sm: 'h-8 px-3 text-body-sm gap-1.5 rounded-control',
  md: 'h-9 px-3.5 text-body gap-2 rounded-control',
  lg: 'h-10 px-4 text-body gap-2 rounded-control-lg',
};

const Button = forwardRef(function Button(
  {
    as: Tag = 'button',
    variant = 'secondary',
    size = 'md',
    loading = false,
    disabled,
    icon: Icon,
    iconRight: IconRight,
    className,
    children,
    ...props
  },
  ref
) {
  const isDisabled = disabled || loading;
  return (
    <Tag
      ref={ref}
      disabled={Tag === 'button' ? isDisabled : undefined}
      aria-disabled={isDisabled || undefined}
      aria-busy={loading || undefined}
      className={cn(
        'relative inline-flex select-none items-center justify-center whitespace-nowrap font-medium',
        'transition-[background-color,border-color,color,box-shadow,transform] duration-150 ease-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
        'active:translate-y-px disabled:pointer-events-none disabled:opacity-60 disabled:active:translate-y-0',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {loading && <Loader2 aria-hidden className="h-3.5 w-3.5 animate-[spin_0.7s_linear_infinite]" />}
      {!loading && Icon && <Icon aria-hidden className={size === 'xs' ? 'h-3.5 w-3.5' : 'h-4 w-4'} />}
      {children}
      {!loading && IconRight && <IconRight aria-hidden className="h-4 w-4 opacity-70" />}
    </Tag>
  );
});

export default Button;
