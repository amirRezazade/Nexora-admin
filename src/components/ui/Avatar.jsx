import { cn, initials } from '@/lib/format';

const sizes = {
  xs: 'h-6 w-6 text-[10px]',
  sm: 'h-7 w-7 text-[11px]',
  md: 'h-8 w-8 text-caption',
  lg: 'h-10 w-10 text-body-sm',
  xl: 'h-16 w-16 text-h2',
};

const tones = {
  brand: 'bg-brand-soft text-brand-text',
  info: 'bg-info-soft text-info-text',
  success: 'bg-success-soft text-success-text',
  warning: 'bg-warning-soft text-warning-text',
  neutral: 'bg-surface-3 text-ink-2',
};

export default function Avatar({ name = '', size = 'md', tone = 'neutral', className, ring }) {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold',
        sizes[size],
        tones[tone] || tones.neutral,
        ring && 'ring-2 ring-surface',
        className
      )}
    >
      {initials(name)}
    </span>
  );
}
