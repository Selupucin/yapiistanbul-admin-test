import { createProjectAction } from "@/app/actions";
import { listProjects } from "@repo/api";
import { ProjectTable } from "@/components/project-table";
import { ProjectFormFields } from "@/components/project-edit-dialog";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <details className="panel-card group">
        <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#1a4f9d] transition group-open:rotate-45">+</span>
            <h2 className="text-xl font-semibold text-[#0c2c64]">Yeni Proje Ekle</h2>
          </div>
          <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">
            Slug otomatik oluşturulur
          </span>
        </summary>
        <form action={createProjectAction} className="mt-4">
          <ProjectFormFields />
          <div className="mt-4 flex justify-end">
            <button className="btn-primary">+ Projeyi Kaydet</button>
          </div>
        </form>
      </details>

      <ProjectTable
        projects={projects.map((project) => ({
          ...project,
          _id: String(project._id),
        }))}
      />
    </div>
  );
}
