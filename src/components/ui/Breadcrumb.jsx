import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { cn } from '@/lib/format';

export default function Breadcrumb({ items, className }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('min-w-0', className)}>
      <ol className="flex items-center gap-1 text-caption">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.href || item.label} className="flex min-w-0 items-center gap-1">
              {i > 0 && <ChevronRight aria-hidden className="h-3.5 w-3.5 shrink-0 text-ink-3" />}
              {last || !item.href ? (
                <span className="truncate font-medium text-ink" aria-current={last ? 'page' : undefined}>
                  {item.label}
                </span>
              ) : (
                <Link
                  href={item.href}
                  className="truncate text-ink-3 transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
                >
                  {item.label}
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
