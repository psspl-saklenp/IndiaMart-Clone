'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { ProductCard } from '@/components/product/product-card';
import { SupplierCard } from '@/components/supplier/supplier-card';
import { search } from '@/features/search/api';
import { cn } from '@/lib/utils';
import type { SearchResponse, SearchType } from '@/types/search';

const TABS: { id: SearchType; label: string; icon: string }[] = [
  { id: 'all', label: 'All', icon: '🔍' },
  { id: 'products', label: 'Products', icon: '📦' },
  { id: 'suppliers', label: 'Suppliers', icon: '🏪' },
  { id: 'categories', label: 'Categories', icon: '🗂️' },
];

export function SearchResults({ q }: { q: string }) {
  const [type, setType] = useState<SearchType>('all');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['search', { q, type, page }],
    queryFn: () => search({ q, type, page, limit: 24 }),
    placeholderData: keepPreviousData,
  });

  function selectTab(next: SearchType) {
    setType(next);
    setPage(1);
  }

  const totalAcross =
    (data?.products?.meta.total ?? 0) +
    (data?.suppliers?.meta.total ?? 0) +
    (data?.categories?.length ?? 0);

  return (
    <div className="space-y-6">
      {/* Search header */}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        <div className="flex items-center gap-3 border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-5 py-3.5">
          <span className="text-lg" aria-hidden>🔍</span>
          <div>
            <p className="text-sm font-bold text-ink-900">
              Search results for <span className="text-brand-700">&ldquo;{q}&rdquo;</span>
            </p>
            {data && (
              <p className="text-xs text-ink-500">{totalAcross} results found</p>
            )}
          </div>
        </div>

        {/* Tabs */}
        <nav role="tablist" className="flex gap-1 p-2">
          {TABS.map((tab) => {
            const active = tab.id === type;
            const count =
              tab.id === 'products'
                ? data?.products?.meta.total
                : tab.id === 'suppliers'
                  ? data?.suppliers?.meta.total
                  : tab.id === 'categories'
                    ? data?.categories?.length
                    : totalAcross;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => selectTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold transition-all duration-150',
                  active
                    ? 'bg-brand-600 text-white shadow-sm'
                    : 'text-ink-600 hover:bg-ink-50 hover:text-ink-900',
                )}
              >
                <span aria-hidden>{tab.icon}</span>
                {tab.label}
                {count !== undefined && (
                  <span className={cn(
                    'rounded-full px-1.5 py-0.5 text-[10px] font-bold',
                    active ? 'bg-white/20 text-white' : 'bg-ink-100 text-ink-600',
                  )}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-ink-200 bg-white">
              <div className="aspect-[4/3] skeleton" />
              <div className="space-y-2 p-3">
                <div className="h-3.5 w-3/4 rounded skeleton" />
                <div className="h-3 w-1/2 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span aria-hidden>⚠️</span>
          {error instanceof Error ? error.message : 'Search failed'}
        </div>
      )}

      {data && type === 'all' && (
        <AllTab data={data} q={q} onShowMore={selectTab} />
      )}

      {data && type === 'products' && data.products && (
        <>
          {data.products.data.length === 0 ? (
            <EmptyMsg label="No products match this query." />
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {data.products.data.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
          <Pagination
            page={data.products.meta.page ?? 1}
            totalPages={data.products.meta.totalPages ?? 1}
            onChange={setPage}
          />
        </>
      )}

      {data && type === 'suppliers' && data.suppliers && (
        <>
          {data.suppliers.data.length === 0 ? (
            <EmptyMsg label="No suppliers match this query." />
          ) : (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {data.suppliers.data.map((supplier) => (
                <SupplierCard key={supplier.id} supplier={supplier} />
              ))}
            </div>
          )}
          <Pagination
            page={data.suppliers.meta.page ?? 1}
            totalPages={data.suppliers.meta.totalPages ?? 1}
            onChange={setPage}
          />
        </>
      )}

      {data && type === 'categories' && (
        <>
          {!data.categories?.length ? (
            <EmptyMsg label="No categories match this query." />
          ) : (
            <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {data.categories.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/category/${c.slug}`}
                    className="flex items-center gap-3 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-150 hover:border-brand-200 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-xl" aria-hidden>🗂️</span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">{c.name}</p>
                      {c.description && (
                        <p className="mt-0.5 line-clamp-1 text-xs text-ink-500">
                          {c.description}
                        </p>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
    </div>
  );
}

function AllTab({
  data,
  q,
  onShowMore,
}: {
  data: SearchResponse;
  q: string;
  onShowMore: (t: SearchType) => void;
}) {
  const products = data.products?.data.slice(0, 8) ?? [];
  const suppliers = data.suppliers?.data.slice(0, 4) ?? [];
  const categories = data.categories?.slice(0, 6) ?? [];

  if (products.length === 0 && suppliers.length === 0 && categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-4 py-16 text-center">
        <span className="text-4xl" aria-hidden>🔍</span>
        <p className="mt-3 text-sm font-semibold text-ink-700">No results found</p>
        <p className="mt-1 text-xs text-ink-500">Nothing matched &ldquo;{q}&rdquo;. Try a different keyword.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {categories.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Categories"
            icon="🗂️"
            total={data.categories?.length ?? 0}
            onShowMore={() => onShowMore('categories')}
          />
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="flex items-center gap-1.5 rounded-xl border border-ink-200 bg-white px-3 py-2 text-xs font-semibold text-ink-700 transition-all duration-150 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700"
                >
                  <span aria-hidden>🗂️</span>
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      {products.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Products"
            icon="📦"
            total={data.products?.meta.total ?? 0}
            onShowMore={() => onShowMore('products')}
          />
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {suppliers.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Suppliers"
            icon="🏪"
            total={data.suppliers?.meta.total ?? 0}
            onShowMore={() => onShowMore('suppliers')}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {suppliers.map((s) => (
              <SupplierCard key={s.id} supplier={s} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function SectionHeader({
  title,
  icon,
  total,
  onShowMore,
}: {
  title: string;
  icon: string;
  total: number;
  onShowMore: () => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <span className="text-base" aria-hidden>{icon}</span>
        <h2 className="text-base font-bold text-ink-900">
          {title}
        </h2>
        <span className="rounded-full bg-ink-100 px-2 py-0.5 text-xs font-medium text-ink-600">
          {total}
        </span>
      </div>
      {total > 0 && (
        <button
          type="button"
          onClick={onShowMore}
          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
        >
          See all →
        </button>
      )}
    </div>
  );
}

function EmptyMsg({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-4 py-12 text-center">
      <span className="text-3xl" aria-hidden>🔍</span>
      <p className="mt-2 text-sm text-ink-500">{label}</p>
    </div>
  );
}
