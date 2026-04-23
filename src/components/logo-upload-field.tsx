"use client";

import Image from "next/image";
import { useState } from "react";

type LogoUploadFieldProps = {
  initialValue?: string;
};

export function LogoUploadField({ initialValue = "" }: LogoUploadFieldProps) {
  const [logo, setLogo] = useState(initialValue);
  const [dragActive, setDragActive] = useState(false);

  function onFileChange(file: File | null) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const data = typeof reader.result === "string" ? reader.result : "";
      setLogo(data);
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
          id="logo-input"
        />
        <label htmlFor="logo-input" className="cursor-pointer">
          <p className="text-sm font-semibold text-[#0c2c64]">Logo yükleyin</p>
          <p className="mt-1 text-xs text-slate-500">veya sürükleyip bırakın</p>
        </label>
      </div>

      <input type="hidden" name="siteLogo" value={logo} />
      {logo ? (
        <Image
          src={logo}
          alt="Logo onizleme"
          width={220}
          height={64}
          unoptimized
          className="h-14 w-auto rounded border border-slate-200 bg-white p-2"
        />
      ) : (
        <p className="text-xs text-slate-500">Logo secilmedi.</p>
      )}
    </div>
  );
}
