import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ShoppingDetailView } from "@/components/shopping/ShoppingDetailView";
import { PageHeader } from "@/components/layout/PageHeader";
import { requireUser } from "@/lib/auth/require-user";
import { getShoppingRecordById } from "@/lib/services/shopping-record-service";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const user = await requireUser();

  if (!user) {
    return { title: "Alışveriş Detayı" };
  }

  try {
    const record = await getShoppingRecordById(user.id, id);
    return { title: record.productName };
  } catch {
    return { title: "Alışveriş Detayı" };
  }
}

export default async function AlisverisDetayPage({ params }: PageProps) {
  const user = await requireUser();
  if (!user) notFound();

  const { id } = await params;

  try {
    const record = await getShoppingRecordById(user.id, id);

    return (
      <>
        <PageHeader title="Alışveriş Detayı" />
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
          <ShoppingDetailView record={record} />
        </div>
      </>
    );
  } catch {
    notFound();
  }
}
