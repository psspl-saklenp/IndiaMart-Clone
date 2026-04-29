import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { authReducer } from './slices/auth.slice';

/**
 * Root Redux store.
 * Phase 2: auth slice (current user + token bookkeeping).
 * Future phases add: ui, compare, etc.
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: process.env.NEXT_PUBLIC_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
