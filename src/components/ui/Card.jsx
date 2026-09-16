import { cn } from '@/lib/format';

export default function Card({ className, children, as: Tag = 'div', padded = false, ...props }) {
  return (
    <Tag className={cn('card overflow-hidden', padded && 'p-5 sm:p-6', className)} {...props}>
      {children}
    </Tag>
  );
}

export function CardHeader({ title, description, action, className, titleAs: Title = 'h2', border = true, icon: Icon }) {
  return (
    <div
      className={cn(
        'flex flex-wrap items-start justify-between gap-3 px-5 py-4 sm:px-6',
        border && 'border-b border-line',
        className
      )}
    >
      <div className="flex min-w-0 items-start gap-2.5">
        {Icon && (
          <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-control bg-surface-3">
            <Icon aria-hidden className="h-3.5 w-3.5 text-ink-2" />
          </span>
        )}
        <div className="min-w-0">
          <Title className="text-h3 text-ink">{title}</Title>
          {description && <p className="mt-0.5 text-body-sm text-ink-2">{description}</p>}
        </div>
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

export function CardBody({ className, children }) {
  return <div className={cn('px-5 py-5 sm:px-6', className)}>{children}</div>;
}

export function CardFooter({ className, children }) {
  return (
    <div className={cn('flex items-center justify-between gap-3 border-t border-line bg-surface-2 px-5 py-3 sm:px-6', className)}>
      {children}
    </div>
  );
}
