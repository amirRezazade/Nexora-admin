-- Run after seed.sql. You should see these counts:
-- categories 9 | customers 80 | products 28 | coupons 8
-- orders 150 | order_items 227 | reviews 50 | notifications 17 | inventory 28

select * from (
  select 1 as n, 'categories'    as table, count(*) from categories
  union all select 2, 'customers',     count(*) from customers
  union all select 3, 'products',      count(*) from products
  union all select 4, 'coupons',       count(*) from coupons
  union all select 5, 'orders',        count(*) from orders
  union all select 6, 'order_items',   count(*) from order_items
  union all select 7, 'reviews',       count(*) from reviews
  union all select 8, 'notifications', count(*) from notifications
  union all select 9, 'inventory',     count(*) from inventory
) t order by n;
