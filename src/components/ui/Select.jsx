"use client";

import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/format";
import { FieldShell, fieldBase } from "./Input";

/** Native select — reliable keyboard behaviour and mobile pickers for free. */
const Select = forwardRef(function Select({ label, hint, error, required, options = [], placeholder, className, size = "md", id, children, ...props }, ref) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <FieldShell label={label} htmlFor={fieldId} required={required} hint={hint} error={error}>
      <div className="relative">
        <select ref={ref} id={fieldId} aria-invalid={error ? "true" : undefined} className={cn(fieldBase, "cursor-pointer appearance-none pr-9", size === "sm" ? "h-8 pl-2.5 text-body-sm" : "h-9 pl-3 text-body", error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line-strong", className)} {...props}>
          {placeholder && <option value="">{placeholder}</option>}
          {options.map((o) => (
            <option key={o.value} value={o.value} disabled={o.disabled}>
              {o.label}
            </option>
          ))}
          {children}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute end-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
      </div>
    </FieldShell>
  );
});

export default Select;
