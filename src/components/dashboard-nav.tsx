"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

function isItemActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();

  return (
    <nav className="mt-6 space-y-2">
      {items.map((item) => {
        const active = isItemActive(pathname, item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`group relative block rounded-lg px-3 py-2 text-sm transition ${
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
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}