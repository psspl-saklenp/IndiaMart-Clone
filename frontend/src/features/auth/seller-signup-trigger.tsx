'use client';

import type { ReactNode } from 'react';

import { useSellAction } from '@/features/auth/use-sell-action';

interface SellerSignupTriggerProps {
  className?: string;
  children: ReactNode;
}

/**
 * Drop-in button used by server components (footers, sidebars) to invoke
 * the shared Sell call-to-action without having to convert their tree to a
 * client component. Routing (modal vs. dashboard vs. register page) is
 * delegated to {@link useSellAction}.
 */
export function SellerSignupTrigger({ className, children }: SellerSignupTriggerProps) {
  const onSellClick = useSellAction();
  return (
    <button type="button" onClick={onSellClick} className={className}>
      {children}
    </button>
  );
}
