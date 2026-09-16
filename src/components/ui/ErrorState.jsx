import { AlertTriangle, RotateCw } from 'lucide-react';
import { cn } from '@/lib/format';
import Button from './Button';

export default function ErrorState({
  title = 'Something went wrong',
  description = 'We couldn’t load this data. Please try again.',
  onRetry,
  retryLabel = 'Try again',
  className,
  compact,
}) {
  return (
    <div
      role="alert"
      className={cn('flex flex-col items-center justify-center px-6 text-center', compact ? 'py-10' : 'py-16', className)}
    >
      <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-card border border-danger/25 bg-danger-soft">
        <AlertTriangle aria-hidden className="h-5 w-5 text-danger-text" />
      </span>
      <h3 className="text-h4 text-ink">{title}</h3>
      <p className="mt-1.5 max-w-sm text-body-sm leading-relaxed text-ink-2">{description}</p>
      {onRetry && (
        <Button variant="secondary" icon={RotateCw} onClick={onRetry} className="mt-5">
          {retryLabel}
        </Button>
      )}
    </div>
  );
}
