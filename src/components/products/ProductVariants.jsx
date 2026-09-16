'use client';

import { cn, currency, number } from '@/lib/format';
import { Table, TableWrap, TBody, TD, TH, THead, TR } from '@/components/ui/Table';
import Badge from '@/components/ui/Badge';
import EmptyState from '@/components/ui/EmptyState';
import { Layers } from 'lucide-react';

/** Variant matrix. Stock is coloured against the product's own threshold. */
export default function ProductVariants({ variants = [], basePrice, threshold = 5 }) {
  if (!variants.length) {
    return (
      <EmptyState
        compact
        icon={Layers}
        title="No variants"
        description="This product is sold as a single option."
      />
    );
  }

  const hasSize = variants.some((v) => v.size && v.size !== 'One Size');

  return (
    <TableWrap>
      <Table>
        <THead>
          <tr>
            {hasSize && <TH>Size</TH>}
            <TH>Color</TH>
            <TH>SKU</TH>
            <TH align="right">Price</TH>
            <TH align="right">Stock</TH>
          </tr>
        </THead>
        <TBody>
          {variants.map((v) => {
            const low = v.stock <= threshold;
            const out = v.stock === 0;
            return (
              <TR key={v.id}>
                {hasSize && (
                  <TD strong>
                    <span className="inline-flex h-6 min-w-[28px] items-center justify-center rounded-control border border-line bg-surface-2 px-1.5 text-caption font-semibold tabular-nums text-ink">
                      {v.size}
                    </span>
                  </TD>
                )}
                <TD>
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden
                      className="h-3.5 w-3.5 shrink-0 rounded-full border border-line-strong"
                      style={{ backgroundColor: colorSwatch(v.color) }}
                    />
                    {v.color}
                  </span>
                </TD>
                <TD>
                  <span className="font-mono text-caption text-ink-2">{v.sku}</span>
                </TD>
                <TD align="right" numeric strong>
                  {currency(v.price ?? basePrice)}
                </TD>
                <TD align="right">
                  <span
                    className={cn(
                      'font-medium tabular-nums',
                      out ? 'text-danger-text' : low ? 'text-warning-text' : 'text-ink'
                    )}
                  >
                    {number(v.stock)}
                  </span>
                  {out && <Badge tone="danger" size="sm" className="ml-2">Out</Badge>}
                  {!out && low && <Badge tone="warning" size="sm" className="ml-2">Low</Badge>}
                </TD>
              </TR>
            );
          })}
        </TBody>
      </Table>
    </TableWrap>
  );
}

const SWATCHES = {
  white: '#ffffff', black: '#1a1a1a', charcoal: '#3a3f45', sand: '#d8c3a5',
  oat: '#e4dccb', navy: '#1e3a5f', natural: '#e8e0d0', olive: '#6b7250',
  tan: '#c68d5c', espresso: '#4a3428', tobacco: '#8a5a3b', midnight: '#1c2333',
  silver: '#c9ced6', ember: '#e2703a', slate: '#5a6572', sky: '#a9cbe3',
  cream: '#f2e8d8', sage: '#a8b8a0', graphite: '#41464d', ivory: '#f5f0e6',
  camel: '#c19a6b', gold: '#c9a227', gunmetal: '#4c5157', 'matte black': '#22252a',
  'matte cream': '#efe6d5', 'brushed steel': '#b8bcc0',
};
function colorSwatch(name = '') {
  return SWATCHES[name.toLowerCase()] || '#b9bec6';
}
