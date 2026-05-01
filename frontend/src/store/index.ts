import { configureStore } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { authReducer } from './slices/auth.slice';
import { uiReducer } from './slices/ui.slice';

/**
 * Root Redux store.
 * - auth: current user + token bookkeeping.
 * - ui: cross-component UI state (e.g. the seller signup modal).
 */
export const store = configureStore({
  reducer: {
    auth: authReducer,
    ui: uiReducer,
  },
  devTools: process.env.NEXT_PUBLIC_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
