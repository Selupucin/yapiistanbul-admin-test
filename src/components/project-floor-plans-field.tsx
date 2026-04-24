"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

export type FloorPlanItem = { label: string; image: string };

type Props = {
  initialPlans?: FloorPlanItem[];
  initialFloorCount?: number;
  initialBasementCount?: number;
  initialParkingFloors?: number[];
  /** Form içindeki kat sayısı input'unu (name="floorCount") dinler. */
  floorCountInputName?: string;
};

/** Bir kat numarası için varsayılan etiketi üretir. */
function labelForFloor(floor: number, parkingFloors: number[]): string {
  if (floor === 0) return "Zemin";
  if (floor > 0) return `${floor}. Kat`;
  if (parkingFloors.includes(floor)) {
    return parkingFloors.length > 1 ? `Otopark (${floor})` : "Otopark";
  }
  if (floor === -1) return "Bodrum";
  return `${floor}. Kat`;
}

/** Tüm seçilebilir kat numaralarını döndürür: en alt eksi kat → çatı. */
function buildFloorNumbers(floorCount: number, basementCount: number): number[] {
  const list: number[] = [];
  for (let i = basementCount; i >= 1; i -= 1) list.push(-i);
  list.push(0);
  for (let i = 1; i <= floorCount; i += 1) list.push(i);
  return list;
}

/** "1. Kat", "Zemin", "Bodrum", "Otopark", "-2. Kat", "Otopark (-2)" -> kat numarası. */
function parseFloorFromLabel(label: string): number | null {
  const trimmed = label.trim();
  if (/^zemin/i.test(trimmed)) return 0;
  const otoparkParen = trimmed.match(/^otopark\s*\((-?\d+)\)/i);
  if (otoparkParen) return Number(otoparkParen[1]);
  if (/^otopark$/i.test(trimmed)) return -1;
  if (/^bodrum/i.test(trimmed)) return -1;
  const m = trimmed.match(/^(-?\d+)\.\s*kat/i);
  if (m) return Number(m[1]);
  return null;
}

export function ProjectFloorPlansField({
  initialPlans = [],
  initialFloorCount = 0,
  initialBasementCount = 0,
  initialParkingFloors = [],
  floorCountInputName = "floorCount",
}: Props) {
  const [plans, setPlans] = useState<FloorPlanItem[]>(initialPlans);
  const [floorCount, setFloorCount] = useState<number>(initialFloorCount);
  const [hasBasement, setHasBasement] = useState<boolean>(initialBasementCount > 0);
  const [basementCount, setBasementCount] = useState<number>(initialBasementCount);
  const [parkingFloors, setParkingFloors] = useState<number[]>(initialParkingFloors);
  const [selected, setSelected] = useState<number>(0);

  // "Kat sayısı" input'unu canlı dinle
  useEffect(() => {
    if (typeof document === "undefined") return;
    const input = document.querySelector<HTMLInputElement>(
      `input[name="${floorCountInputName}"]`
    );
    if (!input) return;
    const handler = () => setFloorCount(Math.max(0, Number(input.value) || 0));
    input.addEventListener("input", handler);
    input.addEventListener("change", handler);
    handler();
    return () => {
      input.removeEventListener("input", handler);
      input.removeEventListener("change", handler);
    };
  }, [floorCountInputName]);

  useEffect(() => {
    if (!hasBasement) {
      setBasementCount(0);
      setParkingFloors([]);
    }
  }, [hasBasement]);

  useEffect(() => {
    setParkingFloors((prev) => prev.filter((f) => f >= -basementCount));
  }, [basementCount]);

  const floorNumbers = useMemo(
    () => buildFloorNumbers(floorCount, hasBasement ? basementCount : 0),
    [floorCount, hasBasement, basementCount]
  );

  useEffect(() => {
    if (!floorNumbers.includes(selected) && floorNumbers.length > 0) {
      setSelected(floorNumbers.includes(0) ? 0 : floorNumbers[0]);
    }
  }, [floorNumbers, selected]);

  // parkingFloors değişince mevcut planların etiketlerini yenile
  useEffect(() => {
    setPlans((prev) =>
      prev.map((p) => {
        const f = parseFloorFromLabel(p.label);
        if (f === null) return p;
        return { ...p, label: labelForFloor(f, parkingFloors) };
      })
    );
  }, [parkingFloors]);

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
    const newLabel = labelForFloor(selected, parkingFloors);
    setPlans((prev) => {
      const idx = prev.findIndex((p) => parseFloorFromLabel(p.label) === selected);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { label: newLabel, image: dataUrl };
        return next;
      }
      const next = [...prev, { label: newLabel, image: dataUrl }];
      next.sort((a, b) => {
        const fa = parseFloorFromLabel(a.label) ?? 0;
        const fb = parseFloorFromLabel(b.label) ?? 0;
        return fa - fb;
      });
      return next;
    });
  }

  function removeAt(idx: number) {
    setPlans((prev) => prev.filter((_, i) => i !== idx));
  }

  function toggleParking(floor: number) {
    setParkingFloors((prev) =>
      prev.includes(floor) ? prev.filter((f) => f !== floor) : [...prev, floor]
    );
  }

  if (floorCount <= 0) {
    return (
      <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 p-4 text-center">
        <p className="text-sm font-medium text-slate-700">
          Kat planı yüklemek için önce yukarıdaki <strong>Kat sayısı</strong>{" "}
          alanını doldurun.
        </p>
        <p className="mt-1 text-[11px] text-slate-500">
          Kat sayısı girildikten sonra eksi kat ve plan yükleme seçenekleri
          görünür.
        </p>
        <input type="hidden" name="floorPlans" value="[]" />
        <input type="hidden" name="basementCount" value="0" />
        <input type="hidden" name="parkingFloors" value="[]" />
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border border-slate-200 bg-white p-3">
        <p className="text-[12px] font-semibold text-slate-700">
          Bu projede eksi kat (bodrum / otopark) var mı?
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs text-slate-700">
            <input
              type="radio"
              name="hasBasementToggle"
              checked={hasBasement}
              onChange={() => setHasBasement(true)}
            />
            <span>Evet</span>
          </label>
          <label className="flex items-center gap-1.5 text-xs text-slate-700">
            <input
              type="radio"
              name="hasBasementToggle"
              checked={!hasBasement}
              onChange={() => setHasBasement(false)}
            />
            <span>Hayır</span>
          </label>

          {hasBasement ? (
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <span className="font-semibold">Kaç eksi kat?</span>
              <input
                type="number"
                min={1}
                max={10}
                value={basementCount || ""}
                onChange={(e) =>
                  setBasementCount(
                    Math.min(10, Math.max(0, Number(e.target.value) || 0))
                  )
                }
                className="w-20 rounded-md border border-slate-300 px-2 py-1 text-xs"
              />
            </label>
          ) : null}
        </div>

        {hasBasement && basementCount > 0 ? (
          <div className="mt-3 rounded-md bg-slate-50 p-2">
            <p className="text-[11px] font-semibold text-slate-600">
              Otopark olan eksi katları işaretleyin:
            </p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {Array.from({ length: basementCount }).map((_, i) => {
                const floor = -(i + 1);
                const checked = parkingFloors.includes(floor);
                return (
                  <label
                    key={floor}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] transition ${
                      checked
                        ? "border-[#1a4f9d] bg-[#edf4ff] text-[#0c2c64]"
                        : "border-slate-300 bg-white text-slate-600 hover:border-slate-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleParking(floor)}
                      className="h-3 w-3"
                    />
                    <span className="font-medium">{floor}. Kat</span>
                    {checked ? <span>· Otopark</span> : null}
                  </label>
                );
              })}
            </div>
          </div>
        ) : null}
      </div>

      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex flex-wrap items-end gap-2">
          <label className="flex-1 min-w-[180px]">
            <span className="mb-1 block text-[11px] font-semibold text-slate-700">
              Kat seçin
            </span>
            <select
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              className="input-base"
            >
              {floorNumbers.map((f) => (
                <option key={f} value={f}>
                  {labelForFloor(f, parkingFloors)}
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
          Aynı katın görseli yeniden yüklenirse üzerine yazılır. Sadece görsel
          yüklediğiniz katlar web sitesinde görünür.
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
      <input
        type="hidden"
        name="basementCount"
        value={String(hasBasement ? basementCount : 0)}
      />
      <input
        type="hidden"
        name="parkingFloors"
        value={JSON.stringify(parkingFloors)}
      />
    </div>
  );
}
