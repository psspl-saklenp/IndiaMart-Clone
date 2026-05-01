import type { Metadata } from 'next';

import { SearchResults } from '@/features/products/search-results';

export const metadata: Metadata = {
  title: 'Search',
};

interface Props {
  searchParams: Promise<{ q?: string }>;
}

export default async function SearchPage({ searchParams }: Props) {
  const { q = '' } = await searchParams;

  return (
    <div className="space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-ink-500">Search</p>
        <h1 className="text-2xl font-bold text-ink-900">
          {q ? <>Results for &ldquo;{q}&rdquo;</> : 'Type something in the search box'}
        </h1>
      </header>
      {q ? <SearchResults q={q} /> : null}
    </div>
  );
}
