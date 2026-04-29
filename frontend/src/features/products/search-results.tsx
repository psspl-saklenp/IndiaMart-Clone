'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { ProductCard } from '@/components/product/product-card';
import { listProducts } from '@/features/products/api';

export function SearchResults({ q }: { q: string }) {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['search', { q, page }],
    queryFn: () => listProducts({ q, page, limit: 24, sort: 'createdAt', order: 'desc' }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      {isLoading && <p className="text-sm text-ink-500">Searching…</p>}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Search failed'}
        </div>
      )}

      {data && (
        <p className="text-xs text-ink-500">
          {data.meta.total} match{data.meta.total === 1 ? '' : 'es'}
        </p>
      )}

      {data && data.data.length === 0 && !isLoading && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
          No products match this query.
        </p>
      )}

      {data && data.data.length > 0 && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {data.data.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {data && (
        <Pagination
          page={data.meta.page ?? 1}
          totalPages={data.meta.totalPages ?? 1}
          onChange={setPage}
        />
      )}
    </div>
  );
}
