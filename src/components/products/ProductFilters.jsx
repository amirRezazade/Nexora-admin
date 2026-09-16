'use client';

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RotateCcw } from 'lucide-react';
import { setFilters, clearFilters } from '@/store/slices/productsSlice';
import Drawer from '@/components/ui/Drawer';
import Button from '@/components/ui/Button';
import Checkbox from '@/components/ui/Checkbox';
import Input from '@/components/ui/Input';
import { PRODUCT_STATUS, STOCK_STATUS } from '@/components/ui/Badge';
import { useI18n } from '@/i18n/I18nProvider';
import { localized } from '@/lib/format';

function Group({ title, children, hint }) {
  return (
    <fieldset className="border-0 p-0">
      <legend className="mb-2.5 text-h4 text-ink">{title}</legend>
      {hint && <p className="-mt-1.5 mb-2.5 text-caption text-ink-3">{hint}</p>}
      <div className="flex flex-col gap-2.5">{children}</div>
    </fieldset>
  );
}

/**
 * Filters live in a drawer so the table keeps its full width, and every
 * applied filter is echoed back as a removable chip above the table.
 * Edits are staged locally and only committed on "Apply filters".
 */
export default function ProductFilters({ open, onClose, categories = [] }) {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();
  const applied = useSelector((s) => s.products.filters);
  const [draft, setDraft] = useState(applied);

  useEffect(() => {
    if (open) setDraft(applied);
  }, [open, applied]);

  const toggle = (key, value) =>
    setDraft((d) => ({
      ...d,
      [key]: d[key].includes(value) ? d[key].filter((v) => v !== value) : [...d[key], value],
    }));

  const activeCount =
    draft.category.length +
    draft.status.length +
    draft.stock.length +
    (draft.minPrice || draft.maxPrice ? 1 : 0) +
    (draft.addedAfter ? 1 : 0);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('filters.title')}
      description={t('products.description')}
      footer={
        <>
          <Button
            variant="ghost"
            icon={RotateCcw}
            onClick={() => {
              dispatch(clearFilters());
              onClose();
            }}
          >
            {t('common.clearAll')}
          </Button>
          <Button
            variant="primary"
            className="ml-auto"
            onClick={() => {
              dispatch(setFilters(draft));
              onClose();
            }}
          >
            {t('common.apply')}{activeCount > 0 ? ` (${activeCount})` : ''}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-7">
        <Group title={t('filters.category')}>
          {categories.map((c) => (
            <Checkbox
              key={c.id}
              label={localized(c, 'name', locale)}
              description={`${c.productCount} product${c.productCount === 1 ? '' : 's'}`}
              checked={draft.category.includes(c.id)}
              onChange={() => toggle('category', c.id)}
            />
          ))}
        </Group>

        <Group title={t('filters.status')}>
          {Object.entries(PRODUCT_STATUS).map(([value, cfg]) => (
            <Checkbox
              key={value}
              label={t(`status.${value}`)}
              checked={draft.status.includes(value)}
              onChange={() => toggle('status', value)}
            />
          ))}
        </Group>

        <Group title={t('filters.stock')}>
          {Object.entries(STOCK_STATUS).map(([value, cfg]) => (
            <Checkbox
              key={value}
              label={t(`status.${value}`)}
              checked={draft.stock.includes(value)}
              onChange={() => toggle('stock', value)}
            />
          ))}
        </Group>

        <Group title={t('filters.price')} hint="Leave either side empty for an open range.">
          <div className="flex items-center gap-3">
            <Input
              type="number"
              min="0"
              prefix="$"
              placeholder={t('filters.min')}
              aria-label="Minimum price"
              value={draft.minPrice}
              onChange={(e) => setDraft((d) => ({ ...d, minPrice: e.target.value }))}
              className="pl-7"
            />
            <span aria-hidden className="text-ink-3">–</span>
            <Input
              type="number"
              min="0"
              prefix="$"
              placeholder={t('filters.max')}
              aria-label="Maximum price"
              value={draft.maxPrice}
              onChange={(e) => setDraft((d) => ({ ...d, maxPrice: e.target.value }))}
              className="pl-7"
            />
          </div>
        </Group>

        <Group title={t('filters.dateAdded')}>
          <Input
            type="date"
            label={t('filters.addedAfter')}
            value={draft.addedAfter}
            onChange={(e) => setDraft((d) => ({ ...d, addedAfter: e.target.value }))}
          />
        </Group>
      </div>
    </Drawer>
  );
}
