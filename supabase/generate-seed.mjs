/**
 * Turns mockapi/data JSON into supabase/seed.sql
 */
import { readFileSync, writeFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const here = dirname(fileURLToPath(import.meta.url));
const dataDir = join(here, '../mockapi/data');
const outFile = join(here, 'seed.sql');

const load = (name) => JSON.parse(readFileSync(join(dataDir, `${name}.json`), 'utf8'));

const categories = load('categories');
const products = load('products');
const customers = load('customers');
const orders = load('orders');
const coupons = load('coupons');
const reviews = load('reviews');
const notifications = load('notifications');
const inventory = load('inventory');

const warehouseByProduct = Object.fromEntries(inventory.map((i) => [i.productId || i.novaId, i.location]));
const customerIds = new Set(customers.map((c) => c.novaId));

function sqlStr(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  return `'${String(v).replace(/'/g, "''")}'`;
}
function sqlNum(v) {
  if (v === null || v === undefined || v === '') return 'NULL';
  return String(v);
}
function sqlBool(v) {
  return v ? 'true' : 'false';
}
function sqlJson(v) {
  if (v === null || v === undefined) return 'NULL';
  return `${sqlStr(JSON.stringify(v))}::jsonb`;
}
function sqlTextArray(arr) {
  if (!arr || !arr.length) return `'{}'::text[]`;
  return `${sqlStr('{' + arr.map((x) => `"${String(x).replace(/"/g, '\\"')}"`).join(',') + '}')}::text[]`;
}

const lines = [];
const push = (s) => lines.push(s);

push('-- Nova Store — seed data (medium)');
push('-- Run AFTER schema.sql');
push('begin;');
push('');
push('truncate notifications, reviews, order_items, orders, coupons, products, customers, categories cascade;');
push('');

push('-- categories');
push('insert into categories (id, name, slug, parent_id, status, description) values');
push(
  categories
    .map(
      (c) =>
        `  (${sqlStr(c.novaId)}, ${sqlStr(c.name)}, ${sqlStr(c.slug)}, ${sqlStr(c.parentId)}, ${sqlStr(c.status)}, ${sqlStr(c.description)})`
    )
    .join(',\n') + ';'
);
push('');

push('-- customers');
push(`insert into customers (
  id, name, email, phone, city, country, status, segment, joined_at, avatar_tone,
  address_line1, address_line2, postcode, orders_count, total_spent, last_order, avg_order
) values`);
push(
  customers
    .map(
      (c) =>
        `  (${sqlStr(c.novaId)}, ${sqlStr(c.name)}, ${sqlStr(c.email)}, ${sqlStr(c.phone)}, ${sqlStr(c.city)}, ${sqlStr(c.country)}, ${sqlStr(c.status)}, ${sqlStr(c.segment)}, ${sqlStr(c.joinedAt)}::date, ${sqlStr(c.avatarTone)}, ${sqlStr(c.addressLine1)}, ${sqlStr(c.addressLine2)}, ${sqlStr(c.postcode)}, ${sqlNum(c.ordersCount)}, ${sqlNum(c.totalSpent)}, ${c.lastOrder ? sqlStr(c.lastOrder) + '::timestamptz' : 'NULL'}, ${sqlNum(c.avgOrder)})`
    )
    .join(',\n') + ';'
);
push('');

push('-- products');
push(`insert into products (
  id, name, sku, slug, category_id, price, compare_at, cost, stock, reserved, threshold,
  status, brand, tags, variants, rating, review_count, supplier, warehouse,
  description, seo_title, meta_description, created_at, updated_at
) values`);
push(
  products
    .map((p) => {
      const compare = p.compareAt ? sqlNum(p.compareAt) : 'NULL';
      return `  (${sqlStr(p.novaId)}, ${sqlStr(p.name)}, ${sqlStr(p.sku)}, ${sqlStr(p.slug)}, ${sqlStr(p.categoryId)}, ${sqlNum(p.price)}, ${compare}, ${sqlNum(p.cost)}, ${sqlNum(p.stock)}, ${sqlNum(p.reserved)}, ${sqlNum(p.threshold)}, ${sqlStr(p.status)}, ${sqlStr(p.brand)}, ${sqlTextArray(p.tags)}, ${sqlJson(p.variants)}, ${sqlNum(p.rating)}, ${sqlNum(p.reviewCount)}, ${sqlStr(p.supplier)}, ${sqlStr(warehouseByProduct[p.novaId])}, ${sqlStr(p.description)}, ${sqlStr(p.seoTitle)}, ${sqlStr(p.metaDescription)}, ${sqlStr(p.createdAt)}::date, ${sqlStr(p.updatedAt)}::date)`;
    })
    .join(',\n') + ';'
);
push('');

push('-- coupons');
push(`insert into coupons (
  id, code, type, value, min_order, usage, usage_limit, starts_at, expires_at, status, applies_to, scope, description
) values`);
push(
  coupons
    .map(
      (c) =>
        `  (${sqlStr(c.novaId)}, ${sqlStr(c.code)}, ${sqlStr(c.type)}, ${sqlNum(c.value)}, ${sqlNum(c.minOrder)}, ${sqlNum(c.usage)}, ${c.limit ? sqlNum(c.limit) : 'NULL'}, ${sqlStr(c.startsAt)}::date, ${sqlStr(c.expiresAt)}::date, ${sqlStr(c.status)}, ${sqlStr(c.appliesTo)}, ${sqlTextArray(c.scope)}, ${sqlStr(c.description)})`
    )
    .join(',\n') + ';'
);
push('');

push('-- orders');
push(`insert into orders (
  id, customer_id, customer_name, customer_email, placed_at, item_count,
  subtotal, discount, coupon_code, shipping, shipping_method, tax, total,
  status, payment_status, payment_method, payment_brand,
  shipping_address, billing_address, tracking_number, timeline, note
) values`);
push(
  orders
    .map(
      (o) =>
        `  (${sqlStr(o.novaId)}, ${sqlStr(o.customerId)}, ${sqlStr(o.customerName)}, ${sqlStr(o.customerEmail)}, ${sqlStr(o.placedAt)}::timestamptz, ${sqlNum(o.itemCount)}, ${sqlNum(o.subtotal)}, ${sqlNum(o.discount)}, ${sqlStr(o.couponCode)}, ${sqlNum(o.shipping)}, ${sqlStr(o.shippingMethod)}, ${sqlNum(o.tax)}, ${sqlNum(o.total)}, ${sqlStr(o.status)}, ${sqlStr(o.paymentStatus)}, ${sqlStr(o.paymentMethod)}, ${sqlStr(o.paymentBrand)}, ${sqlJson(o.shippingAddress)}, ${sqlJson(o.billingAddress)}, ${sqlStr(o.trackingNumber)}, ${sqlJson(o.timeline)}, ${sqlStr(o.note)})`
    )
    .join(',\n') + ';'
);
push('');

const items = orders.flatMap((o) =>
  (o.items || []).map((it) => ({
    orderId: o.novaId,
    ...it,
  }))
);

push('-- order_items');
push(`insert into order_items (
  order_id, product_id, name, sku, variant_label, quantity, unit_price, total, category_id
) values`);
push(
  items
    .map(
      (it) =>
        `  (${sqlStr(it.orderId)}, ${sqlStr(it.productId)}, ${sqlStr(it.name)}, ${sqlStr(it.sku)}, ${sqlStr(it.variantLabel)}, ${sqlNum(it.quantity)}, ${sqlNum(it.unitPrice)}, ${sqlNum(it.total)}, ${sqlStr(it.categoryId)})`
    )
    .join(',\n') + ';'
);
push('');

push('-- reviews');
push(`insert into reviews (
  id, product_id, product_name, customer_id, customer_name, rating, title, body, created_at, status, verified, helpful
) values`);
push(
  reviews
    .map((r) => {
      const cid = customerIds.has(r.customerId) ? sqlStr(r.customerId) : 'NULL';
      return `  (${sqlStr(r.novaId)}, ${sqlStr(r.productId)}, ${sqlStr(r.productName)}, ${cid}, ${sqlStr(r.customerName)}, ${sqlNum(r.rating)}, ${sqlStr(r.title)}, ${sqlStr(r.body)}, ${sqlStr(r.createdAt)}::timestamptz, ${sqlStr(r.status)}, ${sqlBool(r.verified)}, ${sqlNum(r.helpful)})`;
    })
    .join(',\n') + ';'
);
push('');

push('-- notifications');
push(`insert into notifications (id, category, title, body, href, created_at, tone, read) values`);
push(
  notifications
    .map(
      (n) =>
        `  (${sqlStr(n.novaId)}, ${sqlStr(n.category)}, ${sqlStr(n.title)}, ${sqlStr(n.body)}, ${sqlStr(n.href)}, ${sqlStr(n.createdAt)}::timestamptz, ${sqlStr(n.tone)}, ${sqlBool(n.read)})`
    )
    .join(',\n') + ';'
);
push('');
push('commit;');
push('');

writeFileSync(outFile, lines.join('\n'));
console.log(`wrote ${outFile}`);
console.log({
  categories: categories.length,
  customers: customers.length,
  products: products.length,
  coupons: coupons.length,
  orders: orders.length,
  order_items: items.length,
  reviews: reviews.length,
  notifications: notifications.length,
});
