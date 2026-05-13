'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { deleteUser, listUsers, updateUser } from '@/features/admin/api';
import { cn } from '@/lib/utils';
import type { Role } from '@/types/api';

const ROLE_OPTIONS: { value: '' | Role; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Admin' },
];

const ROLE_COLORS: Record<Role, string> = {
  buyer: 'bg-sky-100 text-sky-800',
  seller: 'bg-emerald-100 text-emerald-800',
  admin: 'bg-purple-100 text-purple-800',
};

export function AdminUsers() {
  const qc = useQueryClient();
  const { user: viewer } = useAuth();
  const [page, setPage] = useState(1);
  const [role, setRole] = useState<'' | Role>('');
  const [q, setQ] = useState('');
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  const listQ = useQuery({
    queryKey: ['admin-users', { page, role, q, verifiedOnly }],
    queryFn: () =>
      listUsers({
        page,
        limit: 20,
        ...(role ? { role } : {}),
        ...(q ? { q } : {}),
        ...(verifiedOnly ? { verified: true } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const updateMut = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateUser>[1] }) =>
      updateUser(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => deleteUser(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-users'] }),
  });

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Users</h1>
        <p className="mt-1 text-sm text-ink-500">
          Promote / demote roles, mark accounts as verified, or soft-delete bad actors.
        </p>
      </div>

      {/* Filters */}
      <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
        <div className="flex items-center gap-2 border-b border-ink-100 bg-gradient-to-r from-ink-50 to-white px-5 py-3">
          <span className="text-sm" aria-hidden>🔍</span>
          <h2 className="text-sm font-bold text-ink-900">Filter users</h2>
          {listQ.data && (
            <span className="ml-auto text-xs font-medium text-ink-500">
              {listQ.data.meta.total} users
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
          <Select
            name="role"
            label="Role"
            value={role}
            onChange={(e) => {
              setRole(e.target.value as '' | Role);
              setPage(1);
            }}
            options={ROLE_OPTIONS}
          />
          <div className="space-y-1.5">
            <label htmlFor="q" className="block text-xs font-semibold text-ink-700 tracking-wide">
              Search
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-ink-400">
                <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                  <circle cx="7" cy="7" r="4.5" />
                  <path d="M10.5 10.5l3 3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                id="q"
                type="search"
                value={q}
                onChange={(e) => {
                  setQ(e.target.value);
                  setPage(1);
                }}
                placeholder="Search by email or name…"
                className="block w-full rounded-lg border border-ink-200 bg-white py-2.5 pl-9 pr-3 text-sm transition-all duration-150 focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-100"
              />
            </div>
          </div>
          <label className="flex items-end gap-2.5 pb-0.5 text-sm font-medium text-ink-700 cursor-pointer">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => {
                setVerifiedOnly(e.target.checked);
                setPage(1);
              }}
              className="size-4 rounded border-ink-300 text-brand-600 focus:ring-brand-400"
            />
            Verified only
          </label>
        </div>
      </div>

      {/* Loading skeleton */}
      {listQ.isLoading && (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-4">
              <div className="size-10 rounded-full skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-1/3 rounded skeleton" />
                <div className="h-2.5 w-1/2 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {listQ.data && listQ.data.data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-4 py-12 text-center">
          <span className="text-3xl" aria-hidden>👥</span>
          <p className="mt-2 text-sm font-semibold text-ink-700">No users match these filters</p>
          <p className="mt-1 text-xs text-ink-500">Try adjusting your search criteria.</p>
        </div>
      )}

      {listQ.data && listQ.data.data.length > 0 && (
        <div className="overflow-hidden rounded-xl border border-ink-200 bg-white shadow-sm">
          <ul className="divide-y divide-ink-100">
            {listQ.data.data.map((u) => {
              const isSelf = u.id === viewer?.id;
              return (
                <li key={u.id} className="flex flex-wrap items-center gap-3 p-4 transition-colors hover:bg-ink-50">
                  {/* Avatar */}
                  <div className={cn(
                    'flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white shadow-sm',
                    u.role === 'admin' ? 'bg-gradient-to-br from-purple-500 to-purple-700' :
                    u.role === 'seller' ? 'bg-gradient-to-br from-brand-500 to-brand-700' :
                    'bg-gradient-to-br from-sky-500 to-sky-700',
                  )}>
                    {u.name.charAt(0).toUpperCase()}
                  </div>

                  {/* User info */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink-900">{u.name}</p>
                      <span className={cn('rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide', ROLE_COLORS[u.role])}>
                        {u.role}
                      </span>
                      {u.isVerified && <Badge tone="success" dot>Verified</Badge>}
                      {isSelf && <Badge tone="info">You</Badge>}
                    </div>
                    <p className="truncate text-xs text-ink-500">{u.email}</p>
                    <p className="text-[11px] text-ink-400">
                      Joined {new Date(u.createdAt).toLocaleDateString()} · last login{' '}
                      {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-wrap items-center gap-2">
                    <Select
                      name={`role-${u.id}`}
                      className="w-28 text-xs"
                      value={u.role}
                      options={[
                        { value: 'buyer', label: 'Buyer' },
                        { value: 'seller', label: 'Seller' },
                        { value: 'admin', label: 'Admin' },
                      ]}
                      disabled={updateMut.isPending || isSelf}
                      onChange={(e) =>
                        updateMut.mutate({ id: u.id, payload: { role: e.target.value as Role } })
                      }
                    />
                    <Button
                      type="button"
                      variant={u.isVerified ? 'secondary' : 'primary'}
                      size="sm"
                      loading={
                        updateMut.isPending &&
                        updateMut.variables?.id === u.id &&
                        updateMut.variables?.payload.isVerified !== undefined
                      }
                      onClick={() =>
                        updateMut.mutate({
                          id: u.id,
                          payload: { isVerified: !u.isVerified },
                        })
                      }
                    >
                      {u.isVerified ? 'Unverify' : 'Verify'}
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      disabled={isSelf}
                      loading={deleteMut.isPending && deleteMut.variables === u.id}
                      onClick={() => {
                        if (confirm(`Delete ${u.email}? They will be soft-removed.`))
                          deleteMut.mutate(u.id);
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
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
