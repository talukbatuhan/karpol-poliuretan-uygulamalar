import type { Metadata } from "next";

import { NoteModule } from "@/components/notes/NoteModule";
import { PageHeader } from "@/components/layout/PageHeader";

export const metadata: Metadata = {
  title: "Karpol Notlar",
};

export default function NotlarPage() {
  return (
    <>
      <PageHeader title="Karpol Notlar" />
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
        <NoteModule />
      </div>
    </>
  );
}
