'use client';

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '@/store/slices/uiSlice';
import { hydrateAuth } from '@/store/slices/authSlice';
import { cn } from '@/lib/format';
import { useI18n } from '@/i18n/I18nProvider';
import Sidebar, { MobileSidebar } from './Sidebar';
import Header from './Header';
import GlobalSearch from './GlobalSearch';
import Toaster from '@/components/ui/Toast';

/** Routes that opt out of the admin chrome. */
const BARE_ROUTES = ['/login', '/forgot-password', '/reset-password'];

export default function AppShell({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const dispatch = useDispatch();
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed);
  const { isAuthenticated, bootstrapped } = useSelector((s) => s.auth);
  const { t } = useI18n();
  const bare = BARE_ROUTES.some((r) => pathname.startsWith(r));

  useEffect(() => {
    dispatch(hydrateAuth());
  }, [dispatch]);

  useEffect(() => {
    dispatch(setPageTitle(null));
  }, [pathname, dispatch]);

  useEffect(() => {
    if (!bootstrapped) return;
    if (!bare && !isAuthenticated) router.replace('/login');
    if (bare && isAuthenticated && pathname === '/login') router.replace('/');
  }, [bootstrapped, isAuthenticated, bare, pathname, router]);

  if (!bootstrapped) {
    return <div className="min-h-screen bg-canvas" />;
  }

  if (bare) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  if (!isAuthenticated) {
    return <div className="min-h-screen bg-canvas" />;
  }

  return (
    <div className="min-h-screen">
      <a
        href="#main-content"
        className="sr-only-focusable fixed left-4 top-4 z-[90] rounded-control bg-brand px-3 py-2 text-body-sm font-medium text-white shadow-lg"
      >
        {t('header.skip')}
      </a>

      <Sidebar />
      <MobileSidebar />

      <div className={cn('flex min-h-screen flex-col transition-[padding] duration-200 ease-inout', collapsed ? 'lg:ps-[68px]' : 'lg:ps-[248px]')}>
        <Header />
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-5 focus:outline-none sm:px-5 sm:py-6 lg:px-6 lg:py-7">
          <div className="mx-auto w-full max-w-[1440px]">{children}</div>
        </main>
      </div>

      <GlobalSearch />
      <Toaster />
    </div>
  );
}
