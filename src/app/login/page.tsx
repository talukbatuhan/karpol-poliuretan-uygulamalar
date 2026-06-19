import { Suspense } from "react";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 px-4 py-12">
      <div className="w-full max-w-md border border-black bg-white">
        <div className="border-b border-black px-6 py-5">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Karpol
          </p>
          <h1 className="mt-1 text-xl font-semibold uppercase tracking-wide text-charcoal">
            İş Takip Paneli
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Devam etmek için Supabase hesabınızla giriş yapın.
          </p>
        </div>

        <div className="p-6">
          <Suspense fallback={<p className="text-sm text-slate-500">Yükleniyor...</p>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
