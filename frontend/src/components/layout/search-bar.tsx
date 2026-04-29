'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, type FormEvent } from 'react';

interface Props {
  className?: string;
  placeholder?: string;
}

export function SearchBar({
  className = '',
  placeholder = 'Search products, suppliers, categories…',
}: Props) {
  const router = useRouter();
  const params = useSearchParams();
  const [value, setValue] = useState(params.get('q') ?? '');

  useEffect(() => {
    setValue(params.get('q') ?? '');
  }, [params]);

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
      className={`flex w-full items-center overflow-hidden rounded-md border border-ink-200 bg-white text-sm focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-200 ${className}`}
    >
      <input
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={placeholder}
        aria-label="Search"
        className="flex-1 bg-transparent px-3 py-1.5 text-ink-900 placeholder:text-ink-400 focus:outline-none"
      />
      <button
        type="submit"
        className="h-full bg-brand-600 px-4 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
      >
        Search
      </button>
    </form>
  );
}
