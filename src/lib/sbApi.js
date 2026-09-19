import { supabase } from "./supabaseClient";
import { queryList } from "./queryList";
import { mapProduct, mapCategory, mapCustomer, mapOrder, mapOrderItem, mapCoupon, mapReview, mapNotification, mapInventory, productToRow, stockStatus } from "./maps";

const TODAY = new Date("2026-08-21T12:00:00Z");
const dayMs = 86400000;
const revenueStatuses = new Set(["delivered", "shipped", "processing", "pending"]);

class ApiError extends Error {
  constructor(message, status = 400, extra = {}) {
    super(message);
    this.status = status;
    Object.assign(this, extra);
  }
}

function paramsOf(path) {
  const q = path.includes("?") ? path.slice(path.indexOf("?") + 1) : "";
  return new URLSearchParams(q);
}
function segs(path) {
  const clean = path
    .split("?")[0]
    .replace(/^\/api\//, "")
    .replace(/^\//, "");
  return clean.split("/").filter(Boolean);
}
async function must(res, msg = "Request failed") {
  if (res.error) throw new ApiError(res.error.message || msg, 400);
  return res.data;
}

async function allProducts() {
  const { data, error } = await supabase.from("products").select("*").order("id");
  if (error) throw new ApiError(error.message);
  return (data || []).map(mapProduct);
}
async function allCategories() {
  const { data, error } = await supabase.from("categories").select("*").order("name");
  if (error) throw new ApiError(error.message);
  return (data || []).map(mapCategory);
}
async function allCustomers() {
  const { data, error } = await supabase.from("customers").select("*");
  if (error) throw new ApiError(error.message);
  return (data || []).map(mapCustomer);
}
async function allOrderItems() {
  const { data, error } = await supabase.from("order_items").select("*");
  if (error) throw new ApiError(error.message);
  return (data || []).map(mapOrderItem);
}
async function allOrders() {
  const [{ data: orders, error }, items] = await Promise.all([supabase.from("orders").select("*").order("placed_at", { ascending: false }), allOrderItems()]);
  if (error) throw new ApiError(error.message);
  const byOrder = new Map();
  items.forEach((it) => {
    const list = byOrder.get(it.orderId || it.order_id) || [];
    list.push(it);
    byOrder.set(it.orderId || it.order_id, list);
  });
  return (orders || []).map((o) => mapOrder(o, byOrder.get(o.id) || []));
}

function decorateCategory(c, products, categories) {
  const productCount = products.filter((p) => p.categoryId === c.id).length;
  const children = categories.filter((x) => x.parentId === c.id);
  const descendantCount = children.reduce((s, ch) => s + products.filter((p) => p.categoryId === ch.id).length, productCount);
  return { ...c, productCount, descendantCount, childCount: children.length };
}

function ordersInRange(list, days) {
  const from = TODAY.getTime() - days * dayMs;
  return list.filter((o) => new Date(o.placedAt).getTime() >= from);
}
function revenueOf(list) {
  return Math.round(list.filter((o) => revenueStatuses.has(o.status)).reduce((s, o) => s + o.total, 0) * 100) / 100;
}
function compare(days, valueFn, orders) {
  const now = ordersInRange(orders, days);
  const prevFrom = TODAY.getTime() - days * 2 * dayMs;
  const prevTo = TODAY.getTime() - days * dayMs;
  const prev = orders.filter((o) => {
    const t = new Date(o.placedAt).getTime();
    return t >= prevFrom && t < prevTo;
  });
  const a = valueFn(now);
  const b = valueFn(prev);
  const change = b === 0 ? 0 : Math.round(((a - b) / b) * 1000) / 10;
  return { current: a, previous: b, change };
}
function dateOnly(d) {
  return new Date(d).toISOString().slice(0, 10);
}
function dailySeries(orders, days) {
  const buckets = new Map();
  for (let i = days - 1; i >= 0; i--) {
    const d = dateOnly(new Date(TODAY.getTime() - i * dayMs));
    buckets.set(d, { date: d, revenue: 0, orders: 0, units: 0 });
  }
  orders.forEach((o) => {
    const d = dateOnly(o.placedAt);
    const b = buckets.get(d);
    if (!b) return;
    b.orders += 1;
    b.units += o.itemCount || 0;
    if (revenueStatuses.has(o.status)) b.revenue = Math.round((b.revenue + o.total) * 100) / 100;
  });
  return [...buckets.values()];
}
function monthlySeries(orders, months = 12) {
  const buckets = new Map();
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    buckets.set(key, {
      date: key,
      label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      revenue: 0,
      orders: 0,
      units: 0,
    });
  }
  orders.forEach((o) => {
    const key = String(o.placedAt).slice(0, 7);
    const b = buckets.get(key);
    if (!b) return;
    b.orders += 1;
    b.units += o.itemCount || 0;
    if (revenueStatuses.has(o.status)) b.revenue = Math.round((b.revenue + o.total) * 100) / 100;
  });
  return [...buckets.values()];
}
function productPerformance(orders, products, days = 30) {
  const list = ordersInRange(orders, days).filter((o) => revenueStatuses.has(o.status));
  const map = new Map();
  list.forEach((o) =>
    (o.items || []).forEach((it) => {
      if (!it.productId) return;
      const cur = map.get(it.productId) || { productId: it.productId, name: it.name, units: 0, revenue: 0, orders: 0 };
      cur.units += it.quantity;
      cur.revenue = Math.round((cur.revenue + it.total) * 100) / 100;
      cur.orders += 1;
      map.set(it.productId, cur);
    }),
  );
  return [...map.values()]
    .map((row) => {
      const p = products.find((x) => x.id === row.productId);
      return {
        ...row,
        name: p?.name || row.name,
        nameFa: p?.nameFa || "",
        sku: p?.sku,
        categoryId: p?.categoryId,
        price: p?.price,
        stock: p?.stock,
        image: p?.image,
      };
    })
    .sort((a, b) => b.revenue - a.revenue);
}

const PAGES = [
  { id: "dashboard", title: "Dashboard", href: "/", hint: "Store performance overview" },
  { id: "analytics", title: "Analytics", href: "/analytics", hint: "Revenue, orders and cohorts" },
  { id: "products", title: "Products", href: "/products", hint: "Manage your catalog" },
  { id: "new-product", title: "Add Product", href: "/products/new", hint: "Create a catalog entry" },
  { id: "categories", title: "Categories", href: "/categories", hint: "Organise your catalog" },
  { id: "inventory", title: "Inventory", href: "/inventory", hint: "Stock levels and thresholds" },
  { id: "orders", title: "Orders", href: "/orders", hint: "Track and fulfil orders" },
  { id: "customers", title: "Customers", href: "/customers", hint: "Customer directory" },
  { id: "coupons", title: "Coupons", href: "/coupons", hint: "Discounts and promotions" },
  { id: "reviews", title: "Reviews", href: "/reviews", hint: "Moderate customer reviews" },
  { id: "notifications", title: "Notifications", href: "/notifications", hint: "Activity and alerts" },
  { id: "settings", title: "Settings", href: "/settings", hint: "Store configuration" },
  { id: "profile", title: "Profile", href: "/profile", hint: "Your account" },
];

export async function handleRemote(path, options = {}) {
  const method = (options.method || "GET").toUpperCase();
  const body = options.body || {};
  const params = paramsOf(path);
  const parts = segs(path);
  const [res, id] = parts;

  try {
    if (res === "products" && !id && method === "GET") return getProducts(params);
    if (res === "products" && !id && method === "POST") return createProduct(body);
    if (res === "products" && !id && method === "PATCH") return bulkProducts(body);
    if (res === "products" && id && method === "GET") return getProduct(id);
    if (res === "products" && id && method === "PUT") return updateProduct(id, body);
    if (res === "products" && id && method === "DELETE") return deleteProduct(id);
    if (res === "products" && id && method === "POST") return duplicateProduct(id);

    if (res === "categories" && !id && method === "GET") return getCategories(params);
    if (res === "categories" && !id && method === "POST") return createCategory(body);
    if (res === "categories" && id && method === "PUT") return updateCategory(id, body);
    if (res === "categories" && id && method === "DELETE") return deleteCategory(id);

    if (res === "orders" && !id && method === "GET") return getOrders(params);
    if (res === "orders" && id && method === "GET") return getOrder(id);
    if (res === "orders" && id && method === "PATCH") return patchOrder(id, body);

    if (res === "customers" && !id && method === "GET") return getCustomers(params);
    if (res === "customers" && id && method === "GET") return getCustomer(id);

    if (res === "inventory" && method === "GET") return getInventory(params);
    if (res === "inventory" && method === "PATCH") return patchInventory(body);

    if (res === "reviews" && !id && method === "GET") return getReviews(params);
    if (res === "reviews" && id && method === "PATCH") return patchReview(id, body);
    if (res === "reviews" && id && method === "DELETE") return deleteReview(id);

    if (res === "coupons" && !id && method === "GET") return getCoupons(params);
    if (res === "coupons" && !id && method === "POST") return createCoupon(body);
    if (res === "coupons" && id && method === "PUT") return updateCoupon(id, body);
    if (res === "coupons" && id && method === "DELETE") return deleteCoupon(id);

    if (res === "notifications" && method === "GET") return getNotifications(params);
    if (res === "notifications" && method === "PATCH") return patchNotifications(body);

    if (res === "dashboard") return getDashboard(params);
    if (res === "analytics") return getAnalytics(params);
    if (res === "search") return getSearch(params);

    throw new ApiError(`Unknown API route ${method} ${path}`, 404);
  } catch (e) {
    if (e instanceof ApiError) throw e;
    throw new ApiError(e.message || "Something went wrong.");
  }
}

async function expandCategoryIds(rawIds, cats) {
  if (!rawIds.length) return rawIds;
  const ids = new Set();
  rawIds.forEach((v) => {
    const match = cats.find((c) => c.id === v || c.slug === v);
    if (match) ids.add(match.id);
    else ids.add(v);
  });
  let changed = true;
  while (changed) {
    changed = false;
    cats.forEach((c) => {
      if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
        ids.add(c.id);
        changed = true;
      }
    });
  }
  return [...ids];
}

async function getProducts(params) {
  if (params.get("fail") === "1") throw new ApiError("Upstream catalog service is unavailable.", 500);
  let rows = await allProducts();
  const minPrice = parseFloat(params.get("minPrice"));
  const maxPrice = parseFloat(params.get("maxPrice"));
  if (!Number.isNaN(minPrice)) rows = rows.filter((r) => r.price >= minPrice);
  if (!Number.isNaN(maxPrice)) rows = rows.filter((r) => r.price <= maxPrice);
  const addedAfter = params.get("addedAfter");
  if (addedAfter) rows = rows.filter((r) => new Date(r.createdAt) >= new Date(addedAfter));
  const rawCats = params
    .getAll("category")
    .flatMap((v) => String(v).split(","))
    .filter((v) => v && v !== "all");
  if (rawCats.length) {
    const cats = await allCategories();
    const expanded = await expandCategoryIds(rawCats, cats);
    params = new URLSearchParams(params);
    params.delete("category");
    params.set("category", expanded.join(","));
  }
  const result = queryList(rows, params, {
    searchFields: ["name", "nameFa", "sku", "brand"],
    filters: {
      category: (row, values) => values.includes(row.categoryId),
      status: (row, values) => values.includes(row.status),
      stock: (row, values) => values.includes(row.stockStatus),
    },
    defaultSort: { key: "updatedAt", dir: "desc" },
  });
  const all = rows === undefined ? [] : await allProducts();
  return {
    ...result,
    summary: {
      total: all.length,
      active: all.filter((p) => p.status === "active").length,
      draft: all.filter((p) => p.status === "draft").length,
      archived: all.filter((p) => p.status === "archived").length,
      lowStock: all.filter((p) => p.stockStatus === "low_stock").length,
      outOfStock: all.filter((p) => p.stockStatus === "out_of_stock").length,
    },
  };
}

async function createProduct(body) {
  const errors = {};
  if (!body.name?.trim()) errors.name = "Product name is required.";
  if (!body.sku?.trim()) errors.sku = "SKU is required.";
  if (!body.categoryId) errors.categoryId = "Select a category.";
  if (!(parseFloat(body.price) > 0)) errors.price = "Price must be greater than 0.";
  if (Object.keys(errors).length) throw new ApiError("Validation failed", 422, { errors });
  const id = `prd-${Date.now().toString().slice(-6)}`;
  const row = productToRow(body, {
    id,
    created_at: new Date().toISOString().slice(0, 10),
    sku: body.sku.trim().toUpperCase(),
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    rating: 0,
    review_count: 0,
  });
  const { data, error } = await supabase.from("products").insert(row).select("*").single();
  if (error) throw new ApiError(error.message, 400, { errors: { sku: error.message } });
  return { data: mapProduct(data) };
}

async function updateProduct(id, body) {
  const errors = {};
  if (body.name != null && !String(body.name).trim()) errors.name = "Product name is required.";
  if (body.price != null && !(parseFloat(body.price) > 0)) errors.price = "Price must be greater than 0.";
  if (Object.keys(errors).length) throw new ApiError("Validation failed", 422, { errors });
  const row = productToRow(body);
  const { data, error } = await supabase.from("products").update(row).eq("id", id).select("*").single();
  if (error) throw new ApiError(error.message);
  return { data: mapProduct(data) };
}

async function deleteProduct(id) {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
  return { ok: true, id };
}

async function duplicateProduct(id) {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error || !data) throw new ApiError("Product not found.", 404);
  const copy = {
    ...data,
    id: `prd-${Date.now().toString().slice(-6)}`,
    name: `${data.name} (Copy)`,
    sku: `${data.sku}-C`,
    slug: `${data.slug}-copy`,
    status: "draft",
    created_at: new Date().toISOString().slice(0, 10),
    updated_at: new Date().toISOString().slice(0, 10),
  };
  const ins = await supabase.from("products").insert(copy).select("*").single();
  if (ins.error) throw new ApiError(ins.error.message);
  return { data: mapProduct(ins.data) };
}

async function bulkProducts({ ids = [], action, value }) {
  if (!ids.length) return { affected: 0 };
  let patch = {};
  if (action === "status") patch = { status: value };
  if (action === "category") patch = { category_id: value };
  if (action === "archive") patch = { status: "archived" };
  if (action === "delete") {
    const { error } = await supabase.from("products").delete().in("id", ids);
    if (error) throw new ApiError(error.message);
    return { affected: ids.length };
  }
  const { error } = await supabase.from("products").update(patch).in("id", ids);
  if (error) throw new ApiError(error.message);
  return { affected: ids.length };
}

async function getProduct(id) {
  const { data, error } = await supabase.from("products").select("*").or(`id.eq.${id},slug.eq.${id}`).maybeSingle();
  if (error || !data) throw new ApiError("Product not found.", 404);
  const product = mapProduct(data);
  const [products, reviewsRes] = await Promise.all([allProducts(), supabase.from("reviews").select("*").eq("product_id", product.id).order("created_at", { ascending: false })]);
  const reviews = (reviewsRes.data || []).map(mapReview);
  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  const ratingBreakdown = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }));
  const activity = [
    { type: "created", message: "Product created", actor: "System", at: `${product.createdAt}T09:00:00Z` },
    { type: "edit", message: "Catalog record updated", actor: "System", at: `${product.updatedAt}T14:00:00Z` },
  ];
  return { data: product, activity, reviews, ratingBreakdown, related };
}

async function getCategories(params) {
  const [cats, products] = await Promise.all([allCategories(), allProducts()]);
  const rows = cats.map((c) => decorateCategory(c, products, cats));
  const result = queryList(rows, params, {
    searchFields: ["name", "nameFa", "slug", "description"],
    filters: { status: (row, values) => values.includes(row.status) },
    defaultSort: { key: "name", dir: "asc" },
  });
  return { ...result, all: rows };
}

async function createCategory(body) {
  if (!body.name?.trim()) throw new ApiError("Validation failed", 422, { errors: { name: "Category name is required." } });
  const id = `cat-${body.name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .slice(0, 20)}`;
  const row = {
    id,
    name: body.name.trim(),
    name_fa: body.nameFa || null,
    slug: body.slug || body.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
    parent_id: body.parentId || null,
    status: body.status || "active",
    description: body.description || "",
    description_fa: body.descriptionFa || null,
  };
  let { data, error } = await supabase.from("categories").insert(row).select("*").single();
  if (error && /description_fa/i.test(error.message || "")) {
    delete row.description_fa;
    ({ data, error } = await supabase.from("categories").insert(row).select("*").single());
  }
  if (error) throw new ApiError(error.message, 422, { errors: { name: error.message } });
  return { data: mapCategory(data) };
}

async function updateCategory(id, body) {
  const patch = {
    name: body.name,
    name_fa: body.nameFa ?? body.name_fa ?? null,
    slug: body.slug,
    parent_id: body.parentId || body.parent_id || null,
    status: body.status,
    description: body.description ?? "",
    description_fa: body.descriptionFa ?? body.description_fa ?? null,
  };
  let { data, error } = await supabase.from("categories").update(patch).eq("id", id).select("*").single();
  if (error && /description_fa/i.test(error.message || "")) {
    delete patch.description_fa;
    ({ data, error } = await supabase.from("categories").update(patch).eq("id", id).select("*").single());
  }
  if (error) throw new ApiError(error.message);
  return { data: mapCategory(data) };
}

async function deleteCategory(id) {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
  return { ok: true, id };
}

async function getOrders(params) {
  let rows = await allOrders();
  const from = params.get("from");
  const to = params.get("to");
  if (from) rows = rows.filter((o) => new Date(o.placedAt) >= new Date(from));
  if (to) rows = rows.filter((o) => new Date(o.placedAt) <= new Date(to));
  const minTotal = parseFloat(params.get("minTotal"));
  if (!Number.isNaN(minTotal)) rows = rows.filter((o) => o.total >= minTotal);
  const result = queryList(rows, params, {
    searchFields: ["id", "customerName", "customerEmail", "trackingNumber"],
    filters: {
      status: (row, values) => values.includes(row.status),
      payment: (row, values) => values.includes(row.paymentStatus),
      customerId: (row, values) => values.includes(row.customerId),
    },
    defaultSort: { key: "placedAt", dir: "desc" },
  });
  const all = await allOrders();
  const counts = all.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});
  counts.all = all.length;
  return { ...result, counts };
}

function decorateItems(items, products) {
  const byId = new Map(products.map((p) => [p.id, p]));
  return (items || []).map((it) => {
    const p = byId.get(it.productId);
    if (!p) return it;
    return { ...it, image: p.image, nameFa: p.nameFa, catalogName: p.name };
  });
}

async function getOrder(id) {
  const orders = await allOrders();
  const order = orders.find((o) => o.id === id || o.id === `NV-${id}`);
  if (!order) throw new ApiError("Order not found.", 404);
  const [customers, products] = await Promise.all([allCustomers(), allProducts()]);
  const customer = customers.find((c) => c.id === order.customerId) || null;
  const history = orders.filter((o) => o.customerId === order.customerId && o.id !== order.id).slice(0, 4);
  return { data: { ...order, items: decorateItems(order.items, products) }, customer, history };
}

async function patchOrder(id, body) {
  const status = body.status;
  const patch = { status };
  if (status === "delivered" || status === "shipped") patch.payment_status = "paid";
  if (status === "refunded") patch.payment_status = "refunded";
  const { data, error } = await supabase.from("orders").update(patch).eq("id", id).select("*").single();
  if (error || !data) throw new ApiError("Order not found.", 404);
  const items = (await allOrderItems()).filter((i) => i.orderId === id || i.order_id === id);
  return { data: mapOrder(data, items) };
}

async function getCustomers(params) {
  const all = await allCustomers();
  const result = queryList(all, params, {
    searchFields: ["name", "email", "city", "country"],
    filters: {
      status: (row, values) => values.includes(row.status),
      segment: (row, values) => values.includes(row.segment),
      country: (row, values) => values.includes(row.country),
    },
    defaultSort: { key: "totalSpent", dir: "desc" },
  });
  return {
    ...result,
    summary: {
      total: all.length,
      active: all.filter((c) => c.status === "active").length,
      vip: all.filter((c) => c.segment === "VIP").length,
      new: all.filter((c) => c.segment === "New").length,
      lifetimeValue: Math.round(all.reduce((s, c) => s + c.totalSpent, 0)),
    },
  };
}

async function getCustomer(id) {
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).maybeSingle();
  if (error || !data) throw new ApiError("Customer not found.", 404);
  const customer = mapCustomer(data);
  const orders = (await allOrders()).filter((o) => o.customerId === id);
  const products = await allProducts();
  const byId = new Map(products.map((p) => [p.id, p]));
  const favouriteMap = new Map();
  orders.forEach((o) =>
    (o.items || []).forEach((it) => {
      if (!it.productId) return;
      const p = byId.get(it.productId);
      const cur = favouriteMap.get(it.productId) || {
        productId: it.productId,
        name: p?.name || it.name,
        nameFa: p?.nameFa || "",
        image: p?.image || null,
        units: 0,
        revenue: 0,
      };
      cur.units += it.quantity;
      cur.revenue = Math.round((cur.revenue + it.total) * 100) / 100;
      favouriteMap.set(it.productId, cur);
    }),
  );
  const address = {
    line1: customer.addressLine1,
    line2: customer.addressLine2,
    city: customer.city,
    postcode: customer.postcode,
    country: customer.country,
  };
  const activity = orders.slice(0, 8).map((o) => ({
    id: `ca-${o.id}`,
    type: "order",
    message: `Placed order #${o.id}`,
    at: o.placedAt,
    amount: o.total,
    href: `/orders/${o.id}`,
  }));
  return {
    data: customer,
    address,
    orders: orders.slice(0, 10),
    orderCount: orders.length,
    favourites: [...favouriteMap.values()].sort((a, b) => b.units - a.units).slice(0, 4),
    activity,
  };
}

async function getInventory(params) {
  const [{ data, error }, products] = await Promise.all([supabase.from("inventory").select("*"), allProducts()]);
  if (error) throw new ApiError(error.message);
  const byId = new Map(products.map((p) => [p.id, p]));
  const rows = (data || []).map((row) => {
    const mapped = mapInventory(row);
    const p = byId.get(mapped.id);
    return {
      ...mapped,
      nameFa: p?.nameFa || "",
      image: mapped.primaryImage || p?.image || null,
    };
  });
  const result = queryList(rows, params, {
    searchFields: ["name", "nameFa", "sku"],
    filters: {
      status: (row, values) => values.includes(row.status),
      category: (row, values) => values.includes(row.categoryId),
    },
    defaultSort: { key: "available", dir: "asc" },
  });
  return {
    ...result,
    summary: {
      totalItems: rows.reduce((s, r) => s + (r.available || 0), 0),
      skus: rows.length,
      lowStock: rows.filter((r) => r.status === "low_stock").length,
      outOfStock: rows.filter((r) => r.status === "out_of_stock").length,
      value: Math.round(rows.reduce((s, r) => s + r.value, 0)),
    },
  };
}

async function patchInventory(body) {
  const { id, available } = body;
  const patch = { updated_at: new Date().toISOString().slice(0, 10) };
  if (available != null) patch.stock = Math.max(0, parseInt(available, 10) || 0);
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw new ApiError(error.message);
  const { data } = await supabase.from("inventory").select("*").eq("id", id).maybeSingle();
  return { data: mapInventory(data) };
}

async function getReviews(params) {
  const { data, error } = await supabase.from("reviews").select("*").order("created_at", { ascending: false });
  if (error) throw new ApiError(error.message);
  let rows = (data || []).map(mapReview);
  const rating = params
    .getAll("rating")
    .flatMap((v) => v.split(","))
    .filter(Boolean);
  if (rating.length) rows = rows.filter((r) => rating.includes(String(r.rating)));
  const result = queryList(rows, params, {
    searchFields: ["customerName", "productName", "body", "title"],
    filters: { status: (row, values) => values.includes(row.status) },
    defaultSort: { key: "createdAt", dir: "desc" },
  });
  const all = (data || []).map(mapReview);
  const counts = all.reduce((acc, r) => {
    acc[r.status] = (acc[r.status] || 0) + 1;
    return acc;
  }, {});
  counts.all = all.length;
  const avg = all.reduce((s, r) => s + r.rating, 0) / (all.length || 1);
  return { ...result, counts, average: Math.round(avg * 10) / 10 };
}

async function patchReview(id, body) {
  const { error } = await supabase.from("reviews").update({ status: body.status }).eq("id", id);
  if (error) throw new ApiError(error.message);
  return { ok: true };
}

async function deleteReview(id) {
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
  return { ok: true };
}

async function getCoupons(params) {
  const { data, error } = await supabase.from("coupons").select("*");
  if (error) throw new ApiError(error.message);
  const rows = (data || []).map(mapCoupon);
  return queryList(rows, params, {
    searchFields: ["code", "description"],
    filters: {
      status: (row, values) => values.includes(row.status),
      type: (row, values) => values.includes(row.type),
    },
    defaultSort: { key: "status", dir: "asc" },
  });
}

async function createCoupon(body) {
  const errors = {};
  if (!body.code?.trim()) errors.code = "Coupon code is required.";
  if (body.type !== "free_shipping" && !(parseFloat(body.value) > 0)) errors.value = "Discount value must be greater than 0.";
  if (!body.expiresAt) errors.expiresAt = "Choose an expiration date.";
  if (Object.keys(errors).length) throw new ApiError("Validation failed", 422, { errors });
  const row = {
    id: `cpn-${Date.now().toString().slice(-4)}`,
    code: body.code.trim().toUpperCase(),
    type: body.type,
    value: body.type === "free_shipping" ? 0 : parseFloat(body.value),
    min_order: parseFloat(body.minOrder) || 0,
    usage: 0,
    usage_limit: body.limit ? parseInt(body.limit, 10) : null,
    starts_at: body.startsAt || new Date().toISOString().slice(0, 10),
    expires_at: body.expiresAt,
    status: body.status || "active",
    applies_to: body.appliesTo || "all",
    scope: body.scope || [],
    description: body.description || "",
  };
  const { data, error } = await supabase.from("coupons").insert(row).select("*").single();
  if (error) throw new ApiError(error.message, 422, { errors: { code: error.message } });
  return { data: mapCoupon(data) };
}

async function updateCoupon(id, body) {
  const row = {
    code: body.code,
    type: body.type,
    value: body.value,
    min_order: body.minOrder ?? body.min_order,
    usage_limit: body.limit ?? body.usage_limit,
    starts_at: body.startsAt ?? body.starts_at,
    expires_at: body.expiresAt ?? body.expires_at,
    status: body.status,
    applies_to: body.appliesTo ?? body.applies_to,
    scope: body.scope,
    description: body.description,
  };
  const { data, error } = await supabase.from("coupons").update(row).eq("id", id).select("*").single();
  if (error) throw new ApiError(error.message);
  return { data: mapCoupon(data) };
}

async function deleteCoupon(id) {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) throw new ApiError(error.message);
  return { ok: true };
}

async function getNotifications(params) {
  const { data, error } = await supabase.from("notifications").select("*").order("created_at", { ascending: false });
  if (error) throw new ApiError(error.message);
  let rows = (data || []).map(mapNotification);
  const category = params.get("category");
  const all = rows;
  if (category && category !== "all") rows = rows.filter((n) => n.category === category);
  const counts = all.reduce((acc, n) => {
    acc[n.category] = (acc[n.category] || 0) + 1;
    return acc;
  }, {});
  counts.all = all.length;
  return { data: rows, counts, unread: all.filter((n) => !n.read).length };
}

async function patchNotifications(body) {
  if (body.action === "read_all") {
    await supabase.from("notifications").update({ read: true }).eq("read", false);
  }
  if (body.action === "read" && body.id) {
    await supabase.from("notifications").update({ read: true }).eq("id", body.id);
  }
  if (body.action === "toggle" && body.id) {
    const { data } = await supabase.from("notifications").select("read").eq("id", body.id).single();
    await supabase.from("notifications").update({ read: !data?.read }).eq("id", body.id);
  }
  return getNotifications(new URLSearchParams());
}

async function getDashboard(params) {
  const range = params.get("range") || "30d";
  const days = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 }[range] ?? 30;
  const [orders, products, customers] = await Promise.all([allOrders(), allProducts(), allCustomers()]);
  const revenue = compare(days, revenueOf, orders);
  const orderCount = compare(days, (l) => l.length, orders);
  const units = compare(days, (l) => l.reduce((s, o) => s + (o.itemCount || 0), 0), orders);
  const buyers = compare(days, (l) => new Set(l.map((o) => o.customerId)).size, orders);
  const newCustomers = customers.filter((c) => (TODAY.getTime() - new Date(c.joinedAt).getTime()) / dayMs <= days).length;
  const series = range === "12m" ? monthlySeries(orders, 12) : dailySeries(orders, days);
  return {
    kpis: {
      revenue: { ...revenue, spark: series.slice(-14).map((d) => d.revenue) },
      orders: { ...orderCount, spark: series.slice(-14).map((d) => d.orders) },
      customers: {
        current: customers.length,
        change: buyers.change,
        previous: buyers.previous,
        newInPeriod: newCustomers,
        spark: series.slice(-14).map((d) => d.orders),
      },
      products: {
        current: products.filter((p) => p.status === "active").length,
        change: 0,
        lowStock: products.filter((p) => p.stockStatus === "low_stock").length,
        outOfStock: products.filter((p) => p.stockStatus === "out_of_stock").length,
        spark: series.slice(-14).map((d) => d.units),
      },
      aov: {
        current: orderCount.current ? Math.round((revenue.current / orderCount.current) * 100) / 100 : 0,
        previous: orderCount.previous ? Math.round((revenue.previous / orderCount.previous) * 100) / 100 : 0,
        change: 0,
      },
      units,
    },
    series,
    granularity: range === "12m" ? "month" : "day",
    recentOrders: orders.slice(0, 6),
    topProducts: productPerformance(orders, products, days).slice(0, 5),
    lowStockItems: products
      .filter((p) => p.stockStatus !== "in_stock" && p.status !== "archived")
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 5)
      .map((p) => ({ id: p.id, name: p.name, nameFa: p.nameFa, sku: p.sku, stock: p.stock, threshold: 8, status: p.stockStatus, price: p.price, image: p.image })),
    activity: orders.slice(0, 7).map((o) => ({
      id: `act-${o.id}`,
      type: "order",
      actor: o.customerName,
      message: `placed order #${o.id}`,
      at: o.placedAt,
      href: `/orders/${o.id}`,
      amount: o.total,
    })),
  };
}

async function getAnalytics(params) {
  const range = params.get("range") || "30d";
  const days = { "7d": 7, "30d": 30, "90d": 90, "12m": 365 }[range] ?? 30;
  const [orders, products, customers, categories] = await Promise.all([allOrders(), allProducts(), allCustomers(), allCategories()]);
  const revenue = compare(days, revenueOf, orders);
  const orderCount = compare(days, (l) => l.length, orders);
  const aovCurrent = orderCount.current ? revenue.current / orderCount.current : 0;
  const aovPrevious = orderCount.previous ? revenue.previous / orderCount.previous : 0;
  const inWindow = ordersInRange(orders, days);
  const returningBuyers = new Set();
  const seen = new Set();
  inWindow.forEach((o) => {
    if (seen.has(o.customerId)) returningBuyers.add(o.customerId);
    seen.add(o.customerId);
  });
  const byCountry = {};
  inWindow.forEach((o) => {
    const c = customers.find((x) => x.id === o.customerId);
    if (!c) return;
    byCountry[c.country] = byCountry[c.country] || { country: c.country, revenue: 0, orders: 0 };
    byCountry[c.country].revenue = Math.round((byCountry[c.country].revenue + o.total) * 100) / 100;
    byCountry[c.country].orders += 1;
  });
  const hourly = Array.from({ length: 24 }, (_, h) => ({ hour: h, orders: 0 }));
  inWindow.forEach((o) => {
    hourly[new Date(o.placedAt).getUTCHours()].orders += 1;
  });
  const perf = productPerformance(orders, products, days);
  const catMap = new Map();
  perf.forEach((row) => {
    const cur = catMap.get(row.categoryId) || { categoryId: row.categoryId, revenue: 0, units: 0 };
    cur.revenue = Math.round((cur.revenue + row.revenue) * 100) / 100;
    cur.units += row.units;
    catMap.set(row.categoryId, cur);
  });
  const growth = [];
  for (let i = 11; i >= 0; i--) {
    const d = new Date(Date.UTC(TODAY.getUTCFullYear(), TODAY.getUTCMonth() - i, 1));
    const key = d.toISOString().slice(0, 7);
    growth.push({
      date: key,
      label: d.toLocaleDateString("en-US", { month: "short", timeZone: "UTC" }),
      new: customers.filter((c) => String(c.joinedAt).slice(0, 7) === key).length,
      returning: 0,
    });
  }
  return {
    range,
    kpis: {
      revenue,
      orders: orderCount,
      aov: {
        current: Math.round(aovCurrent * 100) / 100,
        previous: Math.round(aovPrevious * 100) / 100,
        change: aovPrevious ? Math.round((aovCurrent / aovPrevious - 1) * 1000) / 10 : 0,
      },
      customers: compare(days, (l) => new Set(l.map((o) => o.customerId)).size, orders),
      repeatRate: { current: seen.size ? Math.round((returningBuyers.size / seen.size) * 1000) / 10 : 0 },
      units: compare(days, (l) => l.reduce((s, o) => s + (o.itemCount || 0), 0), orders),
    },
    series: range === "12m" ? monthlySeries(orders, 12) : dailySeries(orders, days),
    granularity: range === "12m" ? "month" : "day",
    monthly: monthlySeries(orders, 12),
    products: perf.slice(0, 8),
    categories: [...catMap.values()]
      .map((c) => ({
        ...c,
        name: categories.find((x) => x.id === c.categoryId)?.name || "Uncategorised",
        nameFa: categories.find((x) => x.id === c.categoryId)?.nameFa || "",
      }))
      .sort((a, b) => b.revenue - a.revenue),
    customerGrowth: growth,
    geography: Object.values(byCountry)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 8),
    hourly,
  };
}

async function getSearch(params) {
  const q = (params.get("q") || "").trim().toLowerCase();
  if (!q) {
    return { products: [], orders: [], customers: [], pages: PAGES.slice(0, 5).map((p) => ({ ...p, type: "page" })) };
  }
  const [products, orders, customers] = await Promise.all([allProducts(), allOrders(), allCustomers()]);
  return {
    products: products
      .filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || (p.nameFa || "").includes(q))
      .slice(0, 5)
      .map((p) => ({
        id: p.id,
        type: "product",
        title: p.name,
        titleFa: p.nameFa,
        hint: `${p.sku} · $${p.price.toFixed(2)}`,
        href: `/products/${p.id}`,
        status: p.stockStatus,
        image: p.image,
      })),
    orders: orders
      .filter((o) => o.id.toLowerCase().includes(q) || (o.customerName || "").toLowerCase().includes(q))
      .slice(0, 5)
      .map((o) => ({
        id: o.id,
        type: "order",
        title: `#${o.id}`,
        hint: `${o.customerName} · $${o.total.toFixed(2)}`,
        href: `/orders/${o.id}`,
        status: o.status,
      })),
    customers: customers
      .filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q))
      .slice(0, 5)
      .map((c) => ({
        id: c.id,
        type: "customer",
        title: c.name,
        hint: c.email,
        href: `/customers/${c.id}`,
        status: c.status,
      })),
    pages: PAGES.filter((p) => p.title.toLowerCase().includes(q))
      .slice(0, 4)
      .map((p) => ({ ...p, type: "page" })),
  };
}
