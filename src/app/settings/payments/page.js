"use client";

import { CreditCard, Wallet, Landmark, Info } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useSettingsSection } from "@/lib/settingsStore";
import SettingsLayout from "@/components/layout/SettingsLayout";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";
import Alert from "@/components/ui/Alert";
import Badge from "@/components/ui/Badge";

const PROVIDERS = [
  { id: "stripe", name: "Stripe", description: "Cards, Apple Pay and Google Pay", icon: CreditCard, connected: true, fee: "1.4% + $0.25" },
  { id: "paypal", name: "PayPal", description: "PayPal balance and Pay in 3", icon: Wallet, connected: true, fee: "2.9% + $0.30" },
  { id: "bank", name: "Bank transfer", description: "Manual SEPA and wire payments", icon: Landmark, connected: false, fee: "No fee" },
];

export default function PaymentSettingsPage() {
  const { t } = useI18n();
  const { form, patch, setForm, dirty, setDirty, save } = useSettingsSection("payments");

  return (
    <SettingsLayout title={t("settings.payments")} description={t("settingsPages.generalHint")} dirty={dirty} onSave={save}>
      <Alert tone="info" icon={Info} title={t("settingsPages.storeDetails")}>
        {t("auth.blurb")}
      </Alert>

      <Card>
        <CardHeader title={t("settings.payments")} />
        <ul>
          {PROVIDERS.map((p) => {
            const Icon = p.icon;
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 border-b border-line px-5 py-4 last:border-0 sm:px-6">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-card border border-line bg-surface-2">
                  <Icon aria-hidden className="h-5 w-5 text-ink-2" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-body-sm font-semibold text-ink">{p.name}</p>
                    {p.connected ? (
                      <Badge tone="success" dot size="sm">
                        {t("status.active")}
                      </Badge>
                    ) : (
                      <Badge tone="neutral" dot size="sm">
                        {t("status.inactive")}
                      </Badge>
                    )}
                  </div>
                  <p className="mt-0.5 text-caption text-ink-3">
                    {p.description} · {p.fee}
                  </p>
                </div>
                <Switch
                  checked={Boolean(form[p.id])}
                  onChange={(v) => {
                    setForm((f) => ({ ...f, [p.id]: v }));
                    setDirty(true);
                  }}
                  id={`provider-${p.id}`}
                />
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <CardHeader title={t("settingsPages.regional")} />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label={t("settingsPages.payoutSchedule")}
            value={form.payout}
            onChange={patch("payout")}
            options={[
              { value: "daily", label: t("settingsPages.payoutDaily") },
              { value: "weekly", label: t("settingsPages.payoutWeekly") },
              { value: "monthly", label: t("settingsPages.payoutMonthly") },
            ]}
          />
          <Input label={t("settingsPages.payoutAccount")} value="DE89 •••• •••• 3241" disabled className="font-mono" />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settingsPages.businessInfo")} />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label={t("settingsPages.taxRate")} type="number" value={form.taxRate} onChange={patch("taxRate")} suffix="%" />
          <Select
            label={t("settingsPages.taxInclusive")}
            value={form.taxInclusive}
            onChange={patch("taxInclusive")}
            options={[
              { value: "yes", label: t("common.yes") },
              { value: "no", label: t("common.no") },
            ]}
          />
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
