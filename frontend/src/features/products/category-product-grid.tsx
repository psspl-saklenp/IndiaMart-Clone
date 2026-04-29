'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { ProductCard } from '@/components/product/product-card';
import { Select } from '@/components/ui/select';
import { listProducts } from '@/features/products/api';

const SORT_OPTIONS = [
  { value: 'createdAt:desc', label: 'Newest first' },
  { value: 'createdAt:asc', label: 'Oldest first' },
  { value: 'price:asc', label: 'Price: low to high' },
  { value: 'price:desc', label: 'Price: high to low' },
  { value: 'viewCount:desc', label: 'Most viewed' },
];

export function CategoryProductGrid({ categorySlug }: { categorySlug: string }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState('createdAt:desc');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [sortField, sortOrder] = sort.split(':') as [string, 'asc' | 'desc'];

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['products', { categorySlug, page, sort, minPrice, maxPrice }],
    queryFn: () =>
      listProducts({
        category: categorySlug,
        page,
        limit: 24,
        sort: sortField,
        order: sortOrder,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-4">
        <Select
          label="Sort by"
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setPage(1);
          }}
          options={SORT_OPTIONS}
        />
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-ink-700" htmlFor="minPrice">
            Min price
          </label>
          <input
            id="minPrice"
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => {
              setMinPrice(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="0"
          />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-ink-700" htmlFor="maxPrice">
            Max price
          </label>
          <input
            id="maxPrice"
            type="number"
            min={0}
            value={maxPrice}
            onChange={(e) => {
              setMaxPrice(e.target.value);
              setPage(1);
            }}
            className="block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
            placeholder="any"
          />
        </div>
        <div className="flex items-end justify-end text-xs text-ink-500">
          {data ? `${data.meta.total} product${data.meta.total === 1 ? '' : 's'}` : ''}
        </div>
      </div>

      {isLoading && <p className="text-sm text-ink-500">Loading products…</p>}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          Failed to load products: {error instanceof Error ? error.message : 'unknown error'}
        </div>
      )}

      {data && data.data.length === 0 && !isLoading && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
          No products in this category yet.
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
