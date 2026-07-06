import type { Metadata } from "next";

import { TechnicalDrawingModule } from "@/components/technical-drawing/TechnicalDrawingModule";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Teknik Resim Araçları",
  description: "Ölçek, birim ve açı dönüşüm araçları",
};

export default function TeknikResimPage() {
  return (
    <>
      <PageHeader title="Teknik Resim Araçları" />
      <div className="mx-auto max-w-4xl px-4 py-6 md:px-8 md:py-8">
        <TechnicalDrawingModule />
      </div>
    </>
  );
}
