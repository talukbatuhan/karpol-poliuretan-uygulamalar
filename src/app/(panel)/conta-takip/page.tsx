import { ContaModule } from "@/components/conta/ContaModule";
import { PageHeader } from "@/components/layout/PageHeader";

export default function ContaTakipPage() {
  return (
    <>
      <PageHeader title="Conta Takip" />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <ContaModule />
      </div>
    </>
  );
}
