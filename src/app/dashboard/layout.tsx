import Link from "next/link";
import { LogOut, Bell } from "lucide-react";
import { getAdminSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { listMeetingRequests } from "@repo/api";
import { DashboardNav } from "@/components/dashboard-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/");

  const requests = await listMeetingRequests();
  const newRequestCount = requests.filter((request) => request.status === "new").length;

  const navItems = [
    { href: "/dashboard", label: "Genel Bakış" },
    { href: "/dashboard/blog", label: "Blog Yönetimi" },
    { href: "/dashboard/projects", label: "Proje Yönetimi" },
    { href: "/dashboard/meeting-requests", label: "Toplantı Talepleri", badge: newRequestCount },
    { href: "/dashboard/contact", label: "İletişim" },
    { href: "/dashboard/settings", label: "Ayarlar" },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4ff_100%)]">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-6 p-4 md:grid-cols-[260px_1fr] md:p-6">
        <aside className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:sticky md:top-6 md:max-h-[calc(100vh-3rem)] md:overflow-y-auto">
          <header>
            <p className="text-lg font-bold text-[#0c2c64]">Yapı İstanbul</p>
            <p className="mt-0.5 text-xs text-slate-500">Yönetim Paneli</p>
          </header>

          <DashboardNav items={navItems} />

          <div className="mt-auto space-y-3 border-t border-slate-200 pt-4">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[linear-gradient(135deg,#0c2c64_0%,#1a4f9d_100%)] text-sm font-semibold text-white">
                {session.username.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#0c2c64]">{session.username}</p>
                <p className="text-[11px] text-slate-500">Yönetici</p>
              </div>
            </div>

            <form action={logoutAction}>
              <button className="btn-secondary w-full" type="submit">
                <LogOut size={16} aria-hidden="true" />
                <span>Çıkış Yap</span>
              </button>
            </form>
          </div>
        </aside>

        <section className="space-y-4">
          {newRequestCount > 0 ? (
            <div className="flex items-start gap-3 rounded-2xl border border-[#b8d3ff] bg-[#eef5ff] p-4 shadow-sm">
              <Bell size={18} className="mt-0.5 shrink-0 text-[#1a4f9d]" aria-hidden="true" />
              <p className="text-sm text-[#0c2c64]">
                <strong>Yeni talep bildirimi:</strong> {newRequestCount} yeni toplantı talebi bekliyor.
                <Link href="/dashboard/meeting-requests" className="admin-link ml-2">
                  Talepleri incele
                </Link>
              </p>
            </div>
          ) : null}
          {children}
        </section>
      </div>
    </div>
  );
}
