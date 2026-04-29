'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Pagination } from '@/components/ui/pagination';
import { ProductCard } from '@/components/product/product-card';
import { SupplierCard } from '@/components/supplier/supplier-card';
import { search } from '@/features/search/api';
import type { SearchResponse, SearchType } from '@/types/search';

const TABS: { id: SearchType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'products', label: 'Products' },
  { id: 'suppliers', label: 'Suppliers' },
  { id: 'categories', label: 'Categories' },
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
      <nav role="tablist" className="flex gap-2 border-b border-ink-200">
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
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium transition-colors ${
                active
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-600 hover:text-ink-900'
              }`}
            >
              {tab.label}
              {count !== undefined && (
                <span className="ml-1.5 rounded-full bg-ink-100 px-1.5 py-0.5 text-[10px] text-ink-600">
                  {count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {isLoading && <p className="text-sm text-ink-500">Searching…</p>}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
                    className="block rounded-lg border border-ink-200 bg-white p-4 hover:shadow-[var(--shadow-card-hover)]"
                  >
                    <p className="text-sm font-medium text-ink-900">{c.name}</p>
                    {c.description && (
                      <p className="mt-1 line-clamp-2 text-xs text-ink-500">
                        {c.description}
                      </p>
                    )}
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
    return <EmptyMsg label={`Nothing matched “${q}”. Try a different keyword.`} />;
  }

  return (
    <div className="space-y-10">
      {categories.length > 0 && (
        <section className="space-y-3">
          <SectionHeader
            title="Categories"
            total={data.categories?.length ?? 0}
            onShowMore={() => onShowMore('categories')}
          />
          <ul className="flex flex-wrap gap-2">
            {categories.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/category/${c.slug}`}
                  className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 hover:border-ink-300 hover:text-ink-900"
                >
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
  total,
  onShowMore,
}: {
  title: string;
  total: number;
  onShowMore: () => void;
}) {
  return (
    <div className="flex items-baseline justify-between">
      <h2 className="text-base font-semibold text-ink-900">
        {title}
        <span className="ml-2 text-xs font-normal text-ink-500">{total} total</span>
      </h2>
      {total > 0 && (
        <button
          type="button"
          onClick={onShowMore}
          className="text-xs font-medium text-brand-700 hover:underline"
        >
          See all →
        </button>
      )}
    </div>
  );
}

function EmptyMsg({ label }: { label: string }) {
  return (
    <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
      {label}
    </p>
  );
}

