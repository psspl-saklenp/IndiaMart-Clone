import type { HTMLAttributes } from 'react';

import { cn } from '@/lib/utils';

type Tone = 'neutral' | 'brand' | 'success' | 'warning' | 'danger' | 'info';
type Size = 'sm' | 'md';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
  size?: Size;
  dot?: boolean;
}

const TONE: Record<Tone, string> = {
  neutral: 'bg-ink-100 text-ink-700 ring-ink-200/50',
  brand: 'bg-brand-100 text-brand-800 ring-brand-200/50',
  success: 'bg-emerald-100 text-emerald-800 ring-emerald-200/50',
  warning: 'bg-amber-100 text-amber-800 ring-amber-200/50',
  danger: 'bg-red-100 text-red-700 ring-red-200/50',
  info: 'bg-sky-100 text-sky-800 ring-sky-200/50',
};

const DOT_TONE: Record<Tone, string> = {
  neutral: 'bg-ink-500',
  brand: 'bg-brand-600',
  success: 'bg-emerald-600',
  warning: 'bg-amber-500',
  danger: 'bg-red-600',
  info: 'bg-sky-600',
};

const SIZE: Record<Size, string> = {
  sm: 'px-1.5 py-0.5 text-[10px]',
  md: 'px-2 py-0.5 text-[11px]',
};

export function Badge({ tone = 'neutral', size = 'sm', dot = false, className, children, ...rest }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full font-semibold uppercase tracking-wide ring-1',
        TONE[tone],
        SIZE[size],
        className,
      )}
      {...rest}
    >
      {dot && (
        <span className={cn('size-1.5 rounded-full shrink-0', DOT_TONE[tone])} aria-hidden />
      )}
      {children}
    </span>
  );
}
