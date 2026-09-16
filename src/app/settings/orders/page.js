'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { useSettingsSection } from '@/lib/settingsStore';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Switch from '@/components/ui/Switch';

export default function OrderSettingsPage() {
  const { t } = useI18n();
  const { form, patch, setForm, dirty, setDirty, save } = useSettingsSection('orders');
  const track = (key) => (v) => { setForm((f) => ({ ...f, [key]: v })); setDirty(true); };

  return (
    <SettingsLayout title={t('settings.orders')} description={t('settingsPages.generalHint')} dirty={dirty} onSave={save}>
      <Card>
        <CardHeader title="Order numbering" />
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label="Order number prefix"
              value={form.prefix}
              onChange={patch('prefix')}
              hint="Shown to customers on receipts."
              className="font-mono"
            />
            <Input label="Next order number" type="number" value={form.nextNumber} onChange={patch('nextNumber')} className="font-mono" />
          </div>
          <p className="rounded-card bg-surface-2 px-4 py-3 text-body-sm text-ink-2">
            Your next order will be numbered{' '}
            <span className="font-mono font-semibold text-ink">{form.prefix}{form.nextNumber}</span>.
          </p>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Fulfilment" />
        <CardBody className="flex flex-col gap-5">
          <Switch
            checked={form.autoFulfil}
            onChange={track('autoFulfil')}
            label="Automatically fulfil digital items"
            description="Digital products are marked as fulfilled the moment payment clears."
          />
          <div className="border-t border-line pt-5">
            <Select
              label="Default fulfilment location"
              value={form.location}
              onChange={patch('location')}
              options={[
                { value: 'frankfurt', label: 'Frankfurt DC' },
                { value: 'rotterdam', label: 'Rotterdam DC' },
                { value: 'manchester', label: 'Manchester DC' },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Cancellation rules" />
        <CardBody className="flex flex-col gap-5">
          <Switch
            checked={form.autoCancel}
            onChange={track('autoCancel')}
            label="Auto-cancel unpaid orders"
            description="Release reserved stock when payment doesn't complete."
          />
          {form.autoCancel && (
            <div className="border-t border-line pt-5">
              <Select
                label="Cancel after"
                value={form.cancelAfter}
                onChange={patch('cancelAfter')}
                options={[
                  { value: '6', label: '6 hours' },
                  { value: '12', label: '12 hours' },
                  { value: '24', label: '24 hours' },
                  { value: '72', label: '3 days' },
                ]}
                className="sm:max-w-xs"
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Customer notifications" description="Emails sent automatically as an order progresses." />
        <CardBody className="flex flex-col gap-5">
          <Switch checked={form.notifyPlaced} onChange={track('notifyPlaced')} label="Order confirmation" description="Sent immediately after checkout." />
          <div className="border-t border-line pt-5">
            <Switch checked={form.notifyShipped} onChange={track('notifyShipped')} label="Shipping confirmation" description="Includes the tracking number when available." />
          </div>
          <div className="border-t border-line pt-5">
            <Switch checked={notifyDelivered} onChange={track(setNotifyDelivered)} label="Delivery confirmation" description="Sent when the carrier marks the parcel delivered." />
          </div>
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
