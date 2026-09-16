"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { LayoutDashboard, LineChart, Package, FolderTree, Boxes, ShoppingCart, Users, Ticket, Star, Bell, Settings, LifeBuoy, PanelLeftClose, PanelLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";
import { toggleSidebar, setMobileNav } from "@/store/slices/uiSlice";
import Tooltip from "@/components/ui/Tooltip";
import Avatar from "@/components/ui/Avatar";
import Image from "next/image";

export const NAV_GROUPS = [
  {
    labelKey: "nav.overview",
    items: [
      { href: "/", labelKey: "nav.dashboard", icon: LayoutDashboard },
      { href: "/analytics", labelKey: "nav.analytics", icon: LineChart },
    ],
  },
  {
    labelKey: "nav.catalog",
    items: [
      { href: "/products", labelKey: "nav.products", icon: Package },
      { href: "/categories", labelKey: "nav.categories", icon: FolderTree },
      { href: "/inventory", labelKey: "nav.inventory", icon: Boxes },
    ],
  },
  {
    labelKey: "nav.sales",
    items: [
      { href: "/orders", labelKey: "nav.orders", icon: ShoppingCart },
      { href: "/customers", labelKey: "nav.customers", icon: Users },
    ],
  },
  {
    labelKey: "nav.marketing",
    items: [
      { href: "/coupons", labelKey: "nav.coupons", icon: Ticket },
      { href: "/reviews", labelKey: "nav.reviews", icon: Star },
    ],
  },
  {
    labelKey: "nav.system",
    items: [
      { href: "/notifications", labelKey: "nav.notifications", icon: Bell, badgeKey: "notifications" },
      { href: "/settings", labelKey: "nav.settings", icon: Settings },
    ],
  },
];

export function NovaMark({ className }) {
  return (
    <span aria-hidden className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px]  text-white ", className)}>
      <Image width={40} height={40} src={"/images/avatars/nexora-favicon-exact.ico"} />
    </span>
  );
}

function isActive(pathname, href) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

function NavLink({ item, collapsed, unread, onNavigate }) {
  const { t } = useI18n();
  const pathname = usePathname();
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  const label = t(item.labelKey);
  const badge = item.badgeKey === "notifications" && unread > 0 ? unread : null;

  const link = (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn("group relative flex items-center gap-2.5 rounded-control py-2 text-body-sm font-medium transition-colors duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-surface", collapsed ? "justify-center px-2" : "px-2.5", active ? "bg-brand-soft text-brand-text" : "text-ink-2 hover:bg-surface-3 hover:text-ink")}
    >
      {/* Active rail — reinforces selection beyond the tint alone */}
      {active && <span aria-hidden className={cn("absolute rounded-pill bg-brand", collapsed ? "-start-2 top-1/2 h-5 w-1 -translate-y-1/2" : "-start-3 top-1/2 h-5 w-[3px] -translate-y-1/2")} />}
      <Icon aria-hidden className={cn("h-[18px] w-[18px] shrink-0", active ? "text-brand" : "text-ink-3 group-hover:text-ink-2")} />
      {!collapsed && <span className="flex-1 truncate">{label}</span>}
      {!collapsed && badge && <span className="rounded-pill bg-brand px-1.5 text-[11px] font-semibold leading-4 tabular-nums text-white">{badge > 99 ? "99+" : badge}</span>}
      {collapsed && badge && <span aria-hidden className="absolute right-1.5 top-1.5 h-1.5 w-1.5 rounded-full bg-brand ring-2 ring-surface" />}
    </Link>
  );

  if (!collapsed) return link;
  return (
    <Tooltip content={badge ? `${label} (${badge})` : label} side="right" delay={80}>
      {link}
    </Tooltip>
  );
}

export function SidebarContent({ collapsed = false, onNavigate }) {
  const { t } = useI18n();
  const dispatch = useDispatch();
  const unread = useSelector((s) => s.notifications.unread);
  const user = useSelector((s) => s.auth.user);
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-surface">
      {/* Brand */}
      <div className={cn("flex h-14 shrink-0 items-center border-b border-line", collapsed ? "justify-center px-2" : "gap-2.5 px-4")}>
        <Link href="/" onClick={onNavigate} className="flex min-w-0 items-center gap-2.5 rounded-control focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand" aria-label={`${t("brand.name")} — ${t("brand.tagline")}`}>
          <NovaMark />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate text-[15px] font-bold leading-5 tracking-tight text-ink">{t("brand.name")}</span>
              <span className="block truncate text-[11px] leading-4 text-ink-3">{t("brand.tagline")}</span>
            </span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav aria-label="Main navigation" className={cn("flex-1  py-3", collapsed ? "px-3" : "px-3")}>
        {NAV_GROUPS.map((group, gi) => (
          <div key={group.labelKey} className={cn(gi > 0 && "mt-5")}>
            {collapsed ? gi > 0 && <div aria-hidden className="mx-auto mb-3 h-px w-6 bg-line" /> : <p className="mb-1.5 px-2.5 text-micro uppercase tracking-wider text-ink-3">{t(group.labelKey)}</p>}
            <ul className="flex flex-col gap-0.5">
              {group.items.map((item) => (
                <li key={item.href} className="relative">
                  <NavLink item={item} collapsed={collapsed} unread={unread} onNavigate={onNavigate} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className={cn("shrink-0 border-t border-line py-3", collapsed ? "px-3" : "px-3")}>
        <ul className="flex flex-col gap-0.5">
          <li>
            <NavLink item={{ href: "/support", labelKey: "nav.support", icon: LifeBuoy }} collapsed={collapsed} onNavigate={onNavigate} />
          </li>
        </ul>

        <Link href="/profile" onClick={onNavigate} className={cn("mt-2 flex items-center gap-2.5 rounded-control py-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", collapsed ? "justify-center px-0" : "px-2", isActive(pathname, "/profile") ? "bg-brand-soft" : "hover:bg-surface-3")}>
          <Avatar name={user?.name || "Sarah Chen"} tone="brand" size={collapsed ? "sm" : "md"} />
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-body-sm font-medium text-ink">{user?.name}</span>
              <span className="block truncate text-caption text-ink-3">{user?.role}</span>
            </span>
          )}
          {!collapsed && <ChevronRight aria-hidden className="h-4 w-4 shrink-0 text-ink-3" />}
        </Link>

        {/* Collapse control — desktop only */}
        <button type="button" onClick={() => dispatch(toggleSidebar())} className={cn("mt-2 hidden w-full items-center gap-2.5 rounded-control py-2 text-body-sm font-medium text-ink-3 transition-colors hover:bg-surface-3 hover:text-ink lg:flex", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand", collapsed ? "justify-center px-0" : "px-2.5")} aria-label={collapsed ? t("nav.expand") : t("nav.collapse")}>
          {collapsed ? (
            <PanelLeft aria-hidden className="h-[18px] w-[18px] rtl:rotate-180" />
          ) : (
            <>
              <PanelLeftClose aria-hidden className="h-[18px] w-[18px] rtl:rotate-180" />
              <span>{t("nav.collapse")}</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar() {
  const collapsed = useSelector((s) => s.ui.sidebarCollapsed);
  return (
    <aside className={cn("fixed inset-y-0 start-0 z-40 hidden shrink-0 border-e border-line transition-[width] duration-200 ease-inout lg:block", collapsed ? "w-[68px]" : "w-[248px]")}>
      <SidebarContent collapsed={collapsed} />
    </aside>
  );
}

export function MobileSidebar() {
  const { locale } = useI18n();
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.mobileNavOpen);
  const close = () => dispatch(setMobileNav(false));

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[60] lg:hidden">
      <div className="absolute inset-0 animate-fade-in bg-overlay/45 backdrop-blur-[2px]" onClick={close} aria-hidden />
      <div role="dialog" aria-modal="true" aria-label="Navigation menu" className="absolute inset-y-0 left-0 w-[272px] animate-slide-in-left border-r border-line shadow-xl">
        <SidebarContent onNavigate={close} />
      </div>
    </div>
  );
}
