'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';

import { AuthBootstrap } from '@/features/auth/auth-bootstrap';
import { createQueryClient } from '@/lib/query-client';
import { store } from '@/store';

export function Providers({ children }: { children: React.ReactNode }) {
  // Lazy-init the QueryClient inside state so we get a single instance per
  // browser session but a fresh one per server-render.
  const [queryClient] = useState(() => createQueryClient());

  return (
    <ReduxProvider store={store}>
      <QueryClientProvider client={queryClient}>
        <AuthBootstrap />
        {children}
        {process.env.NEXT_PUBLIC_ENV !== 'production' && (
          <ReactQueryDevtools initialIsOpen={false} buttonPosition="bottom-right" />
        )}
      </QueryClientProvider>
    </ReduxProvider>
  );
}
