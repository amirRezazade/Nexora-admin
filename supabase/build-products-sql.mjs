import { writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { products } from './catalog.mjs';

const here = dirname(fileURLToPath(import.meta.url));

function sqlStr(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlNum(v) {
  if (v === null || v === undefined) return 'NULL';
  return String(v);
}
function sqlJson(v) {
  return `${sqlStr(JSON.stringify(v))}::jsonb`;
}
function sqlTextArray(arr) {
  if (!arr?.length) return `'{}'::text[]`;
  return `${sqlStr('{' + arr.map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(',') + '}')}::text[]`;
}

const rows = products.map(
  (p) => `  (${sqlStr(p.id)}, ${sqlStr(p.name)}, ${sqlStr(p.sku)}, ${sqlStr(p.slug)}, ${sqlStr(p.categoryId)}, ${sqlNum(p.price)}, ${p.compareAt ? sqlNum(p.compareAt) : 'NULL'}, ${sqlNum(p.cost)}, ${sqlNum(p.stock)}, ${sqlStr(p.status)}, ${sqlStr(p.brand)}, ${sqlTextArray(p.tags)}, ${sqlJson(p.variants)}, ${sqlJson(p.images)}, ${sqlNum(p.rating)}, ${sqlNum(p.reviewCount)}, ${sqlStr(p.description)}, ${sqlStr(p.seoTitle)}, ${sqlStr(p.metaDescription)}, ${sqlStr(p.createdAt)}::date, ${sqlStr(p.updatedAt)}::date)`
);

const sql = `-- Nova products rebuild
-- Run in SQL Editor. Keeps categories/customers/orders.
-- Removes warehouse, supplier, threshold, reserved.
-- Adds images jsonb. Replaces catalog with 50 products.

begin;

drop view if exists inventory cascade;
drop view if exists product_image_urls cascade;

alter table products drop column if exists reserved;
alter table products drop column if exists threshold;
alter table products drop column if exists supplier;
alter table products drop column if exists warehouse;
alter table products add column if not exists images jsonb not null default '[]'::jsonb;

-- Old order lines keep a snapshot name even if product_id is cleared.
update order_items set product_id = null;
delete from reviews;
delete from product_images;
delete from products;

insert into products (
  id, name, sku, slug, category_id, price, compare_at, cost, stock, status, brand,
  tags, variants, images, rating, review_count, description, seo_title, meta_description,
  created_at, updated_at
) values
${rows.join(',\n')};

create or replace view inventory as
select
  p.id,
  p.id as product_id,
  p.name,
  p.sku,
  p.category_id,
  p.stock as available,
  p.cost,
  round(p.cost * p.stock, 2) as value,
  case
    when p.stock <= 0 then 'out_of_stock'
    when p.stock <= 8 then 'low_stock'
    else 'in_stock'
  end as status,
  p.updated_at,
  (select i->>'url' from jsonb_array_elements(p.images) i where (i->>'primary')::boolean limit 1) as primary_image
from products p;

commit;

-- Expected: 50 products
-- select count(*) from products;
`;

writeFileSync(join(here, 'migrate-products.sql'), sql);
writeFileSync(join(here, 'products.json'), JSON.stringify(products, null, 2));
console.log('products', products.length);
console.log('wrote migrate-products.sql');
