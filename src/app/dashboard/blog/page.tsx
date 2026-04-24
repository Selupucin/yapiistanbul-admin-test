import { createBlogAction } from "@/app/actions";
import { BlogImageField } from "@/components/blog-image-field";
import { BlogTable } from "@/components/blog-table";
import { listBlogs } from "@repo/api";

export default async function AdminBlogPage() {
  const blogs = await listBlogs();

  return (
    <div className="space-y-6">
      <details className="panel-card group">
        <summary className="flex cursor-pointer items-center justify-between gap-3 list-none">
          <div className="flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#edf4ff] text-[#1a4f9d] transition group-open:rotate-45">+</span>
            <h2 className="text-xl font-semibold text-[#0c2c64]">Yeni Blog Yazısı</h2>
          </div>
          <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-xs font-semibold text-[#1a4f9d]">
            Slug başlıktan otomatik
          </span>
        </summary>
        <form action={createBlogAction} className="mt-4 space-y-3">
          <input name="title" placeholder="Başlık (TR)" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <input name="titleEn" placeholder="Başlık (EN)" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <p className="rounded-lg border border-[#d7e4f9] bg-[#f7fbff] px-3 py-2 text-xs text-[#32588e]">
            Slug başlıktan otomatik oluşturulur.
          </p>
          <BlogImageField />
          <textarea name="content" placeholder="İçerik (TR)" className="h-32 w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <textarea name="contentEn" placeholder="İçerik (EN)" className="h-32 w-full rounded-lg border border-slate-300 px-3 py-2" required />
          <button className="btn-primary">+ Yayına Al</button>
        </form>
      </details>

      <BlogTable blogs={blogs.map((blog) => ({ ...blog, _id: String(blog._id) }))} />
    </div>
  );
}
