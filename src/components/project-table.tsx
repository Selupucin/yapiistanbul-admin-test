"use client";

import { useMemo, useState } from "react";
import { ProjectEditDialog } from "@/components/project-edit-dialog";
import { deleteProjectAction } from "@/app/actions";

type ProjectRow = {
  _id: string;
  name: string;
  nameEn?: string;
  link: string;
  createdAt?: string | Date;
};

function formatDate(value?: string | Date) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

export function ProjectTable({ projects }: { projects: ProjectRow[] }) {
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = projects.filter((project) => {
      if (normalizedQuery.length === 0) return true;
      return (
        project.name.toLowerCase().includes(normalizedQuery) ||
        (project.nameEn || "").toLowerCase().includes(normalizedQuery) ||
        project.link.toLowerCase().includes(normalizedQuery)
      );
    });

    rows.sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      if (sortBy === "name") {
        return a.name.localeCompare(b.name, "tr") * direction;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (aTime - bTime) * direction;
    });

    return rows;
  }, [projects, query, sortBy, sortDir]);

  function toggleSort(column: "name" | "createdAt") {
    if (sortBy === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir(column === "name" ? "asc" : "desc");
  }

  return (
    <article className={`panel-card ${filtered.length === 0 ? "min-h-[260px]" : "min-h-[360px]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#0c2c64]">Projeler Tablosu</h2>
        <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Toplam: {filtered.length}</p>
      </div>

      <div className="mt-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Proje adı, İngilizce adı veya link ile filtrele"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">
                <button type="button" onClick={() => toggleSort("name")} className="text-left hover:text-[#0c2c64]">
                  Proje {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3">Link</th>
              <th className="px-3 py-3">
                <button type="button" onClick={() => toggleSort("createdAt")} className="text-left hover:text-[#0c2c64]">
                  Tarih {sortBy === "createdAt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => (
              <tr key={String(project._id)} className="border-t border-slate-200 align-top">
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-800">{project.name}</p>
                  {project.nameEn ? <p className="mt-1 text-xs text-slate-500">{project.nameEn}</p> : null}
                </td>
                <td className="px-3 py-3">
                  <a href={project.link} target="_blank" rel="noreferrer" className="admin-link text-xs">
                    {project.link}
                  </a>
                </td>
                <td className="px-3 py-3 text-xs text-slate-600">{formatDate(project.createdAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <ProjectEditDialog
                      id={String(project._id)}
                      name={project.name}
                      nameEn={project.nameEn || ""}
                      link={project.link}
                    />
                    <form action={deleteProjectAction}>
                      <input type="hidden" name="id" value={String(project._id)} />
                      <button className="btn-danger px-3 py-1 text-xs">✕ Sil</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={4}>
                  Filtreye uygun proje kaydı bulunamadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
