'use client';

import { Upload, Image as ImageIcon } from 'lucide-react';
import { useI18n } from '@/i18n/I18nProvider';
import { useSettingsSection } from '@/lib/settingsStore';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import { NovaMark } from '@/components/layout/Sidebar';

export default function StoreSettingsPage() {
  const { t } = useI18n();
  const { form, patch, dirty, save } = useSettingsSection('store');
  return (
    <SettingsLayout title={t('settings.store')} description={t('settingsPages.branding')} dirty={dirty} onSave={save}>
      <Card>
        <CardHeader title="Branding" description="Used across your storefront, emails and invoices." />
        <CardBody className="flex flex-col gap-6">
          <div className="flex flex-wrap items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center rounded-card-lg border border-line bg-surface-2">
              <NovaMark className="h-12 w-12 rounded-card" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-ink">Store logo</p>
              <p className="mt-0.5 text-caption text-ink-3">PNG or SVG, at least 256×256px.</p>
              <div className="mt-2.5 flex gap-2">
                <Button size="sm" variant="secondary" icon={Upload}>Upload logo</Button>
                <Button size="sm" variant="ghost">Remove</Button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-5 border-t border-line pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-card border border-line bg-surface-2">
              <ImageIcon aria-hidden className="h-5 w-5 text-ink-3" />
            </div>
            <div>
              <p className="text-body-sm font-medium text-ink">Favicon</p>
              <p className="mt-0.5 text-caption text-ink-3">32×32px ICO or PNG.</p>
              <Button size="sm" variant="secondary" icon={Upload} className="mt-2.5">Upload favicon</Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Business address" description="Appears on invoices and shipping labels." />
        <CardBody className="flex flex-col gap-4">
          <Input label="Address line 1" value={form.address1} onChange={patch('address1')} />
          <Input label="Address line 2" value={form.address2} onChange={patch('address2')} />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Input label="City" value={form.city} onChange={patch('city')} />
            <Input label="Postcode" value={form.postcode} onChange={patch('postcode')} />
            <Select
              label="Country"
              value={form.country}
              onChange={patch('country')}
              options={[
                { value: 'DE', label: 'Germany' },
                { value: 'GB', label: 'United Kingdom' },
                { value: 'US', label: 'United States' },
                { value: 'NL', label: 'Netherlands' },
              ]}
            />
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Business information" description="Required for tax and compliance." />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label="Legal entity name" value={form.legalName} onChange={patch('legalName')} />
          <Input label="VAT number" value={form.vat} onChange={patch('vat')} className="font-mono" />
          <Input label="Company registration" value={form.registration} onChange={patch('registration')} className="font-mono" />
          <Input label="Registered since" type="date" value={form.registeredSince} onChange={patch('registeredSince')} />
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
