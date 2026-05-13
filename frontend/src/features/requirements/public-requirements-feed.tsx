'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { useAuth } from '@/hooks/use-auth';
import { listRequirements } from '@/features/requirements/api';
import type { Requirement } from '@/types/engagement';

/**
 * Client component — paginated public requirements feed.
 * Guests can browse all open requirements but must log in to respond.
 */
export function PublicRequirementsFeed() {
  const [page, setPage] = useState(1);
  const { isAuthenticated } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['requirements', 'public', page],
    queryFn: () => listRequirements({ page, limit: 20, status: 'open' }),
    staleTime: 60_000,
  });

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-xl bg-ink-200" />
        ))}
      </div>
    );
  }

  if (isError || !data) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-6 text-center text-sm text-red-700">
        Failed to load requirements. Please try again later.
      </p>
    );
  }

  if (data.data.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-ink-200 bg-white px-4 py-12 text-center">
        <p className="text-sm text-ink-500">No open requirements yet.</p>
        <Link
          href="/requirements/new"
          className="mt-3 inline-block rounded-lg bg-brand-600 px-4 py-2 text-xs font-bold text-white hover:bg-brand-700"
        >
          Post the first requirement →
        </Link>
      </div>
    );
  }

  const { meta } = data;
  const totalPages = meta.total != null && meta.limit != null
    ? Math.ceil(meta.total / meta.limit)
    : 1;

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        {data.data.map((req) => (
          <RequirementRow key={req.id} req={req} isAuthenticated={isAuthenticated} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          <button
            type="button"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 disabled:opacity-40 hover:bg-ink-50"
          >
            ← Prev
          </button>
          <span className="text-xs text-ink-500">
            Page {page} of {totalPages}
          </span>
          <button
            type="button"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="rounded-lg border border-ink-200 bg-white px-3 py-1.5 text-xs font-medium text-ink-700 disabled:opacity-40 hover:bg-ink-50"
          >
            Next →
          </button>
        </div>
      )}
    </div>
  );
}

function RequirementRow({
  req,
  isAuthenticated,
}: {
  req: Requirement;
  isAuthenticated: boolean;
}) {
  const timeAgo = formatTimeAgo(req.createdAt);

  return (
    <div className="flex items-start gap-4 rounded-xl border border-ink-200 bg-white p-4 transition-shadow hover:shadow-sm">
      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-xl">
        📋
      </div>

      <div className="min-w-0 flex-1">
        <p className="font-semibold text-ink-900">{req.title}</p>
        <p className="mt-0.5 text-xs text-ink-500 line-clamp-2">{req.description}</p>
        <div className="mt-2 flex flex-wrap items-center gap-2 text-[10px] text-ink-400">
          <span className="rounded-full bg-ink-100 px-2 py-0.5 font-medium text-ink-600">
            {req.category.name}
          </span>
          {req.quantity && req.unit && (
            <span>
              Qty: {req.quantity} {req.unit}
            </span>
          )}
          {req.expectedPrice && (
            <span>Budget: ₹{Number(req.expectedPrice).toLocaleString('en-IN')}</span>
          )}
          {req.locationCity && <span>📍 {req.locationCity}</span>}
          <span>{timeAgo}</span>
          <span className="font-medium text-brand-600">
            {req.responseCount} response{req.responseCount !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Respond CTA */}
      <div className="shrink-0">
        {isAuthenticated ? (
          <Link
            href={`/seller/leads`}
            className="rounded-lg bg-brand-600 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-brand-700"
          >
            Respond
          </Link>
        ) : (
          <Link
            href="/login?next=/requirements"
            className="rounded-lg border border-brand-400 bg-white px-3 py-1.5 text-xs font-bold text-brand-700 transition-colors hover:bg-brand-50"
          >
            Login to respond
          </Link>
        )}
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
