import { configureStore, createSlice } from '@reduxjs/toolkit';
import { type TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

/**
 * Root Redux store. Slices added per phase:
 *   - Phase 2: auth (current user, token bookkeeping)
 *   - Phase 4: ui (global modals, toast queue)
 *   - Phase 6: compare (compare-list of products)
 *
 * The `system` slice is a phase-1 placeholder so the store has at least one
 * reducer. It will be repurposed in Phase 4 for cross-cutting UI flags.
 */
const systemSlice = createSlice({
  name: 'system',
  initialState: { bootedAt: Date.now() },
  reducers: {},
});

export const store = configureStore({
  reducer: {
    system: systemSlice.reducer,
  },
  devTools: process.env.NEXT_PUBLIC_ENV !== 'production',
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
