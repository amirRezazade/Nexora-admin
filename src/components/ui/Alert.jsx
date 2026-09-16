import { CheckCircle2, AlertCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/format';

const tones = {
  info: { icon: Info, wrap: 'bg-info-soft border-info/25', icon_: 'text-info', title: 'text-info-text' },
  success: { icon: CheckCircle2, wrap: 'bg-success-soft border-success/25', icon_: 'text-success', title: 'text-success-text' },
  warning: { icon: AlertTriangle, wrap: 'bg-warning-soft border-warning/25', icon_: 'text-warning', title: 'text-warning-text' },
  danger: { icon: AlertCircle, wrap: 'bg-danger-soft border-danger/25', icon_: 'text-danger', title: 'text-danger-text' },
};

export default function Alert({ tone = 'info', title, children, action, className, icon }) {
  const cfg = tones[tone];
  const Icon = icon || cfg.icon;
  return (
    <div className={cn('flex items-start gap-3 rounded-card border p-3.5', cfg.wrap, className)}>
      <Icon aria-hidden className={cn('mt-0.5 h-4 w-4 shrink-0', cfg.icon_)} />
      <div className="min-w-0 flex-1">
        {title && <p className={cn('text-body-sm font-semibold', cfg.title)}>{title}</p>}
        {children && <div className={cn('text-body-sm leading-relaxed text-ink-2', title && 'mt-0.5')}>{children}</div>}
      </div>
      {action}
    </div>
  );
}
