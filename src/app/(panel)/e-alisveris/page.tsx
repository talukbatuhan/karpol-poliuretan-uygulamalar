import type { Metadata } from "next";

import { ShoppingListModule } from "@/components/shopping/ShoppingListModule";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "E-Alışveriş",
  description: "Kişisel alışveriş kayıtları",
};

export default function EAlisverisPage() {
  return (
    <>
      <PageHeader title="E-Alışveriş" />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <ShoppingListModule />
      </div>
    </>
  );
}
