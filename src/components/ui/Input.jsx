"use client";

import { forwardRef, useId } from "react";
import { AlertCircle } from "lucide-react";
import { cn } from "@/lib/format";
import { restoreWindowScroll } from "@/lib/numberInput";
import { useI18n } from "@/i18n/I18nProvider";

export { numberFocusGuards, restoreWindowScroll } from "@/lib/numberInput";

export const fieldBase = "w-full rounded-control border bg-surface text-ink placeholder:text-ink-3 " + "transition-[border-color,box-shadow,background-color] duration-150 " + "focus:outline-none focus:border-brand focus:ring-[3px] focus:ring-brand/20 " + "disabled:cursor-not-allowed disabled:bg-surface-3 disabled:text-ink-3";

export function FieldShell({ label, htmlFor, required, hint, error, children, className, action }) {
  const { t } = useI18n();
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-2">
          <label htmlFor={htmlFor} className="text-body-sm font-medium text-ink">
            {label}
            {required && (
              <span className="ms-0.5 text-danger-text" aria-hidden>
                *
              </span>
            )}
            {required && <span className="sr-only"> ({t("common.required")})</span>}
          </label>
          {action}
        </div>
      )}
      {children}
      {error ? (
        <p className="flex items-start gap-1.5 text-caption text-danger-text">
          <AlertCircle aria-hidden className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className="text-caption text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

const Input = forwardRef(function Input({ label, hint, error, required, className, wrapperClassName, prefix, suffix, icon: Icon, id, action, type, onMouseDown, onWheel, value, ...props }, ref) {
  const autoId = useId();
  const inputId = id || autoId;
  const describedBy = error || hint ? `${inputId}-desc` : undefined;

  return (
    <FieldShell label={label} htmlFor={inputId} required={required} hint={hint} error={error} className={wrapperClassName} action={action}>
      <div className="relative flex items-center">
        {Icon && <Icon aria-hidden className="pointer-events-none absolute start-3 h-4 w-4 text-ink-3" />}
        {prefix && <span className="pointer-events-none absolute start-3 text-body text-ink-3">{prefix}</span>}
        <input
          ref={ref}
          id={inputId}
          type={type}
          /* Uncontrolled when the caller passes defaultValue instead of value —
             passing both makes React warn on every render. */
          value={value === undefined && props.defaultValue !== undefined ? undefined : (value ?? "")}
          aria-invalid={error ? "true" : undefined}
          aria-describedby={describedBy}
          aria-required={required || undefined}
          onMouseDown={(e) => {
            onMouseDown?.(e);
            if (type === "number") {
              restoreWindowScroll();
              if (document.activeElement !== e.currentTarget) {
                e.preventDefault();
                e.currentTarget.focus({ preventScroll: true });
              }
            }
          }}
          onWheel={(e) => {
            onWheel?.(e);
            if (type === "number") e.currentTarget.blur();
          }}
          className={cn(fieldBase, "h-9 px-3 text-body", Icon && "ps-9", prefix && "ps-7", suffix && "pe-10", error ? "border-danger focus:border-danger focus:ring-danger/20" : "border-line-strong", className)}
          {...props}
        />
        {suffix && <span className="pointer-events-none absolute end-3 text-caption text-ink-3">{suffix}</span>}
      </div>
      {(error || hint) && (
        <span id={describedBy} className="sr-only">
          {error || hint}
        </span>
      )}
    </FieldShell>
  );
});

export default Input;
