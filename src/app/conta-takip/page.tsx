import { ContaForm } from "@/components/conta/ContaForm";
import { AppHeader } from "@/components/layout/AppHeader";

export default function ContaTakipPage() {
  return (
    <div className="min-h-full bg-slate-50">
      <AppHeader title="Conta Takip" active="conta-takip" />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <ContaForm />
      </main>
    </div>
  );
}
