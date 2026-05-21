'use client';

import { useAuth } from '@/hooks/use-auth';
import { BuyerAppBar } from '@/components/layout/buyer-app-bar';
import { PublicNavbar } from '@/components/layout/public-navbar';

export function DynamicNavbar() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading && !user) {
    // Show a clean loading placeholder to prevent layout shift during auth hydration.
    return (
      <header className="sticky top-0 z-30 border-b border-ink-200 bg-white shadow-sm h-16 animate-pulse" />
    );
  }

  if (isAuthenticated && user) {
    return <BuyerAppBar />;
  }

  return <PublicNavbar />;
}
