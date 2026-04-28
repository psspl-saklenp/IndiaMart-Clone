import { describe, it, expect } from 'vitest';

import { store } from './index';

describe('redux store', () => {
  it('boots with the system slice present', () => {
    const state = store.getState();
    expect(state).toHaveProperty('system');
    expect(typeof state.system.bootedAt).toBe('number');
  });
});
