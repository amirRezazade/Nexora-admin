import clsx from "clsx";

export const cn = (...args) => clsx(...args);

const FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

function readStoredLocale() {
  if (typeof window === "undefined") return "en";
  try {
    const l = window.localStorage.getItem("nexora-locale") || window.localStorage.getItem("nova-locale");
    return l === "fa" ? "fa" : "en";
  } catch {
    return "en";
  }
}

let formatLocale = readStoredLocale();

export function setFormatLocale(l) {
  formatLocale = l === "fa" ? "fa" : "en";
}
export function getFormatLocale() {
  return formatLocale;
}

const intlLocale = () => (formatLocale === "fa" ? "fa-IR" : "en-US");

/** Convert ASCII digits in a string to the active locale’s digits. */
export function digits(value) {
  const s = String(value ?? "");
  if (formatLocale !== "fa") return s.replace(/[۰-۹]/g, (d) => "0123456789"[FA_DIGITS.indexOf(d)] ?? d);
  return s.replace(/\d/g, (d) => FA_DIGITS[d] ?? d);
}

export function localized(record, field, locale = formatLocale) {
  if (!record) return "";
  if (locale === "fa") {
    return record[`${field}Fa`] || record[`${field}_fa`] || record[field] || "";
  }
  return record[field] || "";
}

export const currency = (n, opts = {}) =>
  new Intl.NumberFormat(intlLocale(), {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: opts.decimals ?? 2,
    maximumFractionDigits: opts.decimals ?? 2,
  }).format(n ?? 0);

/** Compact money for chart axes and dense KPI contexts. */
export const currencyCompact = (n) => {
  const v = n ?? 0;
  const loc = intlLocale();
  if (Math.abs(v) >= 1000000) {
    return new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: 1 }).format(v / 1000000) + "M";
  }
  if (Math.abs(v) >= 1000) {
    return new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: 1 }).format(v / 1000) + "k";
  }
  return new Intl.NumberFormat(loc, { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(v);
};

export const number = (n) => new Intl.NumberFormat(intlLocale()).format(n ?? 0);

export const percent = (n, digitsCount = 1) => {
  const v = n ?? 0;
  const formatted = new Intl.NumberFormat(intlLocale(), {
    minimumFractionDigits: digitsCount,
    maximumFractionDigits: digitsCount,
  }).format(Math.abs(v));
  const sign = v > 0 ? "+" : v < 0 ? (formatLocale === "fa" ? "−" : "-") : "";
  return `${sign}${formatted}%`;
};

export const dateShort = (d) => new Date(d).toLocaleDateString(intlLocale(), { month: "short", day: "numeric", year: "numeric" });

export const dateMedium = (d) => new Date(d).toLocaleDateString(intlLocale(), { month: "short", day: "numeric", year: "numeric" });

export const dateTime = (d) =>
  new Date(d).toLocaleString(intlLocale(), {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

export const timeOnly = (d) => new Date(d).toLocaleTimeString(intlLocale(), { hour: "numeric", minute: "2-digit" });

export function relativeTime(d) {
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.round(diff / 60000);
  const fa = formatLocale === "fa";
  if (mins < 1) return fa ? "همین حالا" : "Just now";
  if (mins < 60) return fa ? `${number(mins)} دقیقه پیش` : `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return fa ? `${number(hours)} ساعت پیش` : `${hours}h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return fa ? `${number(days)} روز پیش` : `${days}d ago`;
  if (days < 31) return fa ? `${number(Math.round(days / 7))} هفته پیش` : `${Math.round(days / 7)}w ago`;
  if (days < 365) return fa ? `${number(Math.round(days / 30))} ماه پیش` : `${Math.round(days / 30)}mo ago`;
  return fa ? `${number(Math.round(days / 365))} سال پیش` : `${Math.round(days / 365)}y ago`;
}

export const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const titleCase = (s = "") => s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

export const slugify = (s = "") =>
  s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

/** Deterministic pleasant gradient for product placeholder imagery. */
export function productArt(seed = "") {
  const hash = String(seed)
    .split("")
    .reduce((s, c) => s + c.charCodeAt(0), 0);
  const palettes = [
    ["#F4E4D7", "#E8C9AC"],
    ["#DCE5EC", "#BECEDD"],
    ["#E2E8DF", "#C4D2C2"],
    ["#EDE3EE", "#D6C4DA"],
    ["#F0E6D2", "#DDCDA9"],
    ["#DDE3EB", "#C0CBDA"],
  ];
  return palettes[hash % palettes.length];
}
