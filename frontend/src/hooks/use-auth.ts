'use client';

import { useCallback } from 'react';

import { useAppDispatch, useAppSelector } from '@/store';
import {
  clearError,
  loginThunk,
  logoutThunk,
  registerThunk,
} from '@/store/slices/auth.slice';
import type { LoginPayload, RegisterPayload } from '@/types/auth';

export function useAuth() {
  const dispatch = useAppDispatch();
  const { user, status, error } = useAppSelector((s) => s.auth);

  const login = useCallback(
    (payload: LoginPayload) => dispatch(loginThunk(payload)),
    [dispatch],
  );

  const register = useCallback(
    (payload: RegisterPayload) => dispatch(registerThunk(payload)),
    [dispatch],
  );

  const logout = useCallback(() => dispatch(logoutThunk()), [dispatch]);
  const reset = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    user,
    status,
    error,
    isAuthenticated: status === 'authenticated' && Boolean(user),
    isLoading: status === 'loading',
    login,
    register,
    logout,
    reset,
  };
}
