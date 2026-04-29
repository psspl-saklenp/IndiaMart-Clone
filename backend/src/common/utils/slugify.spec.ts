import { toSlug, uniqueSlug } from './slugify';

describe('slugify utils', () => {
  describe('toSlug', () => {
    it('lowercases, strips punctuation, collapses spaces', () => {
      expect(toSlug('Industrial Ball Bearing 6203!')).toBe('industrial-ball-bearing-6203');
    });

    it('drops accents', () => {
      expect(toSlug('Café au lait')).toBe('cafe-au-lait');
    });

    it('returns empty when input is only punctuation', () => {
      expect(toSlug('!!! ?')).toBe('');
    });
  });

  describe('uniqueSlug', () => {
    it('returns the base slug when nothing collides', async () => {
      const slug = await uniqueSlug('Hello World', async () => false);
      expect(slug).toBe('hello-world');
    });

    it('falls back to "item" if the base produces an empty slug', async () => {
      const slug = await uniqueSlug('!!!', async () => false);
      expect(slug).toBe('item');
    });

    it('appends -2, -3 ... when slugs collide', async () => {
      const taken = new Set(['hello-world', 'hello-world-2', 'hello-world-3']);
      const slug = await uniqueSlug('Hello World', async (c) => taken.has(c));
      expect(slug).toBe('hello-world-4');
    });

    it('falls back to a random suffix after maxAttempts collisions', async () => {
      const slug = await uniqueSlug(
        'Hello World',
        async () => true,
        3,
      );
      expect(slug).toMatch(/^hello-world-[a-z0-9]{6}$/);
    });
  });
});
