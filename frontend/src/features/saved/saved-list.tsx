'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';

import { ProductCard } from '@/components/product/product-card';
import { listSaved } from '@/features/saved/api';

export function SavedList() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['saved-products'],
    queryFn: listSaved,
  });

  if (isLoading) return <p className="text-sm text-ink-500">Loading…</p>;
  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Failed to load saved products'}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-12 text-center">
        <p className="text-sm text-ink-500">You haven&apos;t saved any products yet.</p>
        <Link href="/" className="mt-3 inline-block text-sm font-medium text-brand-700 hover:underline">
          Browse the catalog →
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {data.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
