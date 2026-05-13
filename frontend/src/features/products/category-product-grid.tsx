'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import { useState } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { ProductCard } from '@/components/product/product-card';
import { Select } from '@/components/ui/select';
import { listProducts } from '@/features/products/api';
import { cn } from '@/lib/utils';

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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

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
    <div className="space-y-5">
      {/* Filters bar */}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-5 py-3">
          <span className="text-sm" aria-hidden>🔍</span>
          <h2 className="text-sm font-bold text-ink-900">Filter & Sort</h2>
          {data && (
            <span className="ml-auto text-xs font-medium text-ink-500">
              {data.meta.total} product{data.meta.total === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-4">
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
            <label className="block text-xs font-semibold text-ink-700 tracking-wide" htmlFor="minPrice">
              Min price (₹)
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
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm transition-all duration-150 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="0"
            />
          </div>
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-ink-700 tracking-wide" htmlFor="maxPrice">
              Max price (₹)
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
              className="block w-full rounded-lg border border-ink-200 bg-white px-3 py-2.5 text-sm transition-all duration-150 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              placeholder="any"
            />
          </div>
          {/* View mode toggle */}
          <div className="flex items-end gap-2">
            <div className="flex rounded-xl border border-ink-200 bg-ink-50 p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={cn(
                  'rounded-lg p-2 transition-all duration-150',
                  viewMode === 'grid' ? 'bg-white shadow-sm text-brand-700' : 'text-ink-500 hover:text-ink-700',
                )}
                aria-label="Grid view"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="currentColor" aria-hidden>
                  <rect x="1" y="1" width="6" height="6" rx="1" />
                  <rect x="9" y="1" width="6" height="6" rx="1" />
                  <rect x="1" y="9" width="6" height="6" rx="1" />
                  <rect x="9" y="9" width="6" height="6" rx="1" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={cn(
                  'rounded-lg p-2 transition-all duration-150',
                  viewMode === 'list' ? 'bg-white shadow-sm text-brand-700' : 'text-ink-500 hover:text-ink-700',
                )}
                aria-label="List view"
              >
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <path d="M2 4h12M2 8h12M2 12h12" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Loading skeleton */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-ink-200 bg-white">
              <div className="aspect-[4/3] skeleton" />
              <div className="space-y-2 p-3">
                <div className="h-3.5 w-3/4 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
                <div className="h-3 w-2/3 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span aria-hidden>⚠️</span>
          Failed to load products: {error instanceof Error ? error.message : 'unknown error'}
        </div>
      )}

      {data && data.data.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-4 py-16 text-center">
          <span className="text-4xl" aria-hidden>📦</span>
          <p className="mt-3 text-sm font-semibold text-ink-700">No products in this category yet</p>
          <p className="mt-1 text-xs text-ink-500">Check back later or browse other categories.</p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <div className={cn(
          viewMode === 'grid'
            ? 'grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4'
            : 'flex flex-col gap-3',
        )}>
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
