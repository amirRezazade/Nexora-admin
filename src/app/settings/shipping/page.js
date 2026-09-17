'use client';

import { Plus, Truck, Pencil, Trash2 } from 'lucide-react';
import { currency } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { useSettingsSection } from '@/lib/settingsStore';
import SettingsLayout from '@/components/layout/SettingsLayout';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Badge from '@/components/ui/Badge';
import Switch from '@/components/ui/Switch';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '@/components/ui/Table';

const METHODS = [
  { id: 'std', nameKey: 'settingsPages.std', timeKey: 'settingsPages.stdTime', price: 6.9, regionsKey: 'settingsPages.regionsEuUk', active: true },
  { id: 'exp', nameKey: 'settingsPages.exp', timeKey: 'settingsPages.expTime', price: 14.9, regionsKey: 'settingsPages.regionsEuUk', active: true },
  { id: 'intl', nameKey: 'settingsPages.intl', timeKey: 'settingsPages.intlTime', price: 24.9, regionsKey: 'settingsPages.regionsWorld', active: true },
  { id: 'pickup', nameKey: 'settingsPages.pickup', timeKey: 'settingsPages.pickupTime', price: 0, regionsKey: 'settingsPages.regionsFra', active: false },
];

const REGION_KEYS = [
  'settingsPages.regionEU',
  'settingsPages.regionGB',
  'settingsPages.regionCH',
  'settingsPages.regionNO',
  'settingsPages.regionUS',
  'settingsPages.regionCA',
  'settingsPages.regionAU',
  'settingsPages.regionJP',
];

export default function ShippingSettingsPage() {
  const { t } = useI18n();
  const { form, patch, setForm, dirty, setDirty, save } = useSettingsSection('shipping');

  return (
    <SettingsLayout
      title={t('settingsPages.shippingTitle')}
      description={t('settingsPages.shippingHint')}
      dirty={dirty}
      onSave={save}
    >
      <Card>
        <CardHeader
          title={t('settingsPages.methods')}
          description={t('settingsPages.methodsHint')}
          action={<Button size="sm" variant="secondary" icon={Plus}>{t('settingsPages.addMethod')}</Button>}
        />
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <TH className="min-w-[200px]">{t('settingsPages.colMethod')}</TH>
                <TH className="hidden sm:table-cell">{t('settingsPages.colRegions')}</TH>
                <TH align="right">{t('settingsPages.colRate')}</TH>
                <TH>{t('settingsPages.colStatus')}</TH>
                <TH width="90px" align="right"><span className="sr-only">{t('table.actions')}</span></TH>
              </tr>
            </THead>
            <TBody>
              {METHODS.map((m) => (
                <TR key={m.id}>
                  <TD>
                    <div className="flex items-center gap-2.5">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-control bg-surface-3">
                        <Truck aria-hidden className="h-4 w-4 text-ink-2" />
                      </span>
                      <div>
                        <p className="text-body-sm font-semibold text-ink">{t(m.nameKey)}</p>
                        <p className="text-caption text-ink-3">{t(m.timeKey)}</p>
                      </div>
                    </div>
                  </TD>
                  <TD muted className="hidden sm:table-cell">{t(m.regionsKey)}</TD>
                  <TD align="right" numeric strong>
                    {m.price === 0 ? t('settingsPages.free') : currency(m.price)}
                  </TD>
                  <TD>
                    <Badge tone={m.active ? 'success' : 'neutral'} dot size="sm">
                      {m.active ? t('status.active') : t('status.disabled')}
                    </Badge>
                  </TD>
                  <TD align="right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton icon={Pencil} size="sm" label={t('common.edit')} />
                      <IconButton icon={Trash2} size="sm" variant="danger" label={t('common.delete')} />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
      </Card>

      <Card>
        <CardHeader title={t('settingsPages.freeTitle')} description={t('settingsPages.freeCardHint')} />
        <CardBody className="flex flex-col gap-5">
          <Switch
            checked={form.freeEnabled}
            onChange={(v) => { setForm((f) => ({ ...f, freeEnabled: v })); setDirty(true); }}
            label={t('settingsPages.freeSwitch')}
            description={t('settingsPages.freeSwitchHint')}
          />
          {form.freeEnabled && (
            <div className="border-t border-line pt-5">
              <Input
                label={t('settingsPages.freeThreshold')}
                type="number"
                min="0"
                prefix="$"
                className="pl-7 sm:max-w-xs"
                value={form.freeThreshold}
                onChange={patch('freeThreshold')}
                hint={t('settingsPages.freeOver', { amount: currency(parseFloat(form.freeThreshold) || 0, { decimals: 0 }) })}
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title={t('settingsPages.regionsTitle')} description={t('settingsPages.regionsHint')} />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {REGION_KEYS.map((key) => (
              <Badge key={key} tone="outline">{t(key)}</Badge>
            ))}
          </div>
          <Button size="sm" variant="secondary" icon={Plus} className="mt-4">{t('settingsPages.addRegion')}</Button>
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
