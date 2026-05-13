'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { useAuth } from '@/hooks/use-auth';

/**
 * Mounted on the public homepage.
 *
 * While auth is still hydrating we render a full-page spinner so the public
 * homepage content never flashes for logged-in users. Once hydration
 * completes:
 *   - authenticated  → replace to /me/dashboard (no flash)
 *   - unauthenticated → return null so the homepage renders normally
 */
export function HomeAuthRedirect() {
  const router = useRouter();
  const { isAuthenticated, status } = useAuth();

  useEffect(() => {
    if (status === 'authenticated' && isAuthenticated) {
      router.replace('/me/dashboard');
    }
  }, [status, isAuthenticated, router]);

  // Still resolving — block the page render with a neutral spinner.
  if (status === 'idle' || status === 'loading') {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <span className="size-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  // Authenticated — redirect is in flight, keep the spinner up so the
  // homepage content never appears.
  if (status === 'authenticated' && isAuthenticated) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        <span className="size-8 animate-spin rounded-full border-4 border-brand-200 border-t-brand-600" />
      </div>
    );
  }

  return null;
}
