"use client";

import { useI18n } from "@/i18n/I18nProvider";
import { useSettingsSection } from "@/lib/settingsStore";
import SettingsLayout from "@/components/layout/SettingsLayout";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Switch from "@/components/ui/Switch";

export default function OrderSettingsPage() {
  const { t } = useI18n();
  const { form, patch, setForm, dirty, setDirty, save } = useSettingsSection("orders");
  const track = (key) => (v) => {
    setForm((f) => ({ ...f, [key]: v }));
    setDirty(true);
  };

  return (
    <SettingsLayout title={t("settings.orders")} description={t("settingsPages.ordersHint")} dirty={dirty} onSave={save}>
      <Card>
        <CardHeader title={t("settingsPages.numbering")} />
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t("settingsPages.prefix")} value={form.prefix} onChange={patch("prefix")} hint={t("settingsPages.prefixHint")} className="font-mono" />
            <Input label={t("settingsPages.nextNumber")} type="number" value={form.nextNumber} onChange={patch("nextNumber")} className="font-mono" />
          </div>
          <p className="rounded-card bg-surface-2 px-4 py-3 text-body-sm text-ink-2">{t("settingsPages.nextPreview", { id: `${form.prefix}${form.nextNumber}` })}</p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settingsPages.fulfilment")} />
        <CardBody className="flex flex-col gap-5">
          <Switch checked={form.autoFulfil} onChange={track("autoFulfil")} label={t("settingsPages.autoFulfil")} description={t("settingsPages.autoFulfilHint")} />
          <div className="border-t border-line pt-5">
            <Select
              label={t("settingsPages.location")}
              value={form.location}
              onChange={patch("location")}
              options={[
                { value: "frankfurt", label: t("settingsPages.locFrankfurt") },
                { value: "rotterdam", label: t("settingsPages.locRotterdam") },
                { value: "manchester", label: t("settingsPages.locManchester") },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settingsPages.cancelRules")} />
        <CardBody className="flex flex-col gap-5">
          <Switch checked={form.autoCancel} onChange={track("autoCancel")} label={t("settingsPages.autoCancel")} description={t("settingsPages.autoCancelHint")} />
          {form.autoCancel && (
            <div className="border-t border-line pt-5">
              <Select
                label={t("settingsPages.cancelAfter")}
                value={form.cancelAfter}
                onChange={patch("cancelAfter")}
                options={[
                  { value: "6", label: t("settingsPages.hours6") },
                  { value: "12", label: t("settingsPages.hours12") },
                  { value: "24", label: t("settingsPages.hours24") },
                  { value: "72", label: t("settingsPages.days3") },
                ]}
                className="sm:max-w-xs"
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settingsPages.customerNotify")} description={t("settingsPages.customerNotifyHint")} />
        <CardBody className="flex flex-col gap-5">
          <Switch checked={form.notifyPlaced} onChange={track("notifyPlaced")} label={t("settingsPages.notifyPlaced")} description={t("settingsPages.notifyPlacedHint")} />
          <div className="border-t border-line pt-5">
            <Switch checked={form.notifyShipped} onChange={track("notifyShipped")} label={t("settingsPages.notifyShipped")} description={t("settingsPages.notifyShippedHint")} />
          </div>
          <div className="border-t border-line pt-5">
            <Switch checked={form.notifyDelivered} onChange={track("notifyDelivered")} label={t("settingsPages.notifyDelivered")} description={t("settingsPages.notifyDeliveredHint")} />
          </div>
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
