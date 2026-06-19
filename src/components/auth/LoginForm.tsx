"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

import { SharpField, sharpInputClassName } from "@/components/form/SharpField";
import { createClient } from "@/lib/supabase/client";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const supabase = createClient();
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (signInError) {
      setError("E-posta veya şifre hatalı.");
      setIsSubmitting(false);
      return;
    }

    router.replace(redirectTo);
    router.refresh();
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
      <SharpField label="E-posta" htmlFor="email" required>
        <input
          id="email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className={sharpInputClassName}
          placeholder="ornek@karpol.com"
          required
        />
      </SharpField>

      <SharpField label="Şifre" htmlFor="password" required>
        <input
          id="password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className={sharpInputClassName}
          placeholder="••••••••"
          required
        />
      </SharpField>

      {error && (
        <p
          className="border border-red-700 bg-red-50 px-3 py-2 text-sm text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full border border-black bg-navy px-4 py-3 text-sm font-medium uppercase tracking-wide text-white transition-colors hover:bg-navy-light disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting ? "Giriş yapılıyor..." : "Giriş Yap"}
      </button>
    </form>
  );
}
