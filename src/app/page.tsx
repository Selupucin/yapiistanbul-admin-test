import { redirect } from "next/navigation";
import { loginAction } from "./actions";
import { getAdminSession } from "@/lib/session";
import { LoginForm } from "@/components/login-form";

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
          <LoginForm action={loginAction} showInvalidCredentials={showInvalidCredentials} />
        </section>
      </div>
    </div>
  );
}
