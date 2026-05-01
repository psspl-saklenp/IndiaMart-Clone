'use client';

import { keepPreviousData, useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';

import { Badge } from '@/components/ui/badge';
import { Pagination } from '@/components/ui/pagination';
import { listInquiries } from '@/features/inquiries/api';
import type { InquiryStatus } from '@/types/inquiries';

const STATUS_TONE = {
  new: 'info',
  responded: 'success',
  closed: 'neutral',
} as const;

const STATUS_FILTERS: { value: InquiryStatus | ''; label: string }[] = [
  { value: '', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'responded', label: 'Responded' },
  { value: 'closed', label: 'Closed' },
];

interface Props {
  /** Whose perspective renders this list — controls the counterparty display + link prefix. */
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
        // Tell the backend which side the viewer is on. Required because a
        // user can be both a buyer and a seller — without this filter the
        // /me/inquiries page would also surface conversations where the
        // viewer is the supplier (and vice-versa).
        side: viewer,
        ...(statusFilter ? { status: statusFilter } : {}),
      }),
    placeholderData: keepPreviousData,
  });

  const linkPrefix = viewer === 'seller' ? '/seller/inquiries' : '/me/inquiries';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            type="button"
            onClick={() => {
              setStatusFilter(f.value);
              setPage(1);
            }}
            className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
              statusFilter === f.value
                ? 'border-brand-500 bg-brand-50 text-brand-800'
                : 'border-ink-200 bg-white text-ink-700 hover:border-ink-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {isLoading && <p className="text-sm text-ink-500">Loading…</p>}

      {isError && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error instanceof Error ? error.message : 'Failed to load inquiries'}
        </div>
      )}

      {data && data.data.length === 0 && !isLoading && (
        <p className="rounded-md border border-dashed border-ink-200 bg-white px-4 py-12 text-center text-sm text-ink-500">
          {viewer === 'seller'
            ? 'No inquiries received yet. Once buyers reach out, you’ll see them here.'
            : 'You haven’t sent any inquiries yet. Browse products and use the Send Inquiry button.'}
        </p>
      )}

      {data && data.data.length > 0 && (
        <ul className="divide-y divide-ink-200 overflow-hidden rounded-lg border border-ink-200 bg-white">
          {data.data.map((inquiry) => {
            const counterparty = viewer === 'seller' ? inquiry.buyer : inquiry.seller;
            return (
              <li key={inquiry.id}>
                <Link
                  href={`${linkPrefix}/${inquiry.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-ink-50"
                >
                  <div className="size-12 flex-shrink-0 overflow-hidden rounded-md bg-ink-100">
                    {inquiry.product?.primaryImageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={inquiry.product.primaryImageUrl}
                        alt={inquiry.product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-[10px] text-ink-400">
                        no img
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink-900">
                        {inquiry.subject}
                      </p>
                      {inquiry.unreadForViewer && (
                        <span className="size-2 flex-shrink-0 rounded-full bg-brand-500" aria-label="unread" />
                      )}
                    </div>
                    <p className="truncate text-xs text-ink-500">
                      {viewer === 'seller' ? 'From' : 'To'}: {counterparty.name}
                      {inquiry.product && <> · {inquiry.product.name}</>}
                    </p>
                    <p className="text-[11px] text-ink-400">
                      {inquiry.messageCount} message{inquiry.messageCount === 1 ? '' : 's'} ·{' '}
                      Updated {new Date(inquiry.lastMessageAt).toLocaleString()}
                    </p>
                  </div>

                  <Badge tone={STATUS_TONE[inquiry.status]}>{inquiry.status}</Badge>
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
