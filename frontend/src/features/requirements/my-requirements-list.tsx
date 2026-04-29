'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { closeRequirement, listMyRequirements } from '@/features/requirements/api';

export function MyRequirementsList() {
  const qc = useQueryClient();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['my-requirements'],
    queryFn: listMyRequirements,
  });

  const closeMut = useMutation({
    mutationFn: (id: string) => closeRequirement(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['my-requirements'] }),
  });

  if (isLoading) return <p className="text-sm text-ink-500">Loading…</p>;
  if (isError) {
    return (
      <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
        {error instanceof Error ? error.message : 'Failed to load'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <Link href="/requirements/new">
          <Button>+ Post a new requirement</Button>
        </Link>
      </div>

      {(!data || data.length === 0) && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-12 text-center text-sm text-ink-500">
          You haven&apos;t posted any requirements yet.
        </p>
      )}

      {data && data.length > 0 && (
        <ul className="divide-y divide-ink-200 overflow-hidden rounded-lg border border-ink-200 bg-white">
          {data.map((r) => (
            <li key={r.id} className="flex flex-wrap items-start gap-3 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate text-sm font-semibold text-ink-900">{r.title}</p>
                  <Badge tone={r.status === 'open' ? 'success' : 'neutral'}>{r.status}</Badge>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-ink-600">{r.description}</p>
                <p className="mt-1 text-[11px] text-ink-400">
                  {r.category.name}
                  {r.quantity != null && <> · {r.quantity} {r.unit ?? ''}</>}
                  {' · '}
                  {r.responseCount} response{r.responseCount === 1 ? '' : 's'}
                  {' · '}
                  Posted {new Date(r.createdAt).toLocaleDateString()}
                </p>
              </div>
              {r.status === 'open' && (
                <Button
                  type="button"
                  variant="danger"
                  size="sm"
                  loading={closeMut.isPending && closeMut.variables === r.id}
                  onClick={() => {
                    if (confirm('Close this requirement? Suppliers won\u2019t be able to respond.'))
                      closeMut.mutate(r.id);
                  }}
                >
                  Close
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
