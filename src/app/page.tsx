import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import { getAdminSession } from "@/lib/session";

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  const session = await getAdminSession();
  if (session) redirect("/dashboard");

  const params = await searchParams;
  const showInvalidCredentials = params?.error === "invalid_credentials";

  return (
    <div className="min-h-screen bg-[linear-gradient(160deg,#f1f6ff_0%,#ffffff_35%,#e9f1ff_100%)] px-4 py-6 lg:px-8 lg:py-10">
      <div className="mx-auto grid min-h-[calc(100vh-3rem)] w-full max-w-6xl items-center gap-6 lg:grid-cols-[1.45fr_1fr] lg:gap-8">
        <section className="hidden rounded-3xl bg-[linear-gradient(135deg,#0c2c64_0%,#1b4f9b_100%)] p-10 text-white lg:block">
          <p className="text-sm tracking-widest text-white/80">YAPI ISTANBUL</p>
          <h1 className="mt-3 text-5xl font-semibold leading-tight">Yönetim paneli ile tüm içeriği kontrol et.</h1>
          <p className="mt-5 max-w-md text-sm text-white/85">
            Blog, projeler, iletişim bilgileri ve marka ayarları için merkezi yönetim deneyimi.
          </p>
        </section>

        <section className="flex items-center justify-center">
          <form action={loginAction} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-semibold text-slate-900">Yönetici Girişi</h2>
            <p className="mt-2 text-sm text-slate-600">Yönetim paneline devam etmek için bilgilerinizi girin.</p>
            {showInvalidCredentials ? (
              <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.
              </p>
            ) : null}
            <div className="mt-6 space-y-4">
              <input name="username" placeholder="Kullanıcı adı" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
              <input name="password" type="password" placeholder="Şifre" className="w-full rounded-lg border border-slate-300 px-3 py-2" required />
            </div>
            <button className="btn-primary mt-6 w-full">
              Giriş Yap
            </button>
          </form>
        </section>
      </div>
    </div>
  );
}
