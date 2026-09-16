'use client';

import { ShoppingCart, Package, Star, Server, Mail } from 'lucide-react';
import { useSettingsSection } from '@/lib/settingsStore';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Switch from '@/components/ui/Switch';
import Select from '@/components/ui/Select';
import Input from '@/components/ui/Input';

const GROUPS = [
  {
    title: 'Orders',
    icon: ShoppingCart,
    items: [
      { id: 'order_new', label: 'New order placed', description: 'Every time a customer checks out.', on: true },
      { id: 'order_cancelled', label: 'Order cancelled', description: 'Including auto-cancelled unpaid orders.', on: true },
      { id: 'order_refund', label: 'Refund requested', description: 'When a customer asks for their money back.', on: true },
    ],
  },
  {
    title: 'Inventory',
    icon: Package,
    items: [
      { id: 'stock_low', label: 'Low stock', description: 'A product reaches its reorder threshold.', on: true },
      { id: 'stock_out', label: 'Out of stock', description: 'A product becomes unavailable to buy.', on: true },
      { id: 'stock_restock', label: 'Restocked', description: 'Inventory is replenished.', on: false },
    ],
  },
  {
    title: 'Reviews',
    icon: Star,
    items: [
      { id: 'review_new', label: 'New review', description: 'Any new customer review.', on: false },
      { id: 'review_low', label: 'Low rating', description: 'A review of 2 stars or fewer.', on: true },
    ],
  },
  {
    title: 'System',
    icon: Server,
    items: [
      { id: 'sys_payout', label: 'Payouts', description: 'Scheduled and completed payouts.', on: true },
      { id: 'sys_security', label: 'Security alerts', description: 'New sign-ins and password changes.', on: true },
      { id: 'sys_product', label: 'Product updates', description: 'New Nova features and releases.', on: false },
    ],
  },
];

export default function NotificationSettingsPage() {
  const { form, patch, setForm, dirty, setDirty, save } = useSettingsSection('notifications');
  const set = (id) => (v) => { setForm((s) => ({ ...s, [id]: v })); setDirty(true); };

  return (
    <SettingsLayout
      title="Notifications"
      description="Choose what Nova tells you about, and how."
      dirty={dirty}
      onSave={save}
    >
      <Card>
        <CardHeader title="Delivery" description="Where notifications are sent." />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Notification email" type="email" value={form.email} onChange={patch('email')} icon={Mail} />
          <Select
            label="Digest frequency"
            value={form.digest}
            onChange={patch('digest')}
            options={[
              { value: 'realtime', label: 'Real time' },
              { value: 'hourly', label: 'Hourly digest' },
              { value: 'daily', label: 'Daily digest' },
            ]}
          />
        </CardBody>
      </Card>

      {GROUPS.map((group) => {
        const Icon = group.icon;
        return (
          <Card key={group.title}>
            <CardHeader
              title={
                <span className="flex items-center gap-2">
                  <Icon aria-hidden className="h-4 w-4 text-ink-3" />
                  {group.title}
                </span>
              }
            />
            <CardBody className="flex flex-col gap-5">
              {group.items.map((item, i) => (
                <div key={item.id} className={i > 0 ? 'border-t border-line pt-5' : ''}>
                  <Switch
                    checked={Boolean(form[item.id])}
                    onChange={set(item.id)}
                    label={item.label}
                    description={item.description}
                  />
                </div>
              ))}
            </CardBody>
          </Card>
        );
      })}
    </SettingsLayout>
  );
}
