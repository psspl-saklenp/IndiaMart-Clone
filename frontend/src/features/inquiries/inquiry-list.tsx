'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { listInquiries } from '@/features/inquiries/api';
import { cn } from '@/lib/utils';
import type { InquiryStatus } from '@/types/inquiries';

const STATUS_TONE = {
  new: 'info',
  responded: 'success',
  closed: 'neutral',
} as const;

const STATUS_FILTERS: { value: InquiryStatus | ''; label: string; icon: string }[] = [
  { value: '', label: 'All', icon: '📋' },
  { value: 'new', label: 'New', icon: '🆕' },
  { value: 'responded', label: 'Responded', icon: '✅' },
  { value: 'closed', label: 'Closed', icon: '🔒' },
];

interface Props {
  viewer: 'buyer' | 'seller';
}

export function InquiryList({ viewer }: Props) {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | ''>('');

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['inquiries', { viewer, page, statusFilter }],
    queryFn: () =>
      listInquiries({
        page,
        limit: 20,
        side: viewer,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const linkPrefix = viewer === 'seller' ? '/seller/inquiries' : '/me/inquiries';

  return (
    <div className="space-y-5">
      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            type="button"
            onClick={() => {
              setStatusFilter(f.value);
              setPage(1);
            }}
            className={cn(
              'flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition-all duration-150',
              statusFilter === f.value
                ? 'border-brand-500 bg-brand-600 text-white shadow-sm'
                : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300 hover:bg-ink-50',
            )}
          >
            <span aria-hidden>{f.icon}</span>
            {f.label}
          </button>
        ))}
        {data && (
          <span className="ml-auto text-xs text-ink-500">
            {data.meta.total} total
          </span>
        )}
      </div>

      {isLoading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-4">
              <div className="size-12 rounded-xl skeleton" />
              <div className="flex-1 space-y-2">
                <div className="h-3.5 w-3/4 rounded skeleton" />
                <div className="h-2.5 w-1/2 rounded skeleton" />
                <div className="h-2 w-1/3 rounded skeleton" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span aria-hidden>⚠️</span>
          {error instanceof Error ? error.message : 'Failed to load inquiries'}
        </div>
      )}

      {data && data.data.length === 0 && !isLoading && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-ink-200 bg-white px-4 py-16 text-center">
          <span className="text-4xl" aria-hidden>
            {viewer === 'seller' ? '📭' : '💬'}
          </span>
          <p className="mt-3 text-sm font-semibold text-ink-700">
            {viewer === 'seller' ? 'No inquiries received yet' : 'No inquiries sent yet'}
          </p>
          <p className="mt-1 text-xs text-ink-500">
            {viewer === 'seller'
              ? "Once buyers reach out, you'll see them here."
              : 'Browse products and use the Send Inquiry button to get started.'}
          </p>
        </div>
      )}

      {data && data.data.length > 0 && (
        <ul className="space-y-2">
          {data.data.map((inquiry) => {
            const counterparty = viewer === 'seller' ? inquiry.buyer : inquiry.seller;
            return (
              <li key={inquiry.id}>
                <Link
                  href={`${linkPrefix}/${inquiry.id}`}
                  className="flex items-center gap-4 rounded-xl border border-ink-200 bg-white p-4 transition-all duration-150 hover:border-brand-200 hover:shadow-[var(--shadow-card-hover)]"
                >
                  {/* Product image */}
                  <div className="size-12 shrink-0 overflow-hidden rounded-xl bg-ink-100 shadow-sm">
                    {inquiry.product?.primaryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inquiry.product.primaryImageUrl}
                        alt={inquiry.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-ink-300">
                        <svg viewBox="0 0 24 24" className="size-6" fill="none" stroke="currentColor" strokeWidth={1} aria-hidden>
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {inquiry.subject}
                      </p>
                      {inquiry.unreadForViewer && (
                        <span className="size-2 shrink-0 rounded-full bg-brand-500 ring-2 ring-brand-100" aria-label="unread" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-500">
                      <span className="font-medium text-ink-600">{viewer === 'seller' ? 'From' : 'To'}:</span>{' '}
                      {counterparty.name}
                      {inquiry.product && (
                        <> · <span className="text-ink-700">{inquiry.product.name}</span></>
                      )}
                    </p>
                    <p className="mt-0.5 text-[11px] text-ink-400">
                      {inquiry.messageCount} message{inquiry.messageCount === 1 ? '' : 's'} ·{' '}
                      Updated {new Date(inquiry.lastMessageAt).toLocaleString()}
                    </p>
                  </div>

                  <div className="flex shrink-0 flex-col items-end gap-2">
                    <Badge tone={STATUS_TONE[inquiry.status]} dot>{inquiry.status}</Badge>
                    <svg viewBox="0 0 16 16" className="size-4 text-ink-300" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
                      <path d="M6 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
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
