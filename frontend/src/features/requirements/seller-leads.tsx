'use client';

import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useMemo, useState, type FormEvent } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { Select } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { listCategoryTree } from '@/features/categories/api';
import { listRequirements, respondToRequirement } from '@/features/requirements/api';
import type { Category } from '@/types/catalog';
import type { Requirement } from '@/types/engagement';

interface FlatOption {
  value: string;
  label: string;
}

function flatten(tree: Category[], depth = 0, out: FlatOption[] = []): FlatOption[] {
  for (const c of tree) {
    out.push({ value: c.id, label: `${'  '.repeat(depth)}${c.name}` });
    if (c.children?.length) flatten(c.children, depth + 1, out);
  }
  return out;
}

export function SellerLeads() {
  const [page, setPage] = useState(1);
  const [categoryId, setCategoryId] = useState('');
  const [responding, setResponding] = useState<Requirement | null>(null);

  const treeQ = useQuery({ queryKey: ['categories-tree'], queryFn: listCategoryTree });
  const categoryOptions = useMemo(
    () => [{ value: '', label: 'All categories' }, ...flatten(treeQ.data ?? [])],
    [treeQ.data],
  );

  const listQ = useQuery({
    queryKey: ['leads', { page, categoryId }],
    queryFn: () =>
      listRequirements({
        page,
        limit: 20,
        status: 'open',
        ...(categoryId ? { categoryId } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-3 rounded-lg border border-ink-200 bg-white p-4">
        <div className="min-w-64 flex-1">
          <Select
            name="categoryId"
            label="Filter by category"
            options={categoryOptions}
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
          />
        </div>
      </div>

      {listQ.isLoading && <p className="text-sm text-ink-500">Loading…</p>}
      {listQ.data && listQ.data.data.length === 0 && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-12 text-center text-sm text-ink-500">
          No open requirements right now.
        </p>
      )}

      {listQ.data && listQ.data.data.length > 0 && (
        <ul className="space-y-3">
          {listQ.data.data.map((r) => (
            <li
              key={r.id}
              className="rounded-lg border border-ink-200 bg-white p-4 hover:shadow-[var(--shadow-card-hover)]"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-semibold text-ink-900">{r.title}</p>
                    <Badge tone="info">{r.category.name}</Badge>
                    {r.locationCity && <Badge tone="neutral">{r.locationCity}</Badge>}
                  </div>
                  <p className="mt-2 line-clamp-3 text-sm text-ink-700">{r.description}</p>
                  <p className="mt-2 text-xs text-ink-500">
                    Posted by {r.buyer.name} · {new Date(r.createdAt).toLocaleString()} ·{' '}
                    {r.responseCount} response{r.responseCount === 1 ? '' : 's'}
                    {r.quantity != null && (
                      <>
                        {' · '}Qty {r.quantity} {r.unit ?? ''}
                      </>
                    )}
                    {r.expectedPrice && (
                      <>
                        {' · '}Target ₹
                        {Number(r.expectedPrice).toLocaleString('en-IN', {
                          maximumFractionDigits: 2,
                        })}
                      </>
                    )}
                  </p>
                </div>
                <Button onClick={() => setResponding(r)}>Respond</Button>
              </div>
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

      {responding && (
        <RespondModal requirement={responding} onClose={() => setResponding(null)} />
      )}
    </div>
  );
}

function RespondModal({
  requirement,
  onClose,
}: {
  requirement: Requirement;
  onClose: () => void;
}) {
  const router = useRouter();
  const qc = useQueryClient();
  const [message, setMessage] = useState(
    `Hi, thanks for posting "${requirement.title}". We can supply this — happy to share a detailed quote.`,
  );

  const mut = useMutation({
    mutationFn: () => respondToRequirement(requirement.id, { message: message.trim() }),
    onSuccess: ({ inquiryId }) => {
      qc.invalidateQueries({ queryKey: ['leads'] });
      qc.invalidateQueries({ queryKey: ['inquiries'] });
      qc.invalidateQueries({ queryKey: ['inquiry-counts'] });
      onClose();
      router.push(`/seller/inquiries/${inquiryId}`);
    },
  });

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!message.trim()) return;
    mut.mutate();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-ink-500">Respond to</p>
            <h2 className="text-lg font-semibold text-ink-900">{requirement.title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-m-2 rounded p-2 text-ink-500 hover:bg-ink-100"
          >
            ✕
          </button>
        </div>

        <form onSubmit={onSubmit} className="mt-4 space-y-3">
          <Textarea
            name="message"
            label="Your message to the buyer"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            required
          />
          {mut.isError && (
            <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {mut.error instanceof Error ? mut.error.message : 'Send failed'}
            </p>
          )}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={mut.isPending} disabled={!message.trim()}>
              Send response
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
