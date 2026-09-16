-- Nova Auth setup. Run once in SQL Editor.
-- Does not change the Next.js app.

begin;

-- 1) Confirm the admin created via Auth API
update auth.users
set email_confirmed_at = coalesce(email_confirmed_at, now())
where email = 'sarah@novastore.com';

-- 2) Staff profiles (1-1 with auth.users)
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null unique,
  name        text,
  role        text not null default 'staff'
                check (role in ('admin', 'staff')),
  created_at  timestamptz not null default now()
);

alter table public.profiles enable row level security;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

grant execute on function public.is_admin() to authenticated, anon;

drop policy if exists "profiles_self_read" on public.profiles;
drop policy if exists "profiles_staff_all" on public.profiles;
drop policy if exists "profiles_admin_write" on public.profiles;
create policy "profiles_self_read"
  on public.profiles for select
  to authenticated
  using (id = auth.uid() or public.is_admin());
create policy "profiles_admin_write"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

insert into public.profiles (id, email, name, role)
select id, email, coalesce(raw_user_meta_data->>'name', 'Sarah Chen'), 'admin'
from auth.users
where email = 'sarah@novastore.com'
on conflict (id) do update
  set email = excluded.email,
      name = excluded.name,
      role = 'admin';

-- Auto-create a staff profile when a user signs up in Auth
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'staff')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- 3) Helper: current user is store staff
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid()
      and role in ('admin', 'staff')
  );
$$;

grant execute on function public.is_staff() to authenticated, anon;

-- 4) Lock catalog/ops tables: no more open anon CRUD
do $$
declare
  t text;
begin
  foreach t in array array[
    'categories', 'products', 'customers', 'coupons', 'orders',
    'order_items', 'reviews', 'notifications', 'product_images'
  ]
  loop
    if to_regclass('public.' || t) is null then
      continue;
    end if;
    execute format('drop policy if exists %I on public.%I', 'nova_' || t || '_all', t);
    execute format('drop policy if exists %I on public.%I', t || '_staff_all', t);
    execute format(
      'create policy %I on public.%I for all to authenticated using (public.is_staff()) with check (public.is_staff())',
      t || '_staff_all', t
    );
  end loop;
end;
$$;

-- 5) Storage: public READ (product photos on the web), write only for staff
drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_public_insert" on storage.objects;
drop policy if exists "product_images_public_update" on storage.objects;
drop policy if exists "product_images_public_delete" on storage.objects;
drop policy if exists "product_images_staff_write" on storage.objects;
drop policy if exists "product_images_staff_update" on storage.objects;
drop policy if exists "product_images_staff_delete" on storage.objects;

create policy "product_images_public_read"
  on storage.objects for select
  to public
  using (bucket_id = 'product-images');

create policy "product_images_staff_write"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "product_images_staff_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'product-images' and public.is_staff())
  with check (bucket_id = 'product-images' and public.is_staff());

create policy "product_images_staff_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'product-images' and public.is_staff());

commit;
