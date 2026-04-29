'use client';

import { cn } from '@/lib/utils';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (next: number) => void;
  className?: string;
}

export function Pagination({ page, totalPages, onChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;

  const prev = () => onChange(Math.max(1, page - 1));
  const next = () => onChange(Math.min(totalPages, page + 1));

  return (
    <nav className={cn('flex items-center justify-center gap-2 text-sm', className)}>
      <button
        type="button"
        onClick={prev}
        disabled={page <= 1}
        className="rounded border border-ink-200 px-3 py-1.5 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        ← Prev
      </button>
      <span className="px-3 py-1.5 text-ink-600">
        Page <strong className="text-ink-900">{page}</strong> of {totalPages}
      </span>
      <button
        type="button"
        onClick={next}
        disabled={page >= totalPages}
        className="rounded border border-ink-200 px-3 py-1.5 hover:bg-ink-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next →
      </button>
    </nav>
  );
}
