import { cn } from '@/lib/format';

/** Page title block. Actions stay here, never in the app header. */
export default function PageHeader({ title, description, actions, className, children }) {
  return (
    <div className={cn('flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between', className)}>
      <div className="min-w-0">
        <h1 className="text-h1 text-ink">{title}</h1>
        {description && <p className="mt-1 text-body text-ink-2">{description}</p>}
        {children}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}
