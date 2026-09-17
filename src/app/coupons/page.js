'use client';

import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  Search, Plus, Ticket, Pencil, Trash2, MoreHorizontal, X, Copy, Percent, DollarSign, Truck, Power,
} from 'lucide-react';
import { api, qs } from '@/lib/api';
import { cn, currency, dateShort, number } from '@/lib/format';
import { useDebouncedValue } from '@/lib/hooks';
import { toast } from '@/store/slices/uiSlice';
import { useI18n } from '@/i18n/I18nProvider';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Badge, { StatusBadge, COUPON_STATUS } from '@/components/ui/Badge';
import Pagination from '@/components/ui/Pagination';
import Dropdown, { MenuItem, MenuSeparator } from '@/components/ui/Dropdown';
import Modal, { ConfirmDialog } from '@/components/ui/Modal';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import { SkeletonTable } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';

/* Static class strings — Tailwind can only see literals at build time. */
const TYPES = {
  percentage: { label: 'Percentage', icon: Percent, chip: 'bg-brand-soft text-brand-text' },
  fixed: { label: 'Fixed amount', icon: DollarSign, chip: 'bg-info-soft text-info-text' },
  free_shipping: { label: 'Free shipping', icon: Truck, chip: 'bg-success-soft text-success-text' },
};

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrder: '', limit: '',
  startsAt: '', expiresAt: '', status: 'active', appliesTo: 'all', scope: [], description: '',
};

function CouponDialog({ open, onClose, coupon, onSaved }) {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const editing = Boolean(coupon);
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setValues(coupon ? { ...EMPTY, ...coupon, value: String(coupon.value), minOrder: String(coupon.minOrder), limit: coupon.limit ?? '' } : EMPTY);
      setErrors({});
    }
  }, [open, coupon]);

  const set = (key) => (e) => {
    setValues((v) => ({ ...v, [key]: e?.target ? e.target.value : e }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  const submit = async (e) => {
    e.preventDefault();
    const errs = {};
    if (!values.code.trim()) errs.code = 'Coupon code is required.';
    if (values.type !== 'free_shipping') {
      if (!values.value) errs.value = 'Enter a discount value.';
      else if (!(parseFloat(values.value) > 0)) errs.value = 'Discount value must be greater than 0.';
      else if (values.type === 'percentage' && parseFloat(values.value) > 100)
        errs.value = 'A percentage discount cannot exceed 100%.';
    }
    if (!values.expiresAt) errs.expiresAt = 'Choose an expiration date.';
    if (values.startsAt && values.expiresAt && values.startsAt > values.expiresAt)
      errs.expiresAt = 'The expiration date must be after the start date.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      if (editing) await api(`/api/coupons/${coupon.id}`, { method: 'PUT', body: values });
      else await api('/api/coupons', { method: 'POST', body: values });
      dispatch(toast.success(editing ? t('toast.couponUpdated') : t('toast.couponCreated'), t('toast.couponReady', { code: values.code.toUpperCase() })));
      onSaved();
      onClose();
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      else dispatch(toast.error(t('toast.couponSaveError'), err.message));
    } finally {
      setSaving(false);
    }
  };

  const isShipping = values.type === 'free_shipping';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('couponsPage.edit') : t('couponsPage.create')}
      description={editing ? 'Update this discount.' : 'Set up a new discount for your store.'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={saving}>Cancel</Button>
          <Button variant="primary" onClick={submit} loading={saving}>
            {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Coupon'}
          </Button>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="flex flex-col gap-4 pb-2">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label={t('couponsPage.code')}
            required
            data-autofocus
            placeholder="SUMMER25"
            value={values.code}
            onChange={(e) => { setValues((v) => ({ ...v, code: e.target.value.toUpperCase() })); setErrors((p) => ({ ...p, code: undefined })); }}
            error={errors.code}
            className="font-mono uppercase"
            hint={!errors.code ? 'Customers type this at checkout.' : undefined}
          />
          <Select
            label={t('couponsPage.type')}
            required
            options={Object.entries(TYPES).map(([value]) => ({
              value,
              label: t(`couponsPage.${value === 'free_shipping' ? 'freeShipping' : value}`),
            }))}
            value={values.type}
            onChange={set('type')}
          />
        </div>

        {/* Conditional: a free-shipping coupon has no value to enter */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {!isShipping && (
            <Input
              label={values.type === 'percentage' ? 'Discount percentage' : 'Discount amount'}
              required
              type="number"
              min="0"
              step={values.type === 'percentage' ? '1' : '0.01'}
              max={values.type === 'percentage' ? '100' : undefined}
              prefix={values.type === 'fixed' ? '$' : undefined}
              suffix={values.type === 'percentage' ? '%' : undefined}
              className={values.type === 'fixed' ? 'pl-7' : ''}
              placeholder={values.type === 'percentage' ? '25' : '50.00'}
              value={values.value}
              onChange={set('value')}
              error={errors.value}
            />
          )}
          <Input
            label={t('couponsPage.minOrder')}
            type="number"
            min="0"
            step="0.01"
            prefix="$"
            className="pl-7"
            placeholder="0.00"
            value={values.minOrder}
            onChange={set('minOrder')}
            hint="Leave at 0 for no minimum."
          />
          {isShipping && (
            <div className="flex items-end">
              <p className="rounded-card bg-info-soft px-3 py-2 text-caption leading-relaxed text-info-text">
                Free shipping coupons waive the delivery charge — no discount value needed.
              </p>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Input label={t('couponsPage.starts')} type="date" value={values.startsAt} onChange={set('startsAt')} />
          <Input label={t('couponsPage.expires')} type="date" required value={values.expiresAt} onChange={set('expiresAt')} error={errors.expiresAt} />
          <Input
            label={t('couponsPage.limit')}
            type="number"
            min="0"
            placeholder="Unlimited"
            value={values.limit}
            onChange={set('limit')}
            hint="Total redemptions."
          />
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select
            label={t('couponsPage.appliesTo')}
            options={[
              { value: 'all', label: t('couponsPage.allProducts') },
              { value: 'categories', label: 'Specific categories' },
              { value: 'products', label: 'Specific products' },
            ]}
            value={values.appliesTo}
            onChange={set('appliesTo')}
          />
          <Select
            label="Status"
            options={[
              { value: 'active', label: 'Active' },
              { value: 'scheduled', label: 'Scheduled' },
              { value: 'disabled', label: 'Disabled' },
            ]}
            value={values.status}
            onChange={set('status')}
          />
        </div>

        <Textarea
          label={t('couponsPage.note')}
          rows={2}
          placeholder="What is this coupon for? Only your team sees this."
          value={values.description}
          onChange={set('description')}
        />
      </form>
    </Modal>
  );
}

export default function CouponsPage() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const [state, setState] = useState({ status: 'loading', data: [], total: 0, totalPages: 1 });
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [page, setPage] = useState(1);
  const [dialog, setDialog] = useState({ open: false, coupon: null });
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debounced = useDebouncedValue(query, 300);

  const load = async () => {
    setState((s) => ({ ...s, status: 'loading' }));
    try {
      const res = await api(`/api/coupons${qs({ q: debounced, status: statusFilter, type: typeFilter, page, pageSize: 10 })}`);
      setState({ status: 'succeeded', ...res });
    } catch {
      setState((s) => ({ ...s, status: 'failed' }));
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced, statusFilter, typeFilter, page]);

  const doDelete = async () => {
    setDeleting(true);
    try {
      await api(`/api/coupons/${confirmDelete.id}`, { method: 'DELETE' });
      dispatch(toast.success(t('toast.couponDeleted'), t('toast.couponDeletedHint', { code: confirmDelete.code })));
      setConfirmDelete(null);
      load();
    } catch {
      dispatch(toast.error(t('toast.couponDeleteError'), t('common.tryAgain')));
    } finally {
      setDeleting(false);
    }
  };

  const toggleStatus = async (c) => {
    const next = c.status === 'disabled' ? 'active' : 'disabled';
    try {
      await api(`/api/coupons/${c.id}`, { method: 'PUT', body: { ...c, status: next } });
      dispatch(toast.success(next === 'active' ? t('toast.couponEnabled') : t('toast.couponDisabled'), t('toast.couponNow', { code: c.code, status: t(`status.${next}`) })));
      load();
    } catch {
      dispatch(toast.error(t('toast.couponUpdateError')));
    }
  };

  const hasFilters = Boolean(query || statusFilter || typeFilter);
  const loading = state.status === 'loading';

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('couponsPage.title')}
        description={t('couponsPage.description')}
        actions={
          <Button variant="primary" icon={Plus} onClick={() => setDialog({ open: true, coupon: null })}>
            {t('couponsPage.create')}
          </Button>
        }
      />

      <Card className="flex flex-col">
        <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
          <div className="relative min-w-0 flex-1 sm:max-w-xs">
            <Input
              type="search"
              icon={Search}
              placeholder={t('couponsPage.search')}
              aria-label={t('couponsPage.search')}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setPage(1); }}
              className="h-8"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery('')}
                aria-label="Clear search"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
              >
                <X aria-hidden className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <Select
            size="sm"
            aria-label="Filter by status"
            options={[{ value: '', label: t('filters.allStatuses') }, ...Object.entries(COUPON_STATUS).map(([value]) => ({ value, label: t(`status.${value}`) }))]}
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="w-36"
          />
          <Select
            size="sm"
            aria-label="Filter by type"
            options={[{ value: '', label: t('filters.allTypes') }, ...Object.entries(TYPES).map(([value]) => ({ value, label: t(`couponsPage.${value === 'free_shipping' ? 'freeShipping' : value}`) }))]}
            value={typeFilter}
            onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }}
            className="w-40"
          />
          {hasFilters && (
            <Button size="sm" variant="ghost" onClick={() => { setQuery(''); setStatusFilter(''); setTypeFilter(''); }}>
              Clear
            </Button>
          )}
        </div>

        {state.status === 'failed' ? (
          <ErrorState title={t('couponsPage.loadError')} description="Please try again." onRetry={load} />
        ) : loading && state.data.length === 0 ? (
          <SkeletonTable rows={6} columns={6} checkbox={false} />
        ) : state.data.length === 0 ? (
          <EmptyState
            icon={Ticket}
            title={hasFilters ? t('couponsPage.noneFound') : t('couponsPage.empty')}
            description={hasFilters ? 'No coupons match your filters.' : 'Create your first discount to start running promotions.'}
            action={
              <Button variant="primary" icon={Plus} onClick={() => setDialog({ open: true, coupon: null })}>
                Create Coupon
              </Button>
            }
          />
        ) : (
          <TableWrap className={cn(loading && 'pointer-events-none opacity-60')}>
            <Table>
              <caption className="sr-only">Discount coupons with their usage and expiry.</caption>
              <THead>
                <tr>
                  <TH className="min-w-[180px]">{t('couponsPage.colCode')}</TH>
                  <TH>{t('couponsPage.colType')}</TH>
                  <TH align="right">{t('couponsPage.colDiscount')}</TH>
                  <TH align="right">{t('couponsPage.colUsage')}</TH>
                  <TH className="hidden md:table-cell">{t('couponsPage.colExpiration')}</TH>
                  <TH>{t('couponsPage.colStatus')}</TH>
                  <TH width="60px" align="right"><span className="sr-only">Actions</span></TH>
                </tr>
              </THead>
              <TBody>
                {state.data.map((c) => {
                  const cfg = TYPES[c.type];
                  const Icon = cfg.icon;
                  const usagePct = c.limit ? Math.min(100, (c.usage / c.limit) * 100) : null;
                  const expired = c.status === 'expired';
                  return (
                    <TR key={c.id}>
                      <TD>
                        <div className="flex items-center gap-2.5">
                          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-control', cfg.chip)}>
                            <Icon aria-hidden className="h-4 w-4" />
                          </span>
                          <div className="min-w-0">
                            <button
                              type="button"
                              onClick={() => {
                                navigator.clipboard?.writeText(c.code);
                                dispatch(toast.success(t('toast.couponCopied')));
                              }}
                              className="group/copy flex items-center gap-1.5 rounded font-mono text-body-sm font-semibold text-ink transition-colors hover:text-brand-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                              aria-label={`Copy coupon code ${c.code}`}
                            >
                              {c.code}
                              <Copy aria-hidden className="h-3 w-3 opacity-0 transition-opacity group-hover/copy:opacity-60" />
                            </button>
                            {c.description && <p className="truncate text-caption text-ink-3">{c.description}</p>}
                          </div>
                        </div>
                      </TD>
                      <TD muted>{t(`couponsPage.${c.type === 'free_shipping' ? 'freeShipping' : c.type}`)}</TD>
                      <TD align="right" numeric strong>
                        {c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? currency(c.value) : 'Free ship'}
                        {c.minOrder > 0 && (
                          <span className="block text-caption font-normal text-ink-3">min {currency(c.minOrder, { decimals: 0 })}</span>
                        )}
                      </TD>
                      <TD align="right">
                        <div className="flex flex-col items-end gap-1">
                          <span className="text-body-sm font-medium tabular-nums text-ink">
                            {number(c.usage)}
                            {c.limit ? <span className="text-ink-3"> / {number(c.limit)}</span> : null}
                          </span>
                          {usagePct != null && (
                            <span className="h-1 w-16 overflow-hidden rounded-pill bg-surface-3" aria-hidden>
                              <span
                                className={cn('block h-full rounded-pill', usagePct >= 90 ? 'bg-danger' : usagePct >= 70 ? 'bg-warning' : 'bg-brand')}
                                style={{ width: `${usagePct}%` }}
                              />
                            </span>
                          )}
                        </div>
                      </TD>
                      <TD numeric muted className="hidden md:table-cell">
                        <span className={expired ? 'text-ink-3 line-through' : ''}>{dateShort(c.expiresAt)}</span>
                      </TD>
                      <TD>
                        <StatusBadge map={COUPON_STATUS} value={c.status} size="sm" />
                      </TD>
                      <TD align="right">
                        <Dropdown
                          menuLabel={`Actions for ${c.code}`}
                          trigger={<IconButton icon={MoreHorizontal} size="sm" label={`Actions for coupon ${c.code}`} />}
                        >
                          {({ close }) => (
                            <>
                              <MenuItem icon={Pencil} onClick={() => { close(); setDialog({ open: true, coupon: c }); }}>
                                {t('common.edit')}
                              </MenuItem>
                              <MenuItem
                                icon={Copy}
                                onClick={() => {
                                  close();
                                  navigator.clipboard?.writeText(c.code);
                                  dispatch(toast.success(t('toast.couponCopied')));
                                }}
                              >
                                {t('couponsPage.copyCode')}
                              </MenuItem>
                              <MenuItem icon={Power} onClick={() => { close(); toggleStatus(c); }}>
                                {c.status === 'disabled' ? 'Enable' : 'Disable'}
                              </MenuItem>
                              <MenuSeparator />
                              <MenuItem icon={Trash2} destructive onClick={() => { close(); setConfirmDelete(c); }}>
                                {t('common.delete')}
                              </MenuItem>
                            </>
                          )}
                        </Dropdown>
                      </TD>
                    </TR>
                  );
                })}
              </TBody>
            </Table>
          </TableWrap>
        )}

        <Pagination
          page={page}
          totalPages={state.totalPages}
          total={state.total}
          pageSize={10}
          itemLabel={t('couponsPage.itemLabel')}
          onPageChange={setPage}
        />
      </Card>

      <CouponDialog
        open={dialog.open}
        coupon={dialog.coupon}
        onClose={() => setDialog({ open: false, coupon: null })}
        onSaved={load}
      />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDelete}
        loading={deleting}
        title={t('confirm.deleteCoupon')}
        message={confirmDelete ? t('confirm.deleteCouponMsg', { code: confirmDelete.code }) : ''}
        confirmLabel={t('common.delete')}
      />
    </div>
  );
}
