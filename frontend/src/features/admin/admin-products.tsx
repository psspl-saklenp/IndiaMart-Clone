'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { moderateProduct } from '@/features/admin/api';
import { listProducts } from '@/features/products/api';

export function AdminProducts() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');

  const listQ = useQuery({
    queryKey: ['admin-products', { page, q }],
    queryFn: () =>
      listProducts({
        page,
        limit: 20,
        ...(q ? { q } : {}),
        sort: 'createdAt',
        order: 'desc',
      }),
    placeholderData: keepPreviousData,
  });

  const modMut = useMutation({
    mutationFn: ({ id, next }: { id: string; next: boolean }) => moderateProduct(id, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Products</h1>
        <p className="mt-1 text-sm text-ink-500">
          Hide problematic listings from buyers without deleting them.
        </p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-ink-200 bg-white p-4">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search by product name or description"
          className="w-80 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
      </div>

      {listQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
      {listQ.data && listQ.data.data.length === 0 && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
          No products match.
        </p>
      )}

      {listQ.data && listQ.data.data.length > 0 && (
        <ul className="divide-y divide-ink-200 overflow-hidden rounded-lg border border-ink-200 bg-white">
          {listQ.data.data.map((p) => {
            const primary = p.images.find((i) => i.isPrimary) ?? p.images[0] ?? null;
            return (
              <li key={p.id} className="flex items-center gap-4 p-4">
                <div className="size-12 flex-shrink-0 overflow-hidden rounded-md bg-ink-100">
                  {primary ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={primary.url}
                      alt={p.name}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/product/${p.slug}`}
                      className="truncate text-sm font-semibold text-ink-900 hover:underline"
                    >
                      {p.name}
                    </Link>
                    {!p.isActive && <Badge tone="warning">Hidden</Badge>}
                  </div>
                  <p className="truncate text-xs text-ink-500">
                    {p.seller.companyName ?? p.seller.name} · {p.category.name} · {p.viewCount} views
                  </p>
                </div>
                <Button
                  type="button"
                  variant={p.isActive ? 'danger' : 'primary'}
                  size="sm"
                  loading={modMut.isPending && modMut.variables?.id === p.id}
                  onClick={() => modMut.mutate({ id: p.id, next: !p.isActive })}
                >
                  {p.isActive ? 'Hide' : 'Restore'}
                </Button>
              </li>
            );
          })}
        </ul>
      )}

      {listQ.data && (
        <Pagination
          page={listQ.data.meta.page ?? 1}
          totalPages={listQ.data.meta.totalPages ?? 1}
          onChange={setPage}
        />
      )}
    </div>
  );
}
