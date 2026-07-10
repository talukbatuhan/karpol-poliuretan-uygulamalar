"use client";

import type { ParamDef } from "@/features/design-engine/core/types";
import type { DesignModule } from "@/features/design-engine/core/types";
import type { ValidationIssue } from "@/features/design-engine/core/types";

type ParameterPanelProps = {
  module: DesignModule;
  primary: Record<string, unknown>;
  derivedDefs: { id: string; value: number | string }[];
  issues: ValidationIssue[];
  onChange: (id: string, value: number | string) => void;
  labels: Record<string, string>;
  panelTitle: string;
  derivedTitle: string;
  derivedLabels: Record<string, string>;
  groupLabels: Record<string, string>;
  errorLabels: Record<string, string>;
};

function FieldInput({
  param,
  value,
  onChange,
  label,
  error,
}: {
  param: ParamDef;
  value: unknown;
  onChange: (v: number | string) => void;
  label: string;
  error?: string;
}) {
  if (param.type === "enum" && param.options) {
    return (
      <select
        id={param.id}
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-navy-800 bg-ivory-50 px-3 py-2 font-mono text-sm text-navy-950"
      >
        {param.options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.labelKey}
          </option>
        ))}
      </select>
    );
  }

  if (param.type === "color") {
    return (
      <input
        id={param.id}
        type="color"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full cursor-pointer border border-navy-800"
      />
    );
  }

  if (param.type === "string") {
    return (
      <input
        id={param.id}
        type="text"
        value={String(value)}
        onChange={(e) => onChange(e.target.value)}
        className="w-full border border-navy-800 bg-ivory-50 px-3 py-2 font-mono text-sm text-navy-950"
      />
    );
  }

  return (
    <input
      id={param.id}
      type="number"
      value={Number(value)}
      min={param.min}
      max={param.max}
      step={param.step}
      onChange={(e) =>
        onChange(
          param.type === "integer"
            ? parseInt(e.target.value, 10)
            : parseFloat(e.target.value),
        )
      }
      className="w-full border border-navy-800 bg-ivory-50 px-3 py-2 font-mono text-sm text-navy-950"
    />
  );
}

export function ParameterPanel({
  module,
  primary,
  derivedDefs,
  issues,
  onChange,
  labels,
  panelTitle,
  derivedTitle,
  derivedLabels,
  groupLabels,
  errorLabels,
}: ParameterPanelProps) {
  const primaryParams = module.schema.parameters.filter(
    (p) => p.role === "primary",
  );

  const visibleParams = primaryParams.filter(
    (p) => !p.visibleWhen || p.visibleWhen(primary),
  );

  const groups = [...new Set(visibleParams.map((p) => p.group ?? "general"))];

  const issueFor = (id: string) =>
    issues.find((i) => i.paramId === id)?.messageKey;

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden border-r border-navy-800 bg-ivory-50">
      <div className="border-b border-navy-800 px-4 py-3">
        <h2 className="font-mono text-xs uppercase tracking-widest text-navy-800">
          {panelTitle}
        </h2>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto p-4">
        {issues.length > 0 && (
          <div className="mb-4 border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-800">
            {issues.map((issue) => (
              <p key={issue.code}>{errorLabels[issue.messageKey] ?? issue.messageKey}</p>
            ))}
          </div>
        )}

        {groups.map((group) => (
          <div key={group} className="mb-6">
            <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-gold-600">
              {groupLabels[group] ?? group}
            </h3>
            <div className="space-y-3">
              {visibleParams
                .filter((p) => (p.group ?? "general") === group)
                .map((param) => (
                  <label key={param.id} className="block">
                    <span className="mb-1 block font-sans text-xs text-navy-800">
                      {labels[param.labelKey] ?? param.labelKey}
                      {param.unit ? ` (${param.unit})` : ""}
                    </span>
                    <FieldInput
                      param={param}
                      value={primary[param.id]}
                      onChange={(v) => onChange(param.id, v)}
                      label={labels[param.labelKey] ?? param.labelKey}
                      error={issueFor(param.id) ? errorLabels[issueFor(param.id)!] : undefined}
                    />
                  </label>
                ))}
            </div>
          </div>
        ))}

        <div className="mb-4">
          <h3 className="mb-3 font-mono text-[10px] uppercase tracking-widest text-gold-600">
            {derivedTitle}
          </h3>
          <div className="space-y-2">
            {derivedDefs.map((d) => (
              <div
                key={d.id}
                className="flex items-center justify-between border border-navy-800/20 bg-navy-950/5 px-3 py-2"
              >
                <span className="font-sans text-xs text-navy-800">
                  {derivedLabels[d.id] ?? d.id}
                </span>
                <span className="font-mono text-xs text-navy-950">
                  {typeof d.value === "number"
                    ? d.value.toFixed(2)
                    : d.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
