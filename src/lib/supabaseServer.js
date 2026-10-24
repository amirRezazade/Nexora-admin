import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./env";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server-side Supabase client for React Server Components (RSC).
 *
 * Automatically forwards the user's auth cookie from the incoming request,
 * enabling Row Level Security (RLS) queries on protected tables (orders, customers).
 */
export async function getServerSupabase() {
  const cookieStore = await cookies();
  const url = SUPABASE_URL;
  const key = SUPABASE_ANON_KEY;

  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
        } catch {
          // The `setAll` method was called from a Server Component.
          // This can be ignored if you have middleware refreshing user sessions.
        }
      },
    },
  });
}
