'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import {
  Plus, Search, SlidersHorizontal, Columns3, Download, Upload, X, Check,
} from 'lucide-react';
import { cn, titleCase, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { useDebouncedValue } from '@/lib/hooks';
import { downloadCSV } from '@/lib/export';
import {
  fetchProducts, setFilter, setPage, setPageSize, clearAllFilters, toggleColumn,
  resetColumns, clearSelection, bulkUpdateProducts, deleteProduct, duplicateProduct,
  DEFAULT_COLUMNS,
} from '@/store/slices/productsSlice';
import { fetchCategories } from '@/store/slices/categoriesSlice';
import { toast } from '@/store/slices/uiSlice';

import PageHeader from '@/components/ui/PageHeader';
import Button from '@/components/ui/Button';
import IconButton from '@/components/ui/IconButton';
import Card from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import Checkbox from '@/components/ui/Checkbox';
import Popover from '@/components/ui/Popover';
import Dropdown, { MenuItem, MenuLabel, MenuSeparator } from '@/components/ui/Dropdown';
import Pagination from '@/components/ui/Pagination';
import FilterChips from '@/components/ui/FilterChips';
import BulkBar from '@/components/ui/BulkBar';
import { ConfirmDialog } from '@/components/ui/Modal';
import Tabs from '@/components/ui/Tabs';
import { PRODUCT_STATUS, STOCK_STATUS } from '@/components/ui/Badge';
import ProductTable from '@/components/products/ProductTable';
import ProductFilters from '@/components/products/ProductFilters';

const COLUMN_LABELS = {
  product: 'Product',
  sku: 'SKU',
  category: 'Category',
  price: 'Price',
  stock: 'Stock',
  status: 'Status',
  updated: 'Updated',
  supplier: 'Supplier',
};

export default function ProductsPage() {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();
  const router = useRouter();
  const {
    filters, sort, page, pageSize, total, totalPages, selected, columns, summary, items,
  } = useSelector((s) => s.products);
  const categories = useSelector((s) => s.categories.all);

  const [searchInput, setSearchInput] = useState(filters.q);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const debouncedSearch = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    if (debouncedSearch !== filters.q) dispatch(setFilter({ key: 'q', value: debouncedSearch }));
  }, [debouncedSearch, filters.q, dispatch]);

  useEffect(() => {
    dispatch(fetchProducts());
  }, [dispatch, filters, sort, page, pageSize]);

  const catName = useCallback(
    (id) => {
      const c = categories.find((x) => x.id === id);
      return c ? localized(c, 'name', locale) : id;
    },
    [categories, locale]
  );

  /* Chips reflect exactly what the server is filtering on. */
  const chips = useMemo(() => {
    const out = [];
    filters.category.forEach((v) => out.push({ key: 'category', value: v, label: 'Category', display: catName(v) }));
    filters.status.forEach((v) => out.push({ key: 'status', value: v, label: 'Status', display: PRODUCT_STATUS[v]?.label || v }));
    filters.stock.forEach((v) => out.push({ key: 'stock', value: v, label: 'Stock', display: STOCK_STATUS[v]?.label || v }));
    if (filters.minPrice || filters.maxPrice) {
      out.push({
        key: 'price',
        value: 'price',
        label: 'Price',
        display: `$${filters.minPrice || '0'} – ${filters.maxPrice ? `$${filters.maxPrice}` : 'any'}`,
      });
    }
    if (filters.addedAfter) out.push({ key: 'addedAfter', value: filters.addedAfter, label: 'Added after', display: filters.addedAfter });
    return out;
  }, [filters, catName]);

  const removeChip = (chip) => {
    if (chip.key === 'price') {
      dispatch(setFilter({ key: 'minPrice', value: '' }));
      dispatch(setFilter({ key: 'maxPrice', value: '' }));
    } else if (chip.key === 'addedAfter') {
      dispatch(setFilter({ key: 'addedAfter', value: '' }));
    } else {
      dispatch(setFilter({ key: chip.key, value: filters[chip.key].filter((v) => v !== chip.value) }));
    }
  };

  const clearEverything = () => {
    dispatch(clearAllFilters());
    setSearchInput('');
  };

  const handleExport = (rows, label) => {
    downloadCSV(`nexora-products-${new Date().toISOString().slice(0, 10)}.csv`, rows, [
      { header: 'Name', value: (r) => r.name },
      { header: 'SKU', value: (r) => r.sku },
      { header: 'Category', value: (r) => catName(r.categoryId) },
      { header: 'Brand', value: (r) => r.brand },
      { header: 'Price', value: (r) => r.price.toFixed(2) },
      { header: 'Compare at', value: (r) => (r.compareAt ? r.compareAt.toFixed(2) : '') },
      { header: 'Cost', value: (r) => r.cost.toFixed(2) },
      { header: 'Stock', value: (r) => r.stock },
      { header: 'Low stock threshold', value: (r) => r.threshold },
      { header: 'Status', value: (r) => titleCase(r.status) },
      { header: 'Stock status', value: (r) => STOCK_STATUS[r.stockStatus]?.label },
      { header: 'Supplier', value: (r) => r.supplier },
      { header: 'Updated', value: (r) => r.updatedAt },
    ]);
    dispatch(toast.success(t('toast.exportReady'), t('toast.exportedCsv', { n: rows.length, label })));
  };

  const runBulk = async (action, value, message) => {
    try {
      await dispatch(bulkUpdateProducts({ ids: selected, action, value })).unwrap();
      dispatch(toast.success(message));
    } catch {
      dispatch(toast.error(t('toast.bulkUpdateError'), t('common.tryAgain')));
    }
  };

  const doDelete = async () => {
    setDeleting(true);
    try {
      await dispatch(deleteProduct(confirmDelete.id)).unwrap();
      dispatch(toast.success(t('toast.productDeleted'), t('toast.productDeletedHint', { name: confirmDelete.name })));
      setConfirmDelete(null);
    } catch {
      dispatch(toast.error(t('toast.productDeleteError'), t('common.tryAgain')));
    } finally {
      setDeleting(false);
    }
  };

  const statusTabs = summary
    ? [
        { value: 'all', label: t('common.all'), count: summary.total },
        { value: 'active', label: t('status.active'), count: summary.active },
        { value: 'draft', label: t('status.draft'), count: summary.draft },
        { value: 'archived', label: t('status.archived'), count: summary.archived },
      ]
    : [{ value: 'all', label: t('common.all') }];

  const activeTab = filters.status.length === 1 ? filters.status[0] : 'all';
  const visibleColumnCount = Object.values(columns).filter(Boolean).length;

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={t('products.title')}
        description={t('products.description')}
        actions={
          <>
            <Button
              variant="secondary"
              icon={Upload}
              className="hidden sm:inline-flex"
              onClick={() => dispatch(toast.info(t('toast.importDemo'), t('toast.importDemoHint')))}
            >
              {t('common.import')}
            </Button>
            <Button variant="secondary" icon={Download} onClick={() => handleExport(items, 'products')}>
              {t('common.export')}
            </Button>
            <Button as={Link} href="/products/new" variant="primary" icon={Plus}>
              {t('products.add')}
            </Button>
          </>
        }
      />

      <Card className="flex flex-col">
        {/* Status tabs */}
        <div className="px-4 sm:px-5">
          <Tabs
            tabs={statusTabs}
            value={activeTab}
            ariaLabel="Filter products by status"
            onChange={(v) => dispatch(setFilter({ key: 'status', value: v === 'all' ? [] : [v] }))}
          />
        </div>

        {/* Toolbar — replaced by the bulk bar while rows are selected */}
        {selected.length > 0 ? (
          <BulkBar count={selected.length} itemLabel="product" onClear={() => dispatch(clearSelection())}>
            <Dropdown
              menuLabel="Change status"
              trigger={<Button size="sm" variant="secondary">{t('products.changeStatus')}</Button>}
            >
              {({ close }) =>
                Object.entries(PRODUCT_STATUS).map(([value, cfg]) => (
                  <MenuItem
                    key={value}
                    onClick={() => { close(); runBulk('status', value, t('toast.productBulkStatus', { n: selected.length, status: t(`status.${value}`) })); }}
                  >
                    {t(`status.${value}`)}
                  </MenuItem>
                ))
              }
            </Dropdown>

            <Dropdown
              menuLabel="Move to category"
              trigger={<Button size="sm" variant="secondary">{t('products.moveCategory')}</Button>}
            >
              {({ close }) =>
                categories.map((c) => (
                  <MenuItem
                    key={c.id}
                    onClick={() => { close(); runBulk('category', c.id, t('toast.productBulkMoved', { n: selected.length, name: localized(c, 'name', locale) })); }}
                  >
                    {localized(c, 'name', locale)}
                  </MenuItem>
                ))
              }
            </Dropdown>

            <Button
              size="sm"
              variant="secondary"
              onClick={() => handleExport(items.filter((i) => selected.includes(i.id)), 'selected products')}
            >
              {t('common.export')}
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => runBulk('archive', null, t('toast.productBulkArchived', { n: selected.length }))}
            >
              {t('products.archive')}
            </Button>
          </BulkBar>
        ) : (
          <div className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3 sm:px-5">
            <div className="relative min-w-0 flex-1 sm:max-w-xs">
              <Input
                type="search"
                icon={Search}
                placeholder={t('products.search')}
                aria-label={t('products.searchAria')}
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="h-8"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput('')}
                  aria-label="Clear search"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-ink-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                >
                  <X aria-hidden className="h-3.5 w-3.5" />
                </button>
              )}
            </div>

            <Button
              size="sm"
              variant="secondary"
              icon={SlidersHorizontal}
              onClick={() => setFiltersOpen(true)}
            >
              {t('common.filters')}
              {chips.length > 0 && (
                <span className="ml-0.5 rounded-pill bg-brand px-1.5 text-[10px] font-bold leading-4 text-white">
                  {chips.length}
                </span>
              )}
            </Button>

            <Popover
              width="w-56"
              trigger={
                <Button size="sm" variant="secondary" icon={Columns3}>
                  Columns
                </Button>
              }
            >
              <div className="p-1">
                <div className="flex items-center justify-between px-2.5 pb-1 pt-2">
                  <span className="text-micro uppercase tracking-wide text-ink-3">Visible columns</span>
                  <button
                    type="button"
                    onClick={() => dispatch(resetColumns())}
                    className="rounded text-caption font-medium text-brand-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                  >
                    Reset
                  </button>
                </div>
                <ul className="py-1">
                  {Object.keys(DEFAULT_COLUMNS).map((key) => {
                    const isLast = visibleColumnCount === 1 && columns[key];
                    return (
                      <li key={key}>
                        <label
                          className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-[7px] px-2.5 py-1.5 transition-colors hover:bg-surface-2',
                            isLast && 'cursor-not-allowed opacity-50'
                          )}
                        >
                          <Checkbox
                            checked={columns[key]}
                            disabled={isLast}
                            onChange={() => dispatch(toggleColumn(key))}
                          />
                          <span className="text-body-sm text-ink">{COLUMN_LABELS[key]}</span>
                        </label>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </Popover>

            <div className="ml-auto hidden items-center gap-2 lg:flex">
              <Button size="sm" variant="ghost" icon={Download} onClick={() => handleExport(items, 'products')}>
                Export
              </Button>
              <Button as={Link} href="/products/new" size="sm" variant="primary" icon={Plus}>
                Add Product
              </Button>
            </div>
          </div>
        )}

        {chips.length > 0 && (
          <FilterChips
            chips={chips}
            onRemove={removeChip}
            onClearAll={clearEverything}
            className="border-b border-line px-4 py-2.5 sm:px-5"
          />
        )}

        <ProductTable
          categories={categories}
          hasFilters={chips.length > 0 || Boolean(filters.q)}
          onRetry={() => dispatch(fetchProducts())}
          onClearFilters={clearEverything}
          onAdd={() => router.push('/products/new')}
          onView={(p) => router.push(`/products/${p.id}`)}
          onEdit={(p) => router.push(`/products/${p.id}/edit`)}
          onDuplicate={async (p) => {
            try {
              const copy = await dispatch(duplicateProduct(p.id)).unwrap();
              dispatch(toast.success(t('toast.productDuplicated'), t('toast.productDuplicatedHint', { name: copy.name })));
            } catch {
              dispatch(toast.error(t('toast.productDuplicateError'), t('common.tryAgain')));
            }
          }}
          onArchive={async (p) => {
            const next = p.status === 'archived' ? 'active' : 'archived';
            try {
              await dispatch(bulkUpdateProducts({ ids: [p.id], action: 'status', value: next })).unwrap();
              dispatch(toast.success(next === 'archived' ? t('toast.productArchived') : t('toast.productRestored'), t('toast.productNow', { name: p.name, status: t(`status.${next}`) })));
            } catch {
              dispatch(toast.error(t('toast.productUpdateError'), t('common.tryAgain')));
            }
          }}
          onDelete={(p) => setConfirmDelete(p)}
        />

        <Pagination
          page={page}
          totalPages={totalPages}
          total={total}
          pageSize={pageSize}
          itemLabel={t('products.itemLabel')}
          onPageChange={(p) => dispatch(setPage(p))}
          onPageSizeChange={(s) => dispatch(setPageSize(s))}
        />
      </Card>

      <ProductFilters open={filtersOpen} onClose={() => setFiltersOpen(false)} categories={categories} />

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        onConfirm={doDelete}
        loading={deleting}
        title={t('products.deleteTitle')}
        message={
          confirmDelete
            ? t('products.deleteMessage', { name: confirmDelete.name })
            : ''
        }
        confirmLabel={t('products.deleteConfirm')}
      />
    </div>
  );
}
