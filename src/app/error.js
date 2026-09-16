'use client';

import Link from 'next/link';
import { useEffect } from 'react';
import { RotateCw, LayoutDashboard } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import ErrorPage from '@/components/ui/ErrorPage';
import Button from '@/components/ui/Button';

export default function GlobalError({ error, reset }) {
  const { t } = useI18n();
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <ErrorPage
      code="500"
      tone="danger"
      title={t('errors.crashed')}
      description={t('errors.crashedHint')}
      actions={
        <>
          <Button variant="primary" icon={RotateCw} onClick={reset}>
            {t('common.retry')}
          </Button>
          <Button as={Link} href="/" variant="secondary" icon={LayoutDashboard}>
            {t('errors.backDash')}
          </Button>
        </>
      }
    />
  );
}
