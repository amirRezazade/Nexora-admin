import { handleRemote } from './sbApi';

/**
 * Single data door for the UI. Paths stay REST-shaped (`/api/products`) so
 * slices never import supabase-js. handleRemote talks to Postgres.
 * Throws an Error carrying HTTP status and field-level `errors` (422).
 */
export async function api(path, options = {}) {
  try {
    return await handleRemote(path, options);
  } catch (e) {
    const error = new Error(e.message || 'Something went wrong. Please try again.');
    error.status = e.status || 400;
    error.payload = e;
    error.errors = e.errors || null;
    throw error;
  }
}

/** Serialises a params object into a query string, dropping empties. */
export function qs(params = {}) {
  const sp = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v == null || v === '' || v === 'all') return;
    if (Array.isArray(v)) {
      if (!v.length) return;
      sp.set(k, v.join(','));
    } else {
      sp.set(k, String(v));
    }
  });
  const s = sp.toString();
  return s ? `?${s}` : '';
}
