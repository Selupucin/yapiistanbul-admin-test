"use client";

import { useMemo, useState } from "react";
import { updateMeetingStatusAction } from "@/app/actions";

type MeetingRow = {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  message: string;
  status: "new" | "pending" | "overdue" | "contacted";
  createdAt?: string | Date;
};

const statusConfig: Record<MeetingRow["status"], { label: string; badge: string }> = {
  new: {
    label: "Yeni Talep",
    badge: "bg-blue-100 text-blue-700 border-blue-200",
  },
  pending: {
    label: "Beklemede",
    badge: "bg-amber-100 text-amber-700 border-amber-200",
  },
  overdue: {
    label: "Geciken Talep",
    badge: "bg-red-100 text-red-700 border-red-200",
  },
  contacted: {
    label: "Dönüş Yapıldı",
    badge: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
};

function formatDate(value?: string | Date) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("tr-TR");
}

export function MeetingRequestsTable({ requests }: { requests: MeetingRow[] }) {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | MeetingRow["status"]>("all");
  const [selected, setSelected] = useState<MeetingRow | null>(null);
  const [sortBy, setSortBy] = useState<"fullName" | "createdAt" | "status">("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const rows = requests.filter((request) => {
      const inSearch =
        normalizedQuery.length === 0 ||
        request.fullName.toLowerCase().includes(normalizedQuery) ||
        request.email.toLowerCase().includes(normalizedQuery) ||
        (request.phone || "").toLowerCase().includes(normalizedQuery);
      const inStatus = statusFilter === "all" || request.status === statusFilter;
      return inSearch && inStatus;
    });

    const rank: Record<MeetingRow["status"], number> = {
      new: 0,
      pending: 1,
      overdue: 2,
      contacted: 3,
    };

    rows.sort((a, b) => {
      const direction = sortDir === "asc" ? 1 : -1;
      if (sortBy === "fullName") {
        return a.fullName.localeCompare(b.fullName, "tr") * direction;
      }
      if (sortBy === "status") {
        return (rank[a.status] - rank[b.status]) * direction;
      }
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return (aTime - bTime) * direction;
    });

    return rows;
  }, [query, requests, sortBy, sortDir, statusFilter]);

  function toggleSort(column: "fullName" | "createdAt" | "status") {
    if (sortBy === column) {
      setSortDir((current) => (current === "asc" ? "desc" : "asc"));
      return;
    }
    setSortBy(column);
    setSortDir(column === "fullName" ? "asc" : "desc");
  }

  const counts = useMemo(
    () => ({
      all: requests.length,
      new: requests.filter((item) => item.status === "new").length,
      pending: requests.filter((item) => item.status === "pending").length,
      overdue: requests.filter((item) => item.status === "overdue").length,
      contacted: requests.filter((item) => item.status === "contacted").length,
    }),
    [requests]
  );

  return (
    <article className={`panel-card ${filtered.length === 0 ? "min-h-[260px]" : "min-h-[380px]"}`}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[#0c2c64]">Toplantı Talepleri Tablosu</h2>
          <p className="mt-1 text-sm text-slate-500">Talebi seçip detayları modal içinde okuyabilir, iletişime geçildi olarak işaretleyebilirsiniz.</p>
        </div>
        <p className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">Toplam: {filtered.length}</p>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ad, e-posta veya telefon ile filtrele"
          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
        />
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as "all" | MeetingRow["status"])}
          className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
        >
          <option value="all">Tüm Durumlar ({counts.all})</option>
          <option value="new">Yeni Talep ({counts.new})</option>
          <option value="pending">Beklemede ({counts.pending})</option>
          <option value="overdue">Geciken Talep ({counts.overdue})</option>
          <option value="contacted">Dönüş Yapıldı ({counts.contacted})</option>
        </select>
      </div>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200">
        <table className="min-w-full text-sm">
          <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-3">
                <button type="button" onClick={() => toggleSort("fullName")} className="text-left hover:text-[#0c2c64]">
                  Ad Soyad {sortBy === "fullName" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3">İletişim</th>
              <th className="px-3 py-3">
                <button type="button" onClick={() => toggleSort("status")} className="text-left hover:text-[#0c2c64]">
                  Durum {sortBy === "status" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3">
                <button type="button" onClick={() => toggleSort("createdAt")} className="text-left hover:text-[#0c2c64]">
                  Tarih {sortBy === "createdAt" ? (sortDir === "asc" ? "▲" : "▼") : ""}
                </button>
              </th>
              <th className="px-3 py-3 text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((request) => (
              <tr key={request._id} className="border-t border-slate-200 align-top">
                <td className="px-3 py-3 font-semibold text-slate-800">{request.fullName}</td>
                <td className="px-3 py-3 text-xs text-slate-600">
                  <a href={`mailto:${request.email}`} className="admin-link">{request.email}</a>
                  {request.phone ? (
                    <>
                      <br />
                      <a href={`tel:${request.phone.replace(/\s+/g, "")}`} className="admin-link">{request.phone}</a>
                    </>
                  ) : null}
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${statusConfig[request.status].badge}`}>
                    {statusConfig[request.status].label}
                  </span>
                </td>
                <td className="px-3 py-3 text-xs text-slate-600">{formatDate(request.createdAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex justify-end gap-2">
                    <button type="button" className="btn-secondary px-3 py-1 text-xs" onClick={() => setSelected(request)}>
                      i Detay
                    </button>
                    {request.status !== "contacted" ? (
                      <form action={updateMeetingStatusAction}>
                        <input type="hidden" name="id" value={request._id} />
                        <input type="hidden" name="status" value="contacted" />
                        <button className="btn-primary px-3 py-1 text-xs">Onayla</button>
                      </form>
                    ) : (
                      <form action={updateMeetingStatusAction}>
                        <input type="hidden" name="id" value={request._id} />
                        <input type="hidden" name="status" value="pending" />
                        <button className="btn-secondary px-3 py-1 text-xs">Takibe Al</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 ? (
              <tr>
                <td className="px-3 py-6 text-center text-sm text-slate-500" colSpan={5}>
                  Filtreye uygun toplantı talebi bulunamadı.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>

      {selected ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4" onMouseDown={() => setSelected(null)}>
          <div
            className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[#0c2c64]">Talep Detayı</h3>
              <button type="button" className="icon-btn" onClick={() => setSelected(null)} aria-label="Modalı kapat">
                ×
              </button>
            </div>

            <div className="space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
              <p><span className="font-semibold text-slate-900">Ad Soyad:</span> {selected.fullName}</p>
              <p><span className="font-semibold text-slate-900">E-posta:</span> {selected.email}</p>
              {selected.phone ? <p><span className="font-semibold text-slate-900">Telefon:</span> {selected.phone}</p> : null}
              <p><span className="font-semibold text-slate-900">Tarih:</span> {formatDate(selected.createdAt)}</p>
              <p><span className="font-semibold text-slate-900">Durum:</span> {statusConfig[selected.status].label}</p>
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Mesaj</p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{selected.message}</p>
            </div>

            <div className="mt-5 flex justify-end gap-2">
              <button type="button" className="btn-secondary" onClick={() => setSelected(null)}>
                İptal
              </button>
              {selected.status !== "contacted" ? (
                <form
                  action={async (formData) => {
                    await updateMeetingStatusAction(formData);
                    setSelected(null);
                  }}
                >
                  <input type="hidden" name="id" value={selected._id} />
                  <input type="hidden" name="status" value="contacted" />
                  <button className="btn-primary">İletişime Geçildi</button>
                </form>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </article>
  );
}
