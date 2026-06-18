import { CompanyModule } from "@/components/companies/CompanyModule";
import { AppHeader } from "@/components/layout/AppHeader";

export default function FirmalarPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <AppHeader title="Firma Yönetimi" active="firmalar" />

      <main className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <CompanyModule />
      </main>
    </div>
  );
}
