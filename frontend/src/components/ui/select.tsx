'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  options: SelectOption[];
  placeholder?: string;
}

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, hint, options, placeholder, id, className, ...rest },
  ref,
) {
  const fieldId = id ?? rest.name ?? undefined;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={fieldId} className="block text-xs font-medium text-ink-700">
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={fieldId}
        aria-invalid={Boolean(error)}
        className={cn(
          'block w-full rounded-md border bg-white px-3 py-2 text-sm text-ink-900',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-ink-200 focus:border-brand-400 focus:ring-brand-200',
          className,
        )}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="text-xs text-ink-500">{hint}</p>
      ) : null}
    </div>
  );
});
