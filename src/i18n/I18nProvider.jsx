'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { messages } from './messages';
import { extra } from './extra';
import { setFormatLocale } from '@/lib/format';

const STORAGE_KEY = 'nexora-locale';
const LEGACY_STORAGE_KEY = 'nova-locale';
const LocaleContext = createContext({
  locale: 'en',
  dir: 'ltr',
  setLocale: () => {},
  t: (key) => key,
});

function lookup(dict, key) {
  return key.split('.').reduce((o, k) => (o == null ? o : o[k]), dict);
}

function interpolate(str, vars) {
  if (!vars) return str;
  return String(str).replace(/\{(\w+)\}/g, (_, k) => (vars[k] == null ? `{${k}}` : String(vars[k])));
}

export function translate(locale, key, vars) {
  const table = messages[locale] || messages.en;
  const extraTable = extra[locale] || extra.en;
  const raw =
    lookup(table, key) ??
    lookup(extraTable, key) ??
    lookup(messages.en, key) ??
    lookup(extra.en, key) ??
    key;
  return interpolate(raw, vars);
}

function readLocale() {
  if (typeof window === 'undefined') return 'en';
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (stored === 'fa' || stored === 'en') return stored;
  } catch {
    /* ignore */
  }
  return 'en';
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(readLocale);

  const setLocale = useCallback((next) => {
    const value = next === 'fa' ? 'fa' : 'en';
    setFormatLocale(value);
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      /* ignore */
    }
    const root = document.documentElement;
    root.lang = value;
    root.dir = value === 'fa' ? 'rtl' : 'ltr';
    root.setAttribute('data-locale', value);
    setLocaleState(value);
  }, []);

  useEffect(() => {
    setFormatLocale(locale);
    const root = document.documentElement;
    root.lang = locale;
    root.dir = locale === 'fa' ? 'rtl' : 'ltr';
    root.setAttribute('data-locale', locale);
  }, [locale]);

  const t = useCallback((key, vars) => translate(locale, key, vars), [locale]);

  const value = useMemo(
    () => ({ locale, dir: locale === 'fa' ? 'rtl' : 'ltr', setLocale, t }),
    [locale, setLocale, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n() {
  return useContext(LocaleContext);
}

export const localeScript = `
(function(){
  try {
    var l = localStorage.getItem('${STORAGE_KEY}') || localStorage.getItem('${LEGACY_STORAGE_KEY}') || 'en';
    if (l !== 'fa' && l !== 'en') l = 'en';
    var r = document.documentElement;
    r.lang = l;
    r.dir = l === 'fa' ? 'rtl' : 'ltr';
    r.setAttribute('data-locale', l);
  } catch(e) {}
})();
`;
