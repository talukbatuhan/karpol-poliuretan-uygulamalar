import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShoppingForm } from "@/components/shopping/ShoppingForm";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth/require-user";
import { getShoppingRecordById } from "@/lib/services/shopping-record-service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export const metadata: Metadata = {
  title: "Kaydı Düzenle",
};

export default async function AlisverisDuzenlePage({ params }: PageProps) {
  const user = await requireUser();
  if (!user) notFound();

  const { id } = await params;

  try {
    const record = await getShoppingRecordById(user.id, id);

    return (
      <>
        <PageHeader title="Kaydı Düzenle" />
        <div className="mx-auto max-w-3xl px-4 py-6 md:px-8 md:py-8">
          <ShoppingForm mode="edit" initialData={record} />
        </div>
      </>
    );
  } catch {
    notFound();
  }
}
