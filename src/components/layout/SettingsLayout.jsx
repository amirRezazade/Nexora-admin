'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useDispatch } from 'react-redux';
import {
  Settings as SettingsIcon, Store, ShoppingCart, CreditCard, Truck, Bell, Palette, ShieldCheck, ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { toast } from '@/store/slices/uiSlice';
import Button from '@/components/ui/Button';

export const SETTINGS_NAV = [
  { href: '/settings', label: 'General', icon: SettingsIcon, description: 'Store name, currency and locale' },
  { href: '/settings/store', label: 'Store', icon: Store, description: 'Branding and business details' },
  { href: '/settings/orders', label: 'Orders', icon: ShoppingCart, description: 'Numbering and fulfilment' },
  { href: '/settings/payments', label: 'Payments', icon: CreditCard, description: 'Providers and payouts' },
  { href: '/settings/shipping', label: 'Shipping', icon: Truck, description: 'Methods, regions and rates' },
  { href: '/settings/notifications', label: 'Notifications', icon: Bell, description: 'What you get told about' },
  { href: '/settings/appearance', label: 'Appearance', icon: Palette, description: 'Theme and density' },
  { href: '/settings/security', label: 'Security', icon: ShieldCheck, description: 'Password and sessions' },
];

/**
 * Two-pane settings on desktop, stacked list on mobile. The save bar is part
 * of the layout so every panel behaves the same way.
 */
export default function SettingsLayout({ title, description, children, onSave, dirty: dirtyProp }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);

  const isDirty = dirtyProp ?? dirty;

  const save = async () => {
    setSaving(true);
    try {
      await Promise.resolve(onSave?.());
      setDirty(false);
      dispatch(toast.success(t('common.settingsSaved'), t('common.settingsLive')));
    } catch {
      dispatch(toast.error(t('common.saveFailed'), t('common.tryAgain')));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-h1 text-ink">{t('settings.title')}</h1>
        <p className="mt-1 text-body text-ink-2">{t('settings.description')}</p>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[232px_minmax(0,1fr)]">
        {/* Settings navigation */}
        <nav aria-label="Settings sections" className="lg:sticky lg:top-20 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0" style={{ scrollbarWidth: 'none' }}>
            {SETTINGS_NAV.map((item) => {
              const active = pathname === item.href;
              const Icon = item.icon;
              return (
                <li key={item.href} className="shrink-0 lg:shrink">
                  <Link
                    href={item.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2.5 whitespace-nowrap rounded-control px-3 py-2 text-body-sm font-medium transition-colors',
                      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas',
                      active ? 'bg-brand-soft text-brand-text' : 'text-ink-2 hover:bg-surface-3 hover:text-ink'
                    )}
                  >
                    <Icon aria-hidden className={cn('h-4 w-4 shrink-0', active ? 'text-brand' : 'text-ink-3')} />
                    <span className="flex-1">{t(`settings.${item.href.split('/').pop() === 'settings' ? 'general' : item.href.split('/').pop()}`)}</span>
                    {active && <ChevronRight aria-hidden className="hidden h-3.5 w-3.5 lg:block" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Panel */}
        <div className="min-w-0">
          <div className="mb-5">
            <h2 className="text-h2 text-ink">{title}</h2>
            {description && <p className="mt-1 text-body-sm text-ink-2">{description}</p>}
          </div>

          <div
            className="flex flex-col gap-4"
            onChange={() => setDirty(true)}
          >
            {children}
          </div>

          {onSave !== null && (
            <div className="mt-6 flex items-center justify-end gap-3 border-t border-line pt-5">
              <p className="mr-auto text-caption text-ink-3">
                {isDirty ? t('common.unsaved') : t('common.saved')}
              </p>
              <Button variant="secondary" disabled={saving || !isDirty} onClick={() => setDirty(false)}>
                {t('common.discard')}
              </Button>
              <Button variant="primary" loading={saving} disabled={!isDirty} onClick={save}>
                {saving ? t('common.saving') : t('common.save')}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
