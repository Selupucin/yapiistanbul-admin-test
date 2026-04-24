"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type FloorPlanItem = { label: string; image: string };

type Props = {
  initialPlans?: FloorPlanItem[];
  initialFloorCount?: number;
  /** Form içindeki kat sayısı input'unu (name="floorCount") dinler. */
  floorCountInputName?: string;
};

function buildFloorOptions(count: number): string[] {
  const safe = Math.max(0, Math.min(Math.floor(count) || 0, 200));
  const opts = ["Bodrum Kat", "Zemin Kat"];
  for (let i = 1; i <= safe; i += 1) opts.push(`${i}. Kat`);
  opts.push("Çatı Katı");
  return opts;
}

export function ProjectFloorPlansField({
  initialPlans = [],
  initialFloorCount = 0,
  floorCountInputName = "floorCount",
}: Props) {
  const [plans, setPlans] = useState<FloorPlanItem[]>(initialPlans);
  const [floorCount, setFloorCount] = useState<number>(initialFloorCount);
  const [selected, setSelected] = useState<string>("Zemin Kat");

  // Aynı form içindeki "Kat sayısı" input'unu canlı dinle
  useEffect(() => {
    if (typeof document === "undefined") return;
    const input = document.querySelector<HTMLInputElement>(
      `input[name="${floorCountInputName}"]`
    );
    if (!input) return;
    const handler = () => setFloorCount(Number(input.value) || 0);
    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
    handler();
    return () => {
      input.removeEventListener("input", handler);
      input.removeEventListener("change", handler);
    };
  }, [floorCountInputName]);

  const options = useMemo(() => buildFloorOptions(floorCount), [floorCount]);

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () =>
        resolve(typeof reader.result === "string" ? reader.result : "");
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFile(file: File | null) {
    if (!file) return;
    const dataUrl = await readFile(file);
    if (!dataUrl) return;
    setPlans((prev) => {
      const idx = prev.findIndex((p) => p.label === selected);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { label: selected, image: dataUrl };
        return next;
      }
      return [...prev, { label: selected, image: dataUrl }];
    });
  }

  function removeAt(idx: number) {
    setPlans((prev) => prev.filter((_, i) => i !== idx));
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[160px]">
            <span className="mb-1 block text-[11px] font-semibold text-slate-700">
              Kat seçin
            </span>
            <select
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              className="input-base"
            >
              {options.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </label>
          <label className="flex-1 min-w-[200px]">
            <span className="mb-1 block text-[11px] font-semibold text-slate-700">
              Kat planı görseli
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
              className="input-base file:mr-3 file:rounded file:border-0 file:bg-[#0c2c64] file:px-3 file:py-1 file:text-xs file:font-semibold file:text-white"
            />
          </label>
        </div>
        <p className="mt-2 text-[11px] text-slate-500">
          {floorCount > 0
            ? `Kat sayısı: ${floorCount}. Aynı katın görseli yeniden yüklenirse üzerine yazılır.`
            : "Önce yukarıdaki “Kat sayısı” alanını girin; seçenekler buna göre üretilir."}
        </p>
        <p className="mt-1 text-[11px] font-medium text-[#0c2c64]">
          Önerilen görsel: uzun kenarı <strong>1600 px</strong> (ideal 1600×1200
          veya benzeri oran), <strong>PNG</strong> ya da yüksek kaliteli{" "}
          <strong>JPG</strong>, dosya boyutu en fazla ~2 MB. Görsel orijinal
          oranıyla görüntülenir; etrafında boşluk oluşmaz.
        </p>
      </div>

      {plans.length > 0 ? (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {plans.map((p, idx) => (
            <div
              key={`${p.label}-${idx}`}
              className="relative overflow-hidden rounded-lg border border-slate-200 bg-white"
            >
              <Image
                src={p.image}
                alt={`Kat planı: ${p.label}`}
                width={300}
                height={220}
                unoptimized
                className="h-28 w-full object-cover"
              />
              <div className="flex items-center justify-between gap-1 px-2 py-1 text-[11px]">
                <span className="font-semibold text-[#0c2c64]">{p.label}</span>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="rounded bg-red-50 px-1.5 py-0.5 font-semibold text-red-600 hover:bg-red-100"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-xs text-slate-500">Henüz kat planı eklenmedi.</p>
      )}

      <input type="hidden" name="floorPlans" value={JSON.stringify(plans)} />
    </div>
  );
}
