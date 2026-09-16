'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  Camera, Mail, ShieldCheck, LogOut, Upload, Calendar, Award,
} from 'lucide-react';
import { dateShort, relativeTime } from '@/lib/format';
import { updateProfile } from '@/store/slices/authSlice';
import { toast } from '@/store/slices/uiSlice';
import { useI18n } from '@/i18n/I18nProvider';

import PageHeader from '@/components/ui/PageHeader';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import Avatar from '@/components/ui/Avatar';
import Badge from '@/components/ui/Badge';
import { SessionList, SESSIONS } from '@/app/settings/security/page';

export default function ProfilePage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  const [values, setValues] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    phone: '+49 151 5550 8842',
    bio: 'Running the Nova storefront day to day — catalog, merchandising and the odd 2am inventory panic.',
  });
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [sessions, setSessions] = useState(SESSIONS);

  const [pw, setPw] = useState({ current: '', next: '', confirm: '' });
  const [pwErrors, setPwErrors] = useState({});
  const [pwSaving, setPwSaving] = useState(false);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
    setDirty(true);
  };

  const savePersonal = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.name.trim()) errs.name = 'Your name is required.';
    if (!values.email.trim()) errs.email = 'Email address is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) errs.email = 'Enter a valid email address.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 700));
    dispatch(updateProfile({ name: values.name, email: values.email }));
    dispatch(toast.success('Profile updated.', 'Your details have been saved.'));
    setSaving(false);
    setDirty(false);
  };

  const savePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!pw.current) errs.current = 'Enter your current password.';
    if (!pw.next) errs.next = 'Enter a new password.';
    else if (pw.next.length < 8) errs.next = 'New password must be at least 8 characters.';
    if (pw.confirm !== pw.next) errs.confirm = 'Both passwords must match.';
    setPwErrors(errs);
    if (Object.keys(errs).length) return;

    setPwSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setPwSaving(false);
    setPw({ current: '', next: '', confirm: '' });
    dispatch(toast.success('Password updated.', 'Use your new password next time you sign in.'));
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader title={t('profilePage.title')} description={t('profilePage.description')} />

      {/* Identity card */}
      <Card padded>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <div className="relative shrink-0 self-start">
            <Avatar name={values.name} tone="brand" size="xl" />
            <button
              type="button"
              aria-label="Change profile photo"
              className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-surface bg-brand text-white shadow-sm transition-colors hover:bg-brand-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <Camera aria-hidden className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-h2 text-ink">{values.name}</h2>
              <Badge tone="brand">{values.role}</Badge>
            </div>
            <p className="mt-1 text-body-sm text-ink-2">{values.email}</p>
            <div className="mt-2 flex flex-wrap items-center gap-x-5 gap-y-1 text-caption text-ink-3">
              <span className="flex items-center gap-1.5">
                <Calendar aria-hidden className="h-3.5 w-3.5" />
                Joined {dateShort(user?.joinedAt || '2023-05-14')}
              </span>
              <span className="flex items-center gap-1.5">
                <Award aria-hidden className="h-3.5 w-3.5" />
                Full administrative access
              </span>
            </div>
          </div>

          <Button variant="secondary" icon={Upload} className="shrink-0 self-start sm:self-center">
            {t('profilePage.changePhoto')}
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex flex-col gap-4">
          {/* Personal information */}
          <Card>
            <CardHeader title={t('profilePage.personal')} description="How you appear across Nova." />
            <CardBody>
              <form onSubmit={savePersonal} noValidate className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label={t('profilePage.fullName')} required value={values.name} onChange={set('name')} error={errors.name} autoComplete="name" />
                  <Input label={t('auth.email')} type="email" required icon={Mail} value={values.email} onChange={set('email')} error={errors.email} autoComplete="email" />
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Input label={t('profilePage.phone')} type="tel" value={values.phone} onChange={set('phone')} autoComplete="tel" />
                  <Select
                    label={t('profilePage.role')}
                    value={values.role}
                    onChange={set('role')}
                    options={[
                      { value: 'Store Owner', label: 'Store Owner' },
                      { value: 'Administrator', label: 'Administrator' },
                      { value: 'Merchandiser', label: 'Merchandiser' },
                      { value: 'Support Agent', label: 'Support Agent' },
                    ]}
                    hint="Only the store owner can change roles."
                  />
                </div>
                <Textarea label={t('profilePage.bio')} rows={3} value={values.bio} onChange={set('bio')} maxLength={200} />
                <div className="flex items-center justify-end gap-3 border-t border-line pt-4">
                  <p className="mr-auto text-caption text-ink-3">{dirty ? 'You have unsaved changes.' : 'All changes saved.'}</p>
                  <Button type="button" variant="secondary" disabled={!dirty || saving} onClick={() => setDirty(false)}>
                    Discard
                  </Button>
                  <Button type="submit" variant="primary" loading={saving} disabled={!dirty}>
                    {saving ? 'Saving…' : 'Save Changes'}
                  </Button>
                </div>
              </form>
            </CardBody>
          </Card>

          {/* Password */}
          <Card>
            <CardHeader title={t('profilePage.password')} description="Change the password you use to sign in." />
            <CardBody>
              <form onSubmit={savePassword} noValidate className="flex max-w-md flex-col gap-4">
                <Input
                  label={t('profilePage.currentPassword')}
                  type="password"
                  required
                  autoComplete="current-password"
                  value={pw.current}
                  onChange={(e) => { setPw((v) => ({ ...v, current: e.target.value })); setPwErrors((p) => ({ ...p, current: undefined })); }}
                  error={pwErrors.current}
                />
                <Input
                  label={t('profilePage.newPassword')}
                  type="password"
                  required
                  autoComplete="new-password"
                  value={pw.next}
                  onChange={(e) => { setPw((v) => ({ ...v, next: e.target.value })); setPwErrors((p) => ({ ...p, next: undefined })); }}
                  error={pwErrors.next}
                  hint={!pwErrors.next ? 'At least 8 characters.' : undefined}
                />
                <Input
                  label={t('profilePage.confirmPassword')}
                  type="password"
                  required
                  autoComplete="new-password"
                  value={pw.confirm}
                  onChange={(e) => { setPw((v) => ({ ...v, confirm: e.target.value })); setPwErrors((p) => ({ ...p, confirm: undefined })); }}
                  error={pwErrors.confirm}
                />
                <Button type="submit" variant="primary" loading={pwSaving} className="self-start">
                  {pwSaving ? t('authExtra.updating') : t('profilePage.updatePassword')}
                </Button>
              </form>
            </CardBody>
          </Card>

          {/* Sessions */}
          <Card>
            <CardHeader title={t('profilePage.sessions')} description={`Signed in on ${sessions.length} device${sessions.length === 1 ? '' : 's'}`} />
            <SessionList
              sessions={sessions}
              onRevoke={(s) => {
                setSessions((list) => list.filter((x) => x.id !== s.id));
                dispatch(toast.success('Session ended', `${s.device} was signed out.`));
              }}
            />
          </Card>
        </div>

        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t('profilePage.account')} />
            <CardBody>
              <dl className="divide-y divide-line text-body-sm">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-ink-2">{t('profilePage.role')}</dt>
                  <dd className="font-medium text-ink">{values.role}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-ink-2">{t('profilePage.memberSince')}</dt>
                  <dd className="font-medium text-ink">{dateShort(user?.joinedAt || '2023-05-14')}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-ink-2">{t('profilePage.twoFactor')}</dt>
                  <dd><Badge tone="warning" dot size="sm">{t('profilePage.notEnabled')}</Badge></dd>
                </div>
              </dl>
              <Button as={Link} href="/settings/security" variant="secondary" icon={ShieldCheck} className="mt-4 w-full">
                {t('profilePage.securitySettings')}
              </Button>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('profilePage.signOut')} />
            <CardBody>
              <p className="text-body-sm leading-relaxed text-ink-2">
                Signing out ends this session on this device only.
              </p>
              <Button as={Link} href="/login" variant="secondary" icon={LogOut} className="mt-4 w-full text-danger-text">
                {t('profilePage.signOut')}
              </Button>
            </CardBody>
          </Card>
        </aside>
      </div>
    </div>
  );
}
