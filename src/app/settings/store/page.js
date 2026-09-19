"use client";

import { Upload, Image as ImageIcon } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useSettingsSection } from "@/lib/settingsStore";
import SettingsLayout from "@/components/layout/SettingsLayout";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import NexoraLogo from "@/components/brand/NexoraLogo";

export default function StoreSettingsPage() {
  const { t } = useI18n();
  const { form, patch, dirty, save } = useSettingsSection("store");
  return (
    <SettingsLayout title={t("settings.store")} description={t("settingsPages.branding")} dirty={dirty} onSave={save}>
      <Card>
        <CardHeader title={t("settingsPages.branding")} description={t("settingsPages.brandingHint")} />
        <CardBody className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-card-lg border border-line bg-surface-2">
              <NexoraLogo />
            </div>
            <div>
              <p className="text-body-sm font-medium text-ink">{t("settingsPages.storeLogo")}</p>
              <p className="mt-0.5 text-caption text-ink-3">{t("settingsPages.logoHint")}</p>
              <div className="mt-2.5 flex gap-2">
                <Button size="sm" variant="secondary" icon={Upload}>
                  {t("settingsPages.uploadLogo")}
                </Button>
                <Button size="sm" variant="ghost">
                  {t("settingsPages.remove")}
                </Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 border-t border-line pt-6">
            <div className="flex h-12 w-12 p-1.5 items-center justify-center rounded-card border border-line bg-surface-2">
              <img src="/brand/nexora-mark.webp" alt={"fav icon"} className="object-cover" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-ink">{t("settingsPages.favicon")}</p>
              <p className="mt-0.5 text-caption text-ink-3">{t("settingsPages.faviconHint")}</p>
              <div className="mt-2.5 flex gap-2">
                <Button size="sm" variant="secondary" icon={Upload}>
                  {t("settingsPages.uploadFavicon")}
                </Button>
                <Button size="sm" variant="ghost">
                  {t("settingsPages.remove")}
                </Button>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settingsPages.businessAddress")} description={t("settingsPages.addressHint")} />
        <CardBody className="flex flex-col gap-4">
          <Input label={t("settingsPages.address1")} value={form.address1} onChange={patch("address1")} />
          <Input label={t("settingsPages.address2")} value={form.address2} onChange={patch("address2")} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label={t("settingsPages.city")} value={form.city} onChange={patch("city")} />
            <Input label={t("settingsPages.postcode")} value={form.postcode} onChange={patch("postcode")} />
            <Select
              label={t("settingsPages.country")}
              value={form.country}
              onChange={patch("country")}
              options={[
                { value: "DE", label: t("settingsPages.countryDE") },
                { value: "GB", label: t("settingsPages.countryGB") },
                { value: "US", label: t("settingsPages.countryUS") },
                { value: "NL", label: t("settingsPages.countryNL") },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t("settingsPages.businessInfo")} description={t("settingsPages.businessInfoHint")} />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label={t("settingsPages.legalName")} value={form.legalName} onChange={patch("legalName")} />
          <Input label={t("settingsPages.vat")} value={form.vat} onChange={patch("vat")} className="font-mono" />
          <Input label={t("settingsPages.registration")} value={form.registration} onChange={patch("registration")} className="font-mono" />
          <Input label={t("settingsPages.registeredSince")} type="date" value={form.registeredSince} onChange={patch("registeredSince")} />
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
