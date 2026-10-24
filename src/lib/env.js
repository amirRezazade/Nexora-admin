/**
 * Single place for the public Supabase settings.
 * Both values come from .env.local (locally) and from the Vercel project's
 * environment variables (in production). They are public by design: the anon
 * key is safe in the browser because Row Level Security protects the data.
 * Never put the service_role key in any NEXT_PUBLIC_* variable.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY. " + "Add them to .env.local (and to the Vercel project settings).");
}
