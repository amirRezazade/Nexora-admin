import { Star } from 'lucide-react';
import { cn } from '@/lib/format';

export default function Rating({ value = 0, count, size = 'sm', showValue = true, className }) {
  const px = size === 'sm' ? 'h-3.5 w-3.5' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5';
  return (
    <span className={cn('inline-flex items-center gap-1.5', className)}>
      <span className="flex items-center gap-px" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={cn(
              px,
              i <= Math.round(value) ? 'fill-warning text-warning' : 'fill-transparent text-line-strong'
            )}
          />
        ))}
      </span>
      {showValue && <span className="text-caption font-medium tabular-nums text-ink">{value.toFixed(1)}</span>}
      {count != null && <span className="text-caption text-ink-3">({count.toLocaleString()})</span>}
      <span className="sr-only">
        {value.toFixed(1)} out of 5 stars{count != null ? ` from ${count} reviews` : ''}
      </span>
    </span>
  );
}
