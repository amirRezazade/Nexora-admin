import { createBrowserClient } from '@supabase/ssr';

/**
 * Browser Supabase client.
 *
 * Uses @supabase/ssr so the session lives in *cookies* instead of
 * localStorage. That is what lets src/middleware.js read the session on the
 * server and protect routes with a real redirect before any JS renders.
 * Token refresh and URL-based recovery links keep working automatically.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://akqrnvrgsnofnhrhlxow.supabase.co';
const key =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_aNo4PzSif8eS7OKLwv6Z4g_dfBBCXxG';

export const supabase = createBrowserClient(url, key, {
  auth: {
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
  },
});
