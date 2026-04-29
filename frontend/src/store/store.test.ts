import { describe, it, expect } from 'vitest';

import { store } from './index';

describe('redux store', () => {
  it('boots with the auth slice in the unauthenticated/idle state', () => {
    const state = store.getState();
    expect(state).toHaveProperty('auth');
    expect(state.auth.user).toBeNull();
    expect(['idle', 'unauthenticated']).toContain(state.auth.status);
  });
});
