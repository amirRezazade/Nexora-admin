'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Package, Image as ImageIcon, DollarSign, Boxes, Layers, FileText, Search as SearchIcon,
  Plus, Trash2, AlertCircle, ArrowLeft,
} from 'lucide-react';
import { api } from '@/lib/api';
import { cn, currency, slugify, localized } from '@/lib/format';
import { useMediaQuery } from '@/lib/hooks';
import { useI18n } from '@/i18n/I18nProvider';
import { toast } from '@/store/slices/uiSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';

import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Textarea from '@/components/ui/Textarea';
import Select from '@/components/ui/Select';
import Alert from '@/components/ui/Alert';
import Badge from '@/components/ui/Badge';
import Accordion from '@/components/ui/Accordion';
import ProductGallery from '@/components/products/ProductGallery';

const BRANDS = ['Nova Basics', 'Nike', 'Aurex', 'Aldgate', 'Keystone', 'Terra Studio', 'Ridgeline'];
const SUPPLIERS = ['Loomcraft Textiles', 'Aurex Audio', 'Aldgate Leather Co.', 'Keystone Peripherals', 'Terra Ceramics', 'Ridgeline Outdoor', 'Northwind Athletics'];

const EMPTY = {
  name: '', nameFa: '', sku: '', categoryId: '', brand: 'Nova Basics', supplier: 'Loomcraft Textiles',
  status: 'draft', price: '', compareAt: '', cost: '', stock: '', threshold: '10',
  description: '', descriptionFa: '', seoTitle: '', metaDescription: '', slug: '',
  variants: [], tags: [], images: [],
};

/**
 * Full-page form. Complex product data doesn't belong in a modal — this needs
 * room, section structure and a persistent save affordance.
 */
export default function ProductForm({ mode = 'create', initial = null, productId }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const { t, locale } = useI18n();
  const categories = useSelector((s) => s.categories.all);
  const isMobile = useMediaQuery('(max-width: 767px)');

  const [values, setValues] = useState(initial ? { ...EMPTY, ...initial } : EMPTY);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [slugTouched, setSlugTouched] = useState(Boolean(initial?.slug));
  const errorSummaryRef = useRef(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (initial) setValues((v) => ({ ...EMPTY, ...initial }));
  }, [initial]);

  const set = (key) => (e) => {
    const value = e?.target ? e.target.value : e;
    setValues((v) => {
      const next = { ...v, [key]: value };
      if (key === 'name' && !slugTouched) next.slug = slugify(value);
      return next;
    });
    setDirty(true);
    // Clear the field error as soon as the user starts correcting it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  /* Client-side validation mirrors the server so users get instant feedback,
     but the server remains the source of truth. */
  const validate = () => {
    const e = {};
    if (!values.name.trim()) e.name = 'Product name is required.';
    else if (values.name.trim().length < 3) e.name = 'Product name must be at least 3 characters.';
    if (!values.sku.trim()) e.sku = 'SKU is required.';
    if (!values.categoryId) e.categoryId = 'Select a category.';
    if (values.price === '' || values.price == null) e.price = 'Price is required.';
    else if (!(parseFloat(values.price) > 0)) e.price = 'Price must be greater than 0.';
    if (values.compareAt && parseFloat(values.compareAt) <= parseFloat(values.price))
      e.compareAt = 'Compare-at price must be higher than the price.';
    if (values.cost && parseFloat(values.cost) < 0) e.cost = 'Cost can’t be negative.';
    if (values.stock === '' || values.stock == null) e.stock = 'Enter a stock quantity of 0 or more.';
    else if (parseInt(values.stock, 10) < 0) e.stock = 'Stock can’t be negative.';
    if (values.metaDescription && values.metaDescription.length > 160)
      e.metaDescription = 'Meta description should be 160 characters or fewer.';
    return e;
  };

  const submit = async (e) => {
    e.preventDefault();
    const clientErrors = validate();
    if (Object.keys(clientErrors).length) {
      setErrors(clientErrors);
      // Values are preserved — we only surface what needs fixing.
      requestAnimationFrame(() => errorSummaryRef.current?.focus());
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      const payload = { ...values, tags: values.tags };
      const res =
        mode === 'create'
          ? await api('/api/products', { method: 'POST', body: payload })
          : await api(`/api/products/${productId}`, { method: 'PUT', body: payload });

      dispatch(
        toast.success(
          mode === 'create' ? 'Product created successfully.' : 'Changes saved.',
          `“${res.data.name}” is now ${res.data.status}.`
        )
      );
      setDirty(false);
      router.push(`/products/${res.data.id}`);
    } catch (err) {
      if (err.errors) {
        setErrors(err.errors);
        requestAnimationFrame(() => errorSummaryRef.current?.focus());
        dispatch(toast.error('We couldn’t save the product.', 'Check the highlighted fields and try again.'));
      } else {
        dispatch(toast.error('We couldn’t save the product.', err.message));
      }
      setSubmitting(false);
    }
  };

  const addVariant = () => {
    setValues((v) => ({
      ...v,
      variants: [
        ...v.variants,
        { id: `new-${Date.now()}`, size: '', color: '', sku: '', price: null, stock: 0 },
      ],
    }));
    setDirty(true);
  };

  const updateVariant = (idx, key, value) => {
    setValues((v) => ({
      ...v,
      variants: v.variants.map((row, i) => (i === idx ? { ...row, [key]: value } : row)),
    }));
    setDirty(true);
  };

  const removeVariant = (idx) => {
    setValues((v) => ({ ...v, variants: v.variants.filter((_, i) => i !== idx) }));
    setDirty(true);
  };

  const errorList = Object.entries(errors).filter(([, v]) => v);
  const margin =
    values.price && values.cost
      ? ((parseFloat(values.price) - parseFloat(values.cost)) / parseFloat(values.price)) * 100
      : null;

  const categoryOptions = categories.map((c) => ({ value: c.id, label: localized(c, 'name', locale) }));

  /* Sections render as cards on desktop and collapsible accordions on mobile —
     a long form on a phone should not be one endless scroll. */
  const Section = ({ id, title, description, icon, children, defaultOpen = false }) =>
    isMobile ? (
      <Accordion id={id} title={title} description={description} icon={icon} defaultOpen={defaultOpen}>
        <div className="flex flex-col gap-4">{children}</div>
      </Accordion>
    ) : (
      <Card>
        <CardHeader title={title} description={description} />
        <CardBody className="flex flex-col gap-4">{children}</CardBody>
      </Card>
    );

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5 pb-24">
      <div className="flex items-start gap-3">
        <IconButton
          icon={ArrowLeft}
          label="Back to products"
          variant="secondary"
          onClick={() => router.back()}
          className="mt-1 shrink-0"
        />
        <div className="min-w-0">
          <h1 className="text-h1 text-ink">{mode === 'create' ? t('form.addProduct') : t('form.editProduct')}</h1>
          <p className="mt-1 text-body text-ink-2">
            {mode === 'create' ? t('form.addProductHint') : t('form.editProductHint')}
          </p>
        </div>
      </div>

      {/* Error summary — one place to see everything that needs fixing */}
      {errorList.length > 0 && (
        <div ref={errorSummaryRef} tabIndex={-1} className="focus:outline-none">
          <Alert tone="danger" title={`${errorList.length} field${errorList.length === 1 ? '' : 's'} need${errorList.length === 1 ? 's' : ''} attention`}>
            <ul className="mt-1 list-inside list-disc space-y-0.5">
              {errorList.map(([key, msg]) => (
                <li key={key}>{msg}</li>
              ))}
            </ul>
          </Alert>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
        {/* Main column */}
        <div className="flex flex-col gap-4">
          <Section id="info" title={t('form.info')} description="The essentials customers see first" icon={Package} defaultOpen>
            <Input
              label={t('form.name')}
              required
              placeholder="e.g. Merino Wool Crew Sweater"
              value={values.name}
              onChange={set('name')}
              error={errors.name}
              autoComplete="off"
            />
            <Input
              label={t('form.nameFa')}
              placeholder="مثلاً هودی اورسایز کلاسیک"
              value={values.nameFa || ''}
              onChange={set('nameFa')}
              dir="rtl"
              lang="fa"
              autoComplete="off"
            />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t('form.sku')}
                required
                placeholder="AP-MER-022"
                value={values.sku}
                onChange={set('sku')}
                error={errors.sku}
                hint={!errors.sku ? 'A unique code for your inventory system.' : undefined}
                autoComplete="off"
              />
              <Select
                label={t('form.category')}
                required
                placeholder={t('form.selectCategory')}
                options={categoryOptions}
                value={values.categoryId}
                onChange={set('categoryId')}
                error={errors.categoryId}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Select label={t('form.brand')} options={BRANDS.map((b) => ({ value: b, label: b }))} value={values.brand} onChange={set('brand')} />
              <Select label={t('form.supplier')} options={SUPPLIERS.map((s) => ({ value: s, label: s }))} value={values.supplier} onChange={set('supplier')} />
            </div>
          </Section>

          <Section id="media" title={t('form.media')} description="Images shown on the product page" icon={ImageIcon}>
            <div className="max-w-sm">
              <ProductGallery
                key={productId || 'new-product'}
                productId={productId || 'new-product'}
                name={values.name || t('form.newProduct')}
                images={values.images}
                editable
                onChange={(next) => {
                  setValues((v) => ({
                    ...v,
                    images: next.filter((im) => im.url).map((im, i) => ({ url: im.url, primary: i === 0 })),
                  }));
                  setDirty(true);
                }}
              />
            </div>
          </Section>

          <Section id="pricing" title={t('form.pricing')} description="What the customer pays and what it costs you" icon={DollarSign}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <Input
                label={t('form.price')}
                required
                type="number"
                step="0.01"
                min="0"
                prefix="$"
                placeholder="0.00"
                className="pl-7"
                value={values.price}
                onChange={set('price')}
                error={errors.price}
              />
              <Input
                label={t('form.compareAt')}
                type="number"
                step="0.01"
                min="0"
                prefix="$"
                placeholder="0.00"
                className="pl-7"
                value={values.compareAt}
                onChange={set('compareAt')}
                error={errors.compareAt}
                hint={!errors.compareAt ? 'Shown struck through.' : undefined}
              />
              <Input
                label={t('form.cost')}
                type="number"
                step="0.01"
                min="0"
                prefix="$"
                placeholder="0.00"
                className="pl-7"
                value={values.cost}
                onChange={set('cost')}
                error={errors.cost}
              />
            </div>
            {margin != null && Number.isFinite(margin) && (
              <div className="flex flex-wrap items-center gap-4 rounded-card bg-surface-2 px-4 py-3 text-body-sm">
                <span className="text-ink-2">
                  {t('form.profit')} <span className="font-semibold tabular-nums text-ink">{currency(parseFloat(values.price) - parseFloat(values.cost))}</span>
                </span>
                <span className="text-ink-2">
                  {t('form.margin')}{' '}
                  <span className={cn('font-semibold tabular-nums', margin >= 40 ? 'text-success-text' : 'text-warning-text')}>
                    {margin.toFixed(1)}%
                  </span>
                </span>
              </div>
            )}
            <Select
              label={t('form.tax')}
              options={[
                { value: 'standard', label: t('form.taxStandard') },
                { value: 'reduced', label: t('form.taxReduced') },
                { value: 'exempt', label: t('form.taxExempt') },
              ]}
              defaultValue="standard"
            />
          </Section>

          <Section id="inventory" title={t('form.inventory')} description="Stock levels and reorder alerts" icon={Boxes}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Input
                label={t('form.stockQty')}
                required
                type="number"
                min="0"
                placeholder="0"
                value={values.stock}
                onChange={set('stock')}
                error={errors.stock}
              />
              <Input
                label={t('form.threshold')}
                type="number"
                min="0"
                placeholder="10"
                value={values.threshold}
                onChange={set('threshold')}
                hint="You’ll be alerted at or below this level."
              />
            </div>
          </Section>

          <Section id="variants" title={t('form.variants')} description="Sizes, colours and their own stock" icon={Layers}>
            {values.variants.length === 0 ? (
              <div className="rounded-card border border-dashed border-line-strong px-4 py-8 text-center">
                <p className="text-body-sm text-ink-2">{t('form.noVariants')}</p>
                <Button type="button" variant="secondary" size="sm" icon={Plus} className="mt-3" onClick={addVariant}>
                  {t('form.addVariant')}
                </Button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-body-sm">
                    <thead>
                      <tr className="border-b border-line">
                        <th scope="col" className="pb-2 pr-3 text-left text-micro uppercase tracking-wide text-ink-3">{t('form.size')}</th>
                        <th scope="col" className="pb-2 pr-3 text-left text-micro uppercase tracking-wide text-ink-3">{t('form.color')}</th>
                        <th scope="col" className="pb-2 pr-3 text-left text-micro uppercase tracking-wide text-ink-3">{t('form.sku')}</th>
                        <th scope="col" className="pb-2 pr-3 text-right text-micro uppercase tracking-wide text-ink-3">{t('form.price')}</th>
                        <th scope="col" className="pb-2 pr-3 text-right text-micro uppercase tracking-wide text-ink-3">{t('form.stock')}</th>
                        <th scope="col" className="pb-2"><span className="sr-only">Remove</span></th>
                      </tr>
                    </thead>
                    <tbody>
                      {values.variants.map((v, i) => (
                        <tr key={v.id} className="border-b border-line last:border-0">
                          <td className="py-2 pr-3">
                            <input
                              aria-label={`Variant ${i + 1} size`}
                              value={v.size || ''}
                              onChange={(e) => updateVariant(i, 'size', e.target.value)}
                              placeholder="M"
                              className="h-8 w-20 rounded-control border border-line-strong bg-surface px-2 text-body-sm focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/20"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              aria-label={`Variant ${i + 1} color`}
                              value={v.color || ''}
                              onChange={(e) => updateVariant(i, 'color', e.target.value)}
                              placeholder="Charcoal"
                              className="h-8 w-28 rounded-control border border-line-strong bg-surface px-2 text-body-sm focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/20"
                            />
                          </td>
                          <td className="py-2 pr-3">
                            <input
                              aria-label={`Variant ${i + 1} SKU`}
                              value={v.sku || ''}
                              onChange={(e) => updateVariant(i, 'sku', e.target.value)}
                              placeholder="AP-MER-M-CHA"
                              className="h-8 w-36 rounded-control border border-line-strong bg-surface px-2 font-mono text-caption focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/20"
                            />
                          </td>
                          <td className="py-2 pr-3 text-right">
                            <input
                              aria-label={`Variant ${i + 1} price`}
                              type="number"
                              step="0.01"
                              value={v.price ?? ''}
                              onChange={(e) => updateVariant(i, 'price', e.target.value ? parseFloat(e.target.value) : null)}
                              placeholder={values.price || '—'}
                              className="h-8 w-24 rounded-control border border-line-strong bg-surface px-2 text-right text-body-sm tabular-nums focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/20"
                            />
                          </td>
                          <td className="py-2 pr-3 text-right">
                            <input
                              aria-label={`Variant ${i + 1} stock`}
                              type="number"
                              min="0"
                              value={v.stock ?? 0}
                              onChange={(e) => updateVariant(i, 'stock', parseInt(e.target.value, 10) || 0)}
                              className="h-8 w-20 rounded-control border border-line-strong bg-surface px-2 text-right text-body-sm tabular-nums focus:border-brand focus:outline-none focus:ring-[3px] focus:ring-brand/20"
                            />
                          </td>
                          <td className="py-2 text-right">
                            <IconButton
                              icon={Trash2}
                              size="sm"
                              variant="danger"
                              label={`Remove variant ${i + 1}`}
                              onClick={() => removeVariant(i)}
                            />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <Button type="button" variant="secondary" size="sm" icon={Plus} className="self-start" onClick={addVariant}>
                  {t('form.addVariant')}
                </Button>
              </>
            )}
          </Section>

          <Section id="description" title={t('form.description')} description="Tell customers what makes this product worth buying" icon={FileText}>
            <Textarea
              label={t('form.description')}
              rows={7}
              placeholder="Describe the material, fit, features and anything a customer would want to know before buying."
              value={values.description}
              onChange={set('description')}
              hint="Plain text. Keep it scannable — customers skim."
            />
          </Section>

          <Section id="seo" title={t('form.seo')} description="How this product appears in search results" icon={SearchIcon}>
            <Input
              label={t('form.seoTitle')}
              placeholder={values.name ? `${values.name} | Nova Store` : 'Product name | Nova Store'}
              value={values.seoTitle}
              onChange={set('seoTitle')}
              hint="Aim for 50–60 characters."
            />
            <Textarea
              label={t('form.meta')}
              rows={3}
              maxLength={160}
              placeholder="A short summary that appears under the title in search results."
              value={values.metaDescription}
              onChange={set('metaDescription')}
              error={errors.metaDescription}
            />
            <Input
              label={t('form.slug')}
              prefix=""
              placeholder="merino-wool-crew-sweater"
              value={values.slug}
              onChange={(e) => {
                setSlugTouched(true);
                set('slug')(e);
              }}
              hint={`novastore.com/products/${values.slug || 'your-product'}`}
              className="font-mono text-body-sm"
            />
          </Section>
        </div>

        {/* Side column */}
        <aside className="flex flex-col gap-4">
          <Card>
            <CardHeader title={t('form.visibility')} />
            <CardBody className="flex flex-col gap-4">
              <Select
                label={t('form.status')}
                options={[
                  { value: 'active', label: t('form.statusActive') },
                  { value: 'draft', label: t('form.statusDraft') },
                  { value: 'archived', label: t('form.statusArchived') },
                ]}
                value={values.status}
                onChange={set('status')}
              />
              <p className="text-caption leading-relaxed text-ink-3">
                {values.status === 'active'
                  ? 'This product is purchasable on your storefront.'
                  : values.status === 'draft'
                  ? 'Drafts are only visible to your team. Publish when you’re ready.'
                  : 'Archived products keep their order history but are hidden from customers.'}
              </p>
            </CardBody>
          </Card>

          <Card>
            <CardHeader title={t('form.summary')} />
            <CardBody>
              <dl className="divide-y divide-line text-body-sm">
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-ink-2">{t('form.price')}</dt>
                  <dd className="font-medium tabular-nums text-ink">
                    {values.price ? currency(parseFloat(values.price)) : '—'}
                  </dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-ink-2">{t('form.stock')}</dt>
                  <dd className="font-medium tabular-nums text-ink">{values.stock || '—'}</dd>
                </div>
                <div className="flex justify-between gap-3 py-2">
                  <dt className="text-ink-2">{t('form.variants')}</dt>
                  <dd className="font-medium tabular-nums text-ink">{values.variants.length}</dd>
                </div>
                <div className="flex items-center justify-between gap-3 py-2">
                  <dt className="text-ink-2">{t('form.status')}</dt>
                  <dd>
                    <Badge tone={values.status === 'active' ? 'success' : values.status === 'draft' ? 'neutral' : 'outline'} dot size="sm">
                      {t(`status.${values.status}`)}
                    </Badge>
                  </dd>
                </div>
              </dl>
            </CardBody>
          </Card>
        </aside>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 px-4 py-3 sm:px-5 lg:px-6">
          <p className="hidden text-caption text-ink-3 sm:block">
            {dirty ? t('common.unsaved') : mode === 'create' ? t('form.requiredHint') : t('common.saved')}
          </p>
          <div className="flex flex-1 items-center justify-end gap-2 sm:flex-none">
            <Button type="button" variant="secondary" onClick={() => router.back()} disabled={submitting} className="flex-1 sm:flex-none">
              {t('common.cancel')}
            </Button>
            <Button type="submit" variant="primary" loading={submitting} className="flex-1 sm:flex-none">
              {submitting ? t('common.saving') : mode === 'create' ? t('form.saveProduct') : t('common.save')}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
