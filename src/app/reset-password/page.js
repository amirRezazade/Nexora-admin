'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Lock, Check, X } from 'lucide-react';
import { cn } from '@/lib/format';
import { resetPassword } from '@/store/slices/authSlice';
import { toast } from '@/store/slices/uiSlice';
import { useI18n } from '@/i18n/I18nProvider';
import AuthLayout from '@/components/layout/AuthLayout';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

const RULES = [
  { id: 'length', label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'case', label: 'One uppercase and one lowercase letter', test: (v) => /[a-z]/.test(v) && /[A-Z]/.test(v) },
  { id: 'number', label: 'At least one number', test: (v) => /\d/.test(v) },
];

export default function ResetPasswordPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const router = useRouter();
  const status = useSelector((s) => s.auth.status);
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState({});

  const checks = useMemo(() => RULES.map((r) => ({ ...r, ok: r.test(password) })), [password]);
  const strength = checks.filter((c) => c.ok).length;

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!password) errs.password = 'Enter a new password.';
    else if (strength < RULES.length) errs.password = 'Your password doesn’t meet all the requirements yet.';
    if (confirm !== password) errs.confirm = 'Both passwords must match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    await dispatch(resetPassword());
    dispatch(toast.success(t('toast.passwordUpdated'), t('toast.passwordUpdatedHint')));
    router.push('/login');
  };

  return (
    <AuthLayout title={t('authExtra.setPassword')} description={t('authExtra.forgotHint')}>
      <form onSubmit={submit} noValidate className="flex flex-col gap-4">
        <Input
          label={t('profilePage.newPassword')}
          type="password"
          required
          autoComplete="new-password"
          icon={Lock}
          placeholder="Enter a new password"
          value={password}
          onChange={(e) => { setPassword(e.target.value); setErrors((p) => ({ ...p, password: undefined })); }}
          error={errors.password}
        />

        <div>
          <div className="flex gap-1" aria-hidden>
            {RULES.map((_, i) => (
              <span
                key={i}
                className={cn(
                  'h-1 flex-1 rounded-pill transition-colors duration-200',
                  strength > i
                    ? strength === 1 ? 'bg-danger' : strength === 2 ? 'bg-warning' : 'bg-success'
                    : 'bg-surface-3'
                )}
              />
            ))}
          </div>
          <ul className="mt-2.5 space-y-1">
            {checks.map((c) => (
              <li key={c.id} className={cn('flex items-center gap-1.5 text-caption', c.ok ? 'text-success-text' : 'text-ink-3')}>
                {c.ok ? <Check aria-hidden className="h-3.5 w-3.5" /> : <X aria-hidden className="h-3.5 w-3.5" />}
                {c.label}
              </li>
            ))}
          </ul>
          <p className="sr-only" aria-live="polite">
            Password meets {strength} of {RULES.length} requirements.
          </p>
        </div>

        <Input
          label={t('profilePage.confirmPassword')}
          type="password"
          required
          autoComplete="new-password"
          icon={Lock}
          placeholder="Re-enter your password"
          value={confirm}
          onChange={(e) => { setConfirm(e.target.value); setErrors((p) => ({ ...p, confirm: undefined })); }}
          error={errors.confirm}
        />

        <Button type="submit" variant="primary" size="lg" loading={status === 'loading'} className="mt-1 w-full">
          {status === 'loading' ? t('authExtra.updating') : t('authExtra.resetPassword')}
        </Button>

        <Link
          href="/login"
          className="text-center text-body-sm font-medium text-ink-2 underline-offset-4 hover:text-ink hover:underline"
        >
          Back to sign in
        </Link>
      </form>
    </AuthLayout>
  );
}
