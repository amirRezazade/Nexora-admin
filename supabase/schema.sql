-- Nova Store — Supabase schema
-- Run this first in SQL Editor (one shot).
-- Safe to re-run: drops existing Nova objects, then recreates them.

begin;

drop view if exists inventory cascade;
drop table if exists notifications cascade;
drop table if exists reviews cascade;
drop table if exists order_items cascade;
drop table if exists orders cascade;
drop table if exists coupons cascade;
drop table if exists products cascade;
drop table if exists customers cascade;
drop table if exists categories cascade;

-- ---------- categories ----------
create table categories (
  id            text primary key,          -- cat-sneakers
  name          text not null,
  slug          text not null unique,
  parent_id     text references categories(id) on delete set null,
  status        text not null default 'active'
                  check (status in ('active', 'draft')),
  description   text
);

-- ---------- customers ----------
create table customers (
  id            text primary key,          -- cus-401
  name          text not null,
  email         text not null unique,
  phone         text,
  city          text,
  country       text,
  status        text not null default 'active'
                  check (status in ('active', 'inactive', 'blocked')),
  segment       text not null default 'New'
                  check (segment in ('New', 'Returning', 'VIP')),
  joined_at     date,
  avatar_tone   text,
  address_line1 text,
  address_line2 text,
  postcode      text,
  orders_count  integer not null default 0,
  total_spent   numeric(12,2) not null default 0,
  last_order    timestamptz,
  avg_order     numeric(12,2) not null default 0
);

-- ---------- products ----------
create table products (
  id               text primary key,       -- prd-1001
  name             text not null,
  sku              text not null unique,
  slug             text not null unique,
  category_id      text not null references categories(id),
  price            numeric(10,2) not null check (price > 0),
  compare_at       numeric(10,2),
  cost             numeric(10,2),
  stock            integer not null default 0,
  reserved         integer not null default 0,
  threshold        integer not null default 0,
  status           text not null default 'active'
                     check (status in ('active', 'draft', 'archived')),
  brand            text,
  tags             text[] not null default '{}',
  variants         jsonb not null default '[]'::jsonb,
  rating           numeric(3,2) not null default 0,
  review_count     integer not null default 0,
  supplier         text,
  warehouse        text,
  description      text,
  seo_title        text,
  meta_description text,
  created_at       date,
  updated_at       date
);

-- ---------- coupons ----------
create table coupons (
  id            text primary key,
  code          text not null unique,
  type          text not null
                  check (type in ('percentage', 'fixed', 'free_shipping')),
  value         numeric(10,2) not null default 0,
  min_order     numeric(10,2) not null default 0,
  usage         integer not null default 0,
  usage_limit   integer,
  starts_at     date,
  expires_at    date,
  status        text not null
                  check (status in ('active', 'expired', 'scheduled', 'disabled')),
  applies_to    text not null default 'all',
  scope         text[] not null default '{}',
  description   text
);

-- ---------- orders ----------
create table orders (
  id                text primary key,      -- NV-13264
  customer_id       text not null references customers(id),
  customer_name     text,
  customer_email    text,
  placed_at         timestamptz not null,
  item_count        integer not null default 0,
  subtotal          numeric(12,2) not null default 0,
  discount          numeric(12,2) not null default 0,
  coupon_code       text,
  shipping          numeric(12,2) not null default 0,
  shipping_method   text,
  tax               numeric(12,2) not null default 0,
  total             numeric(12,2) not null default 0,
  status            text not null
                      check (status in ('pending','processing','shipped','delivered','cancelled','refunded')),
  payment_status    text not null
                      check (payment_status in ('pending','paid','failed','refunded')),
  payment_method    text,
  payment_brand     text,
  shipping_address  jsonb,
  billing_address   jsonb,
  tracking_number   text,
  timeline          jsonb not null default '[]'::jsonb,
  note              text
);

-- ---------- order line items ----------
create table order_items (
  id            uuid primary key default gen_random_uuid(),
  order_id      text not null references orders(id) on delete cascade,
  product_id    text references products(id) on delete set null,
  name          text not null,
  sku           text,
  variant_label text,
  quantity      integer not null check (quantity > 0),
  unit_price    numeric(10,2) not null,
  total         numeric(10,2) not null,
  category_id   text
);

-- ---------- reviews ----------
create table reviews (
  id            text primary key,
  product_id    text not null references products(id) on delete cascade,
  product_name  text,
  customer_id   text references customers(id) on delete set null,
  customer_name text,
  rating        integer not null check (rating between 1 and 5),
  title         text,
  body          text,
  created_at    timestamptz not null default now(),
  status        text not null default 'published'
                  check (status in ('published', 'pending', 'hidden')),
  verified      boolean not null default false,
  helpful       integer not null default 0
);

-- ---------- notifications ----------
create table notifications (
  id          text primary key,
  category    text not null,
  title       text not null,
  body        text,
  href        text,
  created_at  timestamptz not null default now(),
  tone        text,
  read        boolean not null default false
);

-- ---------- inventory is derived, not a separate table ----------
create view inventory as
select
  p.id,
  p.id                         as product_id,
  p.name,
  p.sku,
  p.category_id,
  p.stock                      as available,
  p.cost,
  round(p.cost * p.stock, 2)   as value,
  case
    when p.stock <= 0 then 'out_of_stock'
    when p.stock <= 8 then 'low_stock'
    else 'in_stock'
  end                          as status,
  p.updated_at,
  (select i->>'url' from jsonb_array_elements(p.images) i where (i->>'primary')::boolean limit 1) as primary_image
from products p;

create index idx_products_category on products (category_id);
create index idx_products_status   on products (status);
create index idx_orders_customer   on orders (customer_id);
create index idx_orders_status     on orders (status);
create index idx_orders_placed     on orders (placed_at desc);
create index idx_order_items_order on order_items (order_id);
create index idx_reviews_product   on reviews (product_id);

-- Portfolio-mode RLS: tables are locked by default in Supabase.
-- These policies let the public anon key read/write so the dashboard
-- can talk to the API. Tighten later if you add real users.
alter table categories    enable row level security;
alter table customers     enable row level security;
alter table products      enable row level security;
alter table coupons       enable row level security;
alter table orders        enable row level security;
alter table order_items   enable row level security;
alter table reviews       enable row level security;
alter table notifications enable row level security;

create policy "nova_categories_all"    on categories    for all using (true) with check (true);
create policy "nova_customers_all"     on customers     for all using (true) with check (true);
create policy "nova_products_all"      on products      for all using (true) with check (true);
create policy "nova_coupons_all"       on coupons       for all using (true) with check (true);
create policy "nova_orders_all"        on orders        for all using (true) with check (true);
create policy "nova_order_items_all"   on order_items   for all using (true) with check (true);
create policy "nova_reviews_all"       on reviews       for all using (true) with check (true);
create policy "nova_notifications_all" on notifications for all using (true) with check (true);

commit;
