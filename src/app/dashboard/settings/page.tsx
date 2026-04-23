import { saveSettingsAction } from "@/app/actions";
import { LogoUploadField } from "@/components/logo-upload-field";
import { FaviconUploadField } from "@/components/favicon-upload-field";
import { getSettings } from "@repo/api";

export default async function AdminSettingsPage() {
  const settings = await getSettings();

  return (
    <article className="panel-card">
      <h2 className="text-xl font-semibold text-[#0c2c64]">Genel Ayarlar</h2>
      <p className="mt-1 text-sm text-slate-500">Logo, favicon ve marka varliklar&#305;n&#305; bu ekrandan güncelleyebilirsiniz.</p>

      <form action={saveSettingsAction} className="mt-5 space-y-6">
        <div>
          <label className="block text-sm font-semibold text-[#0c2c64]">Site Logosu</label>
          <p className="mt-1 text-xs text-slate-500">Sayfa üstü ve alt bölümde gösterilecek logo</p>
          <div className="mt-2">
            <LogoUploadField initialValue={settings.siteLogo || ""} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-[#0c2c64]">Favicon</label>
          <p className="mt-1 text-xs text-slate-500">Tarayic&#305; sekmesinde gösterilecek ikon (64x64px önerilir)</p>
          <div className="mt-2">
            <FaviconUploadField initialValue={settings.siteFavicon || ""} />
          </div>
        </div>

        <button type="submit" className="btn-primary rounded-full px-6">
          Kaydet
        </button>
      </form>
    </article>
  );
}
