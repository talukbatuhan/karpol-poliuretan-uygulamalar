import type { ReactNode } from "react";

interface SharpFieldProps {
  label: string;
  htmlFor: string;
  error?: string;
  className?: string;
  fullWidth?: boolean;
  children: ReactNode;
}

export const sharpInputClassName =
  "w-full border border-black bg-white px-3 py-2 text-sm text-charcoal focus:outline-none focus:ring-2 focus:ring-navy focus:border-navy placeholder:text-slate-400";

export function SharpField({
  label,
  htmlFor,
  error,
  className = "",
  fullWidth = false,
  children,
}: SharpFieldProps) {
  return (
    <div
      className={`flex flex-col gap-1 ${fullWidth ? "md:col-span-2" : ""} ${className}`}
    >
      <label
        htmlFor={htmlFor}
        className="text-xs font-medium uppercase tracking-wide text-slate-600"
      >
        {label}
      </label>
      {children}
      {error && (
        <p
          className="mt-1 border-l-2 border-red-700 pl-2 text-xs text-red-700"
          role="alert"
        >
          {error}
        </p>
      )}
    </div>
  );
}
