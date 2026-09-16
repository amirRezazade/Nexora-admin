'use client';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Monitor, Smartphone, Tablet, LogOut, ShieldCheck, KeyRound } from 'lucide-react';
import { relativeTime } from '@/lib/format';
import { toast } from '@/store/slices/uiSlice';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import Switch from '@/components/ui/Switch';
import Badge from '@/components/ui/Badge';
import { ConfirmDialog } from '@/components/ui/Modal';

export const SESSIONS = [
  { id: 's1', device: 'MacBook Pro · Chrome', location: 'Frankfurt, Germany', ip: '84.132.44.19', lastActive: '2026-08-21T11:52:00Z', current: true, icon: Monitor },
  { id: 's2', device: 'iPhone 15 · Safari', location: 'Frankfurt, Germany', ip: '84.132.44.19', lastActive: '2026-08-21T07:14:00Z', current: false, icon: Smartphone },
  { id: 's3', device: 'iPad Air · Safari', location: 'Berlin, Germany', ip: '91.44.201.8', lastActive: '2026-08-18T19:33:00Z', current: false, icon: Tablet },
  { id: 's4', device: 'Windows PC · Edge', location: 'Amsterdam, Netherlands', ip: '145.28.11.204', lastActive: '2026-08-12T09:05:00Z', current: false, icon: Monitor },
];

export function SessionList({ sessions, onRevoke }) {
  return (
    <ul>
      {sessions.map((s) => {
        const Icon = s.icon;
        return (
          <li key={s.id} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-0 sm:px-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface-3">
              <Icon aria-hidden className="h-4 w-4 text-ink-2" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-body-sm font-medium text-ink">{s.device}</p>
                {s.current && <Badge tone="success" dot size="sm">This device</Badge>}
              </div>
              <p className="mt-0.5 text-caption text-ink-3">
                {s.location} · <span className="font-mono">{s.ip}</span> · Active {relativeTime(s.lastActive)}
              </p>
            </div>
            {!s.current && (
              <Button size="sm" variant="ghost" icon={LogOut} onClick={() => onRevoke(s)}>
                Sign out
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function SecuritySettingsPage() {
  const dispatch = useDispatch();
  const [sessions, setSessions] = useState(SESSIONS);
  const [twoFactor, setTwoFactor] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({ current: '', next: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.current) errs.current = 'Enter your current password.';
    if (!values.next) errs.next = 'Enter a new password.';
    else if (values.next.length < 8) errs.next = 'New password must be at least 8 characters.';
    if (values.confirm !== values.next) errs.confirm = 'Both passwords must match.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setValues({ current: '', next: '', confirm: '' });
    dispatch(toast.success('Password updated.', 'Use your new password next time you sign in.'));
  };

  const revoke = (s) => {
    setSessions((list) => list.filter((x) => x.id !== s.id));
    dispatch(toast.success('Session ended', `${s.device} was signed out.`));
  };

  return (
    <SettingsLayout title="Security" description="Protect your account and review where you're signed in." onSave={null}>
      <Card>
        <CardHeader title="Password" description="Use a password you don't use anywhere else." />
        <CardBody>
          <form onSubmit={changePassword} noValidate className="flex max-w-md flex-col gap-4">
            <Input
              label="Current password"
              type="password"
              required
              autoComplete="current-password"
              value={values.current}
              onChange={(e) => { setValues((v) => ({ ...v, current: e.target.value })); setErrors((p) => ({ ...p, current: undefined })); }}
              error={errors.current}
            />
            <Input
              label="New password"
              type="password"
              required
              autoComplete="new-password"
              value={values.next}
              onChange={(e) => { setValues((v) => ({ ...v, next: e.target.value })); setErrors((p) => ({ ...p, next: undefined })); }}
              error={errors.next}
              hint={!errors.next ? 'At least 8 characters, with a number.' : undefined}
            />
            <Input
              label="Confirm new password"
              type="password"
              required
              autoComplete="new-password"
              value={values.confirm}
              onChange={(e) => { setValues((v) => ({ ...v, confirm: e.target.value })); setErrors((p) => ({ ...p, confirm: undefined })); }}
              error={errors.confirm}
            />
            <Button type="submit" variant="primary" loading={saving} className="self-start">
              {saving ? 'Updating…' : 'Update Password'}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Security preferences" />
        <CardBody className="flex flex-col gap-5">
          <Switch
            checked={twoFactor}
            onChange={(v) => {
              setTwoFactor(v);
              dispatch(v ? toast.success('Two-factor authentication enabled.') : toast.warning('Two-factor authentication disabled.'));
            }}
            label="Two-factor authentication"
            description="Require a one-time code from your authenticator app when signing in."
          />
          <div className="border-t border-line pt-5">
            <Switch
              checked={alerts}
              onChange={setAlerts}
              label="Sign-in alerts"
              description="Email me when someone signs in from a new device."
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title="Active sessions"
          description={`${sessions.length} device${sessions.length === 1 ? '' : 's'} signed in`}
          action={
            sessions.length > 1 && (
              <Button size="sm" variant="ghost" className="text-danger-text" onClick={() => setConfirmRevokeAll(true)}>
                Sign out everywhere
              </Button>
            )
          }
        />
        <SessionList sessions={sessions} onRevoke={revoke} />
      </Card>

      <ConfirmDialog
        open={confirmRevokeAll}
        onClose={() => setConfirmRevokeAll(false)}
        onConfirm={() => {
          setSessions((list) => list.filter((s) => s.current));
          setConfirmRevokeAll(false);
          dispatch(toast.success('Signed out everywhere', 'All other devices have been signed out.'));
        }}
        title="Sign out of all other devices?"
        message="You'll stay signed in here, but every other session will be ended immediately. Anyone using those devices will need to sign in again."
        confirmLabel="Sign out everywhere"
        tone="danger"
      />
    </SettingsLayout>
  );
}
