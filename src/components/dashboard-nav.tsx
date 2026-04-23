"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Newspaper, Building2, CalendarCheck, Phone, Settings, type LucideIcon } from "lucide-react";

type NavItem = {
  href: string;
  label: string;
  badge?: number;
};

type IconKey = "dashboard" | "blog" | "projects" | "meetings" | "contact" | "settings";

const ICONS: Record<IconKey, LucideIcon> = {
  dashboard: LayoutDashboard,
  blog: Newspaper,
  projects: Building2,
  meetings: CalendarCheck,
  contact: Phone,
  settings: Settings,
};

function iconForHref(href: string): IconKey {
  if (href === "/dashboard") return "dashboard";
  if (href.startsWith("/dashboard/blog")) return "blog";
  if (href.startsWith("/dashboard/projects")) return "projects";
  if (href.startsWith("/dashboard/meeting")) return "meetings";
  if (href.startsWith("/dashboard/contact")) return "contact";
  if (href.startsWith("/dashboard/settings")) return "settings";
  return "dashboard";
}

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-1" aria-label="Yönetim paneli navigasyonu">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);
        const Icon = ICONS[iconForHref(item.href)];
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm transition ${
              active
                ? "bg-[linear-gradient(135deg,#0c2c64_0%,#1a4f9d_100%)] font-semibold text-white shadow"
                : "text-slate-700 hover:bg-[#eef4ff] hover:text-[#0c2c64]"
            }`}
          >
            <span
              aria-hidden="true"
              className={`absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r-full transition ${
                active ? "bg-[#8bb8ff]" : "bg-transparent group-hover:bg-[#cadfff]"
              }`}
            />
            <Icon size={16} aria-hidden="true" className={active ? "text-white" : "text-slate-500 group-hover:text-[#0c2c64]"} strokeWidth={2} />
            <span className="flex-1">{item.label}</span>
            {item.badge && item.badge > 0 ? (
              <span
                className={`inline-flex min-w-[20px] items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                  active ? "bg-white/20 text-white" : "bg-[#0c2c64] text-white"
                }`}
              >
                {item.badge > 99 ? "99+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
