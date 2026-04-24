"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { ProjectEditDialog } from "@/components/project-edit-dialog";
import { deleteProjectAction } from "@/app/actions";

type ProjectRow = {
  _id: string;
  name: string;
  nameEn?: string;
  slug?: string;
  location?: string;
  locationEn?: string;
  mapLocation?: string;
  totalArea?: string;
  unitCount?: number;
  unitTypes?: string;
  blockCount?: number;
  floorCount?: number;
  deliveryDate?: string;
  status?: string;
  summary?: string;
  summaryEn?: string;
  description?: string;
  descriptionEn?: string;
  images?: string[];
  coverImageIndex?: number;
  videoUrl?: string;
  floorPlans?: { label: string; image: string }[];
  basementCount?: number;
  parkingFloors?: number[];
  createdAt?: string | Date;
};

function formatDate(value?: string | Date) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

function coverOf(p: ProjectRow): string | null {
  if (!p.images || p.images.length === 0) return null;
  const idx = Math.min(Math.max(p.coverImageIndex ?? 0, 0), p.images.length - 1);
  return p.images[idx] || p.images[0] || null;
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
        (project.location || "").toLowerCase().includes(normalizedQuery) ||
        (project.slug || "").toLowerCase().includes(normalizedQuery)
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
        <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">
          Toplam: {filtered.length}
        </p>
      </div>

      <div className="mt-4">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Proje adı, konum veya slug ile filtrele"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">Görsel</th>
              <th className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("name")}
                  className="text-left hover:text-[#0c2c64]"
                >
                  Proje {sortBy === "name" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3">Konum</th>
              <th className="px-3 py-3">Daire</th>
              <th className="px-3 py-3">
                <button
                  type="button"
                  onClick={() => toggleSort("createdAt")}
                  className="text-left hover:text-[#0c2c64]"
                >
                  Tarih {sortBy === "createdAt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const cover = coverOf(project);
              return (
                <tr key={String(project._id)} className="border-t border-slate-200 align-top">
                  <td className="px-3 py-3">
                    {cover ? (
                      <Image
                        src={cover}
                        alt={project.name}
                        width={64}
                        height={48}
                        unoptimized
                        className="h-12 w-16 rounded-md object-cover"
                      />
                    ) : (
                      <div className="grid h-12 w-16 place-items-center rounded-md bg-slate-100 text-[10px] text-slate-400">
                        Görsel yok
                      </div>
                    )}
                  </td>
                  <td className="px-3 py-3">
                    <p className="font-semibold text-slate-800">{project.name}</p>
                    {project.nameEn ? (
                      <p className="mt-1 text-xs text-slate-500">{project.nameEn}</p>
                    ) : null}
                    {project.slug ? (
                      <p className="mt-1 font-mono text-[10px] text-slate-400">/{project.slug}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-700">{project.location || "-"}</td>
                  <td className="px-3 py-3 text-xs text-slate-700">
                    {project.unitCount ? `${project.unitCount} daire` : "-"}
                    {project.unitTypes ? (
                      <p className="text-[10px] text-slate-500">{project.unitTypes}</p>
                    ) : null}
                  </td>
                  <td className="px-3 py-3 text-xs text-slate-600">{formatDate(project.createdAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex justify-end gap-2">
                      <ProjectEditDialog
                        id={String(project._id)}
                        name={project.name}
                        nameEn={project.nameEn || ""}
                        location={project.location || ""}
                        locationEn={project.locationEn || ""}
                        mapLocation={project.mapLocation || ""}
                        totalArea={project.totalArea || ""}
                        unitCount={project.unitCount ?? 0}
                        unitTypes={project.unitTypes || ""}
                        blockCount={project.blockCount ?? 0}
                        floorCount={project.floorCount ?? 0}
                        deliveryDate={project.deliveryDate || ""}
                        status={project.status || ""}
                        summary={project.summary || ""}
                        summaryEn={project.summaryEn || ""}
                        description={project.description || ""}
                        descriptionEn={project.descriptionEn || ""}
                        images={project.images || []}
                        coverImageIndex={project.coverImageIndex ?? 0}
                        videoUrl={project.videoUrl || ""}
                        floorPlans={project.floorPlans || []}
                        basementCount={project.basementCount ?? 0}
                        parkingFloors={project.parkingFloors || []}
                      />
                      <form action={deleteProjectAction}>
                        <input type="hidden" name="id" value={String(project._id)} />
                        <button className="btn-danger px-3 py-1 text-xs">✕ Sil</button>
                      </form>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={6}>
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
