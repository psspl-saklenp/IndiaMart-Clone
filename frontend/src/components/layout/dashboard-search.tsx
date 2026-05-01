'use client';

import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, type FormEvent } from 'react';

import { CITY_OPTIONS } from '@/features/buyer/dashboard-data';
import { cn } from '@/lib/utils';

interface DashboardSearchProps {
  /** Default city pre-selected in the dropdown. */
  defaultCity?: string;
  className?: string;
}

/**
 * Combined search bar used at the top of the buyer dashboard.
 * Submits to the public `/search` route.
 */
export function DashboardSearch({
  defaultCity = 'All India',
  className,
}: DashboardSearchProps) {
  const router = useRouter();
  const [city, setCity] = useState(defaultCity);
  const [query, setQuery] = useState('');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set('q', query.trim());
    if (city && city !== 'All India') params.set('city', city);
    router.push(`/search${params.size ? `?${params.toString()}` : ''}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        'flex flex-col gap-2 rounded-md border border-ink-200 bg-white p-2 shadow-sm sm:flex-row sm:items-stretch sm:gap-0',
        className,
      )}
    >
      {/* City selector */}
      <label className="flex shrink-0 items-center gap-2 rounded-md border border-ink-200 px-3 py-2 sm:rounded-r-none sm:border-r-0">
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

      {/* Search input */}
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter product / service"
        aria-label="Search for product or service"
        className="min-w-0 flex-1 rounded-md border border-ink-200 px-3 py-2 text-sm placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-[var(--color-im-teal-500)] sm:rounded-none sm:border-l-0 sm:border-r-0"
      />

      {/* CTAs */}
      <div className="flex shrink-0 items-stretch gap-2 sm:gap-0">
        <button
          type="submit"
          className="flex-1 rounded-md bg-[var(--color-im-teal-600)] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-im-teal-700)] sm:flex-none sm:rounded-l-none sm:rounded-r-md"
        >
          Search
        </button>
        <Link
          href="/requirements/new"
          className="flex-1 rounded-md bg-[var(--color-im-indigo-700)] px-5 py-2 text-center text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[var(--color-im-indigo-600)] sm:ml-2 sm:flex-none"
        >
          Post RFQ
        </Link>
      </div>
    </form>
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
