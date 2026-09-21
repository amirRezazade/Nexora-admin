'use client';

import { useI18n } from '@/i18n/I18nProvider';
import { useSettingsSection } from '@/lib/settingsStore';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';

export default function GeneralSettingsPage() {
  const { t } = useI18n();
  const { form, patch, dirty, save } = useSettingsSection('general');

  return (
    <SettingsLayout
      title={t('settings.general')}
      description={t('settingsPages.generalHint')}
      dirty={dirty}
      onSave={save}
    >
      <Card>
        <CardHeader title={t('settingsPages.storeDetails')} />
        <CardBody className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input
              label={t('settingsPages.storeName')}
              value={form.storeName}
              readOnly
              disabled
              hint={t('settingsPages.lockedHint')}
            />
            <Input label={t('settingsPages.storeEmail')} type="email" value={form.storeEmail} onChange={patch('storeEmail')} required />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Input label={t('settingsPages.supportPhone')} type="tel" value={form.supportPhone} onChange={patch('supportPhone')} />
            <Input
              label={t('settingsPages.storefrontUrl')}
              type="url"
              value={form.storefrontUrl}
              readOnly
              disabled
              hint={t('settingsPages.lockedHint')}
              className="font-mono text-body-sm"
            />
          </div>
          <Textarea label={t('settingsPages.storeDescription')} rows={3} value={form.description} onChange={patch('description')} />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t('settingsPages.regional')} description={t('settingsPages.regionalHint')} />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Select
            label={t('settingsPages.currency')}
            value={form.currency}
            onChange={patch('currency')}
            options={[
              { value: 'USD', label: 'USD ($)' },
              { value: 'EUR', label: 'EUR (€)' },
              { value: 'GBP', label: 'GBP (£)' },
              { value: 'JPY', label: 'JPY (¥)' },
            ]}
          />
          <Select
            label={t('settingsPages.timezone')}
            value={form.timezone}
            onChange={patch('timezone')}
            options={[
              { value: 'Europe/Berlin', label: '(UTC+1) Berlin' },
              { value: 'Europe/London', label: '(UTC+0) London' },
              { value: 'America/New_York', label: '(UTC−5) New York' },
              { value: 'Asia/Tokyo', label: '(UTC+9) Tokyo' },
            ]}
          />
          <Select
            label={t('header.language')}
            value={form.language}
            onChange={patch('language')}
            options={[
              { value: 'en-US', label: t('header.english') },
              { value: 'fa-IR', label: t('header.persian') },
              { value: 'de-DE', label: 'Deutsch' },
              { value: 'fr-FR', label: 'Français' },
            ]}
          />
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t('settingsPages.contact')} description={t('settingsPages.contactHint')} />
        <CardBody className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input label={t('settingsPages.supportEmail')} type="email" value={form.supportEmail} onChange={patch('supportEmail')} />
          <Input label={t('settingsPages.supportHours')} value={form.supportHours} onChange={patch('supportHours')} />
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
