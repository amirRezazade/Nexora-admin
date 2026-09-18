"use client";

import { forwardRef, useId } from "react";
import { cn } from "@/lib/format";
import { FieldShell, fieldBase } from "./Input";

const Textarea = forwardRef(function Textarea({ label, hint, error, required, className, rows = 4, id, maxLength, value, ...props }, ref) {
  const autoId = useId();
  const fieldId = id || autoId;
  return (
    <FieldShell
      label={label}
      htmlFor={fieldId}
      required={required}
      hint={hint}
      error={error}
      action={
        maxLength ? (
          <span className="text-caption tabular-nums text-ink-3">
            {String(value ?? "").length}/{maxLength}
          </span>
        ) : null
      }
    >
      <textarea ref={ref} id={fieldId} rows={rows} value={value ?? ""} maxLength={maxLength} aria-invalid={error ? "true" : undefined} className={cn(fieldBase, "resize-y px-3 py-2.5 text-body leading-relaxed", error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line-strong", className)} {...props} />
    </FieldShell>
  );
});

export default Textarea;
