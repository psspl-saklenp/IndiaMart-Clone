import { describe, it, expect } from 'vitest';

import { store } from './index';
import { closeSellerSignup, openSellerSignup } from './slices/ui.slice';

describe('redux store', () => {
  it('boots with the auth slice in the unauthenticated/idle state', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state.auth.user).toBeNull();
    expect(['idle', 'unauthenticated']).toContain(state.auth.status);
  });

  it('toggles the seller signup modal via ui slice actions', () => {
    expect(store.getState().ui.isSellerSignupOpen).toBe(false);
    store.dispatch(openSellerSignup());
    expect(store.getState().ui.isSellerSignupOpen).toBe(true);
    store.dispatch(closeSellerSignup());
    expect(store.getState().ui.isSellerSignupOpen).toBe(false);
  });
});
