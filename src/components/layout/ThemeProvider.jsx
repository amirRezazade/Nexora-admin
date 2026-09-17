"use client";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setPreference, setResolved } from "@/store/slices/themeSlice";

const STORAGE_KEY = "nexora-theme";
const LEGACY_STORAGE_KEY = "nexora-theme";

/**
 * Resolves 'light' | 'dark' | 'system' into a class on <html>, persists the
 * choice, and follows the OS while the preference is 'system'.
 * The transition is suppressed for one frame on the toggle so only colours
 * animate — never layout.
 */
export default function ThemeProvider({ children }) {
  const dispatch = useDispatch();
  const preference = useSelector((s) => s.theme.preference);

  // Hydrate from storage once.
  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY) || window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (stored && stored !== preference) dispatch(setPreference(stored));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const mql = window.matchMedia("(prefers-color-scheme: dark)");

    const apply = () => {
      const resolved = preference === "system" ? (mql.matches ? "dark" : "light") : preference;
      const root = document.documentElement;
      root.classList.toggle("dark", resolved === "dark");
      root.style.colorScheme = resolved;
      dispatch(setResolved(resolved));
    };

    apply();
    window.localStorage.setItem(STORAGE_KEY, preference);

    if (preference !== "system") return;
    mql.addEventListener("change", apply);
    return () => mql.removeEventListener("change", apply);
  }, [preference, dispatch]);

  return children;
}

/** Inline script that sets the theme class before first paint (no flash). */
export const themeScript = `
(function(){
  try {
    var p = localStorage.getItem('${STORAGE_KEY}') || localStorage.getItem('${LEGACY_STORAGE_KEY}') || 'light';
    var d = p === 'dark' || (p === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    var r = document.documentElement;
    r.classList.add('no-theme-transition');
    if (d) r.classList.add('dark');
    r.style.colorScheme = d ? 'dark' : 'light';
    window.requestAnimationFrame(function(){
      window.requestAnimationFrame(function(){ r.classList.remove('no-theme-transition'); });
    });
  } catch(e) {}
})();
`;
