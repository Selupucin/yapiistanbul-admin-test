"use client";

import { useEffect, useRef, useState } from "react";
import { ProjectImagesField } from "@/components/project-images-field";
import {
  ProjectFloorPlansField,
  type FloorPlanItem,
} from "@/components/project-floor-plans-field";
import { updateProjectAction } from "@/app/actions";

type ProjectEditDialogProps = {
  id: string;
  name: string;
  nameEn?: string;
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
  floorPlans?: FloorPlanItem[];
  basementCount?: number;
  parkingFloors?: number[];
};

export function ProjectEditDialog(props: ProjectEditDialogProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-secondary px-3 py-1 text-xs"
      >
        ✎ Düzenle
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-slate-950/45 p-4"
          onMouseDown={(event) => {
            if (!panelRef.current) return;
            if (!panelRef.current.contains(event.target as Node)) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[#0c2c64]">Proje Düzenle</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Modalı kapat"
              >
                ×
              </button>
            </div>

            <form action={updateProjectAction} onSubmit={() => setOpen(false)} className="space-y-4">
              <input type="hidden" name="id" value={props.id} />

              <ProjectFormFields {...props} />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="btn-secondary">
                  İptal
                </button>
                <button type="submit" className="btn-primary">
                  ✓ Güncelle
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}

export function ProjectFormFields(props: Partial<ProjectEditDialogProps>) {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Proje adı (TR)" required>
          <input name="name" defaultValue={props.name || ""} className="input-base" required />
        </Field>
        <Field label="Proje adı (EN)">
          <input name="nameEn" defaultValue={props.nameEn || ""} className="input-base" />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Konum etiketi (TR)" hint="Örn: İstanbul / Kartal">
          <input name="location" defaultValue={props.location || ""} className="input-base" />
        </Field>
        <Field label="Konum etiketi (EN)" hint="Örn: Istanbul / Kartal">
          <input name="locationEn" defaultValue={props.locationEn || ""} className="input-base" />
        </Field>
      </div>

      <Field label="Harita konumu" hint="Google Maps embed URL veya paylaşım linki">
        <input
          name="mapLocation"
          defaultValue={props.mapLocation || ""}
          placeholder="https://www.google.com/maps/embed?..."
          className="input-base"
        />
      </Field>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Toplam alan" hint="Örn: 12.500 m²">
          <input name="totalArea" defaultValue={props.totalArea || ""} className="input-base" />
        </Field>
        <Field label="Daire sayısı">
          <input
            type="number"
            name="unitCount"
            defaultValue={props.unitCount ?? 0}
            min={0}
            className="input-base"
          />
        </Field>
        <Field label="Daire tipleri" hint="Örn: 1+1, 2+1, 3+1">
          <input name="unitTypes" defaultValue={props.unitTypes || ""} className="input-base" />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="Blok sayısı">
          <input
            type="number"
            name="blockCount"
            defaultValue={props.blockCount ?? 0}
            min={0}
            className="input-base"
          />
        </Field>
        <Field label="Kat sayısı">
          <input
            type="number"
            name="floorCount"
            defaultValue={props.floorCount ?? 0}
            min={0}
            className="input-base"
          />
        </Field>
        <Field label="Teslim tarihi" hint="Örn: 2026 Q4">
          <input name="deliveryDate" defaultValue={props.deliveryDate || ""} className="input-base" />
        </Field>
      </div>

      <Field label="Durum" hint="Örn: Satışta, İnşaat aşamasında, Tamamlandı">
        <input name="status" defaultValue={props.status || ""} className="input-base" />
      </Field>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Kısa özet (TR)" hint="Karta yansıyan kısa açıklama (max 600 karakter)">
          <textarea
            name="summary"
            defaultValue={props.summary || ""}
            rows={3}
            maxLength={600}
            className="input-base"
          />
        </Field>
        <Field label="Kısa özet (EN)">
          <textarea
            name="summaryEn"
            defaultValue={props.summaryEn || ""}
            rows={3}
            maxLength={600}
            className="input-base"
          />
        </Field>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="Detay açıklama (TR)">
          <textarea
            name="description"
            defaultValue={props.description || ""}
            rows={6}
            className="input-base"
          />
        </Field>
        <Field label="Detay açıklama (EN)">
          <textarea
            name="descriptionEn"
            defaultValue={props.descriptionEn || ""}
            rows={6}
            className="input-base"
          />
        </Field>
      </div>

      <Field label="Video URL" hint="YouTube, Vimeo veya doğrudan MP4 linki">
        <input
          name="videoUrl"
          defaultValue={props.videoUrl || ""}
          placeholder="https://www.youtube.com/watch?v=..."
          className="input-base"
        />
      </Field>

      <Field label="Görseller" hint="En fazla 3 görsel · Kapak görseli görsellerden biri seçilir">
        <ProjectImagesField
          initialImages={props.images || []}
          initialCoverIndex={props.coverImageIndex ?? 0}
        />
      </Field>

      <Field label="Kat Planları" hint="Önce kat sayısını girin; sonra eksi kat ve plan yükleme adımları açılır">
        <ProjectFloorPlansField
          initialPlans={props.floorPlans || []}
          initialFloorCount={props.floorCount ?? 0}
          initialBasementCount={props.basementCount ?? 0}
          initialParkingFloors={props.parkingFloors || []}
        />
      </Field>
    </div>
  );
}

function Field({
  label,
  hint,
  required,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center gap-1 text-xs font-semibold text-slate-700">
        {label}
        {required ? <span className="text-red-500">*</span> : null}
      </span>
      {children}
      {hint ? <span className="mt-1 block text-[11px] text-slate-500">{hint}</span> : null}
    </label>
  );
}
