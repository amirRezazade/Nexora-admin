'use client';

import Link from 'next/link';
import { LayoutDashboard, LifeBuoy } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import ErrorPage from '@/components/ui/ErrorPage';
import Button from '@/components/ui/Button';

export default function ForbiddenPage() {
  const { t } = useI18n();
  return (
    <ErrorPage
      code="403"
      tone="warning"
      title={t('errors.denied')}
      description={t('errors.deniedHint')}
      actions={
        <>
          <Button as={Link} href="/" variant="primary" icon={LayoutDashboard}>
            {t('errors.backDash')}
          </Button>
          <Button as={Link} href="/support" variant="secondary" icon={LifeBuoy}>
            {t('errors.contact')}
          </Button>
        </>
      }
    />
  );
}
