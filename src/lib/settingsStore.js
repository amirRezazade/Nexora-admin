"use client";

import { useState } from "react";

const KEY = "nexora-store-settings";
const LEGACY_KEY = "nova-store-settings";

export const SETTINGS_DEFAULTS = {
  general: {
    storeName: "Nexora Store",
    storeEmail: "hello@nexora.com",
    supportPhone: "+49 69 5550 1200",
    storefrontUrl: "nexora-admin-app.vercel.app/",
    description: "Considered everyday essentials — footwear, apparel, audio and home goods, chosen for how they wear over years rather than seasons.",
    currency: "USD",
    timezone: "Europe/Berlin",
    language: "en-US",
    supportEmail: "support@nexora.com",
    supportHours: "Mon–Fri, 9:00–18:00 CET",
  },
  store: {
    address1: "Hanauer Landstraße 188",
    address2: "Building C, 4th floor",
    city: "Frankfurt am Main",
    postcode: "60314",
    country: "DE",
    legalName: "Nexora Commerce GmbH",
    vat: "DE 312 445 908",
    registration: "HRB 118342",
    registeredSince: "2023-04-18",
  },
  orders: {
    prefix: "NV-",
    nextNumber: "13265",
    autoFulfil: false,
    location: "frankfurt",
    autoCancel: true,
    cancelAfter: "24",
    notifyPlaced: true,
    notifyShipped: true,
    notifyDelivered: false,
  },
  payments: {
    stripe: true,
    paypal: true,
    bank: false,
    payout: "monthly",
    taxRate: "19",
    taxInclusive: "yes",
  },
  shipping: {
    freeEnabled: true,
    freeThreshold: "75",
  },
  notifications: {
    email: "sarah@novastore.com",
    digest: "realtime",
    order_new: true,
    order_cancelled: true,
    order_refund: true,
    stock_low: true,
    stock_out: true,
    stock_restock: false,
    review_new: false,
    review_low: true,
    sys_payout: true,
    sys_security: true,
    sys_product: false,
  },
  security: {
    twoFactor: false,
    alerts: true,
  },
};

function merge(base, extra) {
  if (!extra || typeof extra !== "object") return { ...base };
  const out = { ...base };
  Object.keys(base).forEach((k) => {
    if (extra[k] && typeof extra[k] === "object" && !Array.isArray(extra[k]) && typeof base[k] === "object") {
      out[k] = { ...base[k], ...extra[k] };
    } else if (extra[k] !== undefined) {
      out[k] = extra[k];
    }
  });
  return out;
}

export function loadSettings() {
  if (typeof window === "undefined") return structuredClone(SETTINGS_DEFAULTS);
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return structuredClone(SETTINGS_DEFAULTS);
    const merged = merge(SETTINGS_DEFAULTS, JSON.parse(raw));
    merged.general.storeName = SETTINGS_DEFAULTS.general.storeName;
    merged.general.storefrontUrl = SETTINGS_DEFAULTS.general.storefrontUrl;
    return merged;
  } catch {
    return structuredClone(SETTINGS_DEFAULTS);
  }
}

export function saveSettings(section, data) {
  const all = loadSettings();
  if (section) all[section] = { ...all[section], ...data };
  try {
    window.localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    /* ignore quota */
  }
  return all;
}

/** Client hook: one settings panel as controlled state, persisted on save. */
export function useSettingsSection(section) {
  const [form, setForm] = useState(() => loadSettings()[section]);
  const [dirty, setDirty] = useState(false);
  const patch = (key) => (e) => {
    const value = e?.target ? (e.target.type === "checkbox" ? e.target.checked : e.target.value) : e;
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
  };
  const save = () => {
    saveSettings(section, form);
    setDirty(false);
  };
  return { form, setForm, patch, dirty, setDirty, save };
}
