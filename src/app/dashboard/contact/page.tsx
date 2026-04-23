import { saveContactAction } from "@/app/actions";
import { getContact } from "@repo/api";

export default async function AdminContactPage() {
  const contact = await getContact();

  return (
    <article className="panel-card">
      <h2 className="text-xl font-semibold text-[#0c2c64]">İletişim Bilgileri</h2>
      <p className="mt-1 text-sm text-slate-500">Web sitesinde görünen iletişim kartını bu alandan yönetin.</p>

      <form action={saveContactAction} className="mt-5 grid gap-3 md:grid-cols-2">
        <input name="phone" defaultValue={contact.phone} placeholder="Telefon" className="rounded-lg border border-slate-300 px-3 py-2" required />
        <input name="email" defaultValue={contact.email} placeholder="E-posta" className="rounded-lg border border-slate-300 px-3 py-2" required />
        <input name="address" defaultValue={contact.address} placeholder="Adres" className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" required />
        <input name="mapLocation" defaultValue={contact.mapLocation} placeholder="Harita URL" className="rounded-lg border border-slate-300 px-3 py-2 md:col-span-2" required />
        <button className="btn-primary md:col-span-2">Güncelle</button>
      </form>
    </article>
  );
}
