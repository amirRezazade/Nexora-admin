"use client";

import { useId } from "react";
import { cn } from "@/lib/format";

export default function Switch({ checked, onChange, label, description, disabled, className, id }) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      {label && (
        <label htmlFor={fieldId} className="cursor-pointer select-none">
          <span className="block text-body font-medium text-ink">{label}</span>
          {description && <span className="mt-0.5 block text-caption text-ink-2">{description}</span>}
        </label>
      )}
      <button
        id={fieldId}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={!label ? "Toggle" : undefined}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn("relative inline-flex h-5 w-9 shrink-0 items-center rounded-pill border border-transparent transition-colors duration-200 ease-out", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas", "disabled:cursor-not-allowed disabled:opacity-50", checked ? "bg-brand" : "bg-line-strong")}
      >
        <span aria-hidden className={cn("inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ease-out", checked ? "translate-x-4.5" : "translate-x-0.5")} />
      </button>
    </div>
  );
}
