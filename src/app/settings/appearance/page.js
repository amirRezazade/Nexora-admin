'use client';

import { useDispatch, useSelector } from 'react-redux';
import { Sun, Moon, Monitor } from 'lucide-react';
import { cn } from '@/lib/format';
import { setPreference } from '@/store/slices/themeSlice';
import { setDensity } from '@/store/slices/uiSlice';
import { useI18n } from '@/i18n/I18nProvider';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import { RadioCards } from '@/components/ui/Radio';

/** Miniature of the app shell so the choice is previewed, not just described. */
function ThemePreview({ scheme }) {
  const isDark = scheme === 'dark';
  const c = isDark
    ? { canvas: '#0c0e11', surface: '#16191e', line: '#2a2f37', ink: '#9ea5b0', bar: '#3a4049' }
    : { canvas: '#f6f7f9', surface: '#ffffff', line: '#e5e7eb', ink: '#828995', bar: '#d1d5db' };

  return (
    <span
      aria-hidden
      className="block overflow-hidden rounded-control border"
      style={{ backgroundColor: c.canvas, borderColor: c.line }}
    >
      <span className="flex h-[72px]">
        <span className="flex w-[30%] flex-col gap-1 border-e p-1.5" style={{ backgroundColor: c.surface, borderColor: c.line }}>
          <span className="h-1.5 w-3/4 rounded-pill" style={{ backgroundColor: '#ea580c' }} />
          <span className="h-1 w-full rounded-pill" style={{ backgroundColor: c.bar }} />
          <span className="h-1 w-2/3 rounded-pill" style={{ backgroundColor: c.bar }} />
          <span className="h-1 w-3/4 rounded-pill" style={{ backgroundColor: c.bar }} />
        </span>
        <span className="flex flex-1 flex-col gap-1 p-1.5">
          <span className="h-2 w-1/2 rounded-pill" style={{ backgroundColor: c.bar }} />
          <span className="mt-0.5 flex gap-1">
            <span className="h-5 flex-1 rounded" style={{ backgroundColor: c.surface, border: `1px solid ${c.line}` }} />
            <span className="h-5 flex-1 rounded" style={{ backgroundColor: c.surface, border: `1px solid ${c.line}` }} />
          </span>
          <span className="h-7 w-full rounded" style={{ backgroundColor: c.surface, border: `1px solid ${c.line}` }} />
        </span>
      </span>
    </span>
  );
}

function SplitPreview() {
  return (
    <span aria-hidden className="relative block h-[72px] overflow-hidden rounded-control border border-line">
      <span className="absolute inset-0 w-1/2 overflow-hidden">
        <span className="block w-[200%]"><ThemePreview scheme="light" /></span>
      </span>
      <span className="absolute inset-y-0 right-0 w-1/2 overflow-hidden">
        <span className="block w-[200%] -translate-x-1/2"><ThemePreview scheme="dark" /></span>
      </span>
    </span>
  );
}

export default function AppearanceSettingsPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const preference = useSelector((s) => s.theme.preference);
  const density = useSelector((s) => s.ui.density);

  return (
    <SettingsLayout title={t('settings.appearance')} description={t('settingsPages.appearanceHint')} onSave={null}>
      <Card>
        <CardHeader title={t('settingsPages.theme')} description={t('settingsPages.appearanceHint')} />
        <CardBody>
          <RadioCards
            name="theme"
            value={preference}
            onChange={(v) => dispatch(setPreference(v))}
            options={[
              { value: 'light', label: t('settingsPages.light'), description: t('settingsPages.themeLightHint'), preview: <ThemePreview scheme="light" /> },
              { value: 'dark', label: t('settingsPages.dark'), description: t('settingsPages.themeDarkHint'), preview: <ThemePreview scheme="dark" /> },
              { value: 'system', label: t('settingsPages.system'), description: t('settingsPages.themeSystemHint'), preview: <SplitPreview /> },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t('settingsPages.density')} />
        <CardBody>
          <RadioCards
            name="density"
            value={density}
            onChange={(v) => dispatch(setDensity(v))}
            options={[
              {
                value: 'comfortable',
                label: t('settingsPages.comfortable'),
                description: t('settingsPages.comfortableHint'),
                preview: (
                  <span aria-hidden className="flex flex-col gap-2 rounded-control border border-line bg-surface-2 p-2.5">
                    {[1, 2, 3].map((i) => <span key={i} className="h-1.5 rounded-pill bg-line-strong" />)}
                  </span>
                ),
              },
              {
                value: 'compact',
                label: t('settingsPages.compact'),
                description: t('settingsPages.compactHint'),
                preview: (
                  <span aria-hidden className="flex flex-col gap-1 rounded-control border border-line bg-surface-2 p-2.5">
                    {[1, 2, 3, 4, 5].map((i) => <span key={i} className="h-1 rounded-pill bg-line-strong" />)}
                  </span>
                ),
              },
            ]}
            className="sm:grid-cols-2"
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t('settingsPages.accent')} description={t('settingsPages.accentHint')} />
        <CardBody>
          <div className="flex flex-wrap items-center gap-4">
            <span className="flex items-center gap-2.5 rounded-card border border-brand bg-brand-softer px-3.5 py-2.5">
              <span aria-hidden className="h-5 w-5 rounded-full bg-brand ring-2 ring-brand/25 ring-offset-2 ring-offset-brand-softer" />
              <span className="text-body-sm font-medium text-brand-text">{t('settingsPages.accentName')}</span>
            </span>
            <p className="max-w-xs text-caption leading-relaxed text-ink-3">
              {t('settingsPages.accentBody')}
            </p>
          </div>
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
