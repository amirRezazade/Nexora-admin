import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 *
 * Uses @supabase/ssr so the session lives in *cookies* instead of
 * localStorage. That is what lets src/middleware.js read the session on the
 * server and protect routes with a real redirect before any JS renders.
 * Token refresh and URL-based recovery links keep working automatically.
 */
import { SUPABASE_URL as url, SUPABASE_ANON_KEY as key } from "./env";

export const supabase = createBrowserClient(url, key, {
  auth: {
    detectSessionInUrl: true,
    autoRefreshToken: true,
    persistSession: true,
  },
});
