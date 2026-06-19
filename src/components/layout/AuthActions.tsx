"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { createClient } from "@/lib/supabase/client";

export function AuthActions() {
  const router = useRouter();
  const [email, setEmail] = useState<string | null>(null);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    const supabase = createClient();

    void supabase.auth.getUser().then(({ data: { user } }) => {
      setEmail(user?.email ?? null);
    });
  }, []);

  const handleSignOut = async () => {
    setIsSigningOut(true);
    const supabase = createClient();
    await supabase.auth.signOut();
    router.replace("/login");
    router.refresh();
  };

  if (!email) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="max-w-[200px] truncate text-xs text-slate-500">{email}</span>
      <button
        type="button"
        onClick={() => void handleSignOut()}
        disabled={isSigningOut}
        className="border border-black bg-white px-3 py-2 text-xs font-medium uppercase tracking-wide text-charcoal transition-colors hover:bg-slate-100 disabled:opacity-60"
      >
        {isSigningOut ? "Çıkış..." : "Çıkış"}
      </button>
    </div>
  );
}
