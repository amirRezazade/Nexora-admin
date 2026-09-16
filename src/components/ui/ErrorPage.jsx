'use client';

import Link from 'next/link';
import { cn } from '@/lib/format';
import Button from './Button';

/** Shared shell for 404 / 403 / 500. Big code, plain language, one clear exit. */
export default function ErrorPage({ code, title, description, actions, tone = 'neutral' }) {
  const tones = {
    neutral: 'text-ink-3',
    warning: 'text-warning',
    danger: 'text-danger',
  };
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-5 text-center">
      <p className={cn('text-[88px] font-bold leading-none tracking-[-0.04em] tabular-nums opacity-25', tones[tone])}>
        {code}
      </p>
      <h1 className="mt-4 text-h1 text-ink">{title}</h1>
      <p className="mt-2 max-w-md text-body-lg leading-relaxed text-ink-2">{description}</p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">{actions}</div>
    </div>
  );
}
