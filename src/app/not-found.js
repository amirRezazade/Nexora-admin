'use client';

import Link from 'next/link';
import { LayoutDashboard, Search } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import ErrorPage from '@/components/ui/ErrorPage';
import Button from '@/components/ui/Button';

export default function NotFound() {
  const { t } = useI18n();
  return (
    <ErrorPage
      code="404"
      title={t('errors.notFound')}
      description={t('errors.notFoundHint')}
      actions={
        <>
          <Button as={Link} href="/" variant="primary" icon={LayoutDashboard}>
            {t('errors.backDash')}
          </Button>
          <Button as={Link} href="/products" variant="secondary" icon={Search}>
            {t('errors.browse')}
          </Button>
        </>
      }
    />
  );
}
