'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { requestReset } from '@/store/slices/authSlice';
import { useI18n } from '@/i18n/I18nProvider';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Alert from '@/components/ui/Alert';

export default function ForgotPasswordPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const status = useSelector((s) => s.auth.status);
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [sent, setSent] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return setError(t('auth.emailRequired'));
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError(t('auth.emailInvalid'));
    setError(null);
    await dispatch(requestReset(email));
    setSent(true);
  };

  if (sent) {
    return (
      <AuthLayout title={t('authExtra.checkEmail')} description={t('authExtra.forgotHint')}>
        <div className="flex flex-col gap-4">
          <Alert tone="success" icon={CheckCircle2} title={t('authExtra.resetSent')} />
          <Button as={Link} href="/reset-password" variant="primary" size="lg" className="w-full">
            {t('authExtra.resetPassword')}
          </Button>
          <Button variant="ghost" onClick={() => { setSent(false); setEmail(''); }} className="w-full">
            {t('auth.email')}
          </Button>
          <Link
            href="/login"
            className="mt-2 inline-flex items-center justify-center gap-1.5 text-body-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline"
          >
            <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
            {t('authExtra.backSignIn')}
          </Link>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout title={t('authExtra.forgotTitle')} description={t('authExtra.forgotHint')}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input
          label={t('auth.email')}
          type="email"
          required
          autoComplete="email"
          icon={Mail}
          value={email}
          onChange={(e) => { setEmail(e.target.value); setError(null); }}
          error={error}
        />
        <Button type="submit" variant="primary" size="lg" loading={status === 'loading'} className="w-full">
          {status === 'loading' ? t('authExtra.sending') : t('authExtra.sendLink')}
        </Button>
        <Link
          href="/login"
          className="mt-1 inline-flex items-center justify-center gap-1.5 text-body-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
        >
          <ArrowLeft aria-hidden className="h-3.5 w-3.5" />
          {t('authExtra.backSignIn')}
        </Link>
      </form>
    </AuthLayout>
  );
}
