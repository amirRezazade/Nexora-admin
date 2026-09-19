"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { Menu, Search, Bell, Sun, Moon, Monitor, LogOut, User, Settings as SettingsIcon, CheckCheck, Package, ShoppingCart, Star, Server, ChevronDown } from "lucide-react";
import { cn, relativeTime } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import { setMobileNav, setSearchOpen } from "@/store/slices/uiSlice";
import { setPreference } from "@/store/slices/themeSlice";
import { signOut } from "@/store/slices/authSlice";
import { fetchNotifications, markAllRead, markRead } from "@/store/slices/notificationsSlice";
import IconButton from "@/components/ui/IconButton";
import Button from "@/components/ui/Button";
import Avatar from "@/components/ui/Avatar";
import Dropdown, { MenuItem, MenuSeparator, MenuLabel } from "@/components/ui/Dropdown";
import Popover from "@/components/ui/Popover";
import Breadcrumb from "@/components/ui/Breadcrumb";
import { SkeletonList } from "@/components/ui/Skeleton";

/* Route → breadcrumb context. Detail pages append their own trail. */
const ROUTE_KEYS = {
  "": "nav.dashboard",
  analytics: "nav.analytics",
  products: "nav.products",
  categories: "nav.categories",
  inventory: "nav.inventory",
  orders: "nav.orders",
  customers: "nav.customers",
  coupons: "nav.coupons",
  reviews: "nav.reviews",
  notifications: "nav.notifications",
  settings: "nav.settings",
  profile: "nav.profile",
  support: "nav.support",
  new: "header.new",
  edit: "header.edit",
};

function useBreadcrumbs(pageTitle) {
  const { t } = useI18n();
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);
  const items = [{ label: t("brand.name"), href: "/" }];
  parts.forEach((part, i) => {
    const href = `/${parts.slice(0, i + 1).join("/")}`;
    const label = ROUTE_KEYS[part] ? t(ROUTE_KEYS[part]) : decodeURIComponent(part).replace(/^(prd|cus|NV)-/, "#");
    items.push({ label, href: i === parts.length - 1 ? null : href });
  });
  if (parts.length === 0) items.push({ label: t("nav.dashboard") });
  if (pageTitle && items.length > 1) items[items.length - 1] = { label: pageTitle };
  return items;
}

const NOTIFICATION_ICONS = {
  orders: ShoppingCart,
  inventory: Package,
  reviews: Star,
  system: Server,
};

function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <Dropdown
      width="w-40"
      menuLabel={t("header.language")}
      trigger={
        <button type="button" className="inline-flex h-8 min-w-[40px] items-center justify-center rounded-control px-2 text-caption font-semibold text-ink-2 transition-colors hover:bg-surface-3 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label={t("header.language")}>
          {locale === "fa" ? "فا" : "EN"}
        </button>
      }
    >
      {({ close }) => (
        <>
          <MenuLabel>{t("header.language")}</MenuLabel>
          <MenuItem
            onClick={() => {
              setLocale("en");
              close();
            }}
            className={locale === "en" ? "bg-brand-soft text-brand-text hover:bg-brand-soft" : ""}
          >
            {t("header.english")}
          </MenuItem>
          <MenuItem
            onClick={() => {
              setLocale("fa");
              close();
            }}
            className={locale === "fa" ? "bg-brand-soft text-brand-text hover:bg-brand-soft" : ""}
          >
            {t("header.persian")}
          </MenuItem>
        </>
      )}
    </Dropdown>
  );
}

function NotificationPopover() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const { items, unread, status } = useSelector((s) => s.notifications);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  return (
    <Popover
      width="w-[min(380px,calc(100vw-1.5rem))]"
      trigger={
        <span className="relative inline-flex">
          <IconButton icon={Bell} label={unread ? `${t("nav.notifications")}, ${t("header.unread", { n: unread })}` : t("nav.notifications")} />
          {unread > 0 && (
            <span aria-hidden className="pointer-events-none absolute -right-0.5 -top-0.5 flex h-[15px] min-w-[15px] items-center justify-center rounded-pill bg-brand px-1 text-[9px] font-bold leading-none text-white ring-2 ring-canvas">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </span>
      }
    >
      {({ close }) => (
        <div className="flex min-w-0 flex-col overflow-x-hidden">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <div className="flex min-w-0 items-baseline gap-2">
              <h3 className="text-h4 text-ink">{t("nav.notifications")}</h3>
              {unread > 0 && <span className="shrink-0 text-caption text-ink-3">{t("header.unread", { n: unread })}</span>}
            </div>
            {unread > 0 && (
              <Button variant="link" size="xs" icon={CheckCheck} className="shrink-0" onClick={() => dispatch(markAllRead())}>
                {t("header.markAllRead")}
              </Button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {status === "loading" && !items.length ? (
              <SkeletonList rows={4} />
            ) : items.length === 0 ? (
              <p className="px-4 py-10 text-center text-body-sm text-ink-2">{t("header.caughtUp")}</p>
            ) : (
              <ul>
                {items.slice(0, 6).map((n) => {
                  const Icon = NOTIFICATION_ICONS[n.category] || Bell;
                  const tones = {
                    danger: "bg-danger-soft text-danger-text",
                    warning: "bg-warning-soft text-warning-text",
                    success: "bg-success-soft text-success-text",
                    info: "bg-info-soft text-info-text",
                    neutral: "bg-surface-3 text-ink-2",
                  };
                  return (
                    <li key={n.id}>
                      <Link
                        href={n.href}
                        onClick={() => {
                          dispatch(markRead(n.id));
                          close();
                        }}
                        className={cn("flex gap-3 border-b border-line px-4 py-3 transition-colors last:border-0 hover:bg-surface-2", !n.read && "bg-brand-softer/60")}
                      >
                        <span className={cn("mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-control", tones[n.tone] || tones.neutral)}>
                          <Icon aria-hidden className="h-3.5 w-3.5" />
                        </span>
                        <span className="min-w-0 flex-1 overflow-hidden">
                          <span className="flex items-center gap-1.5">
                            <span className="truncate text-body-sm font-medium text-ink">{n.title}</span>
                            {!n.read && <span aria-label="Unread" className="h-1.5 w-1.5 shrink-0 rounded-full bg-brand" />}
                          </span>
                          <span className="mt-0.5 block break-words text-caption leading-relaxed text-ink-2">{n.body}</span>
                          <span className="mt-1 block text-caption text-ink-3">{relativeTime(n.createdAt)}</span>
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>

          <div className="border-t border-line bg-surface-2 px-4 py-2.5">
            <Link href="/notifications" onClick={close} className="text-body-sm font-medium text-brand-text underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand">
              {t("header.viewAll")}
            </Link>
          </div>
        </div>
      )}
    </Popover>
  );
}

function ThemeToggle() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const { preference, resolved } = useSelector((s) => s.theme);
  const Icon = preference === "system" ? Monitor : resolved === "dark" ? Moon : Sun;

  return (
    <Dropdown width="w-44" menuLabel="Theme" trigger={<IconButton icon={Icon} label={`${t("header.theme")}: ${preference}`} />}>
      {({ close }) => (
        <>
          <MenuLabel>{t("header.appearance")}</MenuLabel>
          {[
            { value: "light", label: t("header.light"), icon: Sun },
            { value: "dark", label: t("header.dark"), icon: Moon },
            { value: "system", label: t("header.system"), icon: Monitor },
          ].map((o) => (
            <MenuItem
              key={o.value}
              icon={o.icon}
              onClick={() => {
                dispatch(setPreference(o.value));
                close();
              }}
              className={preference === o.value ? "bg-brand-soft text-brand-text hover:bg-brand-soft" : ""}
            >
              {o.label}
            </MenuItem>
          ))}
        </>
      )}
    </Dropdown>
  );
}

function UserMenu() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const user = useSelector((s) => s.auth.user);

  return (
    <Dropdown
      width="w-60"
      menuLabel="Account"
      trigger={
        <button type="button" className="flex items-center gap-1.5 rounded-pill p-0.5 pr-1.5 transition-colors hover:bg-surface-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas" aria-label={`Account menu for ${user?.name}`}>
          <Avatar name={user?.name || "Sarah Chen"} tone="brand" size="md" />
          <ChevronDown aria-hidden className="hidden h-3.5 w-3.5 text-ink-3 sm:block" />
        </button>
      }
    >
      {({ close }) => (
        <>
          <div className="flex items-center gap-2.5 px-2.5 py-2">
            <Avatar name={user?.name} tone="brand" size="lg" />
            <div className="min-w-0">
              <p className="truncate text-body-sm font-semibold text-ink">{user?.name}</p>
              <p className="truncate text-caption text-ink-3">{user?.email}</p>
            </div>
          </div>
          <MenuSeparator />
          <MenuItem as={Link} href="/profile" icon={User} onClick={close}>
            {t("nav.profile")}
          </MenuItem>
          <MenuItem as={Link} href="/settings" icon={SettingsIcon} onClick={close}>
            {t("nav.settings")}
          </MenuItem>
          <MenuSeparator />
          <MenuItem
            as={Link}
            href="/login"
            icon={LogOut}
            destructive
            onClick={() => {
              dispatch(signOut());
              close();
            }}
          >
            {t("header.signOut")}
          </MenuItem>
        </>
      )}
    </Dropdown>
  );
}

export default function Header() {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const pageTitle = useSelector((s) => s.ui.pageTitle);
  const crumbs = useBreadcrumbs(pageTitle);

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-line bg-canvas/85 px-4 backdrop-blur-md sm:px-5 lg:px-6">
      <IconButton icon={Menu} label={t("header.openNav")} className="lg:hidden" onClick={() => dispatch(setMobileNav(true))} />

      <div className="min-w-0 flex-1">
        <Breadcrumb items={crumbs} className="hidden sm:block" />
        <span className="text-h4 text-ink sm:hidden">{crumbs[crumbs.length - 1]?.label}</span>
      </div>

      {/* Desktop search affordance */}
      <button type="button" onClick={() => dispatch(setSearchOpen(true))} className="hidden h-8 w-56 items-center gap-2 rounded-control border border-line-strong bg-surface px-2.5 text-left text-body-sm text-ink-3 transition-colors hover:border-ink-3/40 hover:bg-surface-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas md:flex xl:w-72">
        <Search aria-hidden className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate">{t("header.search")}</span>
        <kbd className="shrink-0 rounded border border-line bg-surface-2 px-1 py-px text-[10px] font-semibold text-ink-3">⌘K</kbd>
      </button>

      <IconButton icon={Search} label={t("header.searchAria")} className="md:hidden" onClick={() => dispatch(setSearchOpen(true))} />

      <LanguageSwitcher />
      <NotificationPopover />
      <ThemeToggle />
      <UserMenu />
    </header>
  );
}
