"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

type Props = {
  initialImages?: string[];
  initialCoverIndex?: number;
  max?: number;
};

export function ProjectImagesField({
  initialImages = [],
  initialCoverIndex = 0,
  max = 3,
}: Props) {
  const [images, setImages] = useState<string[]>(initialImages.slice(0, max));
  const [cover, setCover] = useState<number>(
    Math.min(Math.max(initialCoverIndex, 0), Math.max(images.length - 1, 0))
  );

  useEffect(() => {
    if (cover > images.length - 1) {
      setCover(Math.max(images.length - 1, 0));
    }
  }, [images.length, cover]);

  function readFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const data = typeof reader.result === "string" ? reader.result : "";
        resolve(data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const remaining = max - images.length;
    if (remaining <= 0) return;
    const arr = Array.from(files).slice(0, remaining);
    const dataUrls = await Promise.all(arr.map((f) => readFile(f)));
    setImages((prev) => [...prev, ...dataUrls].slice(0, max));
  }

  function removeAt(idx: number) {
    setImages((prev) => prev.filter((_, i) => i !== idx));
    setCover((c) => {
      if (c === idx) return 0;
      if (c > idx) return c - 1;
      return c;
    });
  }

  return (
    <div className="space-y-3">
      <div className="rounded-lg border-2 border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center transition hover:border-slate-400">
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
          id="project-images-input"
          disabled={images.length >= max}
        />
        <label
          htmlFor="project-images-input"
          className={`cursor-pointer ${images.length >= max ? "opacity-50" : ""}`}
        >
          <p className="text-sm font-semibold text-[#0c2c64]">
            Proje görsellerini yükleyin (en fazla {max} adet)
          </p>
          <p className="mt-1 text-xs text-slate-500">
            {images.length}/{max} görsel eklendi · Birden fazla dosya seçebilirsiniz
          </p>
        </label>
      </div>

      {images.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img, idx) => (
            <div
              key={`${idx}-${img.slice(0, 32)}`}
              className={`relative overflow-hidden rounded-lg border-2 ${
                cover === idx ? "border-[#0c2c64] ring-2 ring-[#1a4f9d]/40" : "border-slate-200"
              }`}
            >
              <Image
                src={img}
                alt={`Proje görseli ${idx + 1}`}
                width={300}
                height={200}
                unoptimized
                className="h-24 w-full object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-white/90 px-1.5 py-1 text-[10px]">
                <button
                  type="button"
                  onClick={() => setCover(idx)}
                  className={`rounded px-1.5 py-0.5 font-semibold ${
                    cover === idx
                      ? "bg-[#0c2c64] text-white"
                      : "bg-slate-100 text-[#0c2c64] hover:bg-[#eef4ff]"
                  }`}
                  title="Kapak görseli olarak seç"
                >
                  {cover === idx ? "✓ Kapak" : "Kapak yap"}
                </button>
                <button
                  type="button"
                  onClick={() => removeAt(idx)}
                  className="rounded bg-red-50 px-1.5 py-0.5 font-semibold text-red-600 hover:bg-red-100"
                  title="Bu görseli kaldır"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : null}

      {/* Form alanlari */}
      {images.map((img, idx) => (
        <input key={`hidden-${idx}`} type="hidden" name="images" value={img} />
      ))}
      <input type="hidden" name="coverImageIndex" value={String(cover)} />
    </div>
  );
}
