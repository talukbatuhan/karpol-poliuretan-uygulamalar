import type { Metadata } from "next";

import { ShoppingForm } from "@/components/shopping/ShoppingForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Yeni Alışveriş Kaydı",
};

export default function YeniAlisverisPage() {
  return (
    <>
      <PageHeader title="Yeni Kayıt" />
      <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
        <ShoppingForm mode="create" />
      </div>
    </>
  );
}
