'use client';

import { forwardRef, type ButtonHTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'sun';
type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const VARIANTS: Record<Variant, string> = {
  primary:
    'bg-brand-600 text-white shadow-sm hover:bg-brand-700 hover:shadow-md active:bg-brand-800 focus-visible:ring-brand-500 disabled:bg-brand-300 disabled:shadow-none',
  secondary:
    'bg-white text-ink-800 border border-ink-200 shadow-sm hover:bg-ink-50 hover:border-ink-300 hover:shadow-md active:bg-ink-100 focus-visible:ring-ink-300',
  ghost:
    'bg-transparent text-ink-700 hover:bg-ink-100 hover:text-ink-900 active:bg-ink-200 focus-visible:ring-ink-300',
  danger:
    'bg-red-600 text-white shadow-sm hover:bg-red-700 hover:shadow-md active:bg-red-800 focus-visible:ring-red-500 disabled:bg-red-300 disabled:shadow-none',
  outline:
    'bg-transparent text-brand-700 border border-brand-300 hover:bg-brand-50 hover:border-brand-400 active:bg-brand-100 focus-visible:ring-brand-400',
  sun:
    'bg-sun-400 text-ink-900 font-semibold shadow-sm hover:bg-sun-500 hover:shadow-md active:bg-sun-600 focus-visible:ring-sun-400 disabled:bg-sun-200 disabled:shadow-none',
};

const SIZES: Record<Size, string> = {
  xs: 'h-7 px-2.5 text-[11px] rounded-md gap-1',
  sm: 'h-8 px-3 text-xs rounded-md gap-1.5',
  md: 'h-10 px-4 text-sm rounded-lg gap-2',
  lg: 'h-11 px-5 text-sm rounded-lg gap-2',
  xl: 'h-12 px-6 text-base rounded-xl gap-2.5',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled,
    children,
    icon,
    iconPosition = 'left',
    ...rest
  },
  ref,
) {
  return (
    <button
      ref={ref}
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-medium transition-all duration-150',
        'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:cursor-not-allowed disabled:opacity-60',
        'select-none whitespace-nowrap',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      {...rest}
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="size-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
          <span>Loading…</span>
        </span>
      ) : (
        <>
          {icon && iconPosition === 'left' && (
            <span className="shrink-0" aria-hidden>{icon}</span>
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <span className="shrink-0" aria-hidden>{icon}</span>
          )}
        </>
      )}
    </button>
  );
});
