"use client";

import { useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

type LoginFormProps = {
  action: (formData: FormData) => void | Promise<void>;
  showInvalidCredentials: boolean;
};

export function LoginForm({ action, showInvalidCredentials }: LoginFormProps) {
  const [showError, setShowError] = useState(showInvalidCredentials);
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function clearErrorState() {
    if (!showError) return;
    setShowError(false);

    const params = new URLSearchParams(searchParams.toString());
    params.delete("error");
    const nextUrl = params.toString() ? `${pathname}?${params.toString()}` : pathname;
    router.replace(nextUrl, { scroll: false });
  }

  return (
    <form action={action} className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-xl">
      <h2 className="text-2xl font-semibold text-slate-900">Yönetici Girişi</h2>
      <p className="mt-2 text-sm text-slate-600">Yönetim paneline devam etmek için bilgilerinizi girin.</p>
      {showError ? (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Kullanıcı adı veya şifre hatalı. Lütfen tekrar deneyin.
        </p>
      ) : null}
      <div className="mt-6 space-y-4">
        <input
          name="username"
          placeholder="Kullanıcı adı"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          onChange={clearErrorState}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Şifre"
          className="w-full rounded-lg border border-slate-300 px-3 py-2"
          onChange={clearErrorState}
          required
        />
      </div>
      <button className="btn-primary mt-6 w-full">Giriş Yap</button>
    </form>
  );
}