import { buildMeta } from './pagination';

describe('buildMeta', () => {
  it('computes total pages correctly', () => {
    expect(buildMeta(45, 1, 20)).toEqual({ page: 1, limit: 20, total: 45, totalPages: 3 });
  });

  it('always reports at least one page when total is 0', () => {
    expect(buildMeta(0, 1, 20)).toEqual({ page: 1, limit: 20, total: 0, totalPages: 1 });
  });

  it('handles exact multiples', () => {
    expect(buildMeta(40, 2, 20)).toEqual({ page: 2, limit: 20, total: 40, totalPages: 2 });
  });
});
