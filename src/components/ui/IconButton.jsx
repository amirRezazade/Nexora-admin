"use client";

import { forwardRef } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/format";

const variants = {
  ghost: "text-ink-2 hover:bg-surface-3 hover:text-ink",
  secondary: "border border-line-strong bg-surface text-ink-2 hover:bg-surface-2 hover:text-ink shadow-xs",
  danger: "text-danger-text hover:bg-danger-soft",
  brand: "bg-brand text-white hover:bg-brand-hover shadow-xs",
};

const sizes = {
  xs: "h-6 w-6 rounded-[6px]",
  sm: "h-7 w-7 rounded-control",
  md: "h-8 w-8 rounded-control",
  lg: "h-9 w-9 rounded-control",
};

const iconSizes = { xs: "h-3.5 w-3.5", sm: "h-4 w-4", md: "h-4 w-4", lg: "h-[18px] w-[18px]" };

/** Icon-only control. `label` is required — it becomes the accessible name. */
const IconButton = forwardRef(function IconButton({ icon: Icon, label, variant = "ghost", size = "md", className, active, loading = false, disabled, ...props }, ref) {
  const isDisabled = disabled || loading;
  return (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      title={label}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn("inline-flex shrink-0 items-center justify-center transition-colors duration-150", "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas", "disabled:pointer-events-none disabled:opacity-45", variants[variant], sizes[size], active && "bg-brand-soft text-brand-text", className)}
      {...props}
    >
      {loading ? <Loader2 aria-hidden className={cn(iconSizes[size], "animate-[spin_0.7s_linear_infinite]")} /> : <Icon aria-hidden className={iconSizes[size]} />}
    </button>
  );
});

export default IconButton;
