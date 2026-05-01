'use client';

import Link from 'next/link';

/**
 * Bottom-right floating quick actions:
 *   - Round chat button (anchor only; no live chat backend in this phase)
 *   - "Track Order" pill linking to the buyer requirements list
 */
export function TrackOrderFab() {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-20 flex justify-end px-4">
      <div className="pointer-events-auto flex flex-col items-end gap-2">
        <button
          type="button"
          aria-label="Open chat support"
          className="flex size-12 items-center justify-center rounded-full bg-[var(--color-im-teal-600)] text-white shadow-lg transition-colors hover:bg-[var(--color-im-teal-700)]"
        >
          <ChatIcon />
        </button>
        <Link
          href="/me/requirements"
          className="flex items-center gap-2 rounded-full bg-[var(--color-im-navy-800)] px-4 py-2 text-sm font-semibold text-white shadow-lg transition-colors hover:bg-[var(--color-im-navy-700)]"
        >
          <TruckIcon />
          Track Order
        </Link>
      </div>
    </div>
  );
}

function ChatIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M21 15a2 2 0 0 1-2 2H8l-4 4V6a2 2 0 0 1 2-2h13a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function TruckIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="size-4"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x="2" y="7" width="11" height="9" rx="1" />
      <path d="M13 10h4l3 3v3h-7z" />
      <circle cx="7" cy="18" r="1.6" />
      <circle cx="17" cy="18" r="1.6" />
    </svg>
  );
}
