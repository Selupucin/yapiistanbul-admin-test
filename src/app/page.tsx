import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import { getAdminSession } from "@/lib/session";

export default async function Home() {
  const session = await getAdminSession();
  if (session) redirect("/dashboard");

  return (
    <div className="grid min-h-screen items-center bg-[linear-gradient(160deg,#f1f6ff_0%,#ffffff_35%,#e9f1ff_100%)] p-4 lg:grid-cols-2 lg:p-10">
      <section className="hidden rounded-3xl bg-[linear-gradient(135deg,#0c2c64_0%,#1b4f9b_100%)] p-10 text-white lg:block">
        <p className="text-sm tracking-widest text-white/80">YAPI ISTANBUL</p>
        <h1 className="mt-3 text-5xl font-semibold leading-tight">Yonetim paneli ile tum icerigi kontrol et.</h1>
        <p className="mt-5 max-w-md text-sm text-white/85">
          Blog, projeler, iletisim bilgileri ve marka ayarlari icin merkezi yonetim deneyimi.
        </p>
      </section>

      <section className="flex items-center justify-center">
        <form action={loginAction} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
          <h2 className="text-2xl font-semibold text-slate-900">Admin Giris</h2>
          <p className="mt-2 text-sm text-slate-600">Yonetim paneline devam etmek icin bilgilerinizi girin.</p>
          <div className="mt-6 space-y-4">
            <input name="username" placeholder="Username" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
            <input name="password" type="password" placeholder="Password" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
          </div>
          <button className="btn-primary mt-6 w-full">
            Giris Yap
          </button>
        </form>
      </section>
    </div>
  );
}
