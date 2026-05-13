'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';

/**
 * Large hero search bar on the public homepage.
 * Submits to /search?q=...
 */
export function HomeHeroSearch() {
  const router = useRouter();
  const [value, setValue] = useState('');

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const q = value.trim();
    if (!q) return;
    router.push(`/search?q=${encodeURIComponent(q)}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      className="flex w-full overflow-hidden rounded-xl border-2 border-white/30 bg-white/10 backdrop-blur-sm focus-within:border-white/60"
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search for products, suppliers, categories…"
        aria-label="Search products and suppliers"
        className="flex-1 bg-transparent px-4 py-3 text-sm text-white placeholder:text-white/50 focus:outline-none sm:text-base"
      />
      <button
        type="submit"
        className="bg-yellow-400 px-6 py-3 text-sm font-bold text-ink-900 transition-colors hover:bg-yellow-300"
      >
        Search
      </button>
    </form>
  );
}
