"use client";

import Image from "next/image";
import { useState } from "react";

type FaviconUploadFieldProps = {
  initialValue?: string;
};

export function FaviconUploadField({ initialValue = "" }: FaviconUploadFieldProps) {
  const [favicon, setFavicon] = useState(initialValue);
  const [dragActive, setDragActive] = useState(false);

  function onFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === "string" ? reader.result : "";
      setFavicon(data);
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
        className={`rounded-lg border-2 border-dashed px-4 py-6 text-center transition ${
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
          id="favicon-input"
        />
        <label htmlFor="favicon-input" className="cursor-pointer">
          <p className="text-sm font-semibold text-[#0c2c64]">Favicon yükleyin</p>
          <p className="mt-1 text-xs text-slate-500">veya sürükleyip bırakın (en az 64x64px)</p>
        </label>
      </div>

      <input type="hidden" name="siteFavicon" value={favicon} />
      {favicon ? (
        <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <Image
            src={favicon}
            alt="Favicon onizleme"
            width={32}
            height={32}
            unoptimized
            className="h-8 w-8 rounded border border-slate-200"
          />
          <p className="text-xs text-slate-600">Favicon hazır</p>
        </div>
      ) : (
        <p className="text-xs text-slate-500">Favicon seçilmedi.</p>
      )}
    </div>
  );
}
