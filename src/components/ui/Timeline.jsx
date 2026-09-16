import { cn } from '@/lib/format';

/** Vertical timeline shared by order status, product audit and activity feeds. */
export default function Timeline({ children, className }) {
  return <ol className={cn('relative flex flex-col', className)}>{children}</ol>;
}

const toneRing = {
  brand: 'border-brand bg-brand text-white',
  success: 'border-success bg-success text-white',
  warning: 'border-warning bg-warning text-white',
  danger: 'border-danger bg-danger text-white',
  info: 'border-info bg-info text-white',
  muted: 'border-line-strong bg-surface text-ink-3',
};

export function TimelineItem({
  icon: Icon, title, description, meta, tone = 'muted', last = false, active = false, children,
}) {
  return (
    <li className="relative flex gap-3 pb-5 last:pb-0">
      {!last && (
        <span aria-hidden className="absolute bottom-0 left-[11px] top-6 w-px bg-line" />
      )}
      <span
        aria-hidden
        className={cn(
          'relative z-10 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2',
          toneRing[tone],
          active && 'ring-4 ring-brand/15'
        )}
      >
        {Icon ? <Icon className="h-3 w-3" strokeWidth={2.5} /> : <span className="h-1.5 w-1.5 rounded-full bg-current" />}
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-0.5">
          <p className={cn('text-body-sm', active ? 'font-semibold text-ink' : 'font-medium text-ink')}>{title}</p>
          {meta && <span className="shrink-0 text-caption tabular-nums text-ink-3">{meta}</span>}
        </div>
        {description && <p className="mt-0.5 text-caption leading-relaxed text-ink-2">{description}</p>}
        {children}
      </div>
    </li>
  );
}
