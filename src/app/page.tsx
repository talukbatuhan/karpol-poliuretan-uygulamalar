import { SharpForm } from "@/components/SharpForm";
import { AppHeader } from "@/components/layout/AppHeader";

export default function Home() {
  return (
    <div className="min-h-full bg-slate-50">
      <AppHeader title="İş Takip Paneli" active="is-takip" />

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <SharpForm />
      </main>
    </div>
  );
}
