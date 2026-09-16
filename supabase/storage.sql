-- Nova Store — product images (Storage + table)
-- Run in SQL Editor AFTER schema.sql and seed.sql.

begin;

-- 1) Public bucket. Files are reachable at:
-- https://<project>.supabase.co/storage/v1/object/public/product-images/<path>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'product-images',
  'product-images',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

-- 2) One row per photo. First/primary is marked is_primary.
create table if not exists product_images (
  id           uuid primary key default gen_random_uuid(),
  product_id   text not null references products(id) on delete cascade,
  storage_path text not null,
  alt          text,
  sort_order   integer not null default 0,
  is_primary   boolean not null default false,
  created_at   timestamptz not null default now(),
  unique (product_id, storage_path)
);

create index if not exists idx_product_images_product on product_images (product_id, sort_order);

-- At most one primary image per product.
create unique index if not exists product_images_one_primary
  on product_images (product_id)
  where is_primary;

alter table product_images enable row level security;

drop policy if exists "nova_product_images_all" on product_images;
create policy "nova_product_images_all"
  on product_images for all
  using (true) with check (true);

-- Convenient URL for lists / gallery.
-- Example path: prd-1001/01.jpg
create or replace view product_image_urls as
select
  i.*,
  'https://akqrnvrgsnofnhrhlxow.supabase.co/storage/v1/object/public/product-images/' || i.storage_path
    as public_url
from product_images i;

-- 3) Storage policies (portfolio: public read + write).
-- Tighten later when Auth is wired.
drop policy if exists "product_images_public_read"   on storage.objects;
drop policy if exists "product_images_public_insert" on storage.objects;
drop policy if exists "product_images_public_update" on storage.objects;
drop policy if exists "product_images_public_delete" on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "product_images_public_insert"
  on storage.objects for insert
  to public
  with check (bucket_id = 'product-images');

create policy "product_images_public_update"
  on storage.objects for update
  to public
  using (bucket_id = 'product-images')
  with check (bucket_id = 'product-images');

create policy "product_images_public_delete"
  on storage.objects for delete
  to public
  using (bucket_id = 'product-images');

commit;
