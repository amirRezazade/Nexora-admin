-- Recalculate customer order stats whenever orders change.
-- Run once in SQL Editor.

create or replace function nova_refresh_customer_stats(cid text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  cnt int;
  spent numeric;
  last_at timestamptz;
begin
  if cid is null then
    return;
  end if;

  select
    count(*)::int,
    coalesce(sum(total) filter (
      where status in ('delivered', 'shipped', 'processing', 'pending')
    ), 0),
    max(placed_at)
  into cnt, spent, last_at
  from orders
  where customer_id = cid;

  update customers
  set
    orders_count = coalesce(cnt, 0),
    total_spent  = round(coalesce(spent, 0), 2),
    last_order   = last_at,
    avg_order    = case
      when coalesce(cnt, 0) > 0 then round(coalesce(spent, 0) / cnt, 2)
      else 0
    end
  where id = cid;
end;
$$;

create or replace function nova_orders_customer_stats()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform nova_refresh_customer_stats(old.customer_id);
    return old;
  end if;

  perform nova_refresh_customer_stats(new.customer_id);
  if tg_op = 'UPDATE' and old.customer_id is distinct from new.customer_id then
    perform nova_refresh_customer_stats(old.customer_id);
  end if;
  return new;
end;
$$;

drop trigger if exists trg_orders_customer_stats on orders;
create trigger trg_orders_customer_stats
after insert or update of customer_id, total, status, placed_at or delete
on orders
for each row
execute function nova_orders_customer_stats();

-- Refresh everyone once
do $$
declare r record;
begin
  for r in select id from customers loop
    perform nova_refresh_customer_stats(r.id);
  end loop;
end;
$$;
