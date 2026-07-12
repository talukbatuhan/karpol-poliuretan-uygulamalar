import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { UsersModule } from "@/components/users/UsersModule";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireAdmin } from "@/lib/auth/require-admin";

export const metadata: Metadata = {
  title: "Kullanıcı Yönetimi",
};

export default async function KullanicilarPage() {
  const admin = await requireAdmin();
  if (!admin) {
    redirect("/");
  }

  return (
    <>
      <PageHeader title="Kullanıcı Yönetimi" />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <UsersModule />
      </div>
    </>
  );
}
