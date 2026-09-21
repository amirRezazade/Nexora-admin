export function stockStatus(p) {
  const stock = p.stock ?? p.available ?? 0;
  if (stock <= 0) return "out_of_stock";
  if (stock <= 8) return "low_stock";
  return "in_stock";
}

export function withStock(p) {
  return {
    ...p,
    threshold: p.threshold ?? 8,
    reserved: p.reserved ?? 0,
    supplier: p.supplier ?? "",
    stockStatus: stockStatus(p),
  };
}

export function mapProduct(row) {
  if (!row) return null;
  const images = Array.isArray(row.images) ? row.images : [];
  const primary = images.find((i) => i.primary) || images[0];
  return withStock({
    id: row.id,
    name: row.name,
    nameFa: row.name_fa || "",
    sku: row.sku,
    slug: row.slug,
    categoryId: row.category_id,
    price: Number(row.price),
    compareAt: row.compare_at != null ? Number(row.compare_at) : null,
    cost: row.cost != null ? Number(row.cost) : 0,
    stock: Number(row.stock) || 0,
    status: row.status,
    brand: row.brand,
    tags: row.tags || [],
    variants: row.variants || [],
    images,
    image: primary?.url || null,
    rating: Number(row.rating) || 0,
    reviewCount: Number(row.review_count) || 0,
    description: row.description || "",
    descriptionFa: row.description_fa || "",
    seoTitle: row.seo_title || "",
    metaDescription: row.meta_description || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export function mapCategory(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    nameFa: row.name_fa || "",
    slug: row.slug,
    parentId: row.parent_id || null,
    status: row.status,
    description: row.description || "",
    descriptionFa: row.description_fa || "",
  };
}

export function mapCustomer(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    city: row.city,
    country: row.country,
    status: row.status,
    segment: row.segment,
    joinedAt: row.joined_at,
    avatarTone: row.avatar_tone,
    addressLine1: row.address_line1,
    addressLine2: row.address_line2,
    postcode: row.postcode,
    orders: row.orders_count,
    ordersCount: row.orders_count,
    totalSpent: Number(row.total_spent) || 0,
    lastOrder: row.last_order,
    avgOrder: Number(row.avg_order) || 0,
  };
}

export function mapOrder(row, items = []) {
  if (!row) return null;
  return {
    id: row.id,
    customerId: row.customer_id,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    placedAt: row.placed_at,
    items,
    itemCount: row.item_count,
    subtotal: Number(row.subtotal) || 0,
    discount: Number(row.discount) || 0,
    couponCode: row.coupon_code || "",
    shipping: Number(row.shipping) || 0,
    shippingMethod: row.shipping_method,
    tax: Number(row.tax) || 0,
    total: Number(row.total) || 0,
    status: row.status,
    paymentStatus: row.payment_status,
    paymentMethod: row.payment_method,
    paymentBrand: row.payment_brand,
    shippingAddress: row.shipping_address,
    billingAddress: row.billing_address,
    trackingNumber: row.tracking_number || "",
    timeline: row.timeline || [],
    note: row.note || "",
  };
}

export function mapOrderItem(row) {
  return {
    id: row.id,
    orderId: row.order_id,
    productId: row.product_id,
    name: row.name,
    sku: row.sku,
    variantLabel: row.variant_label,
    quantity: row.quantity,
    unitPrice: Number(row.unit_price),
    total: Number(row.total),
    categoryId: row.category_id,
  };
}

export function mapCoupon(row) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: Number(row.value) || 0,
    minOrder: Number(row.min_order) || 0,
    usage: row.usage,
    limit: row.usage_limit,
    startsAt: row.starts_at,
    expiresAt: row.expires_at,
    status: row.status,
    appliesTo: row.applies_to,
    scope: row.scope || [],
    description: row.description || "",
  };
}

export function mapReview(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    productName: row.product_name,
    customerId: row.customer_id,
    customerName: row.customer_name,
    rating: row.rating,
    title: row.title,
    body: row.body,
    createdAt: row.created_at,
    status: row.status,
    verified: row.verified,
    helpful: row.helpful,
  };
}

export function mapNotification(row) {
  if (!row) return null;
  return {
    id: row.id,
    category: row.category,
    title: row.title,
    body: row.body,
    href: row.href,
    createdAt: row.created_at,
    tone: row.tone,
    read: row.read,
  };
}

export function mapInventory(row) {
  if (!row) return null;
  return {
    id: row.id,
    productId: row.product_id,
    name: row.name,
    sku: row.sku,
    categoryId: row.category_id,
    available: row.available,
    reserved: 0,
    onHand: row.available,
    threshold: 8,
    cost: Number(row.cost) || 0,
    value: Number(row.value) || 0,
    status: row.status,
    supplier: "",
    location: "",
    updatedAt: row.updated_at,
    primaryImage: row.primary_image,
  };
}

/** Numeric column helper — form inputs send '' when left blank, and Postgres
 *  rejects '' for numeric columns ("invalid input syntax for type numeric"). */
const toNum = (v, fallback = null) => {
  if (v === "" || v === null || v === undefined) return fallback;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : fallback;
};

export function productToRow(body, extra = {}) {
  return {
    name: body.name,
    sku: body.sku,
    slug: body.slug,
    category_id: body.categoryId,
    price: toNum(body.price),
    compare_at: toNum(body.compareAt),
    cost: toNum(body.cost, 0),
    stock: toNum(body.stock, 0),
    status: body.status || "draft",
    brand: body.brand || "Nexora Basics",
    tags: body.tags || [],
    variants: body.variants || [],
    images: body.images || [],
    description: body.description || "",
    seo_title: body.seoTitle || "",
    meta_description: body.metaDescription || "",
    name_fa: body.nameFa || body.name_fa || null,
    description_fa: body.descriptionFa || body.description_fa || null,
    updated_at: new Date().toISOString().slice(0, 10),
    ...extra,
  };
}
