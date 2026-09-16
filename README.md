# Nova — E-commerce Admin

A production-quality admin platform for a single online store: catalog, orders,
inventory, customers and analytics. Built with Next.js, React, JavaScript,
Redux Toolkit, Tailwind CSS and **Supabase** (Postgres + Auth + Storage).

## Running locally

Requires **Node.js 18.17+** (built and tested on Node 20). On Windows, Next 16
must run with Webpack (`npm run dev` already passes `--webpack`).

```bash
npm install      # first time only
npm run dev      # → http://localhost:3000
```

Copy `.env.local` (gitignored) with:

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_PUBLISHABLE_KEY
```

Sign in at `/login` with **sarah@novastore.com** / **nova2026**.
Unauthenticated users are redirected to login. Row Level Security on Supabase
returns empty arrays until a valid session JWT is present.

---

## What's inside

| Area | Routes |
| --- | --- |
| Auth | `/login`, `/forgot-password`, `/reset-password` |
| Overview | `/` (Dashboard), `/analytics` |
| Catalog | `/products`, `/products/new`, `/products/[id]`, `/products/[id]/edit`, `/categories`, `/inventory` |
| Sales | `/orders`, `/orders/[id]`, `/customers`, `/customers/[id]` |
| Marketing | `/coupons`, `/reviews` |
| System | `/notifications`, `/settings` (8 panels), `/profile`, `/support` |
| Errors | `404`, `/403`, `/500` |

---

## Architecture

```
src/
├─ app/                 Routes (App Router pages only)
├─ components/
│  ├─ ui/               Reusable primitives (Button, Table, Modal, …)
│  ├─ layout/           Shell: Sidebar, Header, GlobalSearch, ThemeProvider
│  ├─ charts/           Recharts wrappers with shared theming + tooltip
│  ├─ dashboard/        KPI widgets, RecentOrders, TopProducts, LowStock, Activity
│  └─ products/         ProductTable, ProductFilters, ProductForm, Gallery, Variants
├─ store/               Redux Toolkit store + 9 slices
├─ lib/                 Supabase client, API adapter, mappers, formatters, hooks
└─ i18n/                EN / FA messages + RTL
```

```
page / slice
  → api('/api/products')     src/lib/api.js   (stable REST-shaped contract)
  → handleRemote(...)        src/lib/sbApi.js (Supabase queries + aggregates)
  → supabase-js              src/lib/supabaseClient.js
  → Postgres + Storage
```

UI talks camelCase (`nameFa`, `categoryId`). Postgres is snake_case
(`name_fa`, `category_id`). `src/lib/maps.js` is the boundary.

### Data

Live data lives in Supabase, not in the repo:

- ~50 products (`prd-1001` …) with public images in the `product-images` bucket
- 9 categories, ~80 customers, ~150 orders, 8 coupons, ~300 reviews
- Inventory is a **view** over `products` (stock 0 = out, 1–8 = low)
- Auth user: `sarah@novastore.com` — schema/seed SQL is under `supabase/`

Dashboard “today” is fixed at `2026-08-21T12:00:00Z` so historical seed
windows are not all zeros. Revenue counts pending, processing, shipped and
delivered (not cancelled/refunded).

### Redux Toolkit

Nine slices for state that is genuinely shared: `products`, `orders`,
`customers`, `categories`, `inventory`, `notifications`, `auth`, `ui`, `theme`.
Each list slice owns its filters, sort, page, selection and column visibility,
with async thunks reading the current slice state so a filter change
automatically refetches.

Local UI state stays local by design — dropdown open/closed, hover, draft form
values and modal visibility are all `useState`. The one deliberate exception is
`ui.pageTitle`: detail pages publish their resolved title so the header
breadcrumb can show a product name instead of a raw id.

---

## Design system

**Tokens.** Every colour is a CSS custom property consumed through semantic
Tailwind names (`surface`, `ink-2`, `brand-soft`, `danger-text`). Nothing
references a raw hex in a component, which is what makes the dark theme a
separate designed palette rather than an inversion — dark re-tunes the orange
lighter and less saturated so it holds contrast on dark surfaces, and gives
tables, badges, inputs and charts their own values.

**Type scale.** Display / H1–H4 / Body Large / Body / Body Small / Caption /
Label / Micro, on Inter (Vazirmatn when `fa`) with tabular numerals wherever
figures are compared.

**Spacing** 4→64 · **Radius** controls 8–10, cards 12–16, containers 20, pills 999
· **Shadows** reserved for dropdowns, popovers, modals and toasts.

**Orange is an accent**, not a surface: primary CTAs, active navigation,
selection, focus rings, progress and trend accents.

### Notable UI decisions

- **Tables** right-align and tabular-align every numeric column, use horizontal
  rules only, sticky identity and action columns during horizontal scroll, and
  swap the toolbar for a bulk-action bar the moment rows are selected.
- **Status is never colour alone** — every dot ships with its label
  (`● Low stock`), so meaning survives greyscale.
- **Filters** live in a drawer, are staged locally and applied on confirm, and
  every active filter is echoed as a removable chip above the table.
- **Complex forms are full pages**, with a sticky save bar, an error summary,
  inline field messages, preserved values after failed validation, and sections
  that become collapsible accordions on mobile.
- **Charts** are chosen for the data: area for revenue trend, dual-axis bars +
  line for orders vs units, donut for category share, stacked bars for new vs
  returning customers, horizontal bars for product ranking.

### States

Every data-driven surface implements loading, success, empty and error.
Skeletons mirror the real layout (KPI cards, tables, lists, charts); spinners
are reserved for short actions like Saving… and Deleting…. Empty states
distinguish "nothing yet" from "nothing matches your filters" and offer the
right next action for each.

### Accessibility

Semantic HTML and landmarks, a skip link, keyboard-operable menus with roving
arrow navigation, focus trapping and restoration in modals and drawers, visible
focus rings throughout, `aria-sort` on sortable headers, accessible names on
every icon button, `sr-only` table captions, live regions for toasts, and
`prefers-reduced-motion` honoured globally.

### Responsive

Not a shrunk desktop. The sidebar collapses to icons with tooltips and becomes a
drawer on mobile; KPI cards go two-up with a tighter type scale and no sparkline;
filters become a bottom sheet; tables scroll horizontally with sticky columns;
the product form collapses into accordions; and the order status timeline flips
from horizontal to vertical.

---

## Keyboard

| Shortcut | Action |
| --- | --- |
| `⌘K` / `Ctrl+K` | Open global search |
| `↑` `↓` | Move through results |
| `Enter` | Open the highlighted result |
| `Esc` | Close any dialog, drawer or menu |

---

## Notes

Product images are served from Supabase Storage. Payment provider settings are
UI-only — no credentials are stored or transmitted, and nothing processes a
real transaction. Free-tier Supabase pauses after about a week of idle
database traffic; restore from the dashboard if queries hang.
