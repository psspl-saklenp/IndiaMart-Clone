'use client';

import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  hint?: string;
  /** Icon rendered inside the left edge of the input */
  leadingIcon?: ReactNode;
  /** Icon or element rendered inside the right edge */
  trailingIcon?: ReactNode;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, hint, id, className, leadingIcon, trailingIcon, ...rest },
  ref,
) {
  const inputId = id ?? rest.name ?? undefined;
  return (
    <div className="space-y-1.5">
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-ink-700 tracking-wide">
          {label}
        </label>
      )}
      <div className="relative">
        {leadingIcon && (
          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400">
            {leadingIcon}
          </span>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${inputId}-err` : hint ? `${inputId}-hint` : undefined}
          className={cn(
            'block w-full rounded-lg border bg-white text-sm text-ink-900',
            'placeholder:text-ink-400',
            'transition-all duration-150',
            'focus:outline-none focus:ring-2 focus:ring-offset-0',
            leadingIcon ? 'pl-9 pr-3 py-2.5' : 'px-3 py-2.5',
            trailingIcon ? 'pr-9' : '',
            error
              ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
              : 'border-ink-200 focus:border-brand-400 focus:ring-brand-100',
            'disabled:cursor-not-allowed disabled:bg-ink-50 disabled:text-ink-500',
            className,
          )}
          {...rest}
        />
        {trailingIcon && (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-400">
            {trailingIcon}
          </span>
        )}
      </div>
      {error ? (
        <p id={`${inputId}-err`} className="flex items-center gap-1 text-xs text-red-600">
          <svg viewBox="0 0 16 16" className="size-3.5 shrink-0" fill="currentColor" aria-hidden>
            <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 3.5a.75.75 0 0 1 .75.75v3a.75.75 0 0 1-1.5 0v-3A.75.75 0 0 1 8 4.5zm0 6.5a.875.875 0 1 1 0-1.75A.875.875 0 0 1 8 11z"/>
          </svg>
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
