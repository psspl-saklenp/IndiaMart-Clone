'use client';

import Link from 'next/link';

import { cn } from '@/lib/utils';

interface DashboardSearchProps {
  className?: string;
}

/**
 * Top-of-dashboard row containing only the "Post RFQ" CTA. The city/location
 * picker, product/service text input, and Search button were removed by
 * request — buyers discover suppliers via the navbar search and the
 * category browser instead.
 */
export function DashboardSearch({ className }: DashboardSearchProps) {
  return (
    <div className={cn('flex justify-end', className)}>
      <Link
        href="/me/requirements/new"
        className="shrink-0 rounded-md bg-[var(--color-im-indigo-700)] px-5 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-im-indigo-600)]"
      >
        Post RFQ
      </Link>
    </div>
  );
}
