"use client";

import { ShoppingCart, Package, Star, Server, Mail } from "lucide-react";
import { useI18n } from "@/i18n/I18nProvider";
import { useSettingsSection } from "@/lib/settingsStore";
import SettingsLayout from "@/components/layout/SettingsLayout";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Switch from "@/components/ui/Switch";
import Select from "@/components/ui/Select";
import Input from "@/components/ui/Input";

const GROUPS = [
  {
    titleKey: "settingsPages.grpOrders",
    icon: ShoppingCart,
    items: [
      { id: "order_new", labelKey: "settingsPages.orderNew", hintKey: "settingsPages.orderNewHint" },
      { id: "order_cancelled", labelKey: "settingsPages.orderCancelled", hintKey: "settingsPages.orderCancelledHint" },
      { id: "order_refund", labelKey: "settingsPages.orderRefund", hintKey: "settingsPages.orderRefundHint" },
    ],
  },
  {
    titleKey: "settingsPages.grpInventory",
    icon: Package,
    items: [
      { id: "stock_low", labelKey: "settingsPages.stockLow", hintKey: "settingsPages.stockLowHint" },
      { id: "stock_out", labelKey: "settingsPages.stockOut", hintKey: "settingsPages.stockOutHint" },
      { id: "stock_restock", labelKey: "settingsPages.stockRestock", hintKey: "settingsPages.stockRestockHint" },
    ],
  },
  {
    titleKey: "settingsPages.grpReviews",
    icon: Star,
    items: [
      { id: "review_new", labelKey: "settingsPages.reviewNew", hintKey: "settingsPages.reviewNewHint" },
      { id: "review_low", labelKey: "settingsPages.reviewLow", hintKey: "settingsPages.reviewLowHint" },
    ],
  },
  {
    titleKey: "settingsPages.grpSystem",
    icon: Server,
    items: [
      { id: "sys_payout", labelKey: "settingsPages.sysPayout", hintKey: "settingsPages.sysPayoutHint" },
      { id: "sys_security", labelKey: "settingsPages.sysSecurity", hintKey: "settingsPages.sysSecurityHint" },
      { id: "sys_product", labelKey: "settingsPages.sysProduct", hintKey: "settingsPages.sysProductHint" },
    ],
  },
];

export default function NotificationSettingsPage() {
  const { t } = useI18n();
  const { form, patch, setForm, dirty, setDirty, save } = useSettingsSection("notifications");
  const set = (id) => (v) => {
    setForm((s) => ({ ...s, [id]: v }));
    setDirty(true);
  };

  return (
    <SettingsLayout title={t("settingsPages.notifyTitle")} description={t("settingsPages.notifyHint")} dirty={dirty} onSave={save}>
      <Card>
        <CardHeader title={t("settingsPages.delivery")} description={t("settingsPages.deliveryHint")} />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label={t("settingsPages.notifyEmail")} type="email" value={form.email} onChange={patch("email")} icon={Mail} />
          <Select
            label={t("settingsPages.digest")}
            value={form.digest}
            onChange={patch("digest")}
            options={[
              { value: "realtime", label: t("settingsPages.realtime") },
              { value: "hourly", label: t("settingsPages.hourly") },
              { value: "daily", label: t("settingsPages.daily") },
            ]}
          />
        </CardBody>
      </Card>

      {GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <Card key={group.titleKey}>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Icon aria-hidden className="h-4 w-4 text-ink-3" />
                  {t(group.titleKey)}
                </span>
              }
            />
            <CardBody className="flex flex-col gap-5">
              {group.items.map((item, i) => (
                <div key={item.id} className={i > 0 ? "border-t border-line pt-5" : ""}>
                  <Switch checked={Boolean(form[item.id])} onChange={set(item.id)} label={t(item.labelKey)} description={t(item.hintKey)} />
                </div>
              ))}
            </CardBody>
          </Card>
        );
      })}
    </SettingsLayout>
  );
}
