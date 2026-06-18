import { SharpForm } from "@/components/SharpForm";

export default function Home() {
  return (
    <div className="min-h-full bg-slate-50">
      <header className="border-b border-black bg-white">
        <div className="mx-auto max-w-4xl px-4 py-6 md:px-8">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            Karpol
          </p>
          <h1 className="mt-1 text-xl font-semibold uppercase tracking-wide text-charcoal md:text-2xl">
            İş Takip Paneli
          </h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-8 md:px-8">
        <SharpForm />
      </main>
    </div>
  );
}
