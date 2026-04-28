import { QueryClient } from '@tanstack/react-query';

/**
 * Defaults are tuned for a content-heavy marketplace:
 * - 60s staleTime to avoid double-fetches when navigating between pages.
 * - retry once for transient failures.
 * - mutations don't auto-retry (they're often non-idempotent).
 */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}
