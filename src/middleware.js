import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Server-side route protection.
 *
 * Runs before any page renders. Reads the Supabase session from cookies:
 * - not signed in + private route → redirect to /login
 * - signed in + /login            → redirect to / (no reason to sign in twice)
 *
 * The client-side guard in AppShell stays as a second layer, but this is the
 * one that guarantees a signed-out visitor never sees admin content flash.
 */

const PUBLIC_ROUTES = ['/login', '/forgot-password', '/reset-password'];

const SUPABASE_URL =
  process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://akqrnvrgsnofnhrhlxow.supabase.co';
const SUPABASE_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'sb_publishable_aNo4PzSif8eS7OKLwv6Z4g_dfBBCXxG';

export async function middleware(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(SUPABASE_URL, SUPABASE_KEY, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  /* getUser() (not getSession()) — validates the token with the auth server
     so a forged cookie can't get past this gate. */
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isPublic = PUBLIC_ROUTES.some((r) => path === r || path.startsWith(`${r}/`));

  if (!user && !isPublic) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  if (user && path === '/login') {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  /*
   * Everything except Next internals and static files. Charts, CSS and images
   * must stay reachable without a session.
   */
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|xml|txt|css|js|json|map|woff|woff2)$).*)',
  ],
};
