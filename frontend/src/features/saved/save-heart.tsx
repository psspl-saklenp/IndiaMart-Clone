'use client';

import { useAuth } from '@/hooks/use-auth';
import { useIsSaved, useToggleSaved } from './use-saved-set';

interface Props {
  productId: string;
  className?: string;
}

export function SaveHeart({ productId, className = '' }: Props) {
  const { isAuthenticated, user } = useAuth();
  const saved = useIsSaved(productId);
  const toggle = useToggleSaved();

  // Only buyers (and admins) can save. Sellers don't get a heart on cards.
  if (!isAuthenticated || (user && user.role !== 'buyer' && user.role !== 'admin')) {
    return null;
  }

  return (
    <button
      type="button"
      aria-label={saved ? 'Remove from saved' : 'Save product'}
      title={saved ? 'Remove from saved' : 'Save product'}
      disabled={toggle.isPending}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggle.mutate({ productId, save: !saved });
      }}
      className={`inline-flex size-8 items-center justify-center rounded-full bg-white/95 shadow-sm transition-colors hover:bg-white disabled:opacity-50 ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        aria-hidden
        fill={saved ? 'var(--color-brand-600)' : 'none'}
        stroke={saved ? 'var(--color-brand-600)' : 'var(--color-ink-700)'}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
}
