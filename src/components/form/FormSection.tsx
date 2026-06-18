import type { ReactNode } from "react";

interface FormSectionProps {
  title: string;
  children: ReactNode;
  layout?: "grid" | "stack";
}

export function FormSection({
  title,
  children,
  layout = "grid",
}: FormSectionProps) {
  return (
    <section className="col-span-full border border-black bg-white p-4 md:p-5">
      <h3 className="mb-4 border-b border-black pb-2 text-xs font-semibold uppercase tracking-widest text-charcoal">
        {title}
      </h3>
      {layout === "stack" ? (
        children
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">{children}</div>
      )}
    </section>
  );
}
