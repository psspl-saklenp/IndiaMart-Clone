'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';

import { useAppDispatch } from '@/store';
import { logoutThunk } from '@/store/slices/auth.slice';

/**
 * One-stop hook for logging the user out.
 *
 * Clicking a "Log out" button should always do two things:
 *   1. Dispatch the logout thunk (clears the access token and refresh
 *      cookie via `POST /auth/logout`).
 *   2. Navigate to `/login` so the next thing the user sees is the login
 *      screen, regardless of whether they were on a `Protected` page or a
 *      public one.
 *
 * Returning a single async callback keeps the call sites trivial:
 *   `<button onClick={() => void logout()}>Log out</button>`
 */
export function useLogout() {
  const dispatch = useAppDispatch();
  const router = useRouter();

  return useCallback(async () => {
    await dispatch(logoutThunk());
    router.replace('/login');
  }, [dispatch, router]);
}
