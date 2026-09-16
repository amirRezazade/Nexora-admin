'use client';

import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import {
  Eye, Pencil, Copy, Archive, Trash2, MoreHorizontal, Package,
} from 'lucide-react';
import { cn, currency, dateShort, number, localized } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import { setSort, toggleRow, toggleAllRows } from '@/store/slices/productsSlice';
import {
  Table, TableWrap, TBody, TD, TH, THead, TR, stickyLeft, stickyRight,
} from '@/components/ui/Table';
import Checkbox from '@/components/ui/Checkbox';
import ProductThumb from '@/components/ui/ProductThumb';
import Badge, { StatusBadge, PRODUCT_STATUS, STOCK_STATUS } from '@/components/ui/Badge';
import IconButton from '@/components/ui/IconButton';
import Dropdown, { MenuItem, MenuSeparator } from '@/components/ui/Dropdown';
import { SkeletonTable } from '@/components/ui/Skeleton';
import EmptyState from '@/components/ui/EmptyState';
import ErrorState from '@/components/ui/ErrorState';
import Button from '@/components/ui/Button';

function StockCell({ product }) {
  const { stock, threshold, stockStatus } = product;
  const tone = stockStatus === 'out_of_stock' ? 'text-danger-text' : stockStatus === 'low_stock' ? 'text-warning-text' : 'text-ink';
  return (
    <div className="flex flex-col items-end gap-0.5">
      <span className={cn('text-body-sm font-medium tabular-nums', tone)}>{number(stock)}</span>
      {stockStatus !== 'in_stock' && (
        <span className="text-[11px] leading-3 text-ink-3">min {threshold}</span>
      )}
    </div>
  );
}

export default function ProductTable({
  categories = [], onView, onEdit, onDuplicate, onArchive, onDelete, onRetry, onClearFilters, onAdd, hasFilters,
}) {
  const { t, locale } = useI18n();
  const dispatch = useDispatch();
  const { items, status, error, sort, selected, columns } = useSelector((s) => s.products);

  const catName = (id) => {
    const c = categories.find((x) => x.id === id);
    return c ? localized(c, 'name', locale) : id;
  };
  const allOnPageSelected = items.length > 0 && items.every((i) => selected.includes(i.id));
  const someOnPageSelected = items.some((i) => selected.includes(i.id));

  if (status === 'failed') {
    return (
      <ErrorState
        title={t('products.loadError')}
        description="Please try again. If the problem continues, check your connection."
        onRetry={onRetry}
      />
    );
  }

  if (status === 'loading' && items.length === 0) {
    return <SkeletonTable rows={8} columns={6} />;
  }

  if (status === 'succeeded' && items.length === 0) {
    return hasFilters ? (
      <EmptyState
        icon={Package}
        title={t('products.noneFound')}
        description="No products match your current filters. Try broadening your search or clearing the filters."
        action={
          <Button variant="secondary" onClick={onClearFilters}>
            {t('common.clearFilters')}
          </Button>
        }
      />
    ) : (
      <EmptyState
        icon={Package}
        title={t('products.emptyTitle')}
        description="Add your first product to start building your catalog."
        action={
          <Button variant="primary" onClick={onAdd}>
            {t('products.add')}
          </Button>
        }
      />
    );
  }

  return (
    <TableWrap className={cn(status === 'loading' && 'pointer-events-none opacity-60 transition-opacity')}>
      <Table>
        <caption className="sr-only">
          Product catalog. Use the column headers to sort and the checkboxes to select rows for bulk actions.
        </caption>
        <THead>
          <tr>
            <TH width="44px" className={cn(stickyLeft, 'bg-surface-2 group-hover:bg-surface-2')}>
              <Checkbox
                checked={allOnPageSelected}
                indeterminate={!allOnPageSelected && someOnPageSelected}
                onChange={() => dispatch(toggleAllRows())}
                aria-label={allOnPageSelected ? 'Deselect all products on this page' : 'Select all products on this page'}
              />
            </TH>
            {columns.product && (
              <TH sortable sortKey="name" currentSort={sort} onSort={(k) => dispatch(setSort(k))} className="min-w-[240px]">
                {t('products.colProduct')}
              </TH>
            )}
            {columns.sku && (
              <TH sortable sortKey="sku" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>
                {t('products.colSku')}
              </TH>
            )}
            {columns.category && (
              <TH sortable sortKey="categoryId" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>
                {t('products.colCategory')}
              </TH>
            )}
            {columns.price && (
              <TH align="right" sortable sortKey="price" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>
                {t('products.colPrice')}
              </TH>
            )}
            {columns.stock && (
              <TH align="right" sortable sortKey="stock" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>
                {t('products.colStock')}
              </TH>
            )}
            {columns.status && <TH>{t('products.colStatus')}</TH>}
            {columns.updated && (
              <TH sortable sortKey="updatedAt" currentSort={sort} onSort={(k) => dispatch(setSort(k))}>
                {t('products.colUpdated')}
              </TH>
            )}
            {columns.supplier && <TH>{t('products.colSupplier')}</TH>}
            <TH width="60px" align="right" className={cn(stickyRight, 'bg-surface-2')}>
              <span className="sr-only">Actions</span>
            </TH>
          </tr>
        </THead>

        <TBody>
          {items.map((p) => {
            const isSelected = selected.includes(p.id);
            return (
              <TR key={p.id} selected={isSelected}>
                <TD className={stickyLeft}>
                  <Checkbox
                    checked={isSelected}
                    onChange={() => dispatch(toggleRow(p.id))}
                    aria-label={`Select ${p.name}`}
                  />
                </TD>

                {columns.product && (
                  <TD>
                    <div className="flex items-center gap-3">
                      <ProductThumb name={p.name} seed={p.id} src={p.image} size="sm" />
                      <div className="min-w-0">
                        <Link
                          href={`/products/${p.id}`}
                          className="block truncate text-body-sm font-semibold text-ink underline-offset-4 transition-colors hover:text-brand-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand"
                        >
                          {localized(p, 'name', locale)}
                        </Link>
                        <p className="truncate text-caption text-ink-3">{p.brand}</p>
                      </div>
                    </div>
                  </TD>
                )}

                {columns.sku && (
                  <TD>
                    <span className="font-mono text-caption text-ink-2">{p.sku}</span>
                  </TD>
                )}

                {columns.category && (
                  <TD>
                    <Badge tone="outline">{catName(p.categoryId)}</Badge>
                  </TD>
                )}

                {columns.price && (
                  <TD align="right" numeric>
                    <div className="flex flex-col items-end">
                      <span className="font-medium text-ink">{currency(p.price)}</span>
                      {p.compareAt && (
                        <span className="text-[11px] leading-3 text-ink-3 line-through">{currency(p.compareAt)}</span>
                      )}
                    </div>
                  </TD>
                )}

                {columns.stock && (
                  <TD align="right">
                    <StockCell product={p} />
                  </TD>
                )}

                {columns.status && (
                  <TD>
                    <div className="flex flex-col items-start gap-1">
                      <StatusBadge map={PRODUCT_STATUS} value={p.status} size="sm" />
                      {p.stockStatus !== 'in_stock' && (
                        <StatusBadge map={STOCK_STATUS} value={p.stockStatus} size="sm" />
                      )}
                    </div>
                  </TD>
                )}

                {columns.updated && <TD numeric muted>{dateShort(p.updatedAt)}</TD>}
                {columns.supplier && <TD muted>{p.supplier}</TD>}

                <TD align="right" className={stickyRight}>
                  <Dropdown
                    menuLabel={`Actions for ${p.name}`}
                    trigger={<IconButton icon={MoreHorizontal} size="sm" label={`Actions for ${p.name}`} />}
                  >
                    {({ close }) => (
                      <>
                        <MenuItem icon={Eye} onClick={() => { close(); onView(p); }}>
                          {t('common.view')}
                        </MenuItem>
                        <MenuItem icon={Pencil} onClick={() => { close(); onEdit(p); }}>
                          {t('common.edit')}
                        </MenuItem>
                        <MenuItem icon={Copy} onClick={() => { close(); onDuplicate(p); }}>
                          {t('products.duplicate')}
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem icon={Archive} onClick={() => { close(); onArchive(p); }}>
                          {p.status === 'archived' ? t('products.restore') : t('products.archive')}
                        </MenuItem>
                        <MenuItem icon={Trash2} destructive onClick={() => { close(); onDelete(p); }}>
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
  );
}
