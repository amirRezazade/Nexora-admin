'use client';

import Link from 'next/link';
import { cn } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import NexoraLogo from '@/components/brand/NexoraLogo';

/**
 * Split auth layout: branded panel on the left, focused form on the right.
 * Premium, but deliberately not a marketing page — the job is to sign in.
 */
export default function AuthLayout({ title, description, children, footer }) {
  const { t } = useI18n();
  return (
    <div className="flex min-h-screen bg-canvas">
      {/* Brand panel */}
      <aside className="relative hidden w-[42%] max-w-[560px] flex-col justify-between overflow-hidden border-e border-line bg-surface p-10 lg:flex">
        {/* Restrained background texture — a faint grid, not a gradient wash */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-[0.55]"
          style={{
            backgroundImage:
              'linear-gradient(rgb(var(--c-line)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--c-line)) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)',
            WebkitMaskImage: 'radial-gradient(ellipse 80% 60% at 50% 40%, black, transparent)',
          }}
        />

        <div className="relative">
          <Link
            href="/"
            className="inline-flex items-center gap-2.5 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <NexoraLogo />
          </Link>
        </div>

        <div className="relative max-w-sm">
          <h2 className="text-[30px] font-bold leading-[38px] tracking-[-0.022em] text-ink">
            {t('auth.headline')}
            <span className="text-brand">{t('auth.headlineAccent')}</span>
          </h2>
          <p className="mt-4 text-body-lg leading-relaxed text-ink-2">
            {t('auth.blurb')}
          </p>

          <dl className="mt-10 grid grid-cols-3 gap-6 border-t border-line pt-6">
            {[
              ['12.4k', t('auth.statOrders')], ['3.2k', t('auth.statProducts')], ['99.9%', t('auth.statUptime')],
            ].map(([value, label]) => (
              <div key={label}>
                <dt className="sr-only">{label}</dt>
                <dd>
                  <span className="block text-h2 tabular-nums text-ink">{value}</span>
                  <span className="mt-0.5 block text-caption text-ink-3">{label}</span>
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p className="relative text-caption text-ink-3">© 2026 {t('brand.name')}</p>
      </aside>

      {/* Form panel */}
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[380px]">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2.5 rounded-control lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
          >
            <NexoraLogo />
          </Link>

          <h1 className="text-h1 text-ink">{title}</h1>
          {description && <p className="mt-2 text-body text-ink-2">{description}</p>}

          <div className="mt-7">{children}</div>

          {footer && <div className="mt-6">{footer}</div>}
        </div>
      </main>
    </div>
  );
}
