'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { useAuth } from '@/hooks/use-auth';

/**
 * Shown on public browsing pages (product, supplier, category, search) when
 * the visitor is not logged in. Lists what they're missing and nudges them
 * to register or log in.
 */
export function GuestBanner() {
  const { isAuthenticated, status } = useAuth();
  const pathname = usePathname();

  // Don't flash the banner while auth is still hydrating, and hide once logged in.
  if (status === 'idle' || status === 'loading' || isAuthenticated) return null;

  const next = encodeURIComponent(pathname);

  return (
    <div className="w-full border-b border-amber-200 bg-amber-50">
      <div className="mx-auto flex max-w-[96rem] flex-col items-start gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 text-xl" aria-hidden>🔒</span>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              You&apos;re browsing as a guest
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Register free to send inquiries, save products, post buy requirements, and contact suppliers directly.
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2 pl-9 sm:pl-0">
          <Link
            href={`/login?next=${next}`}
            className="rounded-lg border border-amber-400 bg-white px-3 py-1.5 text-xs font-semibold text-amber-800 transition-colors hover:bg-amber-100"
          >
            Log in
          </Link>
          <Link
            href="/register"
            className="rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-600"
          >
            Sign up free
          </Link>
        </div>
      </div>
    </div>
  );
}
