-- Product rating + review_count from published reviews.
-- Run once in SQL Editor.

create or replace function nova_refresh_product_rating(pid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
  avg_r numeric;
begin
  if pid is null then
    return;
  end if;

  select
    count(*)::int,
    round(avg(rating)::numeric, 1)
  into cnt, avg_r
  from reviews
  where product_id = pid
    and status = 'published';

  update products
  set
    review_count = coalesce(cnt, 0),
    rating = coalesce(avg_r, 0)
  where id = pid;
end;
$$;

create or replace function nova_reviews_product_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform nova_refresh_product_rating(old.product_id);
    return old;
  end if;

  perform nova_refresh_product_rating(new.product_id);
  if tg_op = 'UPDATE' and old.product_id is distinct from new.product_id then
    perform nova_refresh_product_rating(old.product_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_reviews_product_rating on reviews;
create trigger trg_reviews_product_rating
after insert or update of product_id, rating, status or delete
on reviews
for each row
execute function nova_reviews_product_rating();

do $$
declare r record;
begin
  for r in select id from products loop
    perform nova_refresh_product_rating(r.id);
  end loop;
end;
$$;
