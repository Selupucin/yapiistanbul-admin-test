import Link from "next/link";
import { getAnalyticsSummary, listBlogs, listProjects } from "@repo/api";
import { SitePreviewButton } from "@/components/site-preview-button";
import { DashboardAnalyticsPanels } from "@/components/dashboard-analytics-panels";

export default async function DashboardHomePage() {
  const [blogs, projects, day1, day7, day30, day365] = await Promise.all([
    listBlogs(),
    listProjects(),
    getAnalyticsSummary(1),
    getAnalyticsSummary(7),
    getAnalyticsSummary(30),
    getAnalyticsSummary(365),
  ]);

  const analyticsByRange = {
    "1": day1,
    "7": day7,
    "30": day30,
    "365": day365,
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-gradient-to-r from-[#0c2c64] to-[#1a4f9d] p-6 text-white shadow-lg">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm opacity-80">Yönetim Özeti</p>
            <h2 className="mt-1 text-3xl font-semibold">Yapı İstanbul Admin Merkezi</h2>
            <p className="mt-2 text-sm opacity-85">İçerik, proje ve iletişim alanlarını yönetebilirsiniz.</p>
          </div>
          <SitePreviewButton />
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-3">
        <article className="panel-card min-h-[170px]">
          <p className="text-sm text-slate-500">Toplam Blog</p>
          <p className="mt-2 text-4xl font-bold text-[#0c2c64]">{blogs.length}</p>
          <Link href="/dashboard/blog" className="admin-link mt-3 text-sm">Blog yönetimine git</Link>
        </article>

        <article className="panel-card min-h-[170px]">
          <p className="text-sm text-slate-500">Toplam Proje</p>
          <p className="mt-2 text-4xl font-bold text-[#0c2c64]">{projects.length}</p>
          <Link href="/dashboard/projects" className="admin-link mt-3 text-sm">Projeleri yönet</Link>
        </article>

        <article className="panel-card min-h-[170px]">
          <p className="text-sm text-slate-500">Sistem Durumu</p>
          <p className="mt-2 text-2xl font-semibold text-[#0c2c64]">Aktif</p>
          <p className="mt-3 text-sm text-slate-600">Tüm modüller normal çalışıyor.</p>
        </article>
      </section>

      <DashboardAnalyticsPanels analyticsByRange={analyticsByRange} />
    </div>
  );
}
