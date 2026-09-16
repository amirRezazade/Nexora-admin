import { createSlice, nanoid } from '@reduxjs/toolkit';

/** Cross-cutting UI state only: shell chrome, the command palette and toasts.
 *  Component-local concerns (dropdown open, hover, draft form values) stay in
 *  useState by design. */
const slice = createSlice({
  name: 'ui',
  initialState: {
    sidebarCollapsed: false,
    mobileNavOpen: false,
    searchOpen: false,
    toasts: [],
    density: 'comfortable',
    // Detail pages publish their resolved title so the header breadcrumb can
    // show "Nike Air Max 90" instead of a raw record id.
    pageTitle: null,
  },
  reducers: {
    toggleSidebar(s) { s.sidebarCollapsed = !s.sidebarCollapsed; },
    setSidebarCollapsed(s, a) { s.sidebarCollapsed = a.payload; },
    setMobileNav(s, a) { s.mobileNavOpen = a.payload; },
    setSearchOpen(s, a) { s.searchOpen = a.payload; },
    setDensity(s, a) { s.density = a.payload; },
    setPageTitle(s, a) { s.pageTitle = a.payload; },
    addToast: {
      reducer(s, a) {
        s.toasts.unshift(a.payload);
        if (s.toasts.length > 4) s.toasts.pop();
      },
      prepare({ title, description, variant = 'success', duration = 4500, action = null }) {
        return { payload: { id: nanoid(), title, description, variant, duration, action } };
      },
    },
    dismissToast(s, a) { s.toasts = s.toasts.filter((t) => t.id !== a.payload); },
  },
});

export const {
  toggleSidebar, setSidebarCollapsed, setMobileNav, setSearchOpen, setDensity,
  setPageTitle, addToast, dismissToast,
} = slice.actions;

export const toast = {
  success: (title, description) => addToast({ title, description, variant: 'success' }),
  error: (title, description) => addToast({ title, description, variant: 'error', duration: 6000 }),
  warning: (title, description) => addToast({ title, description, variant: 'warning' }),
  info: (title, description) => addToast({ title, description, variant: 'info' }),
};

export default slice.reducer;
