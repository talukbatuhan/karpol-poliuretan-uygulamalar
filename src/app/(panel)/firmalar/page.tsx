import { CompanyModule } from "@/components/companies/CompanyModule";
import { PageHeader } from "@/components/layout/PageHeader";

export default function FirmalarPage() {
  return (
    <>
      <PageHeader title="Firma Kartları" />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <CompanyModule />
      </div>
    </>
  );
}
