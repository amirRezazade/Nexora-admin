"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useDispatch } from "react-redux";
import { Monitor, Smartphone, Tablet, LogOut } from "lucide-react";
import { relativeTime } from "@/lib/format";
import { supabase } from "@/lib/supabaseClient";
import { signOut } from "@/store/slices/authSlice";
import { toast } from "@/store/slices/uiSlice";
import { useI18n } from "@/i18n/I18nProvider";
import SettingsLayout from "@/components/layout/SettingsLayout";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import Switch from "@/components/ui/Switch";
import Badge from "@/components/ui/Badge";
import { ConfirmDialog } from "@/components/ui/Modal";

export const SESSIONS = [
  { id: "s1", device: "MacBook Pro · Chrome", location: "Frankfurt, Germany", ip: "84.132.44.19", lastActive: "2026-08-21T11:52:00Z", current: true, icon: Monitor },
  { id: "s2", device: "iPhone 15 · Safari", location: "Frankfurt, Germany", ip: "84.132.44.19", lastActive: "2026-08-21T07:14:00Z", current: false, icon: Smartphone },
  { id: "s3", device: "iPad Air · Safari", location: "Berlin, Germany", ip: "91.44.201.8", lastActive: "2026-08-18T19:33:00Z", current: false, icon: Tablet },
  { id: "s4", device: "Windows PC · Edge", location: "Amsterdam, Netherlands", ip: "145.28.11.204", lastActive: "2026-08-12T09:05:00Z", current: false, icon: Monitor },
];

export function SessionList({ sessions, onRevoke }) {
  const { t } = useI18n();
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
                {s.current && (
                  <Badge tone="success" dot size="sm">
                    {t("securityPage.thisDevice")}
                  </Badge>
                )}
              </div>
              <p className="mt-0.5 text-caption text-ink-3">
                {s.location} · <span className="font-mono">{s.ip}</span> · {t("securityPage.active", { time: relativeTime(s.lastActive) })}
              </p>
            </div>
            {!s.current && (
              <Button size="sm" variant="ghost" icon={LogOut} onClick={() => onRevoke(s)}>
                {t("securityPage.signOut")}
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Demo lock — shared portfolio account: block real password changes so
 * visitors can't break the demo login. Flip to false to enable.
 */
const ACCOUNT_EDIT_LOCKED = true;

export default function SecuritySettingsPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const [sessions, setSessions] = useState(SESSIONS);
  const [twoFactor, setTwoFactor] = useState(false);
  const [alerts, setAlerts] = useState(true);
  const [confirmRevokeAll, setConfirmRevokeAll] = useState(false);
  const [errors, setErrors] = useState({});
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);

  const changePassword = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.current) errs.current = t("securityPage.errCurrent");
    if (!values.next) errs.next = t("securityPage.errNext");
    else if (values.next.length < 8) errs.next = t("securityPage.errNextLen");
    if (values.confirm !== values.next) errs.confirm = t("securityPage.errMatch");
    setErrors(errs);
    if (Object.keys(errs).length) return;

    if (ACCOUNT_EDIT_LOCKED) {
      dispatch(toast.warning(t("toast.accountLocked")));
      setValues({ current: "", next: "", confirm: "" });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: values.next });
      if (error) throw error;
      setValues({ current: "", next: "", confirm: "" });
      dispatch(toast.success(t("toast.passwordUpdated"), t("toast.passwordUpdatedHint")));
    } catch (err) {
      dispatch(toast.error(t("toast.passwordUpdateError"), err?.message || t("common.tryAgain")));
    } finally {
      setSaving(false);
    }
  };

  const revoke = (s) => {
    setSessions((list) => list.filter((x) => x.id !== s.id));
    dispatch(toast.success(t("toast.sessionEnded"), t("toast.sessionEndedHint", { device: s.device })));
  };

  return (
    <SettingsLayout title={t("securityPage.title")} description={t("securityPage.description")} onSave={null}>
      <Card>
        <CardHeader title={t("securityPage.password")} description={t("securityPage.passwordHint")} />
        <CardBody>
          <form onSubmit={changePassword} noValidate className="flex max-w-md flex-col gap-4">
            <Input
              label={t("securityPage.currentPassword")}
              type="password"
              required
              autoComplete="current-password"
              value={values.current}
              onChange={(e) => {
                setValues((v) => ({ ...v, current: e.target.value }));
                setErrors((p) => ({ ...p, current: undefined }));
              }}
              error={errors.current}
            />
            <Input
              label={t("securityPage.newPassword")}
              type="password"
              required
              autoComplete="new-password"
              value={values.next}
              onChange={(e) => {
                setValues((v) => ({ ...v, next: e.target.value }));
                setErrors((p) => ({ ...p, next: undefined }));
              }}
              error={errors.next}
              hint={!errors.next ? t("securityPage.passwordRule") : undefined}
            />
            <Input
              label={t("securityPage.confirmPassword")}
              type="password"
              required
              autoComplete="new-password"
              value={values.confirm}
              onChange={(e) => {
                setValues((v) => ({ ...v, confirm: e.target.value }));
                setErrors((p) => ({ ...p, confirm: undefined }));
              }}
              error={errors.confirm}
            />
            <Button type="submit" variant="primary" loading={saving} className="self-start">
              {saving ? t("securityPage.updating") : t("securityPage.updatePassword")}
            </Button>
          </form>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("securityPage.prefs")} />
        <CardBody className="flex flex-col gap-5">
          <Switch
            checked={twoFactor}
            onChange={(v) => {
              setTwoFactor(v);
              dispatch(v ? toast.success(t("toast.twoFactorOn")) : toast.warning(t("toast.twoFactorOff")));
            }}
            label={t("securityPage.twoFactor")}
            description={t("securityPage.twoFactorHint")}
          />
          <div className="border-t border-line pt-5">
            <Switch checked={alerts} onChange={setAlerts} label={t("securityPage.alerts")} description={t("securityPage.alertsHint")} />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader
          title={t("securityPage.sessions")}
          description={sessions.length === 1 ? t("securityPage.sessionsHintOne") : t("securityPage.sessionsHint", { n: sessions.length })}
          action={
            sessions.length > 1 && (
              <Button size="sm" variant="ghost" className="text-danger-text" onClick={() => setConfirmRevokeAll(true)}>
                {t("securityPage.signOutEverywhere")}
              </Button>
            )
          }
        />
        <SessionList sessions={sessions} onRevoke={revoke} />
      </Card>

      <ConfirmDialog
        open={confirmRevokeAll}
        onClose={() => setConfirmRevokeAll(false)}
        onConfirm={async () => {
          setConfirmRevokeAll(false);
          dispatch(toast.success(t("toast.signedOutAll"), t("toast.signedOutAllHint")));
          /* Global sign-out revokes every session incl. this one — wait for
             it, then land on /login explicitly. */
          try {
            await dispatch(signOut("global")).unwrap();
          } catch {
            /* state settles to signed-out either way */
          }
          router.push("/login");
        }}
        title={t("confirm.signOutAll")}
        message={t("confirm.signOutAllMsg")}
        confirmLabel={t("confirm.signOutAllConfirm")}
        tone="danger"
      />
    </SettingsLayout>
  );
}
