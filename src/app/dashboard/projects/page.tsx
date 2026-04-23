import { createProjectAction } from "@/app/actions";
import { listProjects } from "@repo/api";
import { ProjectTable } from "@/components/project-table";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <article className="panel-card">
        <h2 className="text-xl font-semibold text-[#0c2c64]">Yeni Proje Ekle</h2>
        <form action={createProjectAction} className="mt-4 space-y-3">
          <input name="name" placeholder="Proje ismi (TR)" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="nameEn" placeholder="Proje adı (EN)" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="link" placeholder="https://ornek.yapiistanbul.com" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <button className="btn-primary">Kaydet</button>
        </form>
      </article>

      <ProjectTable projects={projects.map((project) => ({ ...project, _id: String(project._id) }))} />
    </div>
  );
}
