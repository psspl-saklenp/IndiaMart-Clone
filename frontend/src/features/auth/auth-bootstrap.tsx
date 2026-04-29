'use client';

import { useEffect } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import { hydrateThunk } from '@/store/slices/auth.slice';

/**
 * Mounts once at app start; tries to hydrate the auth state via the refresh-token
 * cookie. Renders nothing.
 */
export function AuthBootstrap() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((s) => s.auth.status);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(hydrateThunk());
    }
  }, [dispatch, status]);

  return null;
}
