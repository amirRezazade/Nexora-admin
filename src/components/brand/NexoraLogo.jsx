"use client";

import { cn } from "@/lib/format";
import { useI18n } from "@/i18n/I18nProvider";

/**
 * Wordmark for expanded chrome. Collapsed rail uses the cropped wordmark in
 * English and the N mark in Persian.
 */
export default function NexoraLogo({ compact = false, className, alt = "Nexora Admin" }) {
  const { locale } = useI18n();

  if (compact) {
    return (
      <span className={cn("relative inline-flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-[9px]", className)} aria-hidden>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/brand/nexora-mark.webp" alt="" className="h-10 w-10 object-contain" />
      </span>
    );
  }

  return (
    <span className={cn("inline-flex max-w-full items-center", className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/nexora-light-120.png" alt={alt} className="h-10 w-auto max-w-full dark:hidden" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/nexora-dark-120.png" alt="" className="hidden h-10 w-auto max-w-full dark:block" />
    </span>
  );
}

/** @deprecated use NexoraLogo */
export { NexoraLogo as NovaMark };
