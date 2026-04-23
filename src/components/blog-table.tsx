"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { BlogEditDialog } from "@/components/blog-edit-dialog";
import { deleteBlogAction } from "@/app/actions";

type BlogRow = {
  _id: string;
  title: string;
  titleEn?: string;
  slug: string;
  content: string;
  contentEn: string;
  coverImage?: string;
  createdAt?: string | Date;
};

function formatDate(value?: string | Date) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("tr-TR");
}

export function BlogTable({ blogs }: { blogs: BlogRow[] }) {
  const [query, setQuery] = useState("");
  const [coverFilter, setCoverFilter] = useState<"all" | "with" | "without">("all");
  const [sortBy, setSortBy] = useState<"title" | "createdAt">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const rows = blogs.filter((blog) => {
      const inSearch =
        normalizedQuery.length === 0 ||
        blog.title.toLowerCase().includes(normalizedQuery) ||
        (blog.titleEn || "").toLowerCase().includes(normalizedQuery) ||
        blog.slug.toLowerCase().includes(normalizedQuery);

      const hasCover = Boolean(blog.coverImage);
      const inCover =
        coverFilter === "all" ||
        (coverFilter === "with" && hasCover) ||
        (coverFilter === "without" && !hasCover);

      return inSearch && inCover;
    });

    rows.sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      if (sortBy === "title") {
        return a.title.localeCompare(b.title, "tr") * direction;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (aTime - bTime) * direction;
    });

    return rows;
  }, [blogs, coverFilter, query, sortBy, sortDir]);

  function toggleSort(column: "title" | "createdAt") {
    if (sortBy === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir(column === "title" ? "asc" : "desc");
  }

  return (
    <article className={`panel-card ${filtered.length === 0 ? "min-h-[260px]" : "min-h-[360px]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-[#0c2c64]">Blog Yazıları Tablosu</h2>
        <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Toplam: {filtered.length}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Başlık, İngilizce başlık veya slug ile filtrele"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={coverFilter}
          onChange={(event) => setCoverFilter(event.target.value as "all" | "with" | "without")}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Tüm Görseller</option>
          <option value="with">Sadece görselli</option>
          <option value="without">Görselsiz</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">
                <button type="button" onClick={() => toggleSort("title")} className="text-left hover:text-[#0c2c64]">
                  Yazı {sortBy === "title" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3">Slug</th>
              <th className="px-3 py-3">
                <button type="button" onClick={() => toggleSort("createdAt")} className="text-left hover:text-[#0c2c64]">
                  Tarih {sortBy === "createdAt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3">Görsel</th>
              <th className="px-3 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((blog) => (
              <tr key={String(blog._id)} className="border-t border-slate-200 align-top">
                <td className="px-3 py-3">
                  <p className="font-semibold text-slate-800">{blog.title}</p>
                  {blog.titleEn ? <p className="mt-1 text-xs text-slate-500">{blog.titleEn}</p> : null}
                </td>
                <td className="px-3 py-3 text-xs text-slate-600">/{blog.slug}</td>
                <td className="px-3 py-3 text-xs text-slate-600">{formatDate(blog.createdAt)}</td>
                <td className="px-3 py-3">
                  {blog.coverImage ? (
                    <Image
                      src={blog.coverImage}
                      alt={blog.title}
                      width={120}
                      height={56}
                      unoptimized
                      className="h-14 w-24 rounded-lg border border-slate-200 object-cover"
                    />
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">Yok</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <BlogEditDialog
                      id={String(blog._id)}
                      slug={blog.slug}
                      title={blog.title}
                      titleEn={blog.titleEn || ""}
                      content={blog.content}
                      contentEn={blog.contentEn || ""}
                      coverImage={blog.coverImage || ""}
                    />
                    <form action={deleteBlogAction}>
                      <input type="hidden" name="id" value={String(blog._id)} />
                      <button className="btn-danger px-3 py-1 text-xs">✕ Sil</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={5}>
                  Filtreye uygun blog kaydı bulunamadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </article>
  );
}
