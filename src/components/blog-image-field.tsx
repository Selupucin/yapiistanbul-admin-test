"use client";

import Image from "next/image";
import { useState } from "react";

export function BlogImageField({ initialValue = "" }: { initialValue?: string }) {
  const [coverImage, setCoverImage] = useState(initialValue);
  const [dragActive, setDragActive] = useState(false);

  function onFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === "string" ? reader.result : "";
      setCoverImage(data);
    };
    reader.readAsDataURL(file);
  }

  function handleDrag(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileChange(e.dataTransfer.files[0]);
    }
  }

  return (
    <div className="space-y-3">
      <div
        className={`rounded-lg border-2 border-dashed px-4 py-8 text-center transition ${
          dragActive
            ? "border-[#0c2c64] bg-[#edf4ff]"
            : "border-slate-300 bg-slate-50 hover:border-slate-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={(e) => onFileChange(e.target.files?.[0] || null)}
          className="hidden"
          id="blog-image-input"
        />
        <label htmlFor="blog-image-input" className="cursor-pointer">
          <p className="text-sm font-semibold text-[#0c2c64]">Kapak görseli yükleyin</p>
          <p className="mt-1 text-xs text-slate-500">veya sürükleyip bırakın</p>
        </label>
      </div>

      <input type="hidden" name="coverImage" value={coverImage} />
      {coverImage ? (
        <Image
          src={coverImage}
          alt="Kapak önizleme"
          width={640}
          height={240}
          unoptimized
          className="h-32 w-full rounded-lg border border-slate-200 object-cover"
        />
      ) : null}
    </div>
  );
}
