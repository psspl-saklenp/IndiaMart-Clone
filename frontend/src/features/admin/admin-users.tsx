'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { deleteUser, listUsers, updateUser } from '@/features/admin/api';
import type { Role } from '@/types/api';

const ROLE_OPTIONS: { value: '' | Role; label: string }[] = [
  { value: '', label: 'All roles' },
  { value: 'buyer', label: 'Buyer' },
  { value: 'seller', label: 'Seller' },
  { value: 'admin', label: 'Admin' },
];

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
      <div>
        <h1 className="text-2xl font-bold text-ink-900">Users</h1>
        <p className="mt-1 text-sm text-ink-500">
          Promote / demote roles, mark accounts as verified, or soft-delete bad actors.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 rounded-lg border border-ink-200 bg-white p-4 sm:grid-cols-3">
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
          <label htmlFor="q" className="block text-xs font-medium text-ink-700">
            Search
          </label>
          <input
            id="q"
            type="search"
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="email or name"
            className="block w-full rounded-md border border-ink-200 bg-white px-3 py-2 text-sm focus:border-brand-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
          />
        </div>
        <label className="flex items-end gap-2 text-sm text-ink-700">
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
          No users match these filters.
        </p>
      )}

      {listQ.data && listQ.data.data.length > 0 && (
        <ul className="divide-y divide-ink-200 overflow-hidden rounded-lg border border-ink-200 bg-white">
          {listQ.data.data.map((u) => {
            const isSelf = u.id === viewer?.id;
            return (
              <li key={u.id} className="flex flex-wrap items-center gap-3 p-4">
                <div className="size-9 flex-shrink-0 rounded-full bg-brand-100 text-center text-sm font-semibold leading-9 text-brand-700">
                  {u.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink-900">{u.name}</p>
                    {u.isVerified && <Badge tone="success">Verified</Badge>}
                    {isSelf && <Badge tone="info">You</Badge>}
                  </div>
                  <p className="truncate text-xs text-ink-500">{u.email}</p>
                  <p className="text-[11px] text-ink-400">
                    Joined {new Date(u.createdAt).toLocaleDateString()} · last login{' '}
                    {u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleString() : '—'}
                  </p>
                </div>

                <Select
                  name={`role-${u.id}`}
                  className="w-32"
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
