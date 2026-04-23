import Link from "next/link";
import { getAdminSession } from "@/lib/session";
import { redirect } from "next/navigation";
import { logoutAction } from "@/app/actions";
import { listMeetingRequests } from "@repo/api";

const navItems = [
  { href: "/dashboard", label: "Genel Bakış" },
  { href: "/dashboard/blog", label: "Blog Yönetimi" },
  { href: "/dashboard/projects", label: "Proje Yönetimi" },
  { href: "/dashboard/meeting-requests", label: "Toplantı Talepleri" },
  { href: "/dashboard/contact", label: "İletişim" },
  { href: "/dashboard/settings", label: "Ayarlar" },
];

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/");

  const requests = await listMeetingRequests();
  const newRequestCount = requests.filter((request) => request.status === "new").length;

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4ff_100%)]">
      <div className="mx-auto grid w-full max-w-7xl items-start gap-6 p-4 md:grid-cols-[250px_1fr] md:p-6">
        <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:sticky md:top-6">
          <p className="text-lg font-bold text-[#0c2c64]">Yapı İstanbul</p>
          <p className="mt-1 text-xs text-slate-500">Yönetim Paneli</p>
          <nav className="mt-6 space-y-2">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="block rounded-lg px-3 py-2 text-sm text-slate-700 transition hover:bg-[#eef4ff] hover:text-[#0c2c64]">
                {item.label}
              </Link>
            ))}
          </nav>

          <form action={logoutAction} className="mt-6">
            <button className="btn-secondary w-full">Çıkış Yap</button>
          </form>
        </aside>

        <section className="space-y-4">
          {newRequestCount > 0 ? (
            <div className="panel-card border-[#b8d3ff] bg-[#eef5ff] py-3">
              <p className="text-sm font-semibold text-[#0c2c64]">
                Yeni talep bildirimi: Son 24 saatte {newRequestCount} yeni toplantı talebi geldi.
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
