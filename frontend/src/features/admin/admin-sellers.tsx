'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { setSupplierVerified } from '@/features/admin/api';
import { listSellers } from '@/features/sellers/api';

export function AdminSellers() {
  const qc = useQueryClient();
  const [page, setPage] = useState(1);
  const [q, setQ] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const listQ = useQuery({
    queryKey: ['admin-sellers', { page, q, verifiedOnly }],
    queryFn: () =>
      listSellers({
        page,
        limit: 20,
        ...(q ? { q } : {}),
        ...(verifiedOnly ? { verified: true } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const verifyMut = useMutation({
    mutationFn: ({ slug, next }: { slug: string; next: boolean }) =>
      setSupplierVerified(slug, next),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-sellers'] }),
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Suppliers</h1>
        <p className="mt-1 text-sm text-ink-500">Mark suppliers as verified.</p>
      </div>

      <div className="flex flex-wrap gap-3 rounded-lg border border-ink-200 bg-white p-4">
        <input
          type="search"
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setPage(1);
          }}
          placeholder="Search by company name"
          className="w-64 rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <label className="flex items-center gap-2 text-sm text-ink-700">
          <input
            type="checkbox"
            checked={verifiedOnly}
            onChange={(e) => {
              setVerifiedOnly(e.target.checked);
              setPage(1);
            }}
            className="size-4 rounded border-ink-300"
          />
          Verified only
        </label>
      </div>

      {listQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
      {listQ.data && listQ.data.data.length === 0 && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-8 text-center text-sm text-ink-500">
          No suppliers match.
        </p>
      )}

      {listQ.data && listQ.data.data.length > 0 && (
        <ul className="divide-y divide-ink-200 overflow-hidden rounded-lg border border-ink-200 bg-white">
          {listQ.data.data.map((s) => (
            <li key={s.id} className="flex items-center gap-4 p-4">
              <div className="size-10 flex-shrink-0 rounded-md bg-brand-100 text-center text-sm font-semibold leading-10 text-brand-700">
                {(s.companyName ?? s.name).charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/supplier/${s.slug}`}
                    className="truncate text-sm font-semibold text-ink-900 hover:underline"
                  >
                    {s.companyName ?? s.name}
                  </Link>
                  {s.isVerifiedSupplier && <Badge tone="brand">Verified</Badge>}
                </div>
                <p className="truncate text-xs text-ink-500">
                  {s.businessType ?? '—'} · {s.ratingCount} reviews
                </p>
              </div>
              <Button
                type="button"
                variant={s.isVerifiedSupplier ? 'secondary' : 'primary'}
                size="sm"
                loading={verifyMut.isPending && verifyMut.variables?.slug === s.slug}
                onClick={() =>
                  verifyMut.mutate({ slug: s.slug, next: !s.isVerifiedSupplier })
                }
              >
                {s.isVerifiedSupplier ? 'Unverify' : 'Verify'}
              </Button>
            </li>
          ))}
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
