import slugifyLib from 'slugify';

const SLUG_OPTIONS = {
  lower: true,
  strict: true,
  trim: true,
  locale: 'en',
} as const;

/**
 * Generates a URL-safe slug from a string. Strips accents, punctuation,
 * collapses whitespace.
 */
export function toSlug(value: string): string {
  return slugifyLib(value, SLUG_OPTIONS);
}

/**
 * Generates a unique slug by checking the provided existence-checker.
 * Tries the base slug first, then `-2`, `-3`, ... up to `maxAttempts`.
 * On exhaustion, appends a 6-char random suffix.
 */
export async function uniqueSlug(
  base: string,
  exists: (candidate: string) => Promise<boolean>,
  maxAttempts = 10,
): Promise<string> {
  const seed = toSlug(base) || 'item';
  if (!(await exists(seed))) return seed;

  for (let i = 2; i <= maxAttempts; i++) {
    const candidate = `${seed}-${i}`;
    if (!(await exists(candidate))) return candidate;
  }

  const suffix = Math.random().toString(36).slice(2, 8);
  return `${seed}-${suffix}`;
}
