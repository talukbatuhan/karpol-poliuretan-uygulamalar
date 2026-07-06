import type { Metadata } from "next";

import { SharpForm } from "@/components/SharpForm";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "İş Takip Paneli",
};

export default function IsTakipPage() {
  return (
    <>
      <PageHeader title="İş Takip Paneli" />
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
        <SharpForm />
      </div>
    </>
  );
}
