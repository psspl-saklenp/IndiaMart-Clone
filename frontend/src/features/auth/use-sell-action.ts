'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { useAppDispatch } from '@/store';
import { openSellerSignup } from '@/store/slices/ui.slice';

/**
 * Single source of truth for the "Sell" / "Sell with us" entry points.
 *
 * Routes the click based on the current auth state so every header/footer
 * trigger behaves consistently:
 *   - Logged-out visitors are funnelled to the buyer signup page (the only
 *     way to obtain an account); `?next=sell` lets the page show a small
 *     hint about the upgrade flow.
 *   - Sellers and admins skip the modal and go straight to the seller
 *     dashboard.
 *   - Buyers get the 2-step upgrade modal.
 */
export function useSellAction(): () => void {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAuth();

  return useCallback(() => {
    if (!isAuthenticated || !user) {
      router.push('/register?next=sell');
      return;
    }
    if (user.role === 'seller' || user.role === 'admin') {
      router.push('/seller/dashboard');
      return;
    }
    dispatch(openSellerSignup());
  }, [dispatch, isAuthenticated, router, user]);
}
