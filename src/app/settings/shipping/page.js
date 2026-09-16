'use client';

import { Plus, Truck, Pencil, Trash2 } from 'lucide-react';
import { currency } from '@/lib/format';
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
  { id: 'std', name: 'Standard Shipping', time: '4–6 business days', price: 6.9, regions: 'EU, UK', active: true },
  { id: 'exp', name: 'Express Shipping', time: '1–2 business days', price: 14.9, regions: 'EU, UK', active: true },
  { id: 'intl', name: 'International', time: '7–14 business days', price: 24.9, regions: 'Worldwide', active: true },
  { id: 'pickup', name: 'Local Pickup', time: 'Same day', price: 0, regions: 'Frankfurt', active: false },
];

export default function ShippingSettingsPage() {
  const { form, patch, setForm, dirty, setDirty, save } = useSettingsSection('shipping');

  return (
    <SettingsLayout
      title="Shipping"
      description="Methods, regions and what customers pay for delivery."
      dirty={dirty}
      onSave={save}
    >
      <Card>
        <CardHeader
          title="Shipping methods"
          description="Options shown at checkout."
          action={<Button size="sm" variant="secondary" icon={Plus}>Add method</Button>}
        />
        <TableWrap>
          <Table>
            <THead>
              <tr>
                <TH className="min-w-[200px]">Method</TH>
                <TH className="hidden sm:table-cell">Regions</TH>
                <TH align="right">Rate</TH>
                <TH>Status</TH>
                <TH width="90px" align="right"><span className="sr-only">Actions</span></TH>
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
                        <p className="text-body-sm font-semibold text-ink">{m.name}</p>
                        <p className="text-caption text-ink-3">{m.time}</p>
                      </div>
                    </div>
                  </TD>
                  <TD muted className="hidden sm:table-cell">{m.regions}</TD>
                  <TD align="right" numeric strong>
                    {m.price === 0 ? 'Free' : currency(m.price)}
                  </TD>
                  <TD>
                    <Badge tone={m.active ? 'success' : 'neutral'} dot size="sm">
                      {m.active ? 'Active' : 'Disabled'}
                    </Badge>
                  </TD>
                  <TD align="right">
                    <div className="flex items-center justify-end gap-1">
                      <IconButton icon={Pencil} size="sm" label={`Edit ${m.name}`} />
                      <IconButton icon={Trash2} size="sm" variant="danger" label={`Delete ${m.name}`} />
                    </div>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </TableWrap>
      </Card>

      <Card>
        <CardHeader title="Free shipping" description="Reward larger baskets." />
        <CardBody className="flex flex-col gap-5">
          <Switch
            checked={form.freeEnabled}
            onChange={(v) => { setForm((f) => ({ ...f, freeEnabled: v })); setDirty(true); }}
            label="Offer free shipping above a threshold"
            description="Applies to standard shipping only."
          />
          {form.freeEnabled && (
            <div className="border-t border-line pt-5">
              <Input
                label="Free shipping threshold"
                type="number"
                min="0"
                prefix="$"
                className="pl-7 sm:max-w-xs"
                value={form.freeThreshold}
                onChange={patch('freeThreshold')}
                hint={`Orders over ${currency(parseFloat(form.freeThreshold) || 0, { decimals: 0 })} ship free.`}
              />
            </div>
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Shipping regions" description="Where you deliver." />
        <CardBody>
          <div className="flex flex-wrap gap-2">
            {['European Union', 'United Kingdom', 'Switzerland', 'Norway', 'United States', 'Canada', 'Australia', 'Japan'].map((r) => (
              <Badge key={r} tone="outline">{r}</Badge>
            ))}
          </div>
          <Button size="sm" variant="secondary" icon={Plus} className="mt-4">Add region</Button>
        </CardBody>
      </Card>
    </SettingsLayout>
  );
}
