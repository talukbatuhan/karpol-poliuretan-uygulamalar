import type { Metadata } from "next";

import { AddressLabelApp } from "@/components/address-label/AddressLabelApp";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Adres Etiketi Oluştur",
  description: "A5 yatay adres etiketi oluşturma ve yazdırma uygulaması",
};

export default function AdresYaziciPage() {
  return (
    <>
      <div className="no-print">
        <PageHeader title="Adres Yazıcı" />
      </div>
      <AddressLabelApp />
    </>
  );
}
