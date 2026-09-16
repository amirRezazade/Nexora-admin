import { cn } from '@/lib/format';

/**
 * Empty ≠ error. This state explains what the surface will hold and gives the
 * one action that fills it.
 */
export default function EmptyState({ icon: Icon, title, description, action, secondaryAction, className, compact }) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center px-6 text-center',
        compact ? 'py-10' : 'py-16',
        className
      )}
    >
      {Icon && (
        <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-card border border-line bg-surface-2">
          <Icon aria-hidden className="h-5 w-5 text-ink-3" />
        </span>
      )}
      <h3 className="text-h4 text-ink">{title}</h3>
      {description && <p className="mt-1.5 max-w-sm text-body-sm leading-relaxed text-ink-2">{description}</p>}
      {(action || secondaryAction) && (
        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
