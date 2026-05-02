'use client';

import Link from 'next/link';
import { useState } from 'react';

import { CITY_OPTIONS } from '@/features/buyer/dashboard-data';
import { cn } from '@/lib/utils';

interface DashboardSearchProps {
  /** Default city pre-selected in the dropdown. */
  defaultCity?: string;
  className?: string;
}

/**
 * Top-of-dashboard row with just the city/location picker on the left and
 * the "Post RFQ" CTA on the right. The product/service text input and the
 * Search button were removed by request — buyers discover suppliers via
 * the navbar search and the category browser instead.
 */
export function DashboardSearch({
  defaultCity = 'All India',
  className,
}: DashboardSearchProps) {
  const [city, setCity] = useState(defaultCity);

  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-md border border-ink-200 bg-white p-2 shadow-sm sm:flex-row sm:items-center sm:justify-between',
        className,
      )}
    >
      {/* City selector */}
      <label className="flex shrink-0 items-center gap-2 rounded-md border border-ink-200 px-3 py-2">
        <IconPin />
        <span className="sr-only">City</span>
        <select
          value={city}
          onChange={(e) => setCity(e.target.value)}
          className="bg-transparent text-sm text-ink-800 focus:outline-none"
        >
          {CITY_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>

      {/* Post RFQ CTA */}
      <Link
        href="/requirements/new"
        className="shrink-0 rounded-md bg-[var(--color-im-indigo-700)] px-5 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-im-indigo-600)]"
      >
        Post RFQ
      </Link>
    </div>
  );
}

function IconPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4 text-ink-500"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M12 21s7-6 7-12a7 7 0 0 0-14 0c0 6 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </svg>
  );
}
