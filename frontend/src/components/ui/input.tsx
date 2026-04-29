'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-medium text-ink-700">
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
        className={cn(
          'block w-full rounded-md border bg-white px-3 py-2 text-sm text-ink-900',
          'placeholder:text-ink-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-1',
          error
            ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
            : 'border-ink-200 focus:border-brand-400 focus:ring-brand-200',
          'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500',
          className,
        )}
        {...rest}
      />
      {error ? (
        <p id={`${inputId}-err`} className="text-xs text-red-600">
          {error}
        </p>
      ) : hint ? (
        <p id={`${inputId}-hint`} className="text-xs text-ink-500">
          {hint}
        </p>
      ) : null}
    </div>
  );
});
