import { cn } from '@/lib/format';

export default function Skeleton({ className, ...props }) {
  return <div aria-hidden className={cn('skeleton', className)} {...props} />;
}

export function SkeletonText({ lines = 3, className }) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-3', i === lines - 1 ? 'w-2/3' : 'w-full')} />
      ))}
    </div>
  );
}

export function SkeletonStatCard() {
  return (
    <div className="card p-5">
      <div className="flex items-start justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-8 w-8 rounded-control" />
      </div>
      <Skeleton className="mt-4 h-8 w-32" />
      <div className="mt-4 flex items-center justify-between gap-4">
        <Skeleton className="h-3 w-36" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 8, columns = 7, checkbox = true }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true">
      <span className="sr-only">Loading results</span>
      <div className="flex items-center gap-4 border-b border-line px-4 py-2.5">
        {checkbox && <Skeleton className="h-4 w-4 rounded-[5px]" />}
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className={cn('h-2.5', i === 0 ? 'w-40' : 'w-16')} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-line px-4 py-3 last:border-0">
          {checkbox && <Skeleton className="h-4 w-4 rounded-[5px]" />}
          <div className="flex flex-1 items-center gap-3">
            <Skeleton className="h-9 w-9 shrink-0 rounded-control" />
            <div className="flex flex-1 flex-col gap-1.5">
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-2.5 w-1/5" />
            </div>
          </div>
          {Array.from({ length: columns - 1 }).map((_, i) => (
            <Skeleton key={i} className="h-3 w-16" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonChart({ height = 'h-64' }) {
  return (
    <div className={cn('flex items-end gap-2 px-1', height)} aria-hidden>
      {Array.from({ length: 16 }).map((_, i) => (
        <Skeleton
          key={i}
          className="flex-1 rounded-t-[4px]"
          style={{ height: `${28 + ((i * 37) % 62)}%` }}
        />
      ))}
    </div>
  );
}

export function SkeletonList({ rows = 5 }) {
  return (
    <div className="flex flex-col">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
          <Skeleton className="h-9 w-9 shrink-0 rounded-control" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3 w-2/5" />
            <Skeleton className="h-2.5 w-1/4" />
          </div>
          <Skeleton className="h-3 w-14" />
        </div>
      ))}
    </div>
  );
}
