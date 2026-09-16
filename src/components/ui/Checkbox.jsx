'use client';

import { forwardRef, useEffect, useId, useRef } from 'react';
import { Check, Minus } from 'lucide-react';
import { cn } from '@/lib/format';

const Checkbox = forwardRef(function Checkbox(
  { label, description, indeterminate = false, className, id, ...props },
  ref
) {
  const autoId = useId();
  const fieldId = id || autoId;
  const innerRef = useRef(null);

  useEffect(() => {
    const node = innerRef.current;
    if (node) node.indeterminate = indeterminate;
  }, [indeterminate]);

  const setRefs = (node) => {
    innerRef.current = node;
    if (typeof ref === 'function') ref(node);
    else if (ref) ref.current = node;
  };

  const box = (
    <span className="relative inline-flex h-4 w-4 shrink-0 items-center justify-center">
      <input
        ref={setRefs}
        id={fieldId}
        type="checkbox"
        className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[5px] border border-line-strong bg-surface transition-colors checked:border-brand checked:bg-brand indeterminate:border-brand indeterminate:bg-brand focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-canvas disabled:cursor-not-allowed disabled:bg-surface-3"
        {...props}
      />
      {indeterminate ? (
        <Minus aria-hidden strokeWidth={3} className="pointer-events-none relative z-10 h-3 w-3 text-white opacity-0 peer-indeterminate:opacity-100" />
      ) : (
        <Check aria-hidden strokeWidth={3} className="pointer-events-none relative z-10 h-3 w-3 text-white opacity-0 transition-opacity peer-checked:opacity-100" />
      )}
    </span>
  );

  if (!label) return <span className={className}>{box}</span>;

  return (
    <div className={cn('flex items-start gap-2.5', className)}>
      <span className="mt-0.5">{box}</span>
      <label htmlFor={fieldId} className="cursor-pointer select-none">
        <span className="block text-body text-ink">{label}</span>
        {description && <span className="block text-caption text-ink-3">{description}</span>}
      </label>
    </div>
  );
});

export default Checkbox;
