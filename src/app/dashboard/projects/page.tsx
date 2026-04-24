import { createProjectAction } from "@/app/actions";
import { listProjects } from "@repo/api";
import { ProjectTable } from "@/components/project-table";
import { ProjectFormFields } from "@/components/project-edit-dialog";

export default async function AdminProjectsPage() {
  const projects = await listProjects();

  return (
    <div className="space-y-6">
      <article className="panel-card">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-xl font-semibold text-[#0c2c64]">Yeni Proje Ekle</h2>
          <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">
            Slug otomatik oluşturulur
          </p>
        </div>
        <form action={createProjectAction} className="mt-4">
          <ProjectFormFields />
          <div className="mt-4 flex justify-end">
            <button className="btn-primary">+ Projeyi Kaydet</button>
          </div>
        </form>
      </article>

      <ProjectTable
        projects={projects.map((project) => ({
          ...project,
          _id: String(project._id),
        }))}
      />
    </div>
  );
}
