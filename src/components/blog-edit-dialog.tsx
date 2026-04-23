"use client";

import { useEffect, useRef, useState } from "react";
import { updateBlogAction } from "@/app/actions";
import { BlogImageField } from "@/components/blog-image-field";

type BlogEditDialogProps = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  content: string;
  contentEn: string;
  coverImage: string;
};

export function BlogEditDialog({ id, slug, title, titleEn, content, contentEn, coverImage }: BlogEditDialogProps) {
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
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
            if (!panelRef.current.contains(event.target as Node)) {
              setOpen(false);
            }
          }}
        >
          <div ref={panelRef} className="w-full max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h3 className="text-xl font-semibold text-[#0c2c64]">Blog Yazısını Düzenle</h3>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setOpen(false)}
                aria-label="Modalı kapat"
              >
                ×
              </button>
            </div>

            <form action={updateBlogAction} onSubmit={() => setOpen(false)} className="space-y-3">
              <input type="hidden" name="id" value={id} />
              <input type="hidden" name="slug" value={slug} />
              <input name="title" defaultValue={title} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
              <input name="titleEn" defaultValue={titleEn} className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
              <textarea name="content" defaultValue={content} className="h-28 w-full rounded-lg border border-slate-300 px-3 py-2" required />
              <textarea name="contentEn" defaultValue={contentEn} className="h-28 w-full rounded-lg border border-slate-300 px-3 py-2" required />
              <BlogImageField initialValue={coverImage || ""} />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="btn-secondary"
                >
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
