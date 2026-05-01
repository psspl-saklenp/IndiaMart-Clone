'use client';

import type { ReactNode } from 'react';

import { useAppDispatch } from '@/store';
import { openSellerSignup } from '@/store/slices/ui.slice';

interface SellerSignupTriggerProps {
  className?: string;
  children: ReactNode;
}

/**
 * Drop-in button used by server components (footers, sidebars) to open the
 * global seller signup modal without having to convert their tree to a
 * client component.
 */
export function SellerSignupTrigger({ className, children }: SellerSignupTriggerProps) {
  const dispatch = useAppDispatch();
  return (
    <button
      type="button"
      onClick={() => dispatch(openSellerSignup())}
      className={className}
    >
      {children}
    </button>
  );
}
